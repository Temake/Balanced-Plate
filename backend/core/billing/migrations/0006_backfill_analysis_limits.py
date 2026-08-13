from django.db import migrations


# The new fields on BillingPlan default to the Free tier's allowance (3/day), so
# without this backfill an existing Plus or Pro row would silently be capped at
# three analyses a day the moment 0005 applied. Plans are seeded by a data
# migration rather than at runtime, so this is the only place they get corrected.
PLAN_ANALYSIS_LIMITS = {
    "free": {"analysis_daily_limit": 3, "analysis_monthly_limit": 45},
    "plus": {"analysis_daily_limit": 15, "analysis_monthly_limit": 250},
    "pro": {"analysis_daily_limit": 30, "analysis_monthly_limit": 600},
}

PLAN_DESCRIPTIONS = {
    "free": "3 photo analyses a day, manual meal planning, and basic app access.",
}


def backfill_analysis_limits(apps, schema_editor):
    BillingPlan = apps.get_model("billing", "BillingPlan")
    for key, limits in PLAN_ANALYSIS_LIMITS.items():
        updates = dict(limits)
        if key in PLAN_DESCRIPTIONS:
            updates["description"] = PLAN_DESCRIPTIONS[key]
        BillingPlan.objects.filter(key=key).update(**updates)


def restore_unlimited_wording(apps, schema_editor):
    """Reverse only the user-visible copy. The limit columns are dropped by the
    reverse of 0005, so there is nothing to undo for them."""
    BillingPlan = apps.get_model("billing", "BillingPlan")
    BillingPlan.objects.filter(key="free").update(
        description="Unlimited photo analysis, manual meal planning, and basic app access.",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0005_billingplan_analysis_daily_limit_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_analysis_limits, restore_unlimited_wording),
    ]
