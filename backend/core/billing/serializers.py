from rest_framework import serializers

from .models import BillingPlan, Subscription
from .services import get_active_feature_entitlement


class BillingPlanSerializer(serializers.ModelSerializer):
    price_naira = serializers.SerializerMethodField()

    class Meta:
        model = BillingPlan
        fields = [
            "key",
            "name",
            "description",
            "price_kobo",
            "price_naira",
            "currency",
            "interval",
            "ai_generation_limit",
            "analysis_daily_limit",
            "analysis_monthly_limit",
            "analytics_enabled",
            "reports_enabled",
            "ai_planning_enabled",
            "ai_cooking_enabled",
        ]

    def get_price_naira(self, obj):
        return obj.price_kobo // 100


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = serializers.SerializerMethodField()
    is_paid_access_active = serializers.SerializerMethodField()
    access_source = serializers.SerializerMethodField()
    access_expires_at = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            "plan",
            "status",
            "is_paid_access_active",
            "access_source",
            "access_expires_at",
            "current_period_start",
            "current_period_end",
            "grace_ends_at",
            "cancel_at_period_end",
            "cancelled_at",
        ]

    def get_plan(self, obj):
        data = BillingPlanSerializer(obj.plan).data
        entitlement = get_active_feature_entitlement(obj.owner)
        if entitlement:
            data.update(
                {
                    "key": "demo",
                    "name": "Demo Access",
                    "description": "Temporary full access from a demo invite.",
                    "price_kobo": 0,
                    "price_naira": 0,
                    # Demo access is unmetered, so there is no honest limit to
                    # report. `null` reads as "no limit" on the client.
                    "ai_generation_limit": None,
                    "analysis_daily_limit": None,
                    "analysis_monthly_limit": None,
                    "analytics_enabled": True,
                    "reports_enabled": True,
                    "ai_planning_enabled": True,
                    "ai_cooking_enabled": True,
                }
            )
        return data

    def get_is_paid_access_active(self, obj):
        return obj.is_paid_access_active or get_active_feature_entitlement(obj.owner) is not None

    def get_access_source(self, obj):
        entitlement = get_active_feature_entitlement(obj.owner)
        if entitlement:
            return entitlement.source
        if obj.is_paid_access_active:
            return "subscription"
        return "free"

    def get_access_expires_at(self, obj):
        entitlement = get_active_feature_entitlement(obj.owner)
        if entitlement:
            return entitlement.expires_at
        return obj.current_period_end


class BillingUsageSerializer(serializers.Serializer):
    """Two meters, reported side by side.

    The three `ai_generation_*` keys keep their original meaning so existing
    clients are unaffected; everything else is additive. On unmetered demo access
    every limit and remaining value is null.
    """

    billing_month = serializers.DateField()
    unmetered = serializers.BooleanField()

    ai_generation_limit = serializers.IntegerField(allow_null=True)
    ai_generation_used = serializers.IntegerField()
    ai_generation_remaining = serializers.IntegerField(allow_null=True)

    analysis_daily_limit = serializers.IntegerField(allow_null=True)
    analysis_used_today = serializers.IntegerField()
    analysis_remaining_today = serializers.IntegerField(allow_null=True)
    analysis_monthly_limit = serializers.IntegerField(allow_null=True)
    analysis_used_this_month = serializers.IntegerField()


class InitializePaymentSerializer(serializers.Serializer):
    plan_key = serializers.ChoiceField(choices=["plus", "pro"])


class InitializePaymentResponseSerializer(serializers.Serializer):
    authorization_url = serializers.URLField()
    access_code = serializers.CharField()
    reference = serializers.CharField()


class VerifyPaymentSerializer(serializers.Serializer):
    reference = serializers.CharField(required=True)


class PaymentVerificationResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    subscription = SubscriptionSerializer()


class CreateDemoAccessInviteSerializer(serializers.Serializer):
    max_redemptions = serializers.IntegerField(min_value=1, max_value=100, default=1)
    note = serializers.CharField(required=False, allow_blank=True, max_length=255)


class DemoAccessInviteResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    invite_url = serializers.URLField()
    expires_at = serializers.DateTimeField()
    max_redemptions = serializers.IntegerField()
    access_duration_days = serializers.IntegerField()


class RedeemDemoAccessInviteSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)


class RedeemDemoAccessInviteResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    subscription = SubscriptionSerializer()
