from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from .models import MealPlan, MealEntry


@admin.register(MealPlan)
class MealPlanAdmin(ModelAdmin):
    fieldsets = (
        (
            _("Owner"),
            {
                "classes": ["tab"],
                "fields": ("owner",),
            },
        ),
        (
            _("Plan Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "week_start_date",
                    "budget_level",
                    "is_ai_generated",
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
    list_display = ["id", "owner", "week_start_date", "budget_level", "is_ai_generated"]
    list_filter = ["budget_level", "is_ai_generated"]
    search_fields = ["id", "owner__email", "owner__first_name"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(MealEntry)
class MealEntryAdmin(ModelAdmin):
    fieldsets = (
        (
            _("Meal Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "meal_plan",
                    "day",
                    "meal_type",
                    "food_name",
                    "description",
                    "prep_time_minutes",
                    "health_notes",
                    "is_ai_generated",
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
    list_display = ["id", "meal_plan", "day", "meal_type", "food_name", "is_ai_generated"]
    list_filter = ["day", "meal_type", "is_ai_generated"]
    search_fields = ["food_name", "meal_plan__owner__email"]
    readonly_fields = ["date_added", "date_last_modified"]
