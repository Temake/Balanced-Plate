import random


MOCK_MEALS = [
    {
        "detected_foods": [
            {
                "name": "rice",
                "confidence": 0.94,
                "portion_estimate": "1 cup",
                "nutritional_info": {
                    "calories": 200,
                    "protein": 4.2,
                    "carbs": 44,
                    "fat": 0.4
                }
            },
            {
                "name": "beans",
                "confidence": 0.88,
                "portion_estimate": "1/2 cup",
                "nutritional_info": {
                    "calories": 120,
                    "protein": 7,
                    "carbs": 20,
                    "fat": 0.5
                }
            }
        ],
        "meal_type": "Lunch",
        "balance_score": 0.7,
        "suggestions": [
            "Add vegetables for more fiber",
            "Include a fruit for vitamins"
        ]
    },
    {
        "detected_foods": [
            {
                "name": "jollof rice",
                "confidence": 0.92,
                "portion_estimate": "1.5 cups",
                "nutritional_info": {
                    "calories": 350,
                    "protein": 6,
                    "carbs": 55,
                    "fat": 12
                }
            },
            {
                "name": "fried chicken",
                "confidence": 0.89,
                "portion_estimate": "1 piece",
                "nutritional_info": {
                    "calories": 280,
                    "protein": 25,
                    "carbs": 10,
                    "fat": 16
                }
            },
            {
                "name": "plantain",
                "confidence": 0.85,
                "portion_estimate": "2 slices",
                "nutritional_info": {
                    "calories": 120,
                    "protein": 1,
                    "carbs": 32,
                    "fat": 0.3
                }
            }
        ],
        "meal_type": "Dinner",
        "balance_score": 0.65,
        "suggestions": [
            "Consider adding a salad for more vegetables",
            "Reduce fried foods for heart health",
            "Add more protein variety"
        ]
    },
    {
        "detected_foods": [
            {
                "name": "bread",
                "confidence": 0.95,
                "portion_estimate": "2 slices",
                "nutritional_info": {
                    "calories": 160,
                    "protein": 5,
                    "carbs": 30,
                    "fat": 2
                }
            },
            {
                "name": "eggs",
                "confidence": 0.91,
                "portion_estimate": "2 eggs",
                "nutritional_info": {
                    "calories": 140,
                    "protein": 12,
                    "carbs": 1,
                    "fat": 10
                }
            }
        ],
        "meal_type": "Breakfast",
        "balance_score": 0.75,
        "suggestions": [
            "Add fruits for more vitamins",
            "Consider whole grain bread for more fiber"
        ]
    }
]


def get_mock_analysis_response(randomize: bool = True) -> dict:
    if randomize:
        return random.choice(MOCK_MEALS)
    return MOCK_MEALS[0]
