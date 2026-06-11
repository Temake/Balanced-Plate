import json
from typing import Tuple

from loguru import logger

from .mock import get_mock_weekly_recommendation
from core.utils.helpers.recommendations import WeeklyRecommendationHelper
from core.utils.services import GeminiBaseService
from .models import WeeklyRecommendation
from core.utils import enums


WEEKLY_RECOMMENDATION_PROMPT = """
Based on the following weekly nutrition data, provide a comprehensive health report and personalized recommendations.

USER'S WEEKLY NUTRITION DATA:
{input_data}

Please analyze this data and provide a response in the following JSON format:
{{
    "health_report": {{
        "summary": "A warm, conversational 2-3 sentence assessment of the user's weekly nutrition, using positive and encouraging tone.",
        "strengths": [
            "Strength 1 based on the data",
            "Strength 2 based on the data"
        ],
        "areas_for_improvement": [
            "Area 1 that needs attention",
            "Area 2 that needs attention"
        ],
        "balance_assessment": "Assessment of their overall dietary balance based on the balance_score"
    }},
    "recommendations": {{
        "weekly_micro_wins": [
            "A specific positive dietary achievement this week (e.g. 'You successfully added Ugu leaves or Ewedu to 4 out of 7 dinners! 🎉')"
        ],
        "naija_grocery_list": [
            "A highly actionable list of 3-4 affordable, local West African ingredients to pick up (e.g. 'Scent leaves, Titus fish, Unpolished Ofada rice')"
        ],
        "weekly_actionable_swaps": [
            "A practical diet swap for the week (e.g. 'Swap white garri for wheat or yellow garri at least twice to lower the glycaemic spike.')"
        ],
        "stamina_coaching": [
            "1-sentence actionable tip to maintain high stamina during busy work weeks (e.g. 'Eat a lighter carb meal like boiled yam & egg for breakfast instead of heavy bread to power your morning Lagos hustle.')"
        ]
    }},
    "priority_actions": [
        "Most important local action to take this week",
        "Second priority local action",
        "Third priority local action"
    ],
    "weekly_goals": [
        "Specific measurable local goal for the upcoming week",
        "Second weekly goal",
        "Third weekly goal"
    ]
}}

CRITICAL INSTRUCTIONS FOR GEOGRAPHICAL & CULTURAL RELEVANCE:
- The user is located in Nigeria / West Africa.
- Strictly analyze their data and build goals and shopping lists around local ingredients (e.g., Jollof Rice, Dodo, Eba, Fufu, Egusi, Semo, Amala, Ofada rice, Pap/Ogi, Beans, Yam, Sweet Potatoes, Titus fish, Okra, Efo Riro, Ewedu, Ugu, Scent leaf, Garden egg, Groundnuts, Local Eggs, Mango, Pawpaw).
- DO NOT recommend Western, expensive, or imported foods like blueberries, quinoa, kale, salmon, chia seeds, broccoli, asparagus, or avocados.
- Focus recommendations on addressing key regional health concerns such as high blood pressure, diabetes, high-carb slumps, and cardiovascular health in a practical, encouraging, and friendly local tone ("Naija", "stamina", "traffic hustle").
- Keep all recommendations concise, realistic, and highly actionable.

Return ONLY valid JSON, no additional text.
"""

class WeeklyRecommendationService(GeminiBaseService):
    """Service for generating weekly health recommendations using Gemini AI."""

    def __init__(self):
        super().__init__()

    def generate_recommendation(
        self,
        user,
        start_date=None,
        end_date=None,
    ) -> WeeklyRecommendation:
        """Generate weekly recommendation for a user."""
        
        helper = WeeklyRecommendationHelper(user, start_date, end_date)
        input_data = helper.build_recommendation_input_data()

        recommendation, created = WeeklyRecommendation.objects.get_or_create(
            owner=user,
            week_start_date=helper.start_date,
            defaults={
                "week_end_date": helper.end_date,
                "input_data": input_data,
                "status": "processing",
            }
        )

        if not created and recommendation.status == "completed":
            logger.info(f"Recommendation already exists for user {user.id} week {helper.start_date}")
            return recommendation

        recommendation.status = enums.WeeklyRecommendationStatus.PROCESSING.value
        recommendation.save(update_fields=["status"])

        try:
            result, is_mock = self._call_gemini(input_data)
            
            recommendation.health_report = json.dumps(result.get("health_report", {}))
            recommendation.recommendations = result.get("recommendations", {})
            recommendation.input_data = input_data
            recommendation.input_data["priority_actions"] = result.get("priority_actions", [])
            recommendation.input_data["weekly_goals"] = result.get("weekly_goals", [])
            recommendation.status = enums.WeeklyRecommendationStatus.COMPLETED.value
            recommendation.is_mock_data = is_mock
            recommendation.save()

            logger.info(f"Successfully generated recommendation for user {user.id}")
            return recommendation

        except Exception as e:
            logger.error(f"Failed to generate recommendation: {e}")
            recommendation.status = enums.WeeklyRecommendationStatus.FAILED.value
            recommendation.error_message = str(e)
            recommendation.save(update_fields=["status", "error_message"])
            raise

    def _call_gemini(self, input_data: dict) -> Tuple[dict, bool]:
        """Call Gemini API with the recommendation prompt."""
        
        if not self.client:
            logger.warning("Gemini client not configured, using mock data")
            return get_mock_weekly_recommendation(), True

        try:
            prompt = WEEKLY_RECOMMENDATION_PROMPT.format(
                input_data=json.dumps(input_data, indent=2)
            )
            return self.call_gemini(prompt)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return get_mock_weekly_recommendation(), True
        except Exception as e:
            logger.error(f"Gemini recommendation failed: {e}")
            return get_mock_weekly_recommendation(), True
        

weekly_recommendation_service = WeeklyRecommendationService()