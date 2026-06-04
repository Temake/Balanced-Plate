import json
from typing import Tuple

from django.conf import settings
from loguru import logger

from .mock import get_mock_analysis_response
from core.utils.helpers.recommendations import WeeklyRecommendationHelper
from core.utils.services import GeminiBaseService



ANALYSIS_PROMPT = """
Analyze this food image and provide nutritional information in the following JSON format:
{
    "detected_foods": [
        {
            "name": "food name",
            "confidence": 0.0 to 1.0,
            "portion_estimate": "estimated portion size",
            "nutritional_info": {
                "calories": number,
                "protein": number in grams,
                "carbs": number in grams,
                "fat": number in grams,
                "dairy": number in grams,
                "vegetable": number in grams,
                "fruit": number in grams
            },
            "micronutrients": {
                "vitamin_c": number in mg,
                "vitamin_d": number in mcg,
                "vitamin_b12": number in mcg,
                "calcium": number in mg,
                "iron": number in mg,
                "zinc": number in mg,
                "magnesium": number in mg,
                "folate": number in mg
            },
            "food_group": "Carbs/Proteins/Vegetables/Fruits/Dairy"
        }
    ],
    "meal_type": "Breakfast/Lunch/Dinner/Snack",
    "balance_score": 0.0 to 1.0 (nutritional balance rating),
    "next_meal_recommendations": {
        "layperson_summary": "Warm, conversational 1-2 sentence assessment of this meal in simple terms. Avoid dry clinical talk.",
        "stamina_forecast": "1-sentence energy prediction (e.g. 'High focus forecast, no 3:00 PM sugar slump!')",
        "simple_food_swaps": [
            "A practical local ingredient swap (e.g., 'Swap fried plantain (Dodo) for boiled/baked plantain to save on excess oils.')"
        ],
        "easy_upgrades": [
            "An affordable local ingredient addition to balance this specific plate (e.g., 'Add a spoonful of Efo Riro or steamed Okra for a vitamin boost.')"
        ]
    }
}

Be accurate with portion estimates and nutritional values and micronutrients values.

CRITICAL INSTRUCTIONS FOR GEOGRAPHICAL & CULTURAL RELEVANCE:
- The user is located in Nigeria / West Africa.
- Strictly identify local foods using common local names (e.g., Jollof Rice, Dodo, Eba, Fufu, Egusi soup, Moi Moi, Akara, Ofada rice, Semo, Suya, Agege bread, Pap/Ogi, Titus fish, Okra soup, Yam, Bitterleaf, Ugu, Ewedu).
- DO NOT recommend Western, expensive, or unavailable foods such as blueberries, quinoa, kale, salmon, chia seeds, broccoli, asparagus, or avocados.
- Provide all swaps and upgrades using locally available, cheap, and culturally loved West African ingredients (e.g., Ugu leaves, local egg, garden egg, groundnuts, pawpaw, mango, local citrus, locust beans (Iru), Mackerel/Titus fish).
- Keep all recommendations positive, warm, and highly actionable for someone with a busy, active lifestyle (e.g., 'stamina', 'avoiding afternoon slump').

Return ONLY valid JSON, no additional text.
"""

class GeminiAnalysisService(GeminiBaseService):

    def __init__(self):
        super().__init__()

    def analyze_image(self, image_path: str) -> Tuple[dict, bool]:
        """
        Analyze food image using Gemini AI.
        Returns tuple of (response_data, is_mock_data)
        """
        if not self.client:
            logger.warning("Gemini client not configured, using mock data")
            return get_mock_analysis_response(), True

        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Use the new SDK format with types.Part
            image_part = self.create_image_part(image_data, "image/jpeg")

            return self.call_gemini([ANALYSIS_PROMPT, image_part])

        except FileNotFoundError:
            logger.error(f"Image file not found: {image_path}")
            return get_mock_analysis_response(), True
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return get_mock_analysis_response(), True
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            return get_mock_analysis_response(), True

    def analyze_image_from_url(self, image_url: str) -> Tuple[dict, bool]:
        """
        Analyze food image from URL using Gemini AI.
        Returns tuple of (response_data, is_mock_data)
        """
        if not self.client:
            logger.warning("Gemini client not configured, using mock data")
            return get_mock_analysis_response(), True

        try:
            import requests
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image_data = response.content

            # Use the new SDK format with types.Part
            image_part = self.create_image_part(image_data, "image/jpeg")

            return self.call_gemini([ANALYSIS_PROMPT, image_part])

        except Exception as e:
            logger.error(f"Gemini analysis from URL failed: {e}")
            return get_mock_analysis_response(), True


gemini_service = GeminiAnalysisService()
