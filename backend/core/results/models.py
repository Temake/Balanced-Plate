from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.file_storage.models import FileModel
from core.utils import enums
from core.websocket.utils import emit_websocket_event


class FoodAnalysis(BaseModelMixin):
    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="food_analyses",
        null=False,
        blank=False,
        verbose_name=_("Analysis Owner")
    )
    food_image = models.OneToOneField(
        to=FileModel,
        on_delete=models.CASCADE,
        related_name="analysis",
        null=False,
        blank=False,
        verbose_name=_("Food Image")
    )
    meal_type = models.CharField(
        _("Meal Type"),
        max_length=50,
        null=True,
        blank=True,
        choices=enums.MealType.choices(),
        help_text=_("Type of meal (Breakfast, Lunch, Dinner, Snack)")
    )
    balance_score = models.DecimalField(
        _("Balance Score"),
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Nutritional balance score between 0 and 1")
    )
    next_meal_recommendations = models.JSONField(
        _("Next Meal Recommendations"),
        null=True,
        blank=True,
        default=dict,
        help_text=_("AI-generated recommendations for the next meal")
    )
    is_mock_data = models.BooleanField(
        _("Is Mock Data"),
        default=False,
        help_text=_("Whether this result is from mock data (fallback)")
    )
    analysis_status = models.CharField(
        _("Analysis Status"),
        max_length=20,
        default=enums.FoodAnalysisStatus.PENDING.value,
        choices=enums.FoodAnalysisStatus.choices(),
        help_text=_("Current status of the food analysis process")
    )
    error_message = models.TextField(
        _("Error Message"),
        null=True,
        blank=True,
    )
    push_sent = models.BooleanField(
        _("Is Event Pushed?"),
        default = False
    )
    push_sent_at = models.DateTimeField(
        _("Time Event Was Pushed"),
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = _("Food Analysis")
        verbose_name_plural = _("Food Analyses")
        ordering = ["-date_added"]

    def __str__(self):
        return f"{self.owner.first_name}-{self.food_image.id}-analysis"

    @property
    def total_calories(self):
        return sum(food.calories or 0 for food in self.detected_foods.all())

    @property
    def total_protein(self):
        return sum(food.protein or 0 for food in self.detected_foods.all())

    @property
    def total_carbs(self):
        return sum(food.carbs or 0 for food in self.detected_foods.all())

    @property
    def total_fat(self):
        return sum(food.fat or 0 for food in self.detected_foods.all())
    

    class EventData:
        """
        Subclass for generating WebSocket event payload on analysis completion or failure.
        """
        
        @staticmethod
        def on_completed(instance: "FoodAnalysis") -> dict:

            return {
                "type": enums.FoodAnalysisStatus.COMPLETED.value,
                "data": {
                    "message": "Analysis Completed!",
                    "id": instance.id,
                    "timestamp": timezone.now().isoformat(),
                },
            }
        
        @staticmethod
        def on_failed(instance):

            data = {
                "type": enums.FoodAnalysisStatus.FAILED.value,
                "data": {
                    "message": "Analysis Failed!",
                    "id": instance.id,
                    "timestamp": timezone.now().isoformat(),
                },
            }
            return data
        
    
    def emit_event(self, event_type):
        emit_websocket_event(
            self, event_type
        )
        self.push_sent = True
        self.push_sent_at  = timezone.now()
        self.save(update_fields=[
            "push_sent", 
            "push_sent_at"
        ])


 
class DetectedFood(BaseModelMixin):
    analysis = models.ForeignKey(
        to=FoodAnalysis,
        on_delete=models.CASCADE,
        related_name="detected_foods",
        null=False,
        blank=False,
        verbose_name=_("Parent Analysis")
    )
    name = models.CharField(
        _("Food Name"),
        max_length=255,
        null=False,
        blank=False,
    )
    confidence = models.DecimalField(
        _("Confidence Score"),
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("AI confidence score between 0 and 1")
    )
    portion_estimate = models.CharField(
        _("Portion Estimate"),
        max_length=100,
        null=True,
        blank=True,
        help_text=_("Estimated portion size (e.g., '1 cup', '100g')")
    )
    calories = models.DecimalField(
        _("Calories"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    protein = models.DecimalField(
        _("Protein (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    carbs = models.DecimalField(
        _("Carbohydrates (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    fat = models.DecimalField(
        _("Fat (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    dairy = models.DecimalField(
        _("Dairy (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    vegetable = models.DecimalField(
        _("Vegetable (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    fruit = models.DecimalField(
        _("Fruit (g)"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    micronutrients = models.JSONField(
        _("Micronutrients"),
        null=True,
        blank=True,
        default=dict,
        help_text=_("Micronutrient details like vitamins and minerals")
    )

    class Meta:
        verbose_name = _("Detected Food")
        verbose_name_plural = _("Detected Foods")
        ordering = ["-confidence"]

    def __str__(self):
        return f"{self.name} ({self.portion_estimate})"
