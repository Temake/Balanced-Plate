from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from .models import FoodAnalysis, DetectedFood


@admin.register(FoodAnalysis)
class FoodAnalysisAdmin(ModelAdmin):
    fieldsets = (
        (
            _("User"),
            {
                "classes": ["tab"],
                "fields": ("owner",),
            },
        ),
        (
            _("Analysis Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "food_image",
                    "meal_type",
                    "balance_score",
                    "suggestions",
                    "is_mock_data",
                    "analysis_status",
                    "error_message",
                ),
            },
        ),
        (
            _("Important dates"),
            {
                "classes": ["tab"],
                "fields": ("date_added", "date_last_modified"),
            },
        ),
    )
    list_display = ["id", "owner", "meal_type", "balance_score", "analysis_status", "is_mock_data"]
    list_filter = ["analysis_status", "is_mock_data", "meal_type"]
    search_fields = ["id", "owner__email", "owner__first_name"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(DetectedFood)
class DetectedFoodAdmin(ModelAdmin):
    fieldsets = (
        (
            _("Food Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "analysis",
                    "name",
                    "confidence",
                    "portion_estimate",
                    "food_group"
                ),
            },
        ),
        (
            _("Nutritional Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "calories",
                    "protein",
                    "carbs",
                    "fat",
                    "micronutrients",
                ),
            },
        ),
        (
            _("Important dates"),
            {
                "classes": ["tab"],
                "fields": ("date_added", "date_last_modified"),
            },
        ),
    )
    list_display = ["id", "name", "confidence", "calories", "food_group"]
    list_filter = ["name"]
    search_fields = ["name", "analysis__id"]
    readonly_fields = ["date_added", "date_last_modified"]
