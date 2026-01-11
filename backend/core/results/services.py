import json
import base64
from typing import Tuple

from django.conf import settings
from loguru import logger

from .mock import get_mock_analysis_response

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


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
        "nutritional_recommendations": [
            "One-liner recommendation based on current meal's nutritional content",
            "One-liner recommendation based on health best practices"
        ],
        "balance_improvements": [
            "One-liner suggestion to improve diet balance based on missing food groups",
            "One-liner suggestion for nutrients lacking in the analyzed meal"
        ],
        "timing_recommendations": [
            "One-liner advice on foods to avoid at this meal time",
            "One-liner advice on foods to include at this meal time",
            "One-liner age-appropriate dietary timing suggestion"
        ]
    }
}

Be accurate with portion estimates and nutritional values and micronutrients values.

For next_meal_recommendations:
- nutritional_recommendations: Provide 2-3 one-liner bullet points suggesting what to eat next based on the nutritional content and gaps in the current meal, following evidence-based health practices.
- balance_improvements: Provide 2-3 one-liner bullet points identifying which food groups or nutrients are underrepresented and specific foods to eat in the next meal to achieve better dietary balance.
- timing_recommendations: Provide 2-3 one-liner bullet points advising on meal timing best practices, including foods to avoid or reduce at certain times of day (e.g., heavy carbs late at night), and foods beneficial to consume at specific meal times for optimal health.

Keep all recommendations concise, actionable, and in one-liner bullet point format.
Return ONLY valid JSON, no additional text.
"""


class GeminiAnalysisService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        if GENAI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None

    def analyze_image(self, image_path: str) -> Tuple[dict, bool]:
        """
        Analyze food image using Gemini AI.
        Returns tuple of (response_data, is_mock_data)
        """
        if not self.model:
            logger.warning("Gemini not configured, using mock data")
            return get_mock_analysis_response(), True

        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            image_parts = [{
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_data).decode('utf-8')
            }]

            response = self.model.generate_content([ANALYSIS_PROMPT, image_parts[0]])
            
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            logger.info("Successfully analyzed image with Gemini")
            return result, False

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
        if not self.model:
            logger.warning("Gemini not configured, using mock data")
            return get_mock_analysis_response(), True

        try:
            import requests
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image_data = response.content

            image_parts = [{
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_data).decode('utf-8')
            }]

            ai_response = self.model.generate_content([ANALYSIS_PROMPT, image_parts[0]])
            
            response_text = ai_response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            logger.info("Successfully analyzed image from URL with Gemini")
            return result, False

        except Exception as e:
            logger.error(f"Gemini analysis from URL failed: {e}")
            return get_mock_analysis_response(), True


gemini_service = GeminiAnalysisService()
