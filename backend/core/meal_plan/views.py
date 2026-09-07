import json
from django.http import StreamingHttpResponse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import response, status, views
from rest_framework.permissions import IsAuthenticated

from core.utils.mixins import PaginationMixin
from core.utils.exceptions import exceptions
from core.billing.entitlements import (
    finalize_ai_generation_usage,
    release_ai_generation_credit,
    reserve_ai_generation_credit,
)
from core.billing.models import AIFeatureType

from core.pricing.services import resolve_area, resolve_weekly_budget_kobo

from .models import MealPlan, MealEntry
from .serializers import (
    MealPlanSerializer,
    MealEntrySerializer,
    GenerateAIPlanSerializer,
    GenerateAIDayPlanSerializer,
    UpsertMealEntrySerializer,
)
from .services import (
    generate_costed_meal_plan,
    generate_costed_day_plan,
    generate_progressive_meal_plan,
)


def _budget_context(validated_data, user):
    """Turn the request's budget preset or custom amount into a weekly kobo target."""
    household_size = validated_data.get("household_size") or 1
    budget_naira = validated_data.get("budget_naira")
    explicit_kobo = int(budget_naira * 100) if budget_naira else None

    weekly_kobo = resolve_weekly_budget_kobo(
        validated_data["budget_level"],
        household_size=household_size,
        explicit_kobo=explicit_kobo,
    )
    return {
        "household_size": household_size,
        "weekly_kobo": weekly_kobo,
        "is_custom": bool(explicit_kobo),
        "area": resolve_area(user=user),
    }


def _recost_plan_from_entries(meal_plan, context):
    """Recompute a plan's cost from the entries actually stored against it.

    Used after a single day is regenerated: the AI produced a whole throwaway week,
    but only one day of it was kept, so costing that response would be wrong.
    """
    from core.pricing.services import cost_meals

    area = context["area"]
    if area is None:
        _apply_cost_to_plan(meal_plan, context, None)
        return

    entries = list(meal_plan.entries.all())
    payload = [{"ingredients": entry.ingredients or []} for entry in entries]
    plan_cost = cost_meals(payload, area)

    for entry, costed in zip(entries, payload):
        entry.estimated_cost_kobo = costed.get("estimated_cost_kobo")
    MealEntry.objects.bulk_update(entries, ["estimated_cost_kobo"])

    _apply_cost_to_plan(meal_plan, context, plan_cost)


def _apply_cost_to_plan(meal_plan, context, plan_cost):
    """Freeze the cost onto the plan so a saved plan does not change value later."""
    meal_plan.household_size = context["household_size"]
    meal_plan.budget_kobo = context["weekly_kobo"]
    meal_plan.is_custom_budget = context["is_custom"]
    fields = ["household_size", "budget_kobo", "is_custom_budget", "date_last_modified"]

    if plan_cost is not None:
        meal_plan.estimated_cost_kobo = plan_cost.total_kobo
        meal_plan.price_area = context["area"]
        meal_plan.priced_at = timezone.now()
        meal_plan.unpriced_items = plan_cost.unknown_items
        fields += ["estimated_cost_kobo", "price_area", "priced_at", "unpriced_items"]

    meal_plan.save(update_fields=fields)


@extend_schema(tags=["Meal Plans"])
class ListMealPlans(PaginationMixin, views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="List all meal plans for the authenticated user",
        request=None,
        responses={200: MealPlanSerializer.List(many=True)},
    )
    def get(self, request, *args, **kwargs):
        meal_plans = (
            MealPlan.objects.filter(owner=request.user)
            .prefetch_related("entries")
            .order_by("-week_start_date")
        )

        paginated_queryset = self.paginate_queryset(meal_plans)
        if paginated_queryset is not None:
            serializer = MealPlanSerializer.List(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = MealPlanSerializer.List(meal_plans, many=True)
        return response.Response(data=serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Meal Plans"])
class RetrieveMealPlan(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="Retrieve a specific meal plan by ID with all entries",
        request=None,
        responses={200: MealPlanSerializer.Detail},
    )
    def get(self, request, pk):
        try:
            meal_plan = MealPlan.objects.prefetch_related("entries").get(
                id=pk, owner=request.user
            )
            serializer = MealPlanSerializer.Detail(instance=meal_plan)
            return response.Response(data=serializer.data, status=status.HTTP_200_OK)
        except MealPlan.DoesNotExist:
            raise exceptions.CustomException(
                message="Meal plan not found",
                status_code=status.HTTP_404_NOT_FOUND,
            )


@extend_schema(tags=["Meal Plans"])
class CreateMealPlan(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Create an empty meal plan for a given week",
        request=MealPlanSerializer.Create,
        responses={201: MealPlanSerializer.Detail},
    )
    def post(self, request):
        serializer = MealPlanSerializer.Create(data=request.data)
        serializer.is_valid(raise_exception=True)

        meal_plan = MealPlan.objects.create(
            owner=request.user,
            **serializer.validated_data,
        )
        output = MealPlanSerializer.Detail(instance=meal_plan)
        return response.Response(data=output.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Meal Plans"])
class GenerateAIMealPlan(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Generate an AI-powered 7-day meal plan using Gemini. "
        "Creates or replaces entries for the given week.",
        request=GenerateAIPlanSerializer,
        responses={201: MealPlanSerializer.Detail},
    )
    def post(self, request):
        serializer = GenerateAIPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start_date = serializer.validated_data["week_start_date"]
        budget_level = serializer.validated_data["budget_level"]

        # Build user profile context from the authenticated user
        user = request.user
        user_profile = {
            "age_range": getattr(user, "effective_age_range", "Not specified"),
            "dietary_goal": getattr(user, "dietary_goal", "general_health"),
            "dietary_preference": getattr(user, "dietary_preference", "none"),
            "health_conditions": getattr(user, "health_conditions", []),
        }
        budget = _budget_context(serializer.validated_data, user)

        # Consumed up front, under lock, so parallel requests cannot all clear the same
        # remaining balance; refunded below if generation fails. This has to happen
        # before the existing week is cleared, or an out-of-credit user loses their plan.
        reservation = reserve_ai_generation_credit(user, AIFeatureType.MEAL_PLAN)

        # Get or create the meal plan for this week
        meal_plan, created = MealPlan.objects.get_or_create(
            owner=user,
            week_start_date=week_start_date,
            defaults={"budget_level": budget_level},
        )

        # If plan already exists, update budget and clear old entries
        if not created:
            meal_plan.budget_level = budget_level
            meal_plan.save(update_fields=["budget_level", "date_last_modified"])
            meal_plan.entries.all().delete()

        # Concurrently generate all 7 days in parallel using fast thread pool
        try:
            all_entries = []
            is_mock_any = False
            for day, day_meals, is_mock in generate_progressive_meal_plan(
                user_profile=user_profile,
                week_start_date=week_start_date,
                budget_level=budget_level,
                weekly_budget_kobo=budget["weekly_kobo"],
                household_size=budget["household_size"],
                area=budget["area"],
            ):
                if is_mock:
                    is_mock_any = True
                for meal in day_meals:
                    all_entries.append(
                        MealEntry(
                            meal_plan=meal_plan,
                            day=day,
                            meal_type=str(meal.get("meal_type", "")).lower(),
                            food_name=meal.get("food_name", ""),
                            description=meal.get("description", ""),
                            prep_time_minutes=meal.get("prep_time_minutes"),
                            health_notes=meal.get("health_notes", ""),
                            ingredients=meal.get("ingredients", []) or [],
                            estimated_cost_kobo=meal.get("estimated_cost_kobo"),
                            is_ai_generated=True,
                        )
                    )
            MealEntry.objects.bulk_create(all_entries)
            _recost_plan_from_entries(meal_plan, budget)
            finalize_ai_generation_usage(
                reservation,
                metadata={"meal_plan_id": meal_plan.id, "week_start_date": str(week_start_date)},
            )
            meal_plan.is_ai_generated = True
            meal_plan.save(update_fields=["is_ai_generated", "date_last_modified"])
            logger.info(
                f"Generated {'mock' if is_mock_any else 'AI'} meal plan for user {user.id}, "
                f"week {week_start_date}, {len(all_entries)} entries"
            )

            # Return the complete plan
            meal_plan.refresh_from_db()
            output = MealPlanSerializer.Detail(instance=meal_plan)
            return response.Response(data=output.data, status=status.HTTP_201_CREATED)
        except Exception:
            release_ai_generation_credit(reservation)
            raise


@extend_schema(tags=["Meal Plans"])
class GenerateAIMealPlanStream(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Generate an AI-powered 7-day meal plan with real-time SSE streaming as each day is generated.",
        request=GenerateAIPlanSerializer,
    )
    def post(self, request):
        serializer = GenerateAIPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start_date = serializer.validated_data["week_start_date"]
        budget_level = serializer.validated_data["budget_level"]
        user = request.user

        user_profile = {
            "age_range": getattr(user, "effective_age_range", "Not specified"),
            "dietary_goal": getattr(user, "dietary_goal", "general_health"),
            "dietary_preference": getattr(user, "dietary_preference", "none"),
            "health_conditions": getattr(user, "health_conditions", []),
        }
        budget = _budget_context(serializer.validated_data, user)

        reservation = reserve_ai_generation_credit(user, AIFeatureType.MEAL_PLAN)

        meal_plan, created = MealPlan.objects.get_or_create(
            owner=user,
            week_start_date=week_start_date,
            defaults={"budget_level": budget_level},
        )

        if not created:
            meal_plan.budget_level = budget_level
            meal_plan.save(update_fields=["budget_level", "date_last_modified"])
            meal_plan.entries.all().delete()

        def stream_generator():
            completed_days = 0
            try:
                yield f"event: start\ndata: {json.dumps({'meal_plan_id': meal_plan.id, 'week_start_date': str(week_start_date)})}\n\n"

                for day, day_meals, is_mock in generate_progressive_meal_plan(
                    user_profile=user_profile,
                    week_start_date=week_start_date,
                    budget_level=budget_level,
                    weekly_budget_kobo=budget["weekly_kobo"],
                    household_size=budget["household_size"],
                    area=budget["area"],
                ):
                    completed_days += 1
                    day_entries = [
                        MealEntry(
                            meal_plan=meal_plan,
                            day=day,
                            meal_type=str(meal.get("meal_type", "")).lower(),
                            food_name=meal.get("food_name", ""),
                            description=meal.get("description", ""),
                            prep_time_minutes=meal.get("prep_time_minutes"),
                            health_notes=meal.get("health_notes", ""),
                            ingredients=meal.get("ingredients", []) or [],
                            estimated_cost_kobo=meal.get("estimated_cost_kobo"),
                            is_ai_generated=True,
                        )
                        for meal in day_meals
                    ]
                    MealEntry.objects.bulk_create(day_entries)
                    serialized_entries = MealEntrySerializer(day_entries, many=True).data

                    day_payload = {
                        "day": day,
                        "entries": serialized_entries,
                        "completed_days": completed_days,
                        "total_days": 7,
                    }
                    yield f"event: day\ndata: {json.dumps(day_payload)}\n\n"

                _recost_plan_from_entries(meal_plan, budget)
                finalize_ai_generation_usage(
                    reservation,
                    metadata={"meal_plan_id": meal_plan.id, "week_start_date": str(week_start_date)},
                )
                meal_plan.is_ai_generated = True
                meal_plan.save(update_fields=["is_ai_generated", "date_last_modified"])
                meal_plan.refresh_from_db()

                output = MealPlanSerializer.Detail(instance=meal_plan).data
                yield f"event: complete\ndata: {json.dumps({'meal_plan': output})}\n\n"

            except Exception as e:
                logger.error(f"SSE Meal plan generation failed: {e}")
                release_ai_generation_credit(reservation)
                yield f"event: error\ndata: {json.dumps({'message': 'Failed to generate meal plan. Please try again.'})}\n\n"

        resp = StreamingHttpResponse(stream_generator(), content_type="text/event-stream")
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        return resp


@extend_schema(tags=["Meal Plans"])
class GenerateAIDayMealPlan(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Generate AI-powered meal entries for one day of a selected week. "
        "Only entries for that day are replaced; manual entries on other days are preserved.",
        request=GenerateAIDayPlanSerializer,
        responses={201: MealPlanSerializer.Detail},
    )
    def post(self, request):
        serializer = GenerateAIDayPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start_date = serializer.validated_data["week_start_date"]
        budget_level = serializer.validated_data["budget_level"]
        selected_day = serializer.validated_data["day"]
        user = request.user

        user_profile = {
            "age_range": getattr(user, "effective_age_range", "Not specified"),
            "dietary_goal": getattr(user, "dietary_goal", "general_health"),
            "dietary_preference": getattr(user, "dietary_preference", "none"),
            "health_conditions": getattr(user, "health_conditions", []),
        }
        budget = _budget_context(serializer.validated_data, user)

        # Consumed up front, under lock, before the selected day is cleared below.
        reservation = reserve_ai_generation_credit(user, AIFeatureType.MEAL_PLAN_DAY)

        meal_plan, created = MealPlan.objects.get_or_create(
            owner=user,
            week_start_date=week_start_date,
            defaults={"budget_level": budget_level},
        )

        if not created and meal_plan.budget_level != budget_level:
            meal_plan.budget_level = budget_level
            meal_plan.save(update_fields=["budget_level", "date_last_modified"])

        daily_budget_kobo = (budget["weekly_kobo"] // 7) if budget.get("weekly_kobo") else None
        try:
            day_meals, is_mock = generate_costed_day_plan(
                day=selected_day,
                user_profile=user_profile,
                budget_level=budget_level,
                daily_budget_kobo=daily_budget_kobo,
                household_size=budget["household_size"],
                area=budget["area"],
            )
        except Exception:
            release_ai_generation_credit(reservation)
            raise

        meal_plan.entries.filter(day=selected_day).delete()
        entries = [
            MealEntry(
                meal_plan=meal_plan,
                day=selected_day,
                meal_type=str(meal.get("meal_type", "")).lower(),
                food_name=meal.get("food_name", ""),
                description=meal.get("description", ""),
                prep_time_minutes=meal.get("prep_time_minutes"),
                health_notes=meal.get("health_notes", ""),
                ingredients=meal.get("ingredients", []) or [],
                estimated_cost_kobo=meal.get("estimated_cost_kobo"),
                is_ai_generated=True,
            )
            for meal in day_meals
        ]
        MealEntry.objects.bulk_create(entries)
        # Only this day changed, so recost the whole plan from what is now stored
        _recost_plan_from_entries(meal_plan, budget)
        finalize_ai_generation_usage(
            reservation,
            metadata={
                "meal_plan_id": meal_plan.id,
                "week_start_date": str(week_start_date),
                "day": selected_day,
            },
        )

        meal_plan.is_ai_generated = True
        meal_plan.save(update_fields=["is_ai_generated", "date_last_modified"])
        logger.info(
            f"Generated {'mock' if is_mock else 'AI'} single-day meals for user {user.id}, "
            f"week {week_start_date}, day {selected_day}, {len(entries)} entries"
        )

        meal_plan.refresh_from_db()
        output = MealPlanSerializer.Detail(instance=meal_plan)
        return response.Response(data=output.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Meal Plans"])
class UpsertMealEntry(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Create or update a single meal entry for a day and meal slot. "
        "Creates the weekly meal plan automatically when needed.",
        request=UpsertMealEntrySerializer,
        responses={200: MealPlanSerializer.Detail},
    )
    def post(self, request):
        serializer = UpsertMealEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        meal_plan, _ = MealPlan.objects.get_or_create(
            owner=request.user,
            week_start_date=data["week_start_date"],
            defaults={"budget_level": data["budget_level"], "is_ai_generated": False},
        )

        if meal_plan.budget_level != data["budget_level"]:
            meal_plan.budget_level = data["budget_level"]
            meal_plan.save(update_fields=["budget_level", "date_last_modified"])

        entry = MealEntry.objects.filter(
            meal_plan=meal_plan,
            day=data["day"],
            meal_type=data["meal_type"],
        ).first()

        if entry is None:
            MealEntry.objects.create(
                meal_plan=meal_plan,
                day=data["day"],
                meal_type=data["meal_type"],
                food_name=data["food_name"],
                description=data["description"],
                prep_time_minutes=data.get("prep_time_minutes"),
                health_notes=data["health_notes"],
                is_ai_generated=False,
            )
        else:
            entry.food_name = data["food_name"]
            entry.description = data["description"]
            entry.prep_time_minutes = data.get("prep_time_minutes")
            entry.health_notes = data["health_notes"]
            entry.is_ai_generated = False
            entry.save(
                update_fields=[
                    "food_name",
                    "description",
                    "prep_time_minutes",
                    "health_notes",
                    "is_ai_generated",
                    "date_last_modified",
                ]
            )

        meal_plan.refresh_from_db()
        output = MealPlanSerializer.Detail(instance=meal_plan)
        return response.Response(data=output.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Meal Plans"])
class DeleteMealEntry(views.APIView):
    http_method_names = ["delete"]

    @extend_schema(
        description="Delete a single meal entry from the authenticated user's meal plan.",
        request=None,
        responses={204: None},
    )
    def delete(self, request, pk):
        try:
            entry = MealEntry.objects.select_related("meal_plan").get(
                id=pk,
                meal_plan__owner=request.user,
            )
            entry.delete()
            return response.Response(status=status.HTTP_204_NO_CONTENT)
        except MealEntry.DoesNotExist:
            raise exceptions.CustomException(
                message="Meal entry not found",
                status_code=status.HTTP_404_NOT_FOUND,
            )


@extend_schema(tags=["Meal Plans"])
class DeleteMealPlan(views.APIView):
    http_method_names = ["delete"]

    @extend_schema(
        description="Delete a meal plan and all its entries",
        request=None,
        responses={204: None},
    )
    def delete(self, request, pk):
        try:
            meal_plan = MealPlan.objects.get(id=pk, owner=request.user)
            meal_plan.delete()
            return response.Response(status=status.HTTP_204_NO_CONTENT)
        except MealPlan.DoesNotExist:
            raise exceptions.CustomException(
                message="Meal plan not found",
                status_code=status.HTTP_404_NOT_FOUND,
            )
