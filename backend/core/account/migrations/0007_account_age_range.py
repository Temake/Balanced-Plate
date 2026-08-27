from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0006_account_price_area'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='age_range',
            field=models.CharField(
                blank=True,
                choices=[
                    ('under_18', 'Under 18'),
                    ('18_24', '18-24'),
                    ('25_34', '25-34'),
                    ('35_44', '35-44'),
                    ('45_54', '45-54'),
                    ('55_64', '55-64'),
                    ('65_plus', '65+'),
                ],
                default=None,
                max_length=20,
                null=True,
                verbose_name='Age Range',
            ),
        ),
    ]
