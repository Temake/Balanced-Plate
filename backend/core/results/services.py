import json
from typing import Tuple

from django.conf import settings
from loguru import logger

from .mock import get_mock_analysis_response
from core.utils.helpers.recommendations import WeeklyRecommendationHelper
from core.utils.services import GeminiBaseService



def build_analysis_prompt(user_profile=None):
    """
    Build the AI analysis prompt, optionally injecting user health context
    and age group for personalized feedback.
    """
    health_context = ""
    if user_profile:
        health_conditions = user_profile.get("health_conditions", [])
        if isinstance(health_conditions, list):
            health_conditions_str = ", ".join(health_conditions) if health_conditions else "None"
        else:
            health_conditions_str = str(health_conditions) if health_conditions else "None"

        age_range = user_profile.get("age_range", "Not specified")

        health_context = f"""

USER PROFILE & HEALTH CONTEXT (adjust your feedback accordingly):
- Age Group: {age_range}
- Dietary Goal: {user_profile.get('dietary_goal', 'general_health')}
- Dietary Preference: {user_profile.get('dietary_preference', 'none')}
- Health Conditions: {health_conditions_str}

AGE & HEALTH-AWARE RULES:
- If age group is 'under_18' or '18-24': Prioritize sufficient calories, growth-supporting protein, and iron/calcium for active lifestyles
- If age group is '45-54', '55-64', or '65+': Advise on blood pressure/sugar balance, lighter oil usage, heart health, and joint/bone density (calcium/vitamin D)
- If user has 'diabetes': Highlight sugar/carb impact, suggest lower-carb Nigerian alternatives
- If user has 'hypertension': Highlight salt/oil concerns, suggest lighter preparation methods
- If user is on 'keto': Warn when food is high-carb, suggest fat/protein-rich Nigerian alternatives
- If user goal is 'weight_loss': Emphasize portion control, suggest lighter serving sizes
- If user goal is 'muscle_gain': Focus on protein content, suggest protein-rich additions
- If user goal is 'energy_focus': Focus on sustained energy, suggest complex carbs and balanced meals
"""

    prompt = f"""Analyze this food image and provide nutritional information in the following JSON format:
{{
    "food_name": "The identified meal name (e.g., 'Jollof Rice with Chicken')",
    "detected_foods": [
        {{
            "name": "food name",
            "confidence": 0.0 to 1.0,
            "portion_estimate": "estimated portion size",
            "nutritional_info": {{
                "calories": number,
                "protein": number in grams,
                "carbs": number in grams,
                "fat": number in grams,
                "dairy": number in grams,
                "vegetable": number in grams,
                "fruit": number in grams
            }},
            "micronutrients": {{
                "vitamin_c": number in mg,
                "vitamin_d": number in mcg,
                "vitamin_b12": number in mcg,
                "calcium": number in mg,
                "iron": number in mg,
                "zinc": number in mg,
                "magnesium": number in mg,
                "folate": number in mg
            }},
            "food_group": "Carbs/Proteins/Vegetables/Fruits/Dairy"
        }}
    ],
    "meal_type": "Breakfast/Lunch/Dinner/Snack",
    "balance_score": 0.0 to 1.0 (nutritional balance rating),
    "conversational_feedback": "3-5 sentences in a warm, relatable Nigerian conversational tone. NOT clinical. Example: 'Ah, this jollof rice is looking proper! You\\'ve got good protein from that chicken, but the portion is quite generous — you might want to add some veggies like Ugu or spinach to balance things out. Overall, not bad at all!'",
    "actionable_suggestion": "One small practical tip. Example: 'Try adding a side of steamed vegetables to your next rice meal.'",
    "alternative_suggestion": "A healthier alternative if applicable, or null if not needed.",
    "next_meal_recommendations": {{
        "layperson_summary": "Warm, conversational 1-2 sentence assessment of this meal in simple terms. Avoid dry clinical talk.",
        "stamina_forecast": "1-sentence energy prediction (e.g. 'High focus forecast, no 3:00 PM sugar slump!')",
        "simple_food_swaps": [
            "A practical local ingredient swap (e.g., 'Swap fried plantain (Dodo) for boiled/baked plantain to save on excess oils.')"
        ],
        "easy_upgrades": [
            "An affordable local ingredient addition to balance this specific plate (e.g., 'Add a spoonful of Efo Riro or steamed Okra for a vitamin boost.')"
        ]
    }}
}}

Be accurate with portion estimates and nutritional values and micronutrients values.

CRITICAL INSTRUCTIONS FOR GEOGRAPHICAL & CULTURAL RELEVANCE:
- The user is located in Nigeria / West Africa.
- Strictly identify local foods using common local names (e.g., Jollof Rice, Dodo, Eba, Fufu, Egusi soup, Moi Moi, Akara, Ofada rice, Semo, Suya, Agege bread, Pap/Ogi, Titus fish, Okra soup, Yam, Bitterleaf, Ugu, Ewedu).
- DO NOT recommend Western, expensive, or unavailable foods such as blueberries, quinoa, kale, salmon, chia seeds, broccoli, asparagus, or avocados.
- Provide all swaps and upgrades using locally available, cheap, and culturally loved West African ingredients (e.g., Ugu leaves, local egg, garden egg, groundnuts, pawpaw, mango, local citrus, locust beans (Iru), Mackerel/Titus fish).
- Keep all recommendations positive, warm, and highly actionable for someone with a busy, active lifestyle (e.g., 'stamina', 'avoiding afternoon slump').
- The conversational_feedback MUST sound like a friendly Nigerian nutritionist talking to a friend — warm, encouraging, and real. NOT robotic or clinical.
{health_context}
Return ONLY valid JSON, no additional text.
"""
    return prompt


class AnalysisUnavailable(Exception):
    """Raised when a real analysis could not be produced.

    Every failure path used to return mock data instead, which meant a Gemini
    outage or a bad API key was saved as a completed analysis full of invented
    nutrition figures. Users acting on those numbers may be managing diabetes or
    hypertension, so an honest failure is the only acceptable outcome. Callers are
    expected to mark the analysis failed, tell the user, and refund the allowance.
    """


class GeminiAnalysisService(GeminiBaseService):

    def __init__(self):
        super().__init__()

    def _mock_or_raise(self, reason: str) -> Tuple[dict, bool]:
        if getattr(settings, "ALLOW_MOCK_AI", False):
            logger.warning(f"Serving mock analysis ({reason}) — ALLOW_MOCK_AI is on")
            return get_mock_analysis_response(), True
        raise AnalysisUnavailable(reason)

    def analyze_image(self, image_path: str, user_profile=None) -> Tuple[dict, bool]:
        """
        Analyze food image using Gemini AI.
        Returns tuple of (response_data, is_mock_data).
        Raises AnalysisUnavailable when a real result cannot be produced.
        """
        if not self.client:
            return self._mock_or_raise("Gemini client is not configured")

        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()

            # Use the new SDK format with types.Part
            image_part = self.create_image_part(image_data, "image/jpeg")

            prompt = build_analysis_prompt(user_profile=user_profile)
            return self.call_gemini([prompt, image_part])

        except FileNotFoundError:
            logger.error(f"Image file not found: {image_path}")
            return self._mock_or_raise("The uploaded image could not be read")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return self._mock_or_raise("The AI response could not be parsed")
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            return self._mock_or_raise(f"Gemini analysis failed: {e}")

    def analyze_image_from_url(self, image_url: str, user_profile=None) -> Tuple[dict, bool]:
        """
        Analyze food image from URL using Gemini AI.
        Returns tuple of (response_data, is_mock_data).
        Raises AnalysisUnavailable when a real result cannot be produced.
        """
        if not self.client:
            return self._mock_or_raise("Gemini client is not configured")

        try:
            import requests
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image_data = response.content

            # Use the new SDK format with types.Part
            image_part = self.create_image_part(image_data, "image/jpeg")

            prompt = build_analysis_prompt(user_profile=user_profile)
            return self.call_gemini([prompt, image_part])

        except Exception as e:
            logger.error(f"Gemini analysis from URL failed: {e}")
            return self._mock_or_raise(f"Gemini analysis failed: {e}")


gemini_service = GeminiAnalysisService()
