"""Resolving prices, costing meals, and turning budget tiers into naira.

The one rule that shapes this module: a price is an observation with a date, and
"the current price" is a query result, never a stored field. Everything here takes
an `as_of` date and reports how stale the underlying observation was.
"""

from dataclasses import dataclass, field
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from loguru import logger

from .models import BudgetTier, Ingredient, PriceArea, PriceObservation


# Beyond this, an observation is too old to project forward from. Nigerian food
# inflation has been running around 16% a year, so a price this stale is wrong by
# enough that quoting it does more damage than admitting we don't know.
MAX_PRICE_AGE_DAYS = 90

# Applied when projecting an older observation forward to today. Derived from ~16%
# annual food inflation; replace with per-commodity rates once the RTFP importer
# lands, since it publishes inflation columns per commodity.
MONTHLY_INFLATION_RATE = Decimal("0.0125")

# Costing a 28-meal plan compounds error across ~30 ingredients, so the total is
# always presented as a band rather than a single figure.
COST_RANGE_TOLERANCE = Decimal("0.10")


@dataclass
class ResolvedPrice:
    ingredient: Ingredient
    price_kobo: int
    unit: str
    observed_on: object
    days_stale: int
    source: str
    area_name: str
    was_projected: bool


@dataclass
class MealCost:
    """The cost of one meal, plus everything we could not price."""

    total_kobo: int = 0
    priced_items: list = field(default_factory=list)
    unknown_items: list = field(default_factory=list)

    @property
    def has_gaps(self):
        return bool(self.unknown_items)


@dataclass
class PlanCost:
    total_kobo: int = 0
    low_kobo: int = 0
    high_kobo: int = 0
    priced_meals: int = 0
    unpriced_meals: int = 0
    unknown_items: list = field(default_factory=list)
    area_name: str = ""
    oldest_observation: object = None


def get_default_area():
    return (
        PriceArea.objects.filter(is_default=True, is_active=True).first()
        or PriceArea.objects.filter(is_active=True).order_by("name").first()
    )


def resolve_area(user=None, area=None):
    """Where should we price for? The user's stated area, else the default city."""
    if area is not None:
        return area
    user_area = getattr(user, "price_area", None)
    if user_area is not None and getattr(user_area, "is_active", False):
        return user_area
    return get_default_area()


def _project_forward(price_kobo, months_elapsed):
    if months_elapsed <= 0:
        return price_kobo
    factor = (Decimal(1) + MONTHLY_INFLATION_RATE) ** months_elapsed
    return int(Decimal(price_kobo) * factor)


def resolve_price(ingredient, area, as_of=None):
    """The most recent usable observation for this ingredient, aged forward to `as_of`.

    Returns None when nothing recent enough exists — the caller must treat that as
    "we don't know", not as zero. A meal costed with silent zeroes reads as cheap.
    """
    as_of = as_of or timezone.localdate()
    cutoff = as_of - timedelta(days=MAX_PRICE_AGE_DAYS)

    observation = (
        PriceObservation.objects.filter(
            ingredient=ingredient,
            area=area,
            observed_on__lte=as_of,
            observed_on__gte=cutoff,
        )
        .order_by("-observed_on")
        .first()
    )

    # Fall back to any area before giving up: a national-ish figure with honest
    # provenance beats refusing to price the ingredient at all.
    fallback_area_used = None
    if observation is None:
        observation = (
            PriceObservation.objects.filter(
                ingredient=ingredient,
                observed_on__lte=as_of,
                observed_on__gte=cutoff,
            )
            .select_related("area")
            .order_by("-observed_on")
            .first()
        )
        if observation is not None:
            fallback_area_used = observation.area

    if observation is None:
        return None

    days_stale = (as_of - observation.observed_on).days
    months = days_stale // 30
    projected = _project_forward(observation.price_kobo, months)

    return ResolvedPrice(
        ingredient=ingredient,
        price_kobo=projected,
        unit=observation.unit,
        observed_on=observation.observed_on,
        days_stale=days_stale,
        source=observation.source,
        area_name=(fallback_area_used or area).name,
        was_projected=months > 0,
    )


def get_active_ingredients():
    return list(
        Ingredient.objects.filter(is_active=True, include_in_prompt=True).order_by(
            "category", "name"
        )
    )


def get_priced_catalogue(area, as_of=None):
    """The ingredient list handed to the AI, with a price against each line.

    Anything without a usable price is left out entirely rather than sent unpriced —
    if the model cannot see a price it cannot respect a budget, and we would not be
    able to check its arithmetic afterwards.
    """
    as_of = as_of or timezone.localdate()
    catalogue = []
    for ingredient in get_active_ingredients():
        resolved = resolve_price(ingredient, area, as_of=as_of)
        if resolved is None:
            continue
        catalogue.append(
            {
                "name": ingredient.name,
                "unit": resolved.unit,
                "price_naira": round(resolved.price_kobo / 100, 2),
                "category": ingredient.category,
            }
        )
    return catalogue


def format_catalogue_for_prompt(catalogue):
    """Compact, one line per ingredient. Grouped so the model can scan by category."""
    if not catalogue:
        return "(no priced ingredients available)"

    by_category = {}
    for item in catalogue:
        by_category.setdefault(item["category"], []).append(item)

    lines = []
    for category in sorted(by_category):
        entries = ", ".join(
            f"{item['name']} = N{item['price_naira']:,.0f}/{item['unit']}"
            for item in sorted(by_category[category], key=lambda i: i["name"])
        )
        lines.append(f"{category.upper()}: {entries}")
    return "\n".join(lines)


def _index_ingredients():
    """name/alias -> Ingredient, so costing does one query instead of N."""
    index = {}
    for ingredient in get_active_ingredients():
        index[ingredient.name.strip().lower()] = ingredient
        for alias in ingredient.aliases or []:
            index.setdefault(str(alias).strip().lower(), ingredient)
    return index


def cost_meal(meal_ingredients, area, as_of=None, ingredient_index=None, price_cache=None):
    """Recompute a meal's cost from our own prices.

    The AI is asked to return its own cost estimate, and this deliberately ignores it.
    Model arithmetic is not something to bill a user's budget against.
    """
    as_of = as_of or timezone.localdate()
    index = ingredient_index if ingredient_index is not None else _index_ingredients()
    cache = price_cache if price_cache is not None else {}
    cost = MealCost()

    for line in meal_ingredients or []:
        if not isinstance(line, dict):
            continue
        raw_name = str(line.get("name", "")).strip()
        ingredient = index.get(raw_name.lower())
        try:
            quantity = Decimal(str(line.get("qty", 0)))
        except Exception:
            quantity = Decimal(0)

        if ingredient is None or quantity <= 0:
            if raw_name:
                cost.unknown_items.append(raw_name)
            continue

        if ingredient.pk not in cache:
            cache[ingredient.pk] = resolve_price(ingredient, area, as_of=as_of)
        resolved = cache[ingredient.pk]

        if resolved is None:
            cost.unknown_items.append(raw_name)
            continue

        line_kobo = int(Decimal(resolved.price_kobo) * quantity)
        cost.total_kobo += line_kobo
        cost.priced_items.append(
            {
                "name": ingredient.name,
                "qty": float(quantity),
                "unit": resolved.unit,
                "line_kobo": line_kobo,
            }
        )

    return cost


def cost_meals(meals, area, as_of=None):
    """Cost a whole plan. `meals` is the raw AI payload, each with an `ingredients` list."""
    as_of = as_of or timezone.localdate()
    index = _index_ingredients()
    cache = {}
    plan = PlanCost(area_name=area.name if area else "")

    for meal in meals or []:
        meal_cost = cost_meal(
            meal.get("ingredients"),
            area,
            as_of=as_of,
            ingredient_index=index,
            price_cache=cache,
        )
        meal["estimated_cost_kobo"] = meal_cost.total_kobo
        if meal_cost.total_kobo > 0:
            plan.priced_meals += 1
            plan.total_kobo += meal_cost.total_kobo
        else:
            plan.unpriced_meals += 1
        plan.unknown_items.extend(meal_cost.unknown_items)

    observed_dates = [r.observed_on for r in cache.values() if r is not None]
    plan.oldest_observation = min(observed_dates) if observed_dates else None

    total = Decimal(plan.total_kobo)
    plan.low_kobo = int(total * (Decimal(1) - COST_RANGE_TOLERANCE))
    plan.high_kobo = int(total * (Decimal(1) + COST_RANGE_TOLERANCE))
    plan.unknown_items = sorted(set(plan.unknown_items))
    return plan


def get_budget_tiers():
    return list(BudgetTier.objects.filter(is_active=True).order_by("sort_order"))


def resolve_weekly_budget_kobo(budget_level, household_size=1, explicit_kobo=None):
    """What is this plan allowed to cost for the week?

    An explicit amount always wins — the tier is only a preset for users who would
    rather not think about it.
    """
    if explicit_kobo:
        return int(explicit_kobo)

    tier = BudgetTier.objects.filter(key=budget_level, is_active=True).first()
    if tier is None:
        tier = BudgetTier.objects.filter(is_active=True).order_by("sort_order").first()
    if tier is None:
        logger.warning("No budget tiers configured; meal plan will be generated unpriced")
        return None
    return tier.weekly_kobo(household_size)
