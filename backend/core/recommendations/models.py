from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from loguru import logger
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
    read_at = models.DateTimeField(
        _("Read At"),
        null=True,
        blank=True,
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

    class EventData:
        """
        Subclass for generating WebSocket event payloads for recommendations.
        """
        
        @staticmethod
        def on_recommendation_ready(instance: "WeeklyRecommendation") -> dict:
            """Generate event data for weekly recommendation"""

            from core.recommendations.serializers import WeeklyRecommendationSerializer

            return {
                "type": enums.RecommendationEventType.RECOMMENDATION_READY.value,
                "data": {
                    "recommendation": WeeklyRecommendationSerializer.RecommendationDetails(instance=instance).data,
                    "week_start_date": instance.week_start_date.isoformat(),
                    "week_end_date": instance.week_end_date.isoformat(),
                    "message": "Your weekly health report is ready!",
                    "timestamp": timezone.now().isoformat(),
                },
            }
        
        @staticmethod
        def on_recommendation_read(instance):

            from core.account.serializers import BaseUserSerializer

            data = {
                "type": enums.RecommendationEventType.RECOMMENDATION_READ.value,
                "data": {
                    "from": BaseUserSerializer(instance=instance.owner).data,
                    "id": instance.id,
                },
            }
            return data

    def emit_recommendation_event(self, event_type: str) -> bool:
        """
        Emit WebSocket event for this recommendation.
        """
        event_method = getattr(self.EventData, f"on_{event_type}", None)
        if not event_method:
            logger.warning(f"Unknown recommendation event type: {event_type}")
            return False
        
        try:
            event_data = event_method(self)
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                self.owner.push_notification_channel_id,
                event_data,
            )
            
            logger.info(
                f"Recommendation event emitted: type={event_type}, "
                f"user={self.owner.id}"
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to emit recommendation event: {e}")
            return False

    def mark_as_read(self):
        if self.is_read:
            return
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
        self.emit_recommendation_event(enums.RecommendationEventType.RECOMMENDATION_READ.value)

    def save(self, *args, **kwargs):
        created = False
        if not self.is_instance_exist():
            created = True

        super().save(*args, **kwargs)
        if created and not self.notification_sent:
            self.emit_recommendation_event(enums.RecommendationEventType.RECOMMENDATION_READY.value)
            self.notification_sent_at  = timezone.now()
            self.save(update_fields=[
                "notification_sent", 
                "notification_sent_at"
            ])


    class Meta:
        verbose_name = _("Weekly Recommendation")
        verbose_name_plural = _("Weekly Recommendations")
        ordering = ["-week_start_date"]
        unique_together = [["owner", "week_start_date"]]

    def __str__(self):
        return f"Weekly Recommendation - {self.owner.email} - {self.week_start_date}"
