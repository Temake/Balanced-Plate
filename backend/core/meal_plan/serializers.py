from rest_framework import serializers

from .models import MealPlan, MealEntry


class MealEntrySerializer(serializers.ModelSerializer):
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
            "is_ai_generated",
            "date_added",
            "date_last_modified",
        ]


class MealPlanSerializer:
    class List(serializers.ModelSerializer):
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
            ]

    class Detail(serializers.ModelSerializer):
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
            ]

    class Create(serializers.ModelSerializer):
        class Meta:
            model = MealPlan
            fields = [
                "week_start_date",
                "budget_level",
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
