from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import response, status, views
from rest_framework.permissions import IsAuthenticated

from core.utils.mixins import PaginationMixin
from core.utils.exceptions import exceptions

from .models import MealPlan, MealEntry
from .serializers import MealPlanSerializer, GenerateAIPlanSerializer
from .services import meal_plan_service


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
            "dietary_goal": getattr(user, "dietary_goal", "general_health"),
            "dietary_preference": getattr(user, "dietary_preference", "none"),
            "health_conditions": getattr(user, "health_conditions", []),
        }

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

        # Generate the meal plan via AI service
        result, is_mock = meal_plan_service.generate_meal_plan(
            user_profile=user_profile,
            week_start_date=week_start_date,
            budget_level=budget_level,
        )

        meal_plan.is_ai_generated = True
        meal_plan.save(update_fields=["is_ai_generated"])

        # Bulk-create meal entries from the AI response
        meals_data = result.get("meals", [])
        entries = []
        for meal in meals_data:
            entries.append(
                MealEntry(
                    meal_plan=meal_plan,
                    day=meal.get("day", ""),
                    meal_type=meal.get("meal_type", ""),
                    food_name=meal.get("food_name", ""),
                    description=meal.get("description", ""),
                    prep_time_minutes=meal.get("prep_time_minutes"),
                    health_notes=meal.get("health_notes", ""),
                    is_ai_generated=True,
                )
            )
        MealEntry.objects.bulk_create(entries)
        logger.info(
            f"Generated {'mock' if is_mock else 'AI'} meal plan for user {user.id}, "
            f"week {week_start_date}, {len(entries)} entries"
        )

        # Return the complete plan
        meal_plan.refresh_from_db()
        output = MealPlanSerializer.Detail(instance=meal_plan)
        return response.Response(data=output.data, status=status.HTTP_201_CREATED)


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
