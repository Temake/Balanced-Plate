from django.utils import timezone
from typing import Any, Optional

from core.results.models import DetectedFood


class UserDashboardAnalyticsHelper:
    """
    Helper class for computing analytics data for user dashboard.
    """

    DEFAULT_MICRONUTRIENT_KEYS = [
        "vitamin_c", 
        "vitamin_d",
        "vitamin_b12",
        "calcium",
        "iron",
        "magnesium",
        "zinc",
        "folate",
    ]

    def __init__(self, user):
        self.user = user

    def get_current_day_micronutrient_percentages(
        self, 
        keys: Optional[list[str]] = None
    ) -> list[dict[str, Any]]:
        """
        Get micronutrient percentages for the current day.
        
        Returns a list of dicts: [{"name": "vitamin_c", "value": 30.4, "percent": 24.5}, ...]
        """
        if keys is None:
            keys = self.DEFAULT_MICRONUTRIENT_KEYS

        today = timezone.localdate()
        
        detected_foods = DetectedFood.objects.filter(
            food_analysis__user=self.user,
            food_analysis__date_added__date=today,
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

        # grand total
        grand_total = sum(totals.values())

        # percentages
        result = []
        for key in keys:
            if grand_total > 0:
                percent = float((totals[key] / grand_total) * 100)
            else:
                percent = 0.0
            result.append({
                "name": key,
                "value": float(totals[key]),
                "percent": round(percent, 2),
            })

        return result