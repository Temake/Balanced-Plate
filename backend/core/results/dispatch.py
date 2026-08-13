"""Single entry point for starting a food analysis.

There are two callers — the upload endpoint, which auto-triggers analysis for any
food image, and the explicit `TriggerAnalysis` endpoint. Metering only one of them
would leave the other as a free path to a paid vision call, so the allowance
check, the ledger reservation and the task dispatch all live here.
"""

from loguru import logger

from core.billing.entitlements import (
    release_ai_generation_credit,
    reserve_analysis_credit,
)
from core.utils import enums

from .models import FoodAnalysis


# Statuses that mean an analysis for this image is already queued or running, so a
# second dispatch would charge the user twice for one photo.
IN_FLIGHT_STATUSES = frozenset(
    {
        enums.FoodAnalysisStatus.ANALYSIS_PENDING.value,
        enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value,
    }
)


class AnalysisAlreadyExists(Exception):
    """An analysis for this image is already complete. Carries the existing row."""

    def __init__(self, analysis):
        self.analysis = analysis
        super().__init__("Analysis already exists for this image")


class AnalysisAlreadyRunning(Exception):
    """An analysis for this image is already queued or in progress."""

    def __init__(self, analysis):
        self.analysis = analysis
        super().__init__("Analysis is already running for this image")


def dispatch_food_analysis(user, file_obj, use_mock=False):
    """Reserve the allowance, then queue the analysis. Returns the FoodAnalysis.

    Raises `AnalysisAlreadyExists` / `AnalysisAlreadyRunning` when a dispatch would
    duplicate work, and the billing CustomException (402) when the user is out of
    allowance. Mock runs are never metered — they make no Gemini call.
    """
    existing = FoodAnalysis.objects.filter(food_image=file_obj).first()
    if existing:
        if existing.analysis_status == enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value:
            raise AnalysisAlreadyExists(existing)
        if existing.analysis_status in IN_FLIGHT_STATUSES:
            raise AnalysisAlreadyRunning(existing)

    analysis = existing or FoodAnalysis.objects.create(
        owner=user,
        food_image=file_obj,
        analysis_status=enums.FoodAnalysisStatus.ANALYSIS_PENDING.value,
    )
    if existing:
        # A previously failed analysis is being retried: a fresh Gemini call is
        # genuinely made, so it is charged again.
        analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_PENDING.value
        analysis.error_message = ""
        analysis.save(update_fields=["analysis_status", "error_message"])

    # Reserve before queueing. The reservation is what serialises concurrent
    # requests; a task waiting in a backlog would let any number of them through
    # before the first ledger row existed.
    reservation = None if use_mock else reserve_analysis_credit(
        user, metadata={"file_id": str(file_obj.id), "analysis_id": str(analysis.id)}
    )

    from .tasks import analyze_food_image_task  # local: avoids an import cycle

    try:
        analyze_food_image_task.delay(
            str(file_obj.id),
            use_mock=use_mock,
            reservation_id=str(reservation.pk) if reservation else None,
        )
    except Exception:
        # The broker refused the job, so nothing will ever run. Don't charge, and
        # don't leave the row claiming to be pending forever.
        release_ai_generation_credit(reservation)
        analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_FAILED.value
        analysis.error_message = (
            "We couldn't start the analysis. You haven't been charged — please try again."
        )
        analysis.save(update_fields=["analysis_status", "error_message"])
        logger.error(f"Failed to queue analysis for file {file_obj.id}; reservation released")
        raise

    return analysis
