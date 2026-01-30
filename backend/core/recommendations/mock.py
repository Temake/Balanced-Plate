def get_mock_weekly_recommendation() -> dict:
    """Return mock recommendation data when Gemini is unavailable."""
    
    return {
        "health_report": {
            "summary": "Your weekly nutrition shows moderate balance with room for improvement in vegetable and micronutrient intake.",
            "strengths": [
                "Consistent meal timing throughout the week",
                "Good protein intake levels"
            ],
            "areas_for_improvement": [
                "Increase vegetable and fruit consumption",
                "Improve micronutrient diversity"
            ],
            "balance_assessment": "Your balance score indicates a moderately balanced diet that could benefit from more variety."
        },
        "recommendations": {
            "nutrition_recommendations": [
                "Aim to include a protein source with every meal to maintain muscle health",
                "Consider reducing refined carbohydrates and increasing complex carbs from whole grains",
                "Add healthy fats like avocado, nuts, or olive oil to improve nutrient absorption"
            ],
            "meal_timing_recommendations": [
                "Try to have breakfast within 2 hours of waking to boost metabolism",
                "Space meals 4-5 hours apart to maintain stable energy levels",
                "Avoid heavy meals close to bedtime for better sleep quality"
            ],
            "micronutrient_recommendations": [
                "Include more leafy greens for iron and folate",
                "Add citrus fruits or berries for vitamin C",
                "Consider fortified foods or supplements for vitamin D"
            ],
            "weekly_meal_plan_suggestions": [
                "Plan one meatless day with legume-based protein",
                "Prepare vegetable-rich soups or stews for easy nutrient intake",
                "Include a variety of colored vegetables throughout the week"
            ],
            "lifestyle_recommendations": [
                "Stay hydrated by drinking water with each meal",
                "Practice mindful eating by avoiding screens during meals"
            ]
        },
        "priority_actions": [
            "Add at least 2 servings of vegetables to your daily meals",
            "Include a source of vitamin C with iron-rich foods",
            "Plan and prep healthy snacks for the week"
        ],
        "weekly_goals": [
            "Achieve a balance score of 0.7 or higher on at least 5 days",
            "Include 5 different vegetables in your meals this week",
            "Reduce snack frequency by replacing with nutrient-dense options"
        ]
    }