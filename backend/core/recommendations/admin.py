from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from .models import WeeklyRecommendation


@admin.register(WeeklyRecommendation)
class WeeklyRecommendationAdmin(ModelAdmin):
    fieldsets = (
        (
            _("User"),
            {
                "classes": ["tab"],
                "fields": ("owner",),
            },
        ),
        (
            _("Recommendation"),
            {
                "classes": ["tab"],
                "fields": (
                    "input_data",
                    "health_report",
                    "recommendations",
                ),
            },
        ),
        (
            _("Meta Info"),
            {
                "classes": ["tab"],
                "fields": (
                    "status",
                    "error_message",
                    "is_mock_data",
                    "notification_sent",
                    "notification_sent_at"
                ),
            },
        ),
        (
            _("Important dates"),
            {
                "classes": ["tab"],
                "fields": ("week_start_date", "week_end_date", "date_added", "date_last_modified"),
            },
        ),
    )
    list_display = ["id", "owner", "status", "error_message"]
    list_filter = ["status", "is_mock_data"]
    search_fields = ["owner__email", "owner__first_name"]
    readonly_fields = ["date_added", "date_last_modified"]
