from django.db import connection, transaction
from django.db.models import Sum
from rest_framework import status

from core.utils.exceptions import exceptions

from .models import AIFeatureType, AIUsageLedger, Subscription
from .services import (
    DEMO_AI_GENERATION_LIMIT,
    current_billing_month,
    get_active_feature_entitlement,
    get_or_create_user_subscription,
)


PAID_ACCESS_MESSAGE = "This feature requires an active Plus or Pro subscription."
AI_CREDITS_MESSAGE = "You have used all your AI generation credits for this month."


def has_active_paid_subscription(user):
    subscription = get_or_create_user_subscription(user)
    return subscription.is_paid_access_active or get_active_feature_entitlement(user) is not None


def require_paid_access(user, message=PAID_ACCESS_MESSAGE):
    subscription = get_or_create_user_subscription(user)
    if not subscription.is_paid_access_active and get_active_feature_entitlement(user) is None:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message=message,
        )
    return subscription


def _feature_enabled(subscription, feature_type):
    if get_active_feature_entitlement(subscription.owner) is not None:
        return True
    if feature_type in [AIFeatureType.MEAL_PLAN, AIFeatureType.MEAL_PLAN_DAY]:
        return subscription.plan.ai_planning_enabled
    if feature_type == AIFeatureType.COOKING_GUIDE:
        return subscription.plan.ai_cooking_enabled
    return False


def get_ai_generation_usage(user, billing_month=None):
    billing_month = billing_month or current_billing_month()
    return (
        AIUsageLedger.objects.filter(owner=user, billing_month=billing_month)
        .aggregate(total=Sum("credits_used"))
        .get("total")
        or 0
    )


def get_ai_generation_remaining(user, billing_month=None):
    subscription = get_or_create_user_subscription(user)
    used = get_ai_generation_usage(user, billing_month=billing_month)
    limit = (
        DEMO_AI_GENERATION_LIMIT
        if get_active_feature_entitlement(user) is not None
        else subscription.plan.ai_generation_limit
    )
    return max(limit - used, 0)


def _assert_ai_generation_available(subscription, feature_type, credits_used=1):
    """Shared entitlement checks. Operates on an already-resolved subscription so the
    caller can hold a lock on it across the check."""
    user = subscription.owner
    if not subscription.is_paid_access_active and get_active_feature_entitlement(user) is None:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message=PAID_ACCESS_MESSAGE,
        )

    if not _feature_enabled(subscription, feature_type):
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message="Your current subscription does not include this AI feature.",
        )

    if get_active_feature_entitlement(user) is None and subscription.plan.ai_generation_limit <= 0:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message="Your current subscription does not include AI generation credits.",
        )

    if get_ai_generation_remaining(user) < credits_used:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message=AI_CREDITS_MESSAGE,
        )


def require_ai_generation_available(user, feature_type):
    subscription = get_or_create_user_subscription(user)
    _assert_ai_generation_available(subscription, feature_type)
    return subscription


def _lock_subscription(subscription):
    """Re-read the subscription row under a write lock.

    SQLite (the dev database) has no SELECT ... FOR UPDATE, so there the unlocked
    instance is returned; it serialises writers at the file level anyway.
    """
    if not connection.features.has_select_for_update:
        return subscription
    return (
        Subscription.objects.select_for_update()
        .select_related("plan", "owner")
        .get(pk=subscription.pk)
    )


@transaction.atomic
def reserve_ai_generation_credit(user, feature_type, credits_used=1, metadata=None):
    """Check the entitlement and consume the credit as one indivisible step.

    Callers used to check availability, run a multi-second AI call, and only then
    write the ledger row. Every concurrent request cleared the check before any of
    them recorded usage, so a user with one credit left could spend several at once.
    Writing the ledger row while the subscription row is locked closes that window.
    Pass the returned reservation to `release_ai_generation_credit` if the generation
    itself fails, so a failed request does not cost the user a credit.
    """
    subscription = _lock_subscription(get_or_create_user_subscription(user))
    _assert_ai_generation_available(subscription, feature_type, credits_used=credits_used)
    return AIUsageLedger.objects.create(
        owner=subscription.owner,
        feature_type=feature_type,
        billing_month=current_billing_month(),
        credits_used=credits_used,
        metadata=metadata or {},
    )


def release_ai_generation_credit(reservation):
    """Refund a reservation whose generation never produced a result."""
    if reservation is None:
        return
    AIUsageLedger.objects.filter(pk=reservation.pk).delete()


def finalize_ai_generation_usage(reservation, metadata=None):
    """Attach the post-generation metadata to an already-consumed reservation."""
    if reservation is None or not metadata:
        return reservation
    reservation.metadata = {**(reservation.metadata or {}), **metadata}
    reservation.save(update_fields=["metadata", "date_last_modified"])
    return reservation


def record_ai_generation_usage(user, feature_type, credits_used=1, metadata=None):
    return AIUsageLedger.objects.create(
        owner=user,
        feature_type=feature_type,
        billing_month=current_billing_month(),
        credits_used=credits_used,
        metadata=metadata or {},
    )
