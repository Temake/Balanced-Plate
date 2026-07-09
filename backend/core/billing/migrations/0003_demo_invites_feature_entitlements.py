from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("billing", "0002_rename_billing_ai_owner__713ad1_idx_billing_aiu_owner_i_d21d7d_idx_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="DemoAccessInvite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("token_hash", models.CharField(max_length=64, unique=True, verbose_name="Token Hash")),
                ("expires_at", models.DateTimeField(db_index=True, verbose_name="Expires At")),
                ("max_redemptions", models.PositiveIntegerField(default=1, verbose_name="Max Redemptions")),
                ("redemption_count", models.PositiveIntegerField(default=0, verbose_name="Redemption Count")),
                ("access_duration_days", models.PositiveIntegerField(default=150, verbose_name="Access Duration Days")),
                ("revoked_at", models.DateTimeField(blank=True, null=True, verbose_name="Revoked At")),
                ("note", models.CharField(blank=True, default="", max_length=255, verbose_name="Note")),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_demo_access_invites",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Demo Access Invite",
                "verbose_name_plural": "Demo Access Invites",
                "ordering": ["-date_added"],
            },
        ),
        migrations.CreateModel(
            name="FeatureEntitlement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                (
                    "source",
                    models.CharField(
                        choices=[("demo_invite", "Demo Invite"), ("manual", "Manual")],
                        max_length=40,
                        verbose_name="Source",
                    ),
                ),
                ("all_features", models.BooleanField(default=True, verbose_name="All Features")),
                ("starts_at", models.DateTimeField(default=django.utils.timezone.now, verbose_name="Starts At")),
                ("expires_at", models.DateTimeField(db_index=True, verbose_name="Expires At")),
                ("note", models.CharField(blank=True, default="", max_length=255, verbose_name="Note")),
                (
                    "granted_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="granted_feature_entitlements",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "invite",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="entitlements",
                        to="billing.demoaccessinvite",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="feature_entitlements",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Entitlement Owner",
                    ),
                ),
            ],
            options={
                "verbose_name": "Feature Entitlement",
                "verbose_name_plural": "Feature Entitlements",
                "ordering": ["-expires_at"],
            },
        ),
        migrations.AddIndex(
            model_name="featureentitlement",
            index=models.Index(fields=["owner", "starts_at", "expires_at"], name="billing_fea_owner_i_3aa562_idx"),
        ),
    ]
