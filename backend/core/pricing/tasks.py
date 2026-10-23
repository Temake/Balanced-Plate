from django.conf import settings
from django.db.models import Max
from django.utils import timezone
from huey import crontab
from huey.contrib.djhuey import HUEY, db_periodic_task
from loguru import logger

from core.utils.tasks import mail as mail_tasks
from core.utils.tasks.schedule import once_per_slot

from .models import PriceObservation
from .services import MAX_PRICE_AGE_DAYS

# NBS data for month M usually lands within two months, so by the 11th the newest
# price should be no older than this. Anything older means a release is late or
# wasn't imported, and needs a person to look.
STALE_PRICE_ALERT_DAYS = 60

# New prices are expected by the 11th of each month.
PRICE_UPDATE_DUE_DAY = 11


@db_periodic_task(crontab(hour="9", minute="0"))
@once_per_slot
def check_price_freshness():
    """Email an alert, at most weekly, while prices are overdue for an update.

    Late data is not an emergency: the costing keeps using the last known price,
    adjusted for inflation, for up to MAX_PRICE_AGE_DAYS. This makes sure someone
    hears about it long before prices start dropping out of meal-plan costs.
    Runs daily so a missed run is caught up the next day.
    """
    today = timezone.localdate()
    if today.day < PRICE_UPDATE_DUE_DAY:
        return {"checked": False}

    newest = PriceObservation.objects.aggregate(newest=Max("observed_on"))["newest"]
    age_days = (today - newest).days if newest else None
    if age_days is not None and age_days <= STALE_PRICE_ALERT_DAYS:
        return {"checked": True, "stale": False, "newest": newest.isoformat()}

    # One email per ISO week while the prices stay stale.
    week = today.strftime("%G-W%V")
    if not HUEY.put_if_empty(f"price-freshness-alert.{week}", "1", 8 * 24 * 3600):
        return {"checked": True, "stale": True, "alerted": False}

    if newest is None:
        detail = "There are no prices in the database at all, so meal plans are not being costed."
    else:
        days_left = MAX_PRICE_AGE_DAYS - age_days
        if days_left > 0:
            detail = (
                f"The newest price is from {newest:%B %d, %Y} ({age_days} days old). Meal plans "
                f"are still being costed from it, adjusted for inflation, but in {days_left} days "
                f"prices will be too old to use and plans will stop showing costs."
            )
        else:
            detail = (
                f"The newest price is from {newest:%B %d, %Y} ({age_days} days old), past the "
                f"{MAX_PRICE_AGE_DAYS}-day limit. Meal plans are no longer being costed."
            )

    message = (
        "<h3>Food prices are overdue for an update</h3>"
        f"<p>{detail}</p>"
        "<p>Import the latest NBS Selected Food Price Watch, or add prices under "
        "Pricing → Price Observations in the admin.</p>"
    )
    recipient = settings.PRICE_ALERT_EMAIL
    mail_tasks.send_email_to_address(
        recipient, "[NutriLens] Food prices are overdue for an update", message, "NutriLens Team"
    )
    logger.warning(f"[TASK] Prices are stale (newest: {newest}); alert sent to {recipient}")
    return {"checked": True, "stale": True, "alerted": True}
