from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.file_storage.models import FileModel


class NutritionResult(BaseModelMixin):
    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="food_results",
        blank=False,
        null=False,
        verbose_name=_("Nutrion Results Owner")
    )
    food_image = models.OneToOneField(
        to=FileModel,
        on_delete=models.CASCADE,
        related_name="results",
        null=False,
        blank=False,
        verbose_name=_("Food Image")
    )
    name=models.CharField(
        _("The Name of the Food"),
        null=False,
        blank=False,
        
    )
    confidence = models.DecimalField(
        _("Food Confidence"),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
    )
    calories = models.DecimalField(
        _("Calories"),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("the amount of calories contained in the food")
    )


    class Meta:
        verbose_name = _("Nutrition Result")
        verbose_name_plural = _("Nutrition Results")
        

    def __str__(self):
        return f"{self.owner.first_name}-{self.food_image.id}-result"
