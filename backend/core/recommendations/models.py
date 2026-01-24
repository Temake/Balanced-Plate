from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.utils import enums


class WeeklyRecommendation(BaseModelMixin):  
    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="weekly_recommendations",
        null=False,
        blank=False,
        verbose_name=_("Recommendation Owner")
    )
    week_start_date = models.DateField(
        _("Week Start Date"),
        null=False,
        blank=False,
        help_text=_("Start date of the week (Monday)")
    )
    week_end_date = models.DateField(
        _("Week End Date"),
        null=False,
        blank=False,
        help_text=_("End date of the week (Sunday)")
    )
    input_data = models.JSONField(
        _("Input Data"),
        null=True,
        blank=True,
        default=dict,
        help_text=_("Snapshot of the data used to generate recommendations")
    ) 
    health_report = models.TextField(
        _("Health Report"),
        null=True,
        blank=True,
        help_text=_("AI-generated weekly health report")
    )
    recommendations = models.JSONField(
        _("Recommendations"),
        null=True,
        blank=True,
        default=dict,
        help_text=_("AI-generated weekly recommendations")
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        default=enums.WeeklyRecommendationStatus.PENDING.value,
        choices=enums.WeeklyRecommendationStatus.choices()
    )
    error_message = models.TextField(
        _("Error Message"),
        null=True,
        blank=True,
    )
    is_mock_data = models.BooleanField(
        _("Is Mock Data"),
        default=False,
    )
    is_read = models.BooleanField(
        _("Has User Read Notification?"),
        default=False
    )
    notification_sent = models.BooleanField(
        _("Notification Sent"),
        default=False,
    )
    notification_sent_at = models.DateTimeField(
        _("Notification Sent At"),
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Weekly Recommendation")
        verbose_name_plural = _("Weekly Recommendations")
        ordering = ["-week_start_date"]
        unique_together = [["owner", "week_start_date"]]

    def __str__(self):
        return f"Weekly Recommendation - {self.owner.email} - {self.week_start_date}"
