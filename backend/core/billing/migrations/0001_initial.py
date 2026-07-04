# Generated for the billing foundation phase.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def seed_default_plans(apps, schema_editor):
    BillingPlan = apps.get_model("billing", "BillingPlan")
    defaults = [
        {
            "key": "free",
            "name": "Free",
            "description": "Unlimited photo analysis, manual meal planning, and basic app access.",
            "price_kobo": 0,
            "paystack_plan_code": "",
            "ai_generation_limit": 0,
            "analytics_enabled": False,
            "reports_enabled": False,
            "ai_planning_enabled": False,
            "ai_cooking_enabled": False,
            "sort_order": 0,
        },
        {
            "key": "plus",
            "name": "Plus",
            "description": "Analytics, reports, AI meal planning, and AI cooking guide.",
            "price_kobo": 240000,
            "paystack_plan_code": getattr(settings, "PAYSTACK_PLUS_PLAN_CODE", ""),
            "ai_generation_limit": 30,
            "analytics_enabled": True,
            "reports_enabled": True,
            "ai_planning_enabled": True,
            "ai_cooking_enabled": True,
            "sort_order": 1,
        },
        {
            "key": "pro",
            "name": "Pro",
            "description": "Higher AI limits for regular planning and cooking support.",
            "price_kobo": 450000,
            "paystack_plan_code": getattr(settings, "PAYSTACK_PRO_PLAN_CODE", ""),
            "ai_generation_limit": 100,
            "analytics_enabled": True,
            "reports_enabled": True,
            "ai_planning_enabled": True,
            "ai_cooking_enabled": True,
            "sort_order": 2,
        },
    ]

    for plan in defaults:
        BillingPlan.objects.update_or_create(
            key=plan["key"],
            defaults={
                **plan,
                "currency": "NGN",
                "interval": "monthly",
                "is_active": True,
            },
        )


def remove_default_plans(apps, schema_editor):
    BillingPlan = apps.get_model("billing", "BillingPlan")
    BillingPlan.objects.filter(key__in=["free", "plus", "pro"]).delete()


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BillingPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("key", models.CharField(choices=[("free", "Free"), ("plus", "Plus"), ("pro", "Pro")], max_length=20, unique=True, verbose_name="Plan Key")),
                ("name", models.CharField(max_length=100, verbose_name="Plan Name")),
                ("description", models.TextField(blank=True, default="", verbose_name="Description")),
                ("price_kobo", models.PositiveIntegerField(default=0, verbose_name="Price (kobo)")),
                ("currency", models.CharField(default="NGN", max_length=3, verbose_name="Currency")),
                ("interval", models.CharField(choices=[("monthly", "Monthly")], default="monthly", max_length=20, verbose_name="Billing Interval")),
                ("paystack_plan_code", models.CharField(blank=True, default="", help_text="Dashboard-created Paystack plan code for paid plans.", max_length=100, verbose_name="Paystack Plan Code")),
                ("ai_generation_limit", models.PositiveIntegerField(default=0, help_text="Monthly credits for AI planning and AI cooking guides.", verbose_name="Monthly AI Generation Limit")),
                ("analytics_enabled", models.BooleanField(default=False, verbose_name="Analytics Enabled")),
                ("reports_enabled", models.BooleanField(default=False, verbose_name="Reports Enabled")),
                ("ai_planning_enabled", models.BooleanField(default=False, verbose_name="AI Planning Enabled")),
                ("ai_cooking_enabled", models.BooleanField(default=False, verbose_name="AI Cooking Enabled")),
                ("is_active", models.BooleanField(default=True, verbose_name="Is Active")),
                ("sort_order", models.PositiveSmallIntegerField(default=0, verbose_name="Sort Order")),
            ],
            options={
                "verbose_name": "Billing Plan",
                "verbose_name_plural": "Billing Plans",
                "ordering": ["sort_order", "price_kobo"],
            },
        ),
        migrations.CreateModel(
            name="PaystackWebhookEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("event_type", models.CharField(db_index=True, max_length=100, verbose_name="Event Type")),
                ("reference", models.CharField(blank=True, db_index=True, default="", max_length=120, verbose_name="Reference")),
                ("payload_hash", models.CharField(max_length=128, unique=True, verbose_name="Payload Hash")),
                ("processed", models.BooleanField(default=False, verbose_name="Processed")),
                ("processed_at", models.DateTimeField(blank=True, null=True, verbose_name="Processed At")),
                ("payload", models.JSONField(default=dict, verbose_name="Payload")),
            ],
            options={
                "verbose_name": "Paystack Webhook Event",
                "verbose_name_plural": "Paystack Webhook Events",
                "ordering": ["-date_added"],
            },
        ),
        migrations.CreateModel(
            name="AIUsageLedger",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("feature_type", models.CharField(choices=[("meal_plan", "AI Meal Plan"), ("meal_plan_day", "AI Day Meal Plan"), ("cooking_guide", "AI Cooking Guide")], max_length=40, verbose_name="Feature Type")),
                ("billing_month", models.DateField(help_text="First day of the month this usage belongs to.", verbose_name="Billing Month")),
                ("credits_used", models.PositiveIntegerField(default=1, verbose_name="Credits Used")),
                ("metadata", models.JSONField(blank=True, default=dict, verbose_name="Metadata")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_usage_ledger", to=settings.AUTH_USER_MODEL, verbose_name="Usage Owner")),
            ],
            options={
                "verbose_name": "AI Usage Ledger Entry",
                "verbose_name_plural": "AI Usage Ledger Entries",
                "ordering": ["-date_added"],
            },
        ),
        migrations.CreateModel(
            name="Subscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("status", models.CharField(choices=[("free", "Free"), ("pending", "Pending"), ("active", "Active"), ("grace", "Grace"), ("cancelled", "Cancelled"), ("expired", "Expired"), ("disabled", "Disabled")], db_index=True, default="free", max_length=20, verbose_name="Status")),
                ("paystack_customer_code", models.CharField(blank=True, default="", max_length=100, verbose_name="Paystack Customer Code")),
                ("paystack_subscription_code", models.CharField(blank=True, default="", max_length=100, verbose_name="Paystack Subscription Code")),
                ("paystack_email_token", models.CharField(blank=True, default="", max_length=100, verbose_name="Paystack Email Token")),
                ("current_period_start", models.DateTimeField(blank=True, null=True, verbose_name="Current Period Start")),
                ("current_period_end", models.DateTimeField(blank=True, null=True, verbose_name="Current Period End")),
                ("grace_ends_at", models.DateTimeField(blank=True, null=True, verbose_name="Grace Ends At")),
                ("cancel_at_period_end", models.BooleanField(default=False, verbose_name="Cancel At Period End")),
                ("cancelled_at", models.DateTimeField(blank=True, null=True, verbose_name="Cancelled At")),
                ("renewal_reminder_7d_sent_at", models.DateTimeField(blank=True, null=True, verbose_name="7-day Renewal Reminder Sent At")),
                ("renewal_reminder_1d_sent_at", models.DateTimeField(blank=True, null=True, verbose_name="1-day Renewal Reminder Sent At")),
                ("owner", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="subscription", to=settings.AUTH_USER_MODEL, verbose_name="Subscription Owner")),
                ("plan", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="subscriptions", to="billing.billingplan", verbose_name="Billing Plan")),
            ],
            options={
                "verbose_name": "Subscription",
                "verbose_name_plural": "Subscriptions",
                "ordering": ["-date_last_modified"],
            },
        ),
        migrations.CreateModel(
            name="PaymentTransaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date_added", models.DateTimeField(auto_now_add=True)),
                ("date_last_modified", models.DateTimeField(auto_now=True)),
                ("reference", models.CharField(max_length=120, unique=True, verbose_name="Paystack Reference")),
                ("amount_kobo", models.PositiveIntegerField(verbose_name="Amount (kobo)")),
                ("currency", models.CharField(default="NGN", max_length=3, verbose_name="Currency")),
                ("status", models.CharField(choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed"), ("abandoned", "Abandoned"), ("reversed", "Reversed")], db_index=True, default="pending", max_length=20, verbose_name="Status")),
                ("paystack_access_code", models.CharField(blank=True, default="", max_length=120, verbose_name="Paystack Access Code")),
                ("paystack_authorization_url", models.URLField(blank=True, default="", max_length=500, verbose_name="Paystack Authorization URL")),
                ("paid_at", models.DateTimeField(blank=True, null=True, verbose_name="Paid At")),
                ("raw_response", models.JSONField(blank=True, default=dict, verbose_name="Raw Paystack Response")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payment_transactions", to=settings.AUTH_USER_MODEL, verbose_name="Payment Owner")),
                ("plan", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="payment_transactions", to="billing.billingplan", verbose_name="Billing Plan")),
                ("subscription", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payment_transactions", to="billing.subscription")),
            ],
            options={
                "verbose_name": "Payment Transaction",
                "verbose_name_plural": "Payment Transactions",
                "ordering": ["-date_added"],
            },
        ),
        migrations.AddIndex(
            model_name="aiusageledger",
            index=models.Index(fields=["owner", "billing_month"], name="billing_ai_owner__713ad1_idx"),
        ),
        migrations.AddIndex(
            model_name="aiusageledger",
            index=models.Index(fields=["owner", "feature_type", "billing_month"], name="billing_ai_owner__23f63f_idx"),
        ),
        migrations.RunPython(seed_default_plans, remove_default_plans),
    ]
