from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meal_plan", "0002_mealentry_estimated_cost_kobo_mealentry_ingredients_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="mealplan",
            name="price_source_label",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Where the prices actually came from, e.g. 'Lagos estimates' when the chosen city has no prices of its own yet.",
                max_length=150,
                verbose_name="Price Source",
            ),
        ),
        migrations.AddField(
            model_name="mealplan",
            name="is_price_fallback",
            field=models.BooleanField(
                default=False,
                help_text="True when some or all prices were borrowed from another city.",
                verbose_name="Priced From Another Area",
            ),
        ),
    ]
