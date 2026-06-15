import json
from typing import Tuple

from loguru import logger

from core.utils.services import GeminiBaseService


COOKING_GUIDE_PROMPT = """
You are a friendly Nigerian cooking assistant. Generate a detailed step-by-step cooking guide for the dish: {dish_name}.

USER DIETARY PREFERENCE: {dietary_preference}
USER HEALTH CONDITIONS: {health_conditions}

INSTRUCTIONS:
- Provide a comprehensive cooking guide with clear, numbered steps.
- Use local Nigerian measurements (cups, handfuls, cooking spoons, derica, paint rubber) where appropriate.
- Use local Nigerian ingredient names and common cooking methods (e.g., parboiling rice, blending pepper, frying in palm oil or groundnut oil).
- Keep instructions warm, friendly, and conversational — like a Nigerian auntie teaching someone to cook.
- If the user has health conditions, adapt the recipe accordingly:
  - Diabetes: reduce carbohydrate portions, suggest alternatives like unripe plantain or ofada rice
  - Hypertension: reduce salt and seasoning cubes, use natural spices like locust beans (iru/dawadawa), garlic, and ginger instead
  - Keto: minimize carbs, increase healthy fats and protein
  - Heart disease: reduce oil usage, avoid excessive frying, suggest healthier cooking methods like grilling or boiling
- If dietary preference is vegetarian or vegan, replace meat/fish with plant-based Nigerian protein sources (e.g., beans, soy chunks, mushrooms, egusi, groundnuts).

Return your response in the following JSON format ONLY (no additional text):
{{
    "dish_name": "{dish_name}",
    "servings": 4,
    "total_prep_time_minutes": 45,
    "difficulty": "Medium",
    "ingredients": [
        {{"name": "Long grain rice", "quantity": "3 cups", "is_essential": true}},
        {{"name": "Tomato paste", "quantity": "3 tablespoons", "is_essential": true}}
    ],
    "steps": [
        {{
            "step_number": 1,
            "instruction": "Wash the rice thoroughly in cold water until the water runs clear",
            "duration_minutes": 5,
            "tip": "This removes excess starch and prevents the rice from being sticky"
        }}
    ],
    "health_notes": "Optional notes based on user's health conditions — leave empty string if no conditions"
}}

Return ONLY valid JSON, no additional text.
"""


class CookingAssistantService(GeminiBaseService):
    """Service for generating step-by-step cooking guides using Gemini AI."""

    def __init__(self):
        super().__init__()

    def generate_cooking_guide(
        self,
        dish_name: str,
        dietary_preference: str = "none",
        health_conditions: list = None,
    ) -> Tuple[dict, bool]:
        """Generate a cooking guide for a Nigerian dish.

        Args:
            dish_name: The name of the dish to generate a guide for.
            dietary_preference: User's dietary preference (e.g., 'none', 'vegetarian', 'vegan', 'keto').
            health_conditions: List of user's health conditions (e.g., ['diabetes', 'hypertension']).

        Returns:
            Tuple of (cooking_guide_dict, is_mock_bool)
        """
        if health_conditions is None:
            health_conditions = []

        if not self.client:
            logger.warning("Gemini client not configured, using mock data")
            return self.get_mock_cooking_guide(dish_name), True

        try:
            prompt = COOKING_GUIDE_PROMPT.format(
                dish_name=dish_name,
                dietary_preference=dietary_preference,
                health_conditions=", ".join(health_conditions) if health_conditions else "None",
            )
            return self.call_gemini(prompt)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response for cooking guide: {e}")
            return self.get_mock_cooking_guide(dish_name), True
        except Exception as e:
            logger.error(f"Gemini cooking guide generation failed: {e}")
            return self.get_mock_cooking_guide(dish_name), True

    @staticmethod
    def get_mock_cooking_guide(dish_name: str) -> dict:
        """Return a mock cooking guide for testing/fallback purposes."""
        return {
            "dish_name": dish_name,
            "servings": 4,
            "total_prep_time_minutes": 60,
            "difficulty": "Medium",
            "ingredients": [
                {"name": "Long grain rice", "quantity": "3 cups", "is_essential": True},
                {"name": "Tomato paste", "quantity": "3 tablespoons", "is_essential": True},
                {"name": "Fresh tomatoes", "quantity": "6 medium-sized", "is_essential": True},
                {"name": "Red bell pepper (tatashe)", "quantity": "4 pieces", "is_essential": True},
                {"name": "Scotch bonnet pepper (ata rodo)", "quantity": "3 pieces", "is_essential": True},
                {"name": "Onions", "quantity": "2 large", "is_essential": True},
                {"name": "Vegetable oil or groundnut oil", "quantity": "1/2 cup", "is_essential": True},
                {"name": "Chicken or turkey", "quantity": "1 kg", "is_essential": False},
                {"name": "Seasoning cubes", "quantity": "2 cubes", "is_essential": True},
                {"name": "Curry powder", "quantity": "1 teaspoon", "is_essential": False},
                {"name": "Thyme", "quantity": "1 teaspoon", "is_essential": False},
                {"name": "Bay leaves", "quantity": "2 leaves", "is_essential": False},
                {"name": "Salt", "quantity": "To taste", "is_essential": True},
                {"name": "Chicken stock", "quantity": "2 cups", "is_essential": True},
            ],
            "steps": [
                {
                    "step_number": 1,
                    "instruction": "Wash the rice in cold water about 3-4 times until the water runs clear, then soak in warm water for 15-20 minutes. This helps the rice cook evenly.",
                    "duration_minutes": 20,
                    "tip": "Soaking the rice helps it absorb water and cook faster — no more hard-belly rice!",
                },
                {
                    "step_number": 2,
                    "instruction": "Blend the fresh tomatoes, red bell pepper (tatashe), scotch bonnet pepper (ata rodo), and one onion together until smooth.",
                    "duration_minutes": 5,
                    "tip": "Don't add too much water when blending — you want a thick paste, not juice.",
                },
                {
                    "step_number": 3,
                    "instruction": "Dice the remaining onion. Heat the vegetable oil in a large pot on medium heat, then fry the diced onions until they turn golden brown.",
                    "duration_minutes": 5,
                    "tip": "Golden onions give the Jollof that deep, rich base flavour that makes people ask for your secret.",
                },
                {
                    "step_number": 4,
                    "instruction": "Add the tomato paste to the pot and fry for 2-3 minutes, stirring continuously so it doesn't burn.",
                    "duration_minutes": 3,
                    "tip": "Frying the tomato paste removes the raw, tinny taste and brings out a lovely deep red colour.",
                },
                {
                    "step_number": 5,
                    "instruction": "Pour in the blended pepper mixture and cook on medium-high heat, stirring occasionally, until the oil floats on top and the sauce has reduced significantly.",
                    "duration_minutes": 20,
                    "tip": "This is the most important step! The sauce must fry well — you'll know it's ready when you see the oil sitting on top. Patience is key!",
                },
                {
                    "step_number": 6,
                    "instruction": "Add the seasoning cubes, curry, thyme, bay leaves, salt, and chicken stock. Stir well and let it simmer for 2-3 minutes.",
                    "duration_minutes": 3,
                    "tip": "Taste the sauce before adding rice — adjust seasoning now because it's harder to fix later.",
                },
                {
                    "step_number": 7,
                    "instruction": "Drain the soaked rice and add it to the pot. Stir gently to make sure every grain is coated with the sauce. The liquid should be about 1 inch above the rice.",
                    "duration_minutes": 2,
                    "tip": "If the liquid is not enough, add a little hot water. Too much water = soggy rice, too little = burnt bottom.",
                },
                {
                    "step_number": 8,
                    "instruction": "Cover the pot tightly with aluminium foil, then place the lid on top. Reduce heat to the lowest setting and cook for 30 minutes without opening the lid.",
                    "duration_minutes": 30,
                    "tip": "The foil traps steam and prevents it from escaping — this is the secret to getting that perfect, fluffy Jollof with the smoky party rice flavour!",
                },
                {
                    "step_number": 9,
                    "instruction": "After 30 minutes, open the pot and gently fluff the rice with a fork. Check if the rice is cooked through — if not, sprinkle a little water, cover, and cook for another 5-10 minutes.",
                    "duration_minutes": 5,
                    "tip": "Don't stir too vigorously or you'll break the rice grains. Gentle, gentle!",
                },
            ],
            "health_notes": "",
        }


cooking_assistant_service = CookingAssistantService()
