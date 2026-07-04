from rest_framework import serializers

from .models import BillingPlan, Subscription


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
            "analytics_enabled",
            "reports_enabled",
            "ai_planning_enabled",
            "ai_cooking_enabled",
        ]

    def get_price_naira(self, obj):
        return obj.price_kobo // 100


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = BillingPlanSerializer(read_only=True)
    is_paid_access_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "plan",
            "status",
            "is_paid_access_active",
            "current_period_start",
            "current_period_end",
            "grace_ends_at",
            "cancel_at_period_end",
            "cancelled_at",
        ]


class BillingUsageSerializer(serializers.Serializer):
    billing_month = serializers.DateField()
    ai_generation_limit = serializers.IntegerField()
    ai_generation_used = serializers.IntegerField()
    ai_generation_remaining = serializers.IntegerField()


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
