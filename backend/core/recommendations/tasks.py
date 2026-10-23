from django.utils import timezone
from datetime import timedelta
from huey import crontab
from huey.contrib.djhuey import db_periodic_task
from loguru import logger

from core.account.models import Account
from core.billing.entitlements import has_active_paid_subscription
from core.recommendations.services import weekly_recommendation_service
from core.utils.tasks.schedule import once_per_slot


@db_periodic_task(crontab(day_of_week="1", hour="6", minute="0"))
@once_per_slot
def generate_weekly_recommendations_for_all_users():
    """
    Generate weekly recommendations for all active users.
    Runs every Monday to process the previous week (Monday-Sunday).

    One user's failure is logged and skipped. Retrying the whole run used to
    regenerate — and pay Gemini for — every user who had already succeeded.
    """
    today = timezone.localdate()

    days_since_monday = today.weekday()
    end_date = today - timedelta(days=days_since_monday + 1)
    start_date = end_date - timedelta(days=6)

    logger.info(f"Generating weekly recommendations for {start_date} to {end_date}")

    users = Account.objects.filter(is_active=True)
    success_count = 0
    error_count = 0

    for user in users:
        if not has_active_paid_subscription(user):
            logger.info(f"Skipping weekly recommendation for unpaid user {user.id}")
            continue

        try:
            recommendation = weekly_recommendation_service.generate_recommendation(
                user=user,
                start_date=start_date,
                end_date=end_date,
            )
            recommendation.emit_ready_event()

            success_count += 1
            logger.info(f"Emitted recommendation for user {user.id}")

        except Exception as e:
            error_count += 1
            logger.error(f"Failed to emit recommendation for user {user.id}: {e}")

    logger.info(
        f"Weekly recommendations complete. Success: {success_count}, Errors: {error_count}"
    )

    return {
        "success_count": success_count,
        "error_count": error_count,
        "week_start": start_date.isoformat(),
        "week_end": end_date.isoformat(),
    }
