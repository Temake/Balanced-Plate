from celery import shared_task
from django.utils import timezone
from loguru import logger

from config.celery.queue import CeleryQueue
from core.utils.helpers import message_templates as mailer
from core.utils.tasks import mail as mail_tasks

from .models import Subscription, SubscriptionStatus


def _send_subscription_email(subscription, subject, message):
    owner = subscription.owner
    mail_tasks.send_email_to_address.apply_async(
        (owner.email, subject, message, owner.first_name),
        queue=CeleryQueue.Definitions.EMAIL_AND_NOTIFICATION,
    )


@shared_task(queue="email-notification")
def send_subscription_payment_failed_email(subscription_id):
    subscription = (
        Subscription.objects.select_related("owner", "plan")
        .filter(id=subscription_id)
        .first()
    )
    if not subscription or not subscription.grace_ends_at:
        return {"sent": False, "reason": "subscription_or_grace_not_found"}

    message = mailer.MessageTemplates.subscription_payment_failed(
        subscription.plan.name,
        subscription.grace_ends_at.strftime("%B %d, %Y %I:%M %p"),
    )
    _send_subscription_email(subscription, "Subscription Payment Failed", message)
    return {"sent": True, "subscription_id": subscription.id}


@shared_task(queue="email-notification")
def send_subscription_grace_expired_email(subscription_id):
    subscription = (
        Subscription.objects.select_related("owner", "plan")
        .filter(id=subscription_id)
        .first()
    )
    if not subscription:
        return {"sent": False, "reason": "subscription_not_found"}

    message = mailer.MessageTemplates.subscription_grace_expired(subscription.plan.name)
    _send_subscription_email(subscription, "Subscription Access Paused", message)
    return {"sent": True, "subscription_id": subscription.id}


@shared_task(queue="email-notification")
def send_subscription_expired_email(subscription_id):
    subscription = (
        Subscription.objects.select_related("owner", "plan")
        .filter(id=subscription_id)
        .first()
    )
    if not subscription:
        return {"sent": False, "reason": "subscription_not_found"}

    message = mailer.MessageTemplates.subscription_expired(subscription.plan.name)
    _send_subscription_email(subscription, "Subscription Expired", message)
    return {"sent": True, "subscription_id": subscription.id}


@shared_task(queue="email-notification")
def send_subscription_renewal_reminders():
    now = timezone.now()
    today = timezone.localdate()
    sent_7d = 0
    sent_1d = 0

    subscriptions = Subscription.objects.select_related("owner", "plan").filter(
        status=SubscriptionStatus.ACTIVE,
        current_period_end__isnull=False,
    )

    for subscription in subscriptions:
        renewal_date = timezone.localtime(subscription.current_period_end).date()
        days_until_renewal = (renewal_date - today).days
        if days_until_renewal == 7 and not subscription.renewal_reminder_7d_sent_at:
            message = mailer.MessageTemplates.subscription_renewal_reminder(
                subscription.plan.name,
                renewal_date.strftime("%B %d, %Y"),
            )
            _send_subscription_email(subscription, "Subscription Renewal Reminder", message)
            subscription.renewal_reminder_7d_sent_at = now
            subscription.save(update_fields=["renewal_reminder_7d_sent_at", "date_last_modified"])
            sent_7d += 1
        elif days_until_renewal == 1 and not subscription.renewal_reminder_1d_sent_at:
            message = mailer.MessageTemplates.subscription_renewal_reminder(
                subscription.plan.name,
                renewal_date.strftime("%B %d, %Y"),
            )
            _send_subscription_email(subscription, "Subscription Renews Tomorrow", message)
            subscription.renewal_reminder_1d_sent_at = now
            subscription.save(update_fields=["renewal_reminder_1d_sent_at", "date_last_modified"])
            sent_1d += 1

    logger.info(f"Subscription renewal reminders sent. 7d={sent_7d}, 1d={sent_1d}")
    return {"sent_7d": sent_7d, "sent_1d": sent_1d}


@shared_task(queue="email-notification")
def expire_lapsed_subscriptions():
    """Demote ACTIVE subscriptions whose paid period has ended.

    Paystack renewal events extend `current_period_end`; if a renewal never lands
    (failed card, cancelled plan, missed webhook) nothing else moves the row out of
    ACTIVE, which would leave paid access switched on indefinitely.
    """
    now = timezone.now()
    subscriptions = Subscription.objects.select_related("owner", "plan").filter(
        status=SubscriptionStatus.ACTIVE,
        current_period_end__isnull=False,
        current_period_end__lte=now,
    )
    expired_count = 0
    for subscription in subscriptions:
        subscription.status = SubscriptionStatus.EXPIRED
        subscription.save(update_fields=["status", "date_last_modified"])
        send_subscription_expired_email.delay(subscription.id)
        expired_count += 1

    logger.info(f"Expired lapsed subscriptions: {expired_count}")
    return {"expired_count": expired_count}


@shared_task(queue="email-notification")
def expire_subscription_grace_periods():
    now = timezone.now()
    subscriptions = Subscription.objects.select_related("owner", "plan").filter(
        status=SubscriptionStatus.GRACE,
        grace_ends_at__lte=now,
    )
    expired_count = 0
    for subscription in subscriptions:
        subscription.status = SubscriptionStatus.EXPIRED
        subscription.save(update_fields=["status", "date_last_modified"])
        send_subscription_grace_expired_email.delay(subscription.id)
        expired_count += 1

    logger.info(f"Expired subscription grace periods: {expired_count}")
    return {"expired_count": expired_count}
