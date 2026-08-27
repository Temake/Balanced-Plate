import json
from typing import Tuple

from loguru import logger

from core.utils.services import GeminiBaseService


def get_mock_meal_plan():
    """Fallback mock data: a full week of Nigerian/West African meals."""
    return {
        "meals": [
            # Monday
            {"day": "monday", "meal_type": "breakfast", "food_name": "Akara with Pap",
             "description": "Fried bean cakes served with smooth corn pap (ogi)", "prep_time_minutes": 25,
             "health_notes": "Good protein source to start the day. Pap provides steady energy."},
            {"day": "monday", "meal_type": "lunch", "food_name": "Jollof Rice with Grilled Chicken",
             "description": "Smoky party-style jollof rice with seasoned grilled chicken", "prep_time_minutes": 45,
             "health_notes": "Balanced meal with protein and carbs. Use less oil for a lighter version."},
            {"day": "monday", "meal_type": "dinner", "food_name": "Efo Riro with Pounded Yam",
             "description": "Rich spinach stew with assorted meat, served with pounded yam", "prep_time_minutes": 40,
             "health_notes": "Packed with iron and vitamins from spinach. Control portion of pounded yam."},
            {"day": "monday", "meal_type": "snack", "food_name": "Garden Egg with Groundnut",
             "description": "Fresh garden eggs with roasted groundnuts", "prep_time_minutes": 5,
             "health_notes": "Low-calorie, high-fibre snack. Groundnuts add healthy fats."},
            # Tuesday
            {"day": "tuesday", "meal_type": "breakfast", "food_name": "Moi Moi with Custard",
             "description": "Steamed bean pudding served with creamy custard", "prep_time_minutes": 30,
             "health_notes": "High protein, no oil needed. A much healthier alternative to akara."},
            {"day": "tuesday", "meal_type": "lunch", "food_name": "Ofada Rice with Ayamase Sauce",
             "description": "Local ofada rice with spicy green pepper sauce", "prep_time_minutes": 50,
             "health_notes": "Ofada rice retains more nutrients than polished rice. Watch the oil in ayamase."},
            {"day": "tuesday", "meal_type": "dinner", "food_name": "Pepper Soup with Yam",
             "description": "Spicy goat meat pepper soup with boiled yam", "prep_time_minutes": 35,
             "health_notes": "Light and warming. Pepper aids digestion. Yam provides complex carbs."},
            {"day": "tuesday", "meal_type": "snack", "food_name": "Roasted Plantain with Groundnut",
             "description": "Bole (roasted plantain) with groundnut", "prep_time_minutes": 15,
             "health_notes": "Good source of potassium. Groundnut adds protein."},
            # Wednesday
            {"day": "wednesday", "meal_type": "breakfast", "food_name": "Yam and Egg Sauce",
             "description": "Boiled yam with tomato and egg stir-fry", "prep_time_minutes": 20,
             "health_notes": "Great combo of complex carbs and protein. Use minimal oil."},
            {"day": "wednesday", "meal_type": "lunch", "food_name": "Beans and Plantain Porridge",
             "description": "Honey beans cooked with ripe plantain", "prep_time_minutes": 35,
             "health_notes": "Excellent plant protein and fibre. Very filling and affordable."},
            {"day": "wednesday", "meal_type": "dinner", "food_name": "Egusi Soup with Semo",
             "description": "Melon seed soup with vegetables and semolina", "prep_time_minutes": 40,
             "health_notes": "Rich in healthy fats from melon seeds. Add plenty of Ugu leaves."},
            {"day": "wednesday", "meal_type": "snack", "food_name": "Chin Chin (Baked)",
             "description": "Homemade baked chin chin with reduced sugar", "prep_time_minutes": 20,
             "health_notes": "Baked version has less fat than fried. Good with tea or zobo."},
            # Thursday
            {"day": "thursday", "meal_type": "breakfast", "food_name": "Oats with Banana and Groundnut",
             "description": "Warm oats topped with sliced banana and crushed groundnuts", "prep_time_minutes": 10,
             "health_notes": "Heart-healthy breakfast. Oats lower cholesterol, banana adds potassium."},
            {"day": "thursday", "meal_type": "lunch", "food_name": "Fried Rice with Titus Fish",
             "description": "Nigerian-style fried rice with grilled mackerel (titus)", "prep_time_minutes": 40,
             "health_notes": "Titus fish is rich in omega-3. Add plenty of vegetables to the rice."},
            {"day": "thursday", "meal_type": "dinner", "food_name": "Okra Soup with Eba",
             "description": "Draw soup with fresh okra, crayfish, and stockfish, served with eba", "prep_time_minutes": 30,
             "health_notes": "Okra is great for digestion. Use moderate eba portion."},
            {"day": "thursday", "meal_type": "snack", "food_name": "Pawpaw (Papaya)",
             "description": "Fresh sliced pawpaw", "prep_time_minutes": 5,
             "health_notes": "Rich in vitamin C and digestive enzymes. Perfect afternoon snack."},
            # Friday
            {"day": "friday", "meal_type": "breakfast", "food_name": "Bread and Egg with Tea",
             "description": "Toasted Agege bread with scrambled eggs and hot tea", "prep_time_minutes": 15,
             "health_notes": "Quick protein-rich breakfast. Use whole wheat bread for extra fibre."},
            {"day": "friday", "meal_type": "lunch", "food_name": "Amala with Ewedu and Gbegiri",
             "description": "Yam flour meal with jute leaf soup and bean soup", "prep_time_minutes": 35,
             "health_notes": "Traditional Yoruba combo. Ewedu is rich in vitamins. Gbegiri adds protein."},
            {"day": "friday", "meal_type": "dinner", "food_name": "Grilled Suya with Vegetables",
             "description": "Spicy grilled beef suya with fresh onions, tomatoes, and cabbage", "prep_time_minutes": 25,
             "health_notes": "High protein, low carb option. The spice mix (yaji) aids metabolism."},
            {"day": "friday", "meal_type": "snack", "food_name": "Zobo Drink with Tiger Nuts",
             "description": "Chilled hibiscus drink with tiger nut snack", "prep_time_minutes": 10,
             "health_notes": "Zobo is rich in antioxidants. Tiger nuts are high in fibre and iron."},
            # Saturday
            {"day": "saturday", "meal_type": "breakfast", "food_name": "Pancakes with Groundnut Butter",
             "description": "Fluffy pancakes with local groundnut butter and honey", "prep_time_minutes": 20,
             "health_notes": "Use whole wheat flour for healthier version. Groundnut butter adds protein."},
            {"day": "saturday", "meal_type": "lunch", "food_name": "Native Jollof Rice with Assorted Meat",
             "description": "Firewood-flavored jollof with assorted proteins", "prep_time_minutes": 60,
             "health_notes": "Weekend treat. Balance with vegetables. Watch portion sizes."},
            {"day": "saturday", "meal_type": "dinner", "food_name": "Bitterleaf Soup with Fufu",
             "description": "Traditional bitterleaf soup with cocoyam fufu", "prep_time_minutes": 45,
             "health_notes": "Bitterleaf has medicinal properties. Good for digestion and blood sugar."},
            {"day": "saturday", "meal_type": "snack", "food_name": "Coconut and Cashew Mix",
             "description": "Fresh coconut chunks with roasted cashew nuts", "prep_time_minutes": 5,
             "health_notes": "Healthy fats from coconut and cashews. Good energy booster."},
            # Sunday
            {"day": "sunday", "meal_type": "breakfast", "food_name": "Fried Plantain with Beans",
             "description": "Ripe fried plantain (dodo) with stewed beans", "prep_time_minutes": 25,
             "health_notes": "Classic Sunday breakfast. Beans provide protein and fibre."},
            {"day": "sunday", "meal_type": "lunch", "food_name": "Coconut Rice with Chicken Stew",
             "description": "Fragrant coconut rice with rich tomato-based chicken stew", "prep_time_minutes": 50,
             "health_notes": "Coconut adds healthy fats. Use skinless chicken for lean protein."},
            {"day": "sunday", "meal_type": "dinner", "food_name": "Vegetable Soup with Wheat Meal",
             "description": "Fresh vegetable soup with edible mushrooms, served with wheat meal (semo)", "prep_time_minutes": 35,
             "health_notes": "Light and nutritious way to end the week. Packed with vitamins."},
            {"day": "sunday", "meal_type": "snack", "food_name": "Mango and Yoghurt",
             "description": "Fresh mango slices with plain yoghurt", "prep_time_minutes": 5,
             "health_notes": "Probiotics from yoghurt support gut health. Mango provides vitamin A."},
        ]
    }


def build_meal_plan_prompt(
    user_profile,
    week_start_date,
    budget_level,
    weekly_budget_naira=None,
    household_size=1,
    catalogue_text=None,
):
    """
    Build the AI prompt for generating a 7-day Nigerian meal plan.

    When a budget and a priced catalogue are supplied, the plan is constrained to a
    real naira figure and every meal must come back with a costable ingredient list.
    Previously the budget was the word "low", "medium" or "flexible", which meant the
    model decided what those meant and nothing downstream could check the answer.
    """
    health_conditions = user_profile.get("health_conditions", [])
    if isinstance(health_conditions, list):
        health_conditions_str = ", ".join(health_conditions) if health_conditions else "None"
    else:
        health_conditions_str = str(health_conditions) if health_conditions else "None"

    budget_section = ""
    if weekly_budget_naira and catalogue_text:
        per_person_per_day = weekly_budget_naira / (7 * max(household_size, 1))
        budget_section = f"""

HARD BUDGET CONSTRAINT — THIS IS THE MOST IMPORTANT RULE:
- Total food budget for the week: N{weekly_budget_naira:,.0f} for {household_size} person(s).
- That is about N{per_person_per_day:,.0f} per person per day. Plan to it.
- The full week of meals MUST cost at or under N{weekly_budget_naira:,.0f} at the prices below.
- Ingredients repeat across meals in real cooking. Buy once, use across several meals —
  a tuber of yam or a bag of rice spans multiple days. Plan the week as a shop, not as
  28 unrelated meals.
- If the budget is tight, lean on beans, garri, eggs, groundnut, seasonal vegetables and
  smaller portions of meat rather than dropping protein altogether.

PRICED INGREDIENT CATALOGUE (current prices, per unit shown):
{catalogue_text}

INGREDIENT RULES:
- You may ONLY use ingredients from the catalogue above. Do not invent ingredients.
- Use the EXACT ingredient name and the EXACT unit shown for that ingredient.
- For every meal, return an `ingredients` list of {{"name", "qty", "unit"}} covering the
  whole meal for all {household_size} person(s). `qty` is a number in that ingredient's unit
  and may be fractional (e.g. 0.25 kg).
- Also return `estimated_cost_naira` per meal, computed from the catalogue prices."""

    prompt = f"""Generate a complete 7-day meal plan (Monday to Sunday) with 3 meals and 1 snack per day.

USER PROFILE:
- Dietary Goal: {user_profile.get('dietary_goal', 'general_health')}
- Dietary Preference: {user_profile.get('dietary_preference', 'none')}
- Health Conditions: {health_conditions_str}
- Budget Level: {budget_level}
- Household Size: {household_size}
- Week Starting: {week_start_date}{budget_section}

CRITICAL REQUIREMENTS:
1. ALL meals MUST be Nigerian / West African foods. Use common local names.
2. Use local measurements and affordable, locally available ingredients.
3. Meals should be realistic and culturally relevant.
4. DO NOT suggest Western, expensive, or hard-to-find foods (no quinoa, kale, salmon, chia seeds, avocado, blueberries, etc.).
5. Use ingredients like: Jollof rice, Eba, Fufu, Amala, Semo, Pounded Yam, Egusi, Efo Riro, Okra soup, Akara, Moi Moi, Pap/Ogi, Suya, Dodo, Ofada rice, Garden egg, Groundnut, Ugu, Ewedu, Titus fish, Locust beans (Iru), Bitterleaf, Pawpaw, Mango, Tiger nut, Zobo.

HEALTH-AWARE RULES:
- If user has 'diabetes': Focus on low-carb options, avoid excessive starchy swallows, suggest lighter alternatives.
- If user has 'hypertension': Reduce salt and oil, suggest lighter preparation methods.
- If user preference is 'keto': Minimize carbs, focus on protein and fat-rich Nigerian foods.
- If user goal is 'weight_loss': Emphasize portion control, lighter meals, more vegetables.
- If user goal is 'muscle_gain': Focus on protein-rich meals (beans, eggs, fish, meat).
- If user goal is 'energy_focus': Focus on complex carbs and balanced meals for sustained energy.

BUDGET-AWARE RULES (used only when no naira budget is given above):
- "low": Use the most affordable ingredients (beans, yam, garri, local vegetables, eggs, sardines). Avoid expensive proteins.
- "medium": Balanced mix — can include chicken, fish, and moderate variety.
- "flexible": Include premium options (goat meat, prawns, assorted meats, wider variety).

Return ONLY valid JSON in this exact format:
{{
    "meals": [
        {{
            "day": "monday",
            "meal_type": "breakfast",
            "food_name": "Akara with Pap",
            "description": "Fried bean cakes served with smooth corn pap",
            "prep_time_minutes": 25,
            "health_notes": "Good protein source to start the day",
            "ingredients": [
                {{"name": "Beans (honey)", "qty": 0.3, "unit": "kg"}},
                {{"name": "Palm oil", "qty": 0.1, "unit": "litre"}},
                {{"name": "Pap (ogi)", "qty": 1, "unit": "sachet"}}
            ],
            "estimated_cost_naira": 1280
        }}
    ]
}}

Include exactly 28 entries (4 per day × 7 days).
Days must be lowercase: monday, tuesday, wednesday, thursday, friday, saturday, sunday.
Meal types must be lowercase: breakfast, lunch, dinner, snack.
Return ONLY valid JSON, no additional text.
"""
    return prompt


class MealPlanGenerationService(GeminiBaseService):

    def __init__(self):
        super().__init__()

    def generate_meal_plan(
        self,
        user_profile: dict,
        week_start_date,
        budget_level: str,
        weekly_budget_naira=None,
        household_size: int = 1,
        catalogue_text=None,
    ) -> Tuple[dict, bool]:
        """
        Generate a 7-day meal plan using Gemini AI.
        Returns tuple of (response_data, is_mock_data).
        """
        if not self.client:
            logger.warning("Gemini client not configured, using mock meal plan data")
            return get_mock_meal_plan(), True

        try:
            prompt = build_meal_plan_prompt(
                user_profile,
                week_start_date,
                budget_level,
                weekly_budget_naira=weekly_budget_naira,
                household_size=household_size,
                catalogue_text=catalogue_text,
            )
            return self.call_gemini([prompt])

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini meal plan response: {e}")
            return get_mock_meal_plan(), True
        except Exception as e:
            logger.error(f"Gemini meal plan generation failed: {e}")
            return get_mock_meal_plan(), True


meal_plan_service = MealPlanGenerationService()


# How far over budget a plan may land before it is worth spending a second
# generation on. Under this, the overage is within our own pricing error anyway.
BUDGET_OVERSHOOT_TOLERANCE = 0.15


def generate_costed_meal_plan(
    user_profile,
    week_start_date,
    budget_level,
    weekly_budget_kobo=None,
    household_size=1,
    area=None,
):
    """Generate a plan, cost it against our prices, and retry once if it overshoots.

    Returns (result, is_mock, plan_cost). `plan_cost` is None when there is nothing to
    cost against — no area configured, no budget, or an empty catalogue — in which case
    this degrades to the old unpriced behaviour rather than failing.

    The AI returns its own `estimated_cost_naira` and we deliberately ignore it. Model
    arithmetic is not something to hold a user's grocery budget to.
    """
    from core.pricing.services import (
        cost_meals,
        format_catalogue_for_prompt,
        get_priced_catalogue,
    )

    catalogue_text = None
    weekly_budget_naira = None
    if area is not None and weekly_budget_kobo:
        catalogue = get_priced_catalogue(area)
        if catalogue:
            catalogue_text = format_catalogue_for_prompt(catalogue)
            weekly_budget_naira = weekly_budget_kobo / 100

    result, is_mock = meal_plan_service.generate_meal_plan(
        user_profile=user_profile,
        week_start_date=week_start_date,
        budget_level=budget_level,
        weekly_budget_naira=weekly_budget_naira,
        household_size=household_size,
        catalogue_text=catalogue_text,
    )

    if catalogue_text is None or area is None:
        return result, is_mock, None

    plan_cost = cost_meals(result.get("meals", []), area)

    over_by = plan_cost.total_kobo - weekly_budget_kobo
    if not is_mock and over_by > weekly_budget_kobo * BUDGET_OVERSHOOT_TOLERANCE:
        logger.info(
            f"Meal plan came in {over_by / 100:,.0f} naira over a "
            f"{weekly_budget_kobo / 100:,.0f} naira budget; regenerating once"
        )
        retry_text = (
            f"{catalogue_text}\n\nYOUR PREVIOUS ATTEMPT COST "
            f"N{plan_cost.total_kobo / 100:,.0f}, which is over the "
            f"N{weekly_budget_naira:,.0f} budget. Cut it back: smaller meat portions, "
            f"cheaper proteins (beans, eggs, groundnut), and reuse ingredients across days."
        )
        retry_result, retry_is_mock = meal_plan_service.generate_meal_plan(
            user_profile=user_profile,
            week_start_date=week_start_date,
            budget_level=budget_level,
            weekly_budget_naira=weekly_budget_naira,
            household_size=household_size,
            catalogue_text=retry_text,
        )
        if not retry_is_mock:
            retry_cost = cost_meals(retry_result.get("meals", []), area)
            # Keep the retry only if it actually helped.
            if retry_cost.total_kobo < plan_cost.total_kobo:
                return retry_result, retry_is_mock, retry_cost

    return result, is_mock, plan_cost
