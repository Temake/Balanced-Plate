from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(ModelAdmin):
    fieldsets = (
        (
            _("Sender Information"),
            {
                "classes": ["tab"],
                "fields": ("user", "name", "email"),
            },
        ),
        (
            _("Feedback Content"),
            {
                "classes": ["tab"],
                "fields": ("category", "subject", "message", "is_reviewed"),
            },
        ),
        (
            _("Timestamps"),
            {
                "classes": ["tab"],
                "fields": ("date_added", "date_last_modified"),
            },
        ),
    )
    list_display = ["id", "category", "subject", "email", "is_reviewed", "date_added"]
    list_filter = ["category", "is_reviewed", "date_added"]
    search_fields = ["subject", "message", "email", "name"]
    readonly_fields = ["date_added", "date_last_modified"]

