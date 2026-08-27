from rest_framework import serializers

from .models import MealPlan, MealEntry


class MealEntrySerializer(serializers.ModelSerializer):
    estimated_cost_naira = serializers.SerializerMethodField()

    def get_estimated_cost_naira(self, obj):
        if obj.estimated_cost_kobo is None:
            return None
        return round(obj.estimated_cost_kobo / 100, 2)

    class Meta:
        model = MealEntry
        fields = [
            "id",
            "meal_plan",
            "day",
            "meal_type",
            "food_name",
            "description",
            "prep_time_minutes",
            "health_notes",
            "ingredients",
            "estimated_cost_kobo",
            "estimated_cost_naira",
            "is_ai_generated",
            "date_added",
            "date_last_modified",
        ]


class MealPlanCostMixin(serializers.Serializer):
    """Cost fields shared by the list and detail representations.

    Everything is exposed as a band rather than a single figure — costing a 28-meal
    plan compounds estimate error across ~30 ingredients, and a precise-looking total
    invites the user to catch us being wrong.
    """

    budget_naira = serializers.SerializerMethodField()
    estimated_cost_naira = serializers.SerializerMethodField()
    estimated_cost_low_naira = serializers.SerializerMethodField()
    estimated_cost_high_naira = serializers.SerializerMethodField()
    is_within_budget = serializers.SerializerMethodField()
    price_area_name = serializers.SerializerMethodField()

    def get_budget_naira(self, obj):
        return round(obj.budget_kobo / 100, 2) if obj.budget_kobo else None

    def get_estimated_cost_naira(self, obj):
        if obj.estimated_cost_kobo is None:
            return None
        return round(obj.estimated_cost_kobo / 100, 2)

    def get_estimated_cost_low_naira(self, obj):
        if obj.estimated_cost_kobo is None:
            return None
        return round(obj.estimated_cost_kobo * 0.9 / 100, 2)

    def get_estimated_cost_high_naira(self, obj):
        if obj.estimated_cost_kobo is None:
            return None
        return round(obj.estimated_cost_kobo * 1.1 / 100, 2)

    def get_is_within_budget(self, obj):
        if obj.estimated_cost_kobo is None or not obj.budget_kobo:
            return None
        return obj.estimated_cost_kobo <= obj.budget_kobo

    def get_price_area_name(self, obj):
        return obj.price_area.name if obj.price_area_id else None


COST_FIELDS = [
    "household_size",
    "budget_kobo",
    "budget_naira",
    "is_custom_budget",
    "estimated_cost_kobo",
    "estimated_cost_naira",
    "estimated_cost_low_naira",
    "estimated_cost_high_naira",
    "is_within_budget",
    "price_area_name",
    "priced_at",
    "unpriced_items",
]


class MealPlanSerializer:
    class List(MealPlanCostMixin, serializers.ModelSerializer):
        entries = MealEntrySerializer(many=True, read_only=True)

        class Meta:
            model = MealPlan
            fields = [
                "id",
                "week_start_date",
                "budget_level",
                "is_ai_generated",
                "entries",
                "date_added",
            ] + COST_FIELDS

    class Detail(MealPlanCostMixin, serializers.ModelSerializer):
        entries = MealEntrySerializer(many=True, read_only=True)
        owner_name = serializers.SerializerMethodField()

        def get_owner_name(self, obj):
            return f"{obj.owner.first_name} {obj.owner.last_name}"

        class Meta:
            model = MealPlan
            fields = [
                "id",
                "owner",
                "owner_name",
                "week_start_date",
                "budget_level",
                "is_ai_generated",
                "entries",
                "date_added",
                "date_last_modified",
            ] + COST_FIELDS

    class Create(serializers.ModelSerializer):
        class Meta:
            model = MealPlan
            fields = [
                "week_start_date",
                "budget_level",
                "household_size",
            ]

        def validate_week_start_date(self, value):
            if value.weekday() != 0:
                raise serializers.ValidationError(
                    "week_start_date must be a Monday."
                )
            return value


class GenerateAIPlanSerializer(serializers.Serializer):
    week_start_date = serializers.DateField()
    budget_level = serializers.CharField(default="medium")
    household_size = serializers.IntegerField(
        required=False, default=1, min_value=1, max_value=20
    )
    # The user's own weekly figure for the whole household. When present it wins over
    # the tier — the tier is only a preset for people who would rather not decide.
    budget_naira = serializers.DecimalField(
        required=False,
        allow_null=True,
        default=None,
        max_digits=12,
        decimal_places=2,
        min_value=0,
    )

    def validate_budget_naira(self, value):
        if value in (None, ""):
            return None
        if value <= 0:
            raise serializers.ValidationError("budget_naira must be greater than zero.")
        if value < 1000:
            raise serializers.ValidationError(
                "That is below the cost of a single meal. Enter your weekly food budget."
            )
        return value

    def validate_week_start_date(self, value):
        if value.weekday() != 0:
            raise serializers.ValidationError(
                "week_start_date must be a Monday."
            )
        return value

    def validate_budget_level(self, value):
        valid = ["low", "medium", "flexible"]
        if value not in valid:
            raise serializers.ValidationError(
                f"budget_level must be one of: {', '.join(valid)}"
            )
        return value


class GenerateAIDayPlanSerializer(GenerateAIPlanSerializer):
    day = serializers.CharField()

    def validate_day(self, value):
        normalized = value.lower()
        valid = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        if normalized not in valid:
            raise serializers.ValidationError(
                f"day must be one of: {', '.join(valid)}"
            )
        return normalized


class UpsertMealEntrySerializer(serializers.Serializer):
    week_start_date = serializers.DateField()
    budget_level = serializers.CharField(default="medium")
    day = serializers.CharField()
    meal_type = serializers.CharField()
    food_name = serializers.CharField(max_length=200, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    prep_time_minutes = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    health_notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_week_start_date(self, value):
        if value.weekday() != 0:
            raise serializers.ValidationError(
                "week_start_date must be a Monday."
            )
        return value

    def validate_budget_level(self, value):
        valid = ["low", "medium", "flexible"]
        if value not in valid:
            raise serializers.ValidationError(
                f"budget_level must be one of: {', '.join(valid)}"
            )
        return value

    def validate_day(self, value):
        normalized = value.lower()
        valid = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        if normalized not in valid:
            raise serializers.ValidationError(
                f"day must be one of: {', '.join(valid)}"
            )
        return normalized

    def validate_meal_type(self, value):
        normalized = value.lower()
        valid = ["breakfast", "lunch", "dinner", "snack"]
        if normalized not in valid:
            raise serializers.ValidationError(
                f"meal_type must be one of: {', '.join(valid)}"
            )
        return normalized
