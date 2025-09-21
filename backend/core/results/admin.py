from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from .models import NutritionResult
from django.contrib.auth.models import Group



@admin.register(NutritionResult)
class NutritionResultAdmin(ModelAdmin):

    fieldsets = (
        (
            _("User"),
            {
                "classes": ["tab"],
                "fields": (
                    "owner",
                ),
            },
        ),
        (
            _("Meta info"),
            {
                "classes": ["tab"],
                "fields": (
                    "food_image",
                    "volume",
                    "calories",
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

    list_display = [
        "id", "owner__first_name", "food_image__id"
    ]
    search_fields = ["id", "food_image__id"]
    readonly_fields = ["date_added", "date_last_modified"]
