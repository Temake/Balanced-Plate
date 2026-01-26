from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from loguru import logger

from core.account.models import Account
from core.recommendations.services import weekly_recommendation_service


@shared_task(bind=True, max_retries=3, queue="recommendation")
def generate_weekly_recommendations_for_all_users(self):
    """
    Generate weekly recommendations for all active users.
    Runs every Monday to process the previous week (Monday-Sunday).
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
        try:
            recommendation = weekly_recommendation_service.generate_recommendation(
                user=user,
                start_date=start_date,
                end_date=end_date,
            )
            recommendation.emit_ready_event()
            
            success_count += 1
            logger.info(f"Generated recommendation for user {user.id}")

        except Exception as e:
            error_count += 1
            logger.error(f"Failed to generate recommendation for user {user.id}: {e}")
            raise self.retry(exc=e, countdown=60)

    logger.info(
        f"Weekly recommendations complete. Success: {success_count}, Errors: {error_count}"
    )

    return {
        "success_count": success_count,
        "error_count": error_count,
        "week_start": start_date.isoformat(),
        "week_end": end_date.isoformat(),
    }