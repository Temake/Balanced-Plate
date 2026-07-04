from drf_spectacular.utils import extend_schema
from rest_framework import permissions, response, status, views

from core.utils.exceptions import exceptions

from .models import BillingPlan
from .serializers import (
    BillingPlanSerializer,
    BillingUsageSerializer,
    InitializePaymentResponseSerializer,
    InitializePaymentSerializer,
    PaymentVerificationResponseSerializer,
    SubscriptionSerializer,
    VerifyPaymentSerializer,
    get_monthly_ai_usage,
)
from .services import (
    current_billing_month,
    get_or_create_user_subscription,
    initialize_subscription_payment,
    record_and_process_webhook,
    verify_payment,
)


@extend_schema(tags=["Billing"])
class ListBillingPlans(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="List active billing plans.",
        responses={200: BillingPlanSerializer(many=True)},
    )
    def get(self, request):
        plans = BillingPlan.objects.filter(is_active=True).order_by("sort_order", "price_kobo")
        serializer = BillingPlanSerializer(plans, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class CurrentSubscription(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="Get the authenticated user's current subscription.",
        responses={200: SubscriptionSerializer},
    )
    def get(self, request):
        subscription = get_or_create_user_subscription(request.user)
        serializer = SubscriptionSerializer(subscription)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class BillingUsage(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="Get the authenticated user's AI generation usage for the current billing month.",
        responses={200: BillingUsageSerializer},
    )
    def get(self, request):
        subscription = get_or_create_user_subscription(request.user)
        billing_month = current_billing_month()
        used = get_monthly_ai_usage(request.user, billing_month)
        limit = subscription.plan.ai_generation_limit
        data = {
            "billing_month": billing_month,
            "ai_generation_limit": limit,
            "ai_generation_used": used,
            "ai_generation_remaining": max(limit - used, 0),
        }
        serializer = BillingUsageSerializer(data)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class InitializeSubscriptionPayment(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Initialize a Paystack subscription payment for a paid plan.",
        request=InitializePaymentSerializer,
        responses={200: InitializePaymentResponseSerializer},
    )
    def post(self, request):
        serializer = InitializePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = initialize_subscription_payment(
            user=request.user,
            plan_key=serializer.validated_data["plan_key"],
        )
        output = InitializePaymentResponseSerializer(data)
        return response.Response(output.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class VerifySubscriptionPayment(views.APIView):
    http_method_names = ["get", "post"]

    @extend_schema(
        description="Verify a Paystack payment reference and activate the subscription if valid.",
        request=VerifyPaymentSerializer,
        responses={200: PaymentVerificationResponseSerializer},
    )
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self._verify(request, serializer.validated_data["reference"])

    @extend_schema(
        description="Verify a Paystack payment reference from the callback query string.",
        responses={200: PaymentVerificationResponseSerializer},
    )
    def get(self, request):
        serializer = VerifyPaymentSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return self._verify(request, serializer.validated_data["reference"])

    def _verify(self, request, reference):
        subscription = verify_payment(reference=reference, user=request.user)
        data = {
            "message": "Payment verified successfully",
            "subscription": SubscriptionSerializer(subscription).data,
        }
        return response.Response(data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class PaystackWebhook(views.APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    http_method_names = ["post"]

    @extend_schema(
        description="Receive Paystack webhook events. The x-paystack-signature header is required.",
        request=None,
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
    )
    def post(self, request):
        signature = request.headers.get("x-paystack-signature")
        payload = request.data
        if not isinstance(payload, dict):
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid webhook payload.",
            )

        record_and_process_webhook(
            raw_body=request.body,
            payload=payload,
            signature=signature,
        )
        return response.Response({"message": "Webhook received"}, status=status.HTTP_200_OK)
