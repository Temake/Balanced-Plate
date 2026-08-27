from django.db import migrations
from django.utils import timezone


def seed(apps, schema_editor):
    """Load the starter catalogue, areas and budget tiers.

    The prices are indicative estimates, written with source="estimate" so a real
    market survey can find and replace them. Nothing here is claimed to be observed.
    """
    from core.pricing.seed_data import AREAS, BUDGET_TIERS, INGREDIENTS

    PriceArea = apps.get_model("pricing", "PriceArea")
    Ingredient = apps.get_model("pricing", "Ingredient")
    PriceObservation = apps.get_model("pricing", "PriceObservation")
    BudgetTier = apps.get_model("pricing", "BudgetTier")

    for name, state, lat, lon, is_default in AREAS:
        PriceArea.objects.update_or_create(
            name=name,
            defaults={
                "state": state,
                "latitude": lat,
                "longitude": lon,
                "is_default": is_default,
                "is_active": True,
            },
        )

    for key, label, description, naira_per_person_per_day, sort_order in BUDGET_TIERS:
        BudgetTier.objects.update_or_create(
            key=key,
            defaults={
                "label": label,
                "description": description,
                "kobo_per_person_per_day": naira_per_person_per_day * 100,
                "sort_order": sort_order,
                "is_active": True,
            },
        )

    default_area = PriceArea.objects.filter(is_default=True).first()
    today = timezone.localdate()

    for name, aliases, category, unit, price_naira, protein, kcal in INGREDIENTS:
        ingredient, _ = Ingredient.objects.update_or_create(
            name=name,
            defaults={
                "aliases": aliases,
                "category": category,
                "unit": unit,
                "protein_g_per_unit": protein,
                "kcal_per_unit": kcal,
                "is_active": True,
                "include_in_prompt": True,
            },
        )
        if default_area is None:
            continue
        # Only seed a price if this ingredient has none at all, so re-running the
        # migration never buries a real surveyed price under an estimate.
        if PriceObservation.objects.filter(ingredient=ingredient, area=default_area).exists():
            continue
        PriceObservation.objects.create(
            ingredient=ingredient,
            area=default_area,
            unit=unit,
            price_kobo=price_naira * 100,
            observed_on=today,
            source="estimate",
            note="Seeded estimate — replace with a surveyed price before launch.",
        )


def unseed(apps, schema_editor):
    from core.pricing.seed_data import AREAS, BUDGET_TIERS, INGREDIENTS

    PriceArea = apps.get_model("pricing", "PriceArea")
    Ingredient = apps.get_model("pricing", "Ingredient")
    BudgetTier = apps.get_model("pricing", "BudgetTier")

    Ingredient.objects.filter(name__in=[i[0] for i in INGREDIENTS]).delete()
    BudgetTier.objects.filter(key__in=[t[0] for t in BUDGET_TIERS]).delete()
    PriceArea.objects.filter(name__in=[a[0] for a in AREAS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pricing", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
