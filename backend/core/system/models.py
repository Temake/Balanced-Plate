from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.utils.enums.base import BaseEnum


class FeedbackCategory(BaseEnum):
    BUG = "bug"
    SUGGESTION = "suggestion"
    FEATURE_REQUEST = "feature_request"
    GENERAL = "general"
    OTHER = "other"


class Feedback(BaseModelMixin):
    user = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.SET_NULL,
        related_name="feedbacks",
        null=True,
        blank=True,
        verbose_name=_("User"),
    )
    email = models.EmailField(_("Email Address"), max_length=255)
    name = models.CharField(_("Sender Name"), max_length=255, blank=True, default="")
    category = models.CharField(
        _("Feedback Category"),
        max_length=50,
        choices=FeedbackCategory.choices(),
        default=FeedbackCategory.GENERAL.value,
    )
    subject = models.CharField(_("Subject"), max_length=255)
    message = models.TextField(_("Feedback Message"))
    is_reviewed = models.BooleanField(_("Is Reviewed"), default=False)

    class Meta:
        verbose_name = _("Feedback")
        verbose_name_plural = _("Feedbacks")
        ordering = ["-date_added"]

    def __str__(self):
        return f"[{self.category.upper()}] {self.subject} by {self.email}"

