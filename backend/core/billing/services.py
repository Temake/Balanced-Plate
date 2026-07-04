import hashlib
import hmac
import uuid
from datetime import timedelta

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status

from core.utils.exceptions import exceptions

from .models import (
    BillingPlan,
    BillingPlanKey,
    PaymentStatus,
    PaymentTransaction,
    PaystackWebhookEvent,
    Subscription,
    SubscriptionStatus,
)


PAYSTACK_SUCCESS_STATUS = "success"


class PaystackClient:
    def __init__(self):
        self.base_url = settings.PAYSTACK_BASE_URL.rstrip("/")
        self.secret_key = settings.PAYSTACK_SECRET_KEY

    def _headers(self):
        if not self.secret_key:
            raise exceptions.CustomException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Paystack secret key is not configured.",
            )
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def initialize_transaction(self, payload):
        return self._request("post", "/transaction/initialize", json=payload)

    def verify_transaction(self, reference):
        return self._request("get", f"/transaction/verify/{reference}")

    def _request(self, method, path, **kwargs):
        try:
            response = requests.request(
                method=method,
                url=f"{self.base_url}{path}",
                headers=self._headers(),
                timeout=30,
                **kwargs,
            )
            data = response.json()
        except requests.RequestException:
            raise exceptions.CustomException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Unable to reach Paystack. Please try again.",
            )
        except ValueError:
            raise exceptions.CustomException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Invalid response from Paystack.",
            )

        if response.status_code >= 400 or not data.get("status"):
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message=data.get("message", "Paystack request failed."),
            )
        return data


def current_billing_month():
    today = timezone.localdate()
    return today.replace(day=1)


def generate_payment_reference(user, plan):
    return f"bp_{user.id}_{plan.key}_{uuid.uuid4().hex[:18]}"


def get_callback_url():
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/subscription/success"


def get_free_plan():
    return BillingPlan.objects.get(key=BillingPlanKey.FREE)


def get_or_create_user_subscription(user):
    subscription = getattr(user, "subscription", None)
    if subscription:
        return subscription
    return Subscription.objects.create(
        owner=user,
        plan=get_free_plan(),
        status=SubscriptionStatus.FREE,
    )


def parse_paystack_datetime(value):
    if not value:
        return None
    parsed = parse_datetime(value)
    if parsed and timezone.is_naive(parsed):
        return timezone.make_aware(parsed)
    return parsed


def plan_from_paystack_code(plan_code):
    if not plan_code:
        return None
    return BillingPlan.objects.filter(paystack_plan_code=plan_code, is_active=True).first()


def get_plan_from_paystack_payload(data, fallback_plan=None):
    plan_data = data.get("plan") or {}
    plan_code = plan_data.get("plan_code") or data.get("plan_code")
    return plan_from_paystack_code(plan_code) or fallback_plan


def get_configured_paystack_plan_code(plan):
    if plan.paystack_plan_code:
        return plan.paystack_plan_code
    if plan.key == BillingPlanKey.PLUS:
        return getattr(settings, "PAYSTACK_PLUS_PLAN_CODE", "")
    if plan.key == BillingPlanKey.PRO:
        return getattr(settings, "PAYSTACK_PRO_PLAN_CODE", "")
    return ""


def get_customer_code(data):
    customer = data.get("customer") or {}
    if isinstance(customer, dict):
        return customer.get("customer_code", "")
    return ""


def get_subscription_code(data):
    subscription = data.get("subscription") or {}
    if isinstance(subscription, dict):
        return subscription.get("subscription_code", "")
    return data.get("subscription_code", "")


def get_email_token(data):
    subscription = data.get("subscription") or {}
    if isinstance(subscription, dict):
        return subscription.get("email_token", "")
    return data.get("email_token", "")


def resolve_user_from_paystack_data(data, transaction_obj=None):
    if transaction_obj:
        return transaction_obj.owner

    metadata = data.get("metadata") or {}
    user_id = metadata.get("user_id")
    if user_id:
        from django.contrib.auth import get_user_model

        return get_user_model().objects.filter(id=user_id).first()

    customer_code = get_customer_code(data)
    subscription_code = get_subscription_code(data)
    existing_subscription = Subscription.objects.filter(
        paystack_subscription_code=subscription_code
    ).first()
    if existing_subscription:
        return existing_subscription.owner

    existing_subscription = Subscription.objects.filter(
        paystack_customer_code=customer_code
    ).first()
    if existing_subscription:
        return existing_subscription.owner

    return None


def ensure_paystack_signature(raw_body, signature):
    if not signature:
        return False
    digest = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        raw_body,
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(digest, signature)


def payload_hash(raw_body):
    return hashlib.sha256(raw_body).hexdigest()


@transaction.atomic
def initialize_subscription_payment(user, plan_key):
    plan = BillingPlan.objects.select_for_update().filter(
        key=plan_key,
        is_active=True,
    ).first()
    if not plan or plan.key == BillingPlanKey.FREE:
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Please choose a paid billing plan.",
        )
    paystack_plan_code = get_configured_paystack_plan_code(plan)
    if not paystack_plan_code:
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="This plan is missing its Paystack plan code.",
        )
    if not plan.paystack_plan_code:
        plan.paystack_plan_code = paystack_plan_code
        plan.save(update_fields=["paystack_plan_code", "date_last_modified"])

    reference = generate_payment_reference(user, plan)
    subscription = get_or_create_user_subscription(user)
    payment = PaymentTransaction.objects.create(
        owner=user,
        plan=plan,
        subscription=subscription,
        reference=reference,
        amount_kobo=plan.price_kobo,
        currency=plan.currency,
        status=PaymentStatus.PENDING,
    )

    payload = {
        "email": user.email,
        "amount": plan.price_kobo,
        "currency": plan.currency,
        "reference": reference,
        "callback_url": get_callback_url(),
        "plan": paystack_plan_code,
        "metadata": {
            "user_id": user.id,
            "plan_key": plan.key,
            "payment_transaction_id": payment.id,
        },
    }
    if getattr(user, "first_name", ""):
        payload["first_name"] = user.first_name
    if getattr(user, "last_name", ""):
        payload["last_name"] = user.last_name

    paystack_response = PaystackClient().initialize_transaction(payload)
    data = paystack_response.get("data", {})

    payment.paystack_access_code = data.get("access_code", "")
    payment.paystack_authorization_url = data.get("authorization_url", "")
    payment.raw_response = paystack_response
    payment.save(
        update_fields=[
            "paystack_access_code",
            "paystack_authorization_url",
            "raw_response",
            "date_last_modified",
        ]
    )
    return data


def normalize_payment_status(paystack_status):
    if paystack_status in PaymentStatus.values:
        return paystack_status
    if paystack_status in ["ongoing", "pending", "processing", "queued"]:
        return PaymentStatus.PENDING
    return PaymentStatus.FAILED


@transaction.atomic
def apply_successful_payment(data, transaction_obj=None):
    reference = data.get("reference", "")
    if transaction_obj is None and reference:
        transaction_obj = PaymentTransaction.objects.select_for_update().filter(
            reference=reference
        ).first()

    plan = get_plan_from_paystack_payload(data, fallback_plan=getattr(transaction_obj, "plan", None))
    user = resolve_user_from_paystack_data(data, transaction_obj=transaction_obj)

    if not user or not plan:
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Unable to resolve billing owner or plan from Paystack data.",
        )

    amount = int(data.get("amount") or 0)
    currency = data.get("currency")
    if amount != plan.price_kobo or currency != plan.currency:
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Payment amount or currency does not match the selected plan.",
        )

    paid_at = parse_paystack_datetime(data.get("paid_at")) or timezone.now()
    subscription = get_or_create_user_subscription(user)
    subscription.plan = plan
    subscription.status = SubscriptionStatus.ACTIVE
    subscription.paystack_customer_code = get_customer_code(data) or subscription.paystack_customer_code
    subscription.paystack_subscription_code = (
        get_subscription_code(data) or subscription.paystack_subscription_code
    )
    subscription.paystack_email_token = get_email_token(data) or subscription.paystack_email_token
    subscription.current_period_start = paid_at
    subscription.current_period_end = paid_at + timedelta(days=30)
    subscription.grace_ends_at = None
    subscription.cancel_at_period_end = False
    subscription.cancelled_at = None
    subscription.save()

    if transaction_obj:
        transaction_obj.subscription = subscription
        transaction_obj.status = PaymentStatus.SUCCESS
        transaction_obj.amount_kobo = amount
        transaction_obj.currency = currency
        transaction_obj.paid_at = paid_at
        transaction_obj.raw_response = data
        transaction_obj.save()

    return subscription


@transaction.atomic
def verify_payment(reference, user):
    payment = PaymentTransaction.objects.select_for_update().filter(
        reference=reference,
        owner=user,
    ).first()
    if not payment:
        raise exceptions.CustomException(
            status_code=status.HTTP_404_NOT_FOUND,
            message="Payment transaction not found.",
        )

    paystack_response = PaystackClient().verify_transaction(reference)
    data = paystack_response.get("data", {})
    paystack_status = data.get("status")
    payment.status = normalize_payment_status(paystack_status)
    payment.raw_response = paystack_response
    payment.save(update_fields=["status", "raw_response", "date_last_modified"])

    if paystack_status != PAYSTACK_SUCCESS_STATUS:
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Payment has not been completed successfully.",
        )

    return apply_successful_payment(data, transaction_obj=payment)


@transaction.atomic
def apply_subscription_created(data):
    user = resolve_user_from_paystack_data(data)
    plan = get_plan_from_paystack_payload(data)
    if not user or not plan:
        return None

    subscription = get_or_create_user_subscription(user)
    subscription.plan = plan
    subscription.paystack_customer_code = get_customer_code(data) or subscription.paystack_customer_code
    subscription.paystack_subscription_code = (
        get_subscription_code(data) or subscription.paystack_subscription_code
    )
    subscription.paystack_email_token = get_email_token(data) or subscription.paystack_email_token
    if subscription.status == SubscriptionStatus.FREE:
        subscription.status = SubscriptionStatus.PENDING
    subscription.save()
    return subscription


@transaction.atomic
def start_subscription_grace(data):
    subscription_code = get_subscription_code(data)
    subscription = Subscription.objects.select_for_update().filter(
        paystack_subscription_code=subscription_code
    ).first()
    if not subscription:
        user = resolve_user_from_paystack_data(data)
        subscription = getattr(user, "subscription", None) if user else None
    if not subscription:
        return None

    subscription.status = SubscriptionStatus.GRACE
    subscription.grace_ends_at = timezone.now() + timedelta(hours=48)
    subscription.save(update_fields=["status", "grace_ends_at", "date_last_modified"])
    from .tasks import send_subscription_payment_failed_email

    send_subscription_payment_failed_email.delay(subscription.id)
    return subscription


@transaction.atomic
def mark_subscription_not_renewing(data):
    subscription = Subscription.objects.select_for_update().filter(
        paystack_subscription_code=get_subscription_code(data)
    ).first()
    if not subscription:
        return None
    subscription.cancel_at_period_end = True
    subscription.save(update_fields=["cancel_at_period_end", "date_last_modified"])
    return subscription


@transaction.atomic
def disable_subscription(data):
    subscription = Subscription.objects.select_for_update().filter(
        paystack_subscription_code=get_subscription_code(data)
    ).first()
    if not subscription:
        return None
    subscription.status = SubscriptionStatus.DISABLED
    subscription.cancelled_at = timezone.now()
    subscription.save(update_fields=["status", "cancelled_at", "date_last_modified"])
    return subscription


def process_paystack_event(event):
    event_type = event.get("event")
    data = event.get("data") or {}

    if event_type == "charge.success":
        return apply_successful_payment(data)
    if event_type == "subscription.create":
        return apply_subscription_created(data)
    if event_type == "invoice.payment_failed":
        return start_subscription_grace(data)
    if event_type == "subscription.not_renew":
        return mark_subscription_not_renewing(data)
    if event_type == "subscription.disable":
        return disable_subscription(data)
    return None


@transaction.atomic
def record_and_process_webhook(raw_body, payload, signature):
    if not ensure_paystack_signature(raw_body, signature):
        raise exceptions.CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Invalid Paystack signature.",
        )

    body_hash = payload_hash(raw_body)
    reference = (payload.get("data") or {}).get("reference", "")
    event, created = PaystackWebhookEvent.objects.get_or_create(
        payload_hash=body_hash,
        defaults={
            "event_type": payload.get("event", ""),
            "reference": reference,
            "payload": payload,
        },
    )
    if not created and event.processed:
        return event

    process_paystack_event(payload)
    event.processed = True
    event.processed_at = timezone.now()
    event.save(update_fields=["processed", "processed_at", "date_last_modified"])
    return event
