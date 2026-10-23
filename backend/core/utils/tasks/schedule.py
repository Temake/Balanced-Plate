from functools import wraps

from django.utils import timezone
from huey.contrib.djhuey import HUEY
from loguru import logger


def once_per_slot(fn):
    """Run a periodic task at most once per scheduled minute, across every worker.

    The worker runs inside the web container, and during a Railway deploy the old
    and new containers are both up for a short while, each with its own scheduler.
    Without this, both would fire the same periodic task: duplicate emails, or a
    second round of Gemini calls for weekly recommendations. The first worker to
    claim the minute runs the task; the other skips it.

    Apply it beneath `@db_periodic_task`.
    """

    @wraps(fn)
    def inner(*args, **kwargs):
        slot = timezone.now().strftime("%Y-%m-%dT%H:%M")
        key = f"slot.{fn.__module__}.{fn.__name__}.{slot}"
        # Atomic in Redis; the key expires on its own once the minute is long gone.
        if not HUEY.put_if_empty(key, "1", 3600):
            logger.info(f"[TASK] {fn.__name__} already ran for {slot}; skipping")
            return None
        return fn(*args, **kwargs)

    return inner
