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
        "summary": "A 2-3 sentence overall assessment of the user's weekly nutrition",
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
        "nutrition_recommendations": [
            "Specific actionable recommendation based on their macro intake",
            "Recommendation to address any nutritional gaps",
            "Recommendation for optimal macro balance"
        ],
        "meal_timing_recommendations": [
            "Recommendation based on their meal type distribution",
            "Suggestion for improving meal timing patterns",
            "Advice on meal frequency and timing"
        ],
        "micronutrient_recommendations": [
            "Recommendation to address low micronutrient levels",
            "Suggestion for foods rich in lacking micronutrients",
            "Advice on micronutrient balance"
        ],
        "weekly_meal_plan_suggestions": [
            "Day-specific meal suggestion to improve balance",
            "Suggestion for days with low balance scores",
            "General weekly planning advice"
        ],
        "lifestyle_recommendations": [
            "Holistic health recommendation based on eating patterns",
            "Suggestion for sustainable dietary habits"
        ]
    }},
    "priority_actions": [
        "Most important action to take this week",
        "Second priority action",
        "Third priority action"
    ],
    "weekly_goals": [
        "Specific measurable goal for the upcoming week",
        "Second weekly goal",
        "Third weekly goal"
    ]
}}

Guidelines:
- Be specific and actionable in all recommendations
- Reference the actual numbers from the data where relevant
- Consider dietary balance, timing, and micronutrient needs
- Provide realistic, achievable suggestions
- Keep recommendations concise (one-liner bullet points)
- Focus on gradual improvement rather than drastic changes

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