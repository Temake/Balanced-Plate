import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_added', models.DateTimeField(auto_now_add=True)),
                ('date_last_modified', models.DateTimeField(auto_now=True)),
                ('email', models.EmailField(max_length=255, verbose_name='Email Address')),
                ('name', models.CharField(blank=True, default='', max_length=255, verbose_name='Sender Name')),
                ('category', models.CharField(choices=[('bug', 'BUG'), ('suggestion', 'SUGGESTION'), ('feature_request', 'FEATURE_REQUEST'), ('general', 'GENERAL'), ('other', 'OTHER')], default='general', max_length=50, verbose_name='Feedback Category')),
                ('subject', models.CharField(max_length=255, verbose_name='Subject')),
                ('message', models.TextField(verbose_name='Feedback Message')),
                ('is_reviewed', models.BooleanField(default=False, verbose_name='Is Reviewed')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='feedbacks', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Feedback',
                'verbose_name_plural': 'Feedbacks',
                'ordering': ['-date_added'],
            },
        ),
    ]
