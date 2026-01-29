from django.utils import timezone
from django.db.models import Sum, Avg
from datetime import timedelta
from decimal import Decimal
from typing import Any, Optional

from core.account.models import Account
from core.results.models import FoodAnalysis, DetectedFood

class WeeklyRecommendationHelper:
    """Helper class for generating weekly recommendation input data."""

    DEFAULT_MICRONUTRIENT_KEYS = [
        "vitamin_c",
        "vitamin_d",
        "vitamin_b12",
        "calcium",
        "iron",
        "zinc",
        "magnesium",
        "folate",
    ]

    def __init__(self, user, start_date=None, end_date=None):
        self.user = user
        self._set_week_dates(start_date, end_date)

    def _set_week_dates(self, start_date=None, end_date=None):
        """Set week start (Monday) and end (Sunday) dates."""
        if start_date and end_date:
            self.start_date = start_date
            self.end_date = end_date
        else:
            today = timezone.localdate()
            days_since_monday = today.weekday()
            self.start_date = today - timedelta(days=days_since_monday + 7)
            self.end_date = self.start_date + timedelta(days=6)

    def get_meal_type_percentages(self) -> dict[str, Any]:
        """Get meal type distribution percentages for the week."""
        user = (
            Account.objects
            .filter(id=self.user.id)
            .with_meal_type_distribution(
                start_date=self.start_date,
                end_date=self.end_date,
            )
            .first()
        )

        if not user:
            return {
                "breakfast": 0.0,
                "lunch": 0.0,
                "dinner": 0.0,
                "snack": 0.0,
                "total_meals": 0,
            }

        return {
            "breakfast": round(user.breakfast_percent, 2),
            "lunch": round(user.lunch_percent, 2),
            "dinner": round(user.dinner_percent, 2),
            "snack": round(user.snack_percent, 2),
            "total_meals": user.total_meals
        }

    def get_weekly_balance_score(self) -> dict[str, Any]:
        """Get average weekly balance score and daily breakdown."""
        user = (
            Account.objects
            .filter(id=self.user.id)
            .with_weekly_balance_score(
                start_date=self.start_date,
                end_date=self.end_date,
            )
            .first()
        )

        if not user:
            return {
                "average": 0.0,
                "daily_breakdown": {
                    "monday": 0.0,
                    "tuesday": 0.0,
                    "wednesday": 0.0,
                    "thursday": 0.0,
                    "friday": 0.0,
                    "saturday": 0.0,
                    "sunday": 0.0,
                },
            }

        return {
            "average": round(user.avg_balance_score, 2),
            "daily_breakdown": {
                "monday": round(user.monday_balance, 2),
                "tuesday": round(user.tuesday_balance, 2),
                "wednesday": round(user.wednesday_balance, 2),
                "thursday": round(user.thursday_balance, 2),
                "friday": round(user.friday_balance, 2),
                "saturday": round(user.saturday_balance, 2),
                "sunday": round(user.sunday_balance, 2),
            },
        }

    def get_nutrition_totals_and_percentages(self) -> dict[str, Any]:
        """Get total nutrition consumption and percentages."""
        user = (
            Account.objects
            .filter(id=self.user.id)
            .with_food_groups_data(
                start_date=self.start_date,
                end_date=self.end_date,
            )
            .first()
        )

        if not user:
            return {
                "totals": {
                    "protein": 0.0,
                    "carbs": 0.0,
                    "fat": 0.0,
                    "calories": 0.0,
                    "vegetable": 0.0,
                    "fruits": 0.0,
                    "dairy": 0.0,
                },
                "percentages": {
                    "protein": 0.0,
                    "carbs": 0.0,
                    "fat": 0.0,
                    "vegetable": 0.0,
                    "fruits": 0.0,
                    "dairy": 0.0,
                },
            }

        return {
            "totals": {
                "protein": float(user.total_protein_grams),
                "carbs": float(user.total_carbs_grams),
                "fat": float(user.total_fat_grams),
                "calories": float(user.total_calories),
                "vegetables": float(user.total_vegetable_grams),
                "fruits": float(user.total_fruit_grams),
                "dairy": float(user.total_dairy_grams),
            },
            "percentages": {
                "protein": round(user.protein_percent, 2),
                "carbs": round(user.carbs_percent, 2),
                "fat": round(user.fat_percent, 2),
                "vegetables": round(user.vegetable_percent),
                "fruits": round(user.fruit_percent),
                "dairy": round(user.dairy_percent),
            },
        }

    def get_micronutrients_concentration(
        self,
        keys: Optional[list[str]] = None
    ) -> dict[str, float]:
        """Get micronutrient concentration for the week."""
        if keys is None:
            keys = self.DEFAULT_MICRONUTRIENT_KEYS

        detected_foods = DetectedFood.objects.filter(
            analysis__owner=self.user,
            analysis__date_added__date__gte=self.start_date,
            analysis__date_added__date__lte=self.end_date,
        ).values_list("micronutrients", flat=True)

        totals = {k: 0.0 for k in keys}

        for micronutrients_json in detected_foods:
            if not micronutrients_json:
                continue
            for key in keys:
                value = micronutrients_json.get(key, 0)
                if value:
                    try:
                        totals[key] += float(value)
                    except (ValueError, TypeError):
                        pass

        return {k: round(v, 2) for k, v in totals.items()}

    def build_recommendation_input_data(self) -> dict[str, Any]:
        """Build complete input data for weekly recommendation generation."""
        return {
            "week_start_date": self.start_date.isoformat(),
            "week_end_date": self.end_date.isoformat(),
            "meal_type_percentage": self.get_meal_type_percentages(),
            "balance_score": self.get_weekly_balance_score(),
            "total_nutrition_consumption": self.get_nutrition_totals_and_percentages(),
            "micronutrients_concentration": self.get_micronutrients_concentration(),
        }