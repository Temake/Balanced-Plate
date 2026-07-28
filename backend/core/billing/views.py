from drf_spectacular.utils import extend_schema
from rest_framework import permissions, response, status, views

from core.utils.exceptions import exceptions

from .models import BillingPlan
from .serializers import (
    BillingPlanSerializer,
    BillingUsageSerializer,
    CreateDemoAccessInviteSerializer,
    DemoAccessInviteResponseSerializer,
    InitializePaymentResponseSerializer,
    InitializePaymentSerializer,
    PaymentVerificationResponseSerializer,
    RedeemDemoAccessInviteResponseSerializer,
    RedeemDemoAccessInviteSerializer,
    SubscriptionSerializer,
    VerifyPaymentSerializer,
)
from .entitlements import get_ai_generation_usage
from .services import (
    DEMO_AI_GENERATION_LIMIT,
    create_demo_access_invite,
    current_billing_month,
    get_active_feature_entitlement,
    get_frontend_demo_invite_url,
    get_or_create_user_subscription,
    initialize_subscription_payment,
    redeem_demo_access_invite,
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
        used = get_ai_generation_usage(request.user, billing_month)
        limit = (
            DEMO_AI_GENERATION_LIMIT
            if get_active_feature_entitlement(request.user) is not None
            else subscription.plan.ai_generation_limit
        )
        data = {
            "billing_month": billing_month,
            "ai_generation_limit": limit,
            "ai_generation_used": used,
            "ai_generation_remaining": max(limit - used, 0),
        }
        serializer = BillingUsageSerializer(data)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Billing"])
class CreateDemoAccessInvite(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["post"]

    @extend_schema(
        description="Create a temporary full-access demo invite link. Links expire after 5 months.",
        request=CreateDemoAccessInviteSerializer,
        responses={201: DemoAccessInviteResponseSerializer},
    )
    def post(self, request):
        serializer = CreateDemoAccessInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invite, token = create_demo_access_invite(
            created_by=request.user,
            max_redemptions=serializer.validated_data["max_redemptions"],
            note=serializer.validated_data.get("note", ""),
        )
        output = DemoAccessInviteResponseSerializer(
            {
                "token": token,
                "invite_url": get_frontend_demo_invite_url(token),
                "expires_at": invite.expires_at,
                "max_redemptions": invite.max_redemptions,
                "access_duration_days": invite.access_duration_days,
            }
        )
        return response.Response(output.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Billing"])
class RedeemDemoAccessInvite(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Redeem a demo invite token for temporary full feature access.",
        request=RedeemDemoAccessInviteSerializer,
        responses={200: RedeemDemoAccessInviteResponseSerializer},
    )
    def post(self, request):
        serializer = RedeemDemoAccessInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        redeem_demo_access_invite(request.user, serializer.validated_data["token"])
        subscription = get_or_create_user_subscription(request.user)
        output = RedeemDemoAccessInviteResponseSerializer(
            {
                "message": "Demo access activated.",
                "subscription": SubscriptionSerializer(subscription).data,
            }
        )
        return response.Response(output.data, status=status.HTTP_200_OK)


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
        # `request.body` MUST be read before `request.data`. DRF's JSON parser consumes
        # the underlying stream directly, after which Django refuses to hand back the
        # raw body (RawPostDataException) — and the raw body is what the signature is
        # computed over. Touching it first caches it for both readers.
        raw_body = request.body
        payload = request.data
        if not isinstance(payload, dict):
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid webhook payload.",
            )

        record_and_process_webhook(
            raw_body=raw_body,
            payload=payload,
            signature=signature,
        )
        return response.Response({"message": "Webhook received"}, status=status.HTTP_200_OK)
