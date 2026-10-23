from datetime import timedelta

from django.utils import timezone
from huey import crontab
from huey.contrib.djhuey import db_periodic_task, db_task
from loguru import logger

from core.utils.helpers import message_templates as mailer
from core.utils.tasks import mail as mail_tasks
from core.utils.tasks.schedule import once_per_slot

from .models import Subscription, SubscriptionStatus


def _send_subscription_email(subscription, subject, message):
    owner = subscription.owner
    mail_tasks.send_email_to_address(owner.email, subject, message, owner.first_name)


@db_task()
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


@db_task()
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


@db_task()
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


def _reminder_sent_this_period(sent_at, period_end, days_before):
    """Whether this reminder already went out for the current billing period.

    The sent-at fields are never cleared on renewal, so a bare "is it set" check
    meant every user got reminders for their first renewal and never again. A
    reminder only counts if it was sent inside the run-up to *this* period's end.
    """
    if sent_at is None:
        return False
    return sent_at >= period_end - timedelta(days=days_before + 1)


# Every hour through the day rather than once at 08:00: a run missed during a
# deploy is picked up an hour later instead of losing that day's reminders.
@db_periodic_task(crontab(hour="8-20", minute="0"))
@once_per_slot
def send_subscription_renewal_reminders():
    now = timezone.now()
    today = timezone.localdate()
    sent_7d = 0
    sent_1d = 0

    subscriptions = Subscription.objects.select_related("owner", "plan").filter(
        status=SubscriptionStatus.ACTIVE,
        current_period_end__gte=now,
        current_period_end__lte=now + timedelta(days=8),
    )

    for subscription in subscriptions:
        period_end = subscription.current_period_end
        renewal_date = timezone.localtime(period_end).date()
        days_until_renewal = (renewal_date - today).days
        message = mailer.MessageTemplates.subscription_renewal_reminder(
            subscription.plan.name,
            renewal_date.strftime("%B %d, %Y"),
        )

        # "Within N days" rather than "exactly N days", so a missed run catches up.
        # The 1-day reminder takes priority, so a late catch-up sends one email.
        if days_until_renewal <= 1:
            if _reminder_sent_this_period(subscription.renewal_reminder_1d_sent_at, period_end, 1):
                continue
            subject = (
                "Subscription Renews Tomorrow" if days_until_renewal == 1
                else "Subscription Renews Today"
            )
            _send_subscription_email(subscription, subject, message)
            subscription.renewal_reminder_1d_sent_at = now
            subscription.save(update_fields=["renewal_reminder_1d_sent_at", "date_last_modified"])
            sent_1d += 1
        elif days_until_renewal <= 7:
            if _reminder_sent_this_period(subscription.renewal_reminder_7d_sent_at, period_end, 7):
                continue
            _send_subscription_email(subscription, "Subscription Renewal Reminder", message)
            subscription.renewal_reminder_7d_sent_at = now
            subscription.save(update_fields=["renewal_reminder_7d_sent_at", "date_last_modified"])
            sent_7d += 1

    logger.info(f"Subscription renewal reminders sent. 7d={sent_7d}, 1d={sent_1d}")
    return {"sent_7d": sent_7d, "sent_1d": sent_1d}


@db_periodic_task(crontab(minute="15"))
@once_per_slot
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
        send_subscription_expired_email(subscription.id)
        expired_count += 1

    logger.info(f"Expired lapsed subscriptions: {expired_count}")
    return {"expired_count": expired_count}


@db_periodic_task(crontab(minute="0"))
@once_per_slot
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
        send_subscription_grace_expired_email(subscription.id)
        expired_count += 1

    logger.info(f"Expired subscription grace periods: {expired_count}")
    return {"expired_count": expired_count}
