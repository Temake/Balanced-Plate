from django.db.models import Sum
from rest_framework import status

from core.utils.exceptions import exceptions

from .models import AIFeatureType, AIUsageLedger
from .services import current_billing_month, get_or_create_user_subscription


PAID_ACCESS_MESSAGE = "This feature requires an active Plus or Pro subscription."
AI_CREDITS_MESSAGE = "You have used all your AI generation credits for this month."


def has_active_paid_subscription(user):
    subscription = get_or_create_user_subscription(user)
    return subscription.is_paid_access_active


def require_paid_access(user, message=PAID_ACCESS_MESSAGE):
    subscription = get_or_create_user_subscription(user)
    if not subscription.is_paid_access_active:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message=message,
        )
    return subscription


def _feature_enabled(subscription, feature_type):
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
    return max(subscription.plan.ai_generation_limit - used, 0)


def require_ai_generation_available(user, feature_type):
    subscription = require_paid_access(user)
    if not _feature_enabled(subscription, feature_type):
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message="Your current subscription does not include this AI feature.",
        )

    if subscription.plan.ai_generation_limit <= 0:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message="Your current subscription does not include AI generation credits.",
        )

    if get_ai_generation_remaining(user) <= 0:
        raise exceptions.CustomException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            message=AI_CREDITS_MESSAGE,
        )

    return subscription


def record_ai_generation_usage(user, feature_type, credits_used=1, metadata=None):
    return AIUsageLedger.objects.create(
        owner=user,
        feature_type=feature_type,
        billing_month=current_billing_month(),
        credits_used=credits_used,
        metadata=metadata or {},
    )
