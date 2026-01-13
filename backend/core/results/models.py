from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.file_storage.models import FileModel
from core.utils import enums


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