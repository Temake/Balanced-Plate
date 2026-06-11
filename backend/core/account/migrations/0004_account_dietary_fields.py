# Generated manually for Balanced Plate revamp

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_alter_usersession_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='dietary_goal',
            field=models.CharField(
                choices=[
                    ('weight_loss', 'Weight Management'),
                    ('muscle_gain', 'Muscle Building & Strength'),
                    ('energy_focus', 'Stable Energy & Focus'),
                    ('general_health', 'General Wellness'),
                ],
                default='general_health',
                max_length=30,
                verbose_name='Dietary Goal',
            ),
        ),
        migrations.AddField(
            model_name='account',
            name='dietary_preference',
            field=models.CharField(
                choices=[
                    ('none', 'No restrictions'),
                    ('vegetarian', 'Vegetarian'),
                    ('vegan', 'Vegan'),
                    ('keto', 'Keto-friendly'),
                    ('gluten_free', 'Gluten-Free'),
                ],
                default='none',
                max_length=30,
                verbose_name='Dietary Preference',
            ),
        ),
        migrations.AddField(
            model_name='account',
            name='health_conditions',
            field=models.JSONField(
                blank=True,
                default=list,
                verbose_name='Health Conditions',
            ),
        ),
        migrations.AddField(
            model_name='account',
            name='onboarding_completed',
            field=models.BooleanField(
                default=False,
                verbose_name='Onboarding Completed?',
            ),
        ),
    ]
