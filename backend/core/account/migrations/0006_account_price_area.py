import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_alter_usersession_access_alter_usersession_refresh_and_more'),
        ('pricing', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='price_area',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='accounts',
                to='pricing.pricearea',
                verbose_name='Price Area',
            ),
        ),
    ]
