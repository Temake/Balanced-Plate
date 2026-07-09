from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from .models import (
    AIUsageLedger,
    BillingPlan,
    DemoAccessInvite,
    FeatureEntitlement,
    PaymentTransaction,
    PaystackWebhookEvent,
    Subscription,
)


@admin.register(BillingPlan)
class BillingPlanAdmin(ModelAdmin):
    fieldsets = (
        (_("Plan"), {"classes": ["tab"], "fields": ("key", "name", "description", "sort_order", "is_active")}),
        (_("Pricing"), {"classes": ["tab"], "fields": ("price_kobo", "currency", "interval", "paystack_plan_code")}),
        (
            _("Entitlements"),
            {
                "classes": ["tab"],
                "fields": (
                    "ai_generation_limit",
                    "analytics_enabled",
                    "reports_enabled",
                    "ai_planning_enabled",
                    "ai_cooking_enabled",
                ),
            },
        ),
        (_("Important dates"), {"classes": ["tab"], "fields": ("date_added", "date_last_modified")}),
    )
    list_display = ["id", "key", "name", "price_kobo", "ai_generation_limit", "is_active"]
    list_filter = ["is_active", "analytics_enabled", "reports_enabled", "ai_planning_enabled", "ai_cooking_enabled"]
    search_fields = ["key", "name", "paystack_plan_code"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(Subscription)
class SubscriptionAdmin(ModelAdmin):
    fieldsets = (
        (_("Owner"), {"classes": ["tab"], "fields": ("owner", "plan", "status")}),
        (
            _("Paystack"),
            {
                "classes": ["tab"],
                "fields": ("paystack_customer_code", "paystack_subscription_code", "paystack_email_token"),
            },
        ),
        (
            _("Period"),
            {
                "classes": ["tab"],
                "fields": (
                    "current_period_start",
                    "current_period_end",
                    "grace_ends_at",
                    "cancel_at_period_end",
                    "cancelled_at",
                ),
            },
        ),
        (
            _("Notifications"),
            {
                "classes": ["tab"],
                "fields": ("renewal_reminder_7d_sent_at", "renewal_reminder_1d_sent_at"),
            },
        ),
        (_("Important dates"), {"classes": ["tab"], "fields": ("date_added", "date_last_modified")}),
    )
    list_display = ["id", "owner", "plan", "status", "current_period_end", "grace_ends_at"]
    list_filter = ["status", "plan", "cancel_at_period_end"]
    search_fields = ["owner__email", "owner__first_name", "paystack_customer_code", "paystack_subscription_code"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(ModelAdmin):
    fieldsets = (
        (_("Payment"), {"classes": ["tab"], "fields": ("owner", "plan", "subscription", "reference", "status")}),
        (_("Amount"), {"classes": ["tab"], "fields": ("amount_kobo", "currency", "paid_at")}),
        (
            _("Paystack Checkout"),
            {
                "classes": ["tab"],
                "fields": ("paystack_access_code", "paystack_authorization_url", "raw_response"),
            },
        ),
        (_("Important dates"), {"classes": ["tab"], "fields": ("date_added", "date_last_modified")}),
    )
    list_display = ["id", "owner", "plan", "reference", "amount_kobo", "currency", "status", "paid_at"]
    list_filter = ["status", "currency", "plan"]
    search_fields = ["reference", "owner__email", "paystack_access_code"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(PaystackWebhookEvent)
class PaystackWebhookEventAdmin(ModelAdmin):
    fieldsets = (
        (_("Event"), {"classes": ["tab"], "fields": ("event_type", "reference", "payload_hash", "processed", "processed_at")}),
        (_("Payload"), {"classes": ["tab"], "fields": ("payload",)}),
        (_("Important dates"), {"classes": ["tab"], "fields": ("date_added", "date_last_modified")}),
    )
    list_display = ["id", "event_type", "reference", "processed", "processed_at", "date_added"]
    list_filter = ["event_type", "processed"]
    search_fields = ["event_type", "reference", "payload_hash"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(AIUsageLedger)
class AIUsageLedgerAdmin(ModelAdmin):
    fieldsets = (
        (_("Usage"), {"classes": ["tab"], "fields": ("owner", "feature_type", "billing_month", "credits_used")}),
        (_("Metadata"), {"classes": ["tab"], "fields": ("metadata",)}),
        (_("Important dates"), {"classes": ["tab"], "fields": ("date_added", "date_last_modified")}),
    )
    list_display = ["id", "owner", "feature_type", "billing_month", "credits_used", "date_added"]
    list_filter = ["feature_type", "billing_month"]
    search_fields = ["owner__email", "owner__first_name"]
    readonly_fields = ["date_added", "date_last_modified"]


@admin.register(DemoAccessInvite)
class DemoAccessInviteAdmin(ModelAdmin):
    list_display = ["id", "created_by", "expires_at", "redemption_count", "max_redemptions", "revoked_at"]
    list_filter = ["expires_at", "revoked_at"]
    search_fields = ["created_by__email", "note"]
    readonly_fields = ["token_hash", "redemption_count", "date_added", "date_last_modified"]


@admin.register(FeatureEntitlement)
class FeatureEntitlementAdmin(ModelAdmin):
    list_display = ["id", "owner", "source", "all_features", "starts_at", "expires_at"]
    list_filter = ["source", "all_features", "starts_at", "expires_at"]
    search_fields = ["owner__email", "owner__first_name", "note"]
    readonly_fields = ["date_added", "date_last_modified"]
