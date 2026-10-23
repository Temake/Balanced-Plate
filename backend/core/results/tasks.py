import traceback
from datetime import timedelta

from huey import crontab
from huey.contrib.djhuey import HUEY, db_periodic_task, db_task, signal
from huey.signals import SIGNAL_INTERRUPTED
from loguru import logger

from django.conf import settings
from django.utils import timezone

from core.billing.entitlements import release_ai_generation_credit_by_id
from core.billing.models import AIFeatureType, AIUsageLedger
from core.file_storage.models import FileModel
from .models import FoodAnalysis, DetectedFood
from .services import AnalysisUnavailable, gemini_service
from .mock import get_mock_analysis_response
from core.utils import enums
from core.utils.tasks.schedule import once_per_slot


ANALYSIS_FAILED_MESSAGE = (
    "We couldn't analyse this photo. You haven't been charged for it — "
    "please try again in a moment."
)

ANALYSIS_MAX_RETRIES = 3

# Longer than a full run with every retry (4 attempts, 60s apart, plus the Gemini
# calls), so the sweeper only ever touches analyses whose task has died.
STUCK_ANALYSIS_AFTER = timedelta(minutes=20)


def _mark_failed(file_id, user_message):
    """Terminal failure: tell the user, and release the image for a retry.

    Only called once retries are exhausted. Emitting `analysis_failed` on every
    intermediate attempt used to show the user a failure that then silently
    succeeded on a later retry.
    """
    try:
        analysis = FoodAnalysis.objects.filter(food_image_id=file_id).first()
        if analysis:
            analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_FAILED.value
            # Only the friendly message is stored — this field is serialised to
            # the client, and raw exception text belongs in the logs.
            analysis.error_message = user_message
            analysis.save(update_fields=["analysis_status", "error_message"])
            try:
                analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_FAILED.value.lower())
            except Exception:
                logger.warning("[TASK] Failed to emit failure WebSocket event")

        file_obj = FileModel.objects.filter(id=file_id).first()
        if file_obj:
            file_obj.currently_under_processing = False
            file_obj.save(update_fields=["currently_under_processing"])
    except Exception as cleanup_err:
        logger.error(f"[TASK] Cleanup after failure also failed: {cleanup_err}")


@db_task(retries=ANALYSIS_MAX_RETRIES, retry_delay=60, context=True)
def analyze_food_image_task(file_id: str, use_mock: bool = False, reservation_id=None, task=None):
    logger.info(f"[TASK] Starting food analysis task for file_id={file_id}, use_mock={use_mock}")
    try:
        file_obj = FileModel.objects.get(id=file_id)
        file_obj.currently_under_processing = True
        file_obj.save(update_fields=["currently_under_processing"])

        # Build user health profile for personalized AI feedback
        user = file_obj.owner
        user_profile = {
            "age_range": getattr(user, "effective_age_range", "Not specified"),
            "dietary_goal": getattr(user, "dietary_goal", "general_health"),
            "dietary_preference": getattr(user, "dietary_preference", "none"),
            "health_conditions": getattr(user, "health_conditions", []),
        }

        analysis = FoodAnalysis.objects.filter(food_image=file_obj).first()
        if not analysis:
            analysis = FoodAnalysis.objects.create(
                owner=file_obj.owner,
                food_image=file_obj,
                analysis_status=enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value
            )
        else:
            analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value
            # date_last_modified is what the stuck-analysis sweeper measures from.
            analysis.save(update_fields=["analysis_status", "date_last_modified"])

        if use_mock:
            result, is_mock = get_mock_analysis_response(), True
        else:
            if not settings.USING_MANAGED_STORAGE:
                image_path = file_obj.file.path
                result, is_mock = gemini_service.analyze_image(image_path, user_profile=user_profile)
            else:
                image_url = file_obj.file.url
                result, is_mock = gemini_service.analyze_image_from_url(image_url, user_profile=user_profile)

        # Save analysis results
        analysis.meal_type = result.get("meal_type")
        analysis.balance_score = result.get("balance_score")
        analysis.next_meal_recommendations = result.get("next_meal_recommendations", {})
        analysis.food_name = result.get("food_name")
        analysis.conversational_feedback = result.get("conversational_feedback")
        analysis.actionable_suggestion = result.get("actionable_suggestion")
        analysis.alternative_suggestion = result.get("alternative_suggestion")
        analysis.is_mock_data = is_mock
        analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value
        analysis.save()

        # Save detected foods
        DetectedFood.objects.filter(analysis=analysis).delete()

        detected_food_instances = [
            DetectedFood(
                analysis=analysis,
                name=food_data.get("name", "Unknown"),
                confidence=food_data.get("confidence"),
                portion_estimate=food_data.get("portion_estimate"),
                calories=nutritional_info.get("calories"),
                protein=nutritional_info.get("protein"),
                carbs=nutritional_info.get("carbs"),
                fat=nutritional_info.get("fat"),
                dairy=nutritional_info.get("dairy"),
                vegetable=nutritional_info.get("vegetable"),
                fruit=nutritional_info.get("fruit"),
                micronutrients=food_data.get("micronutrients", {}),
            )
            for food_data in result.get("detected_foods", [])
            for nutritional_info in [food_data.get("nutritional_info", {})]
        ]
        if detected_food_instances:
            DetectedFood.objects.bulk_create(detected_food_instances)

        file_obj.currently_under_processing = False
        file_obj.save(update_fields=["currently_under_processing"])

        # Emit WebSocket event — wrapped in try/catch so a WebSocket
        # failure doesn't cause a task retry when analysis itself succeeded
        try:
            analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value.lower())
            logger.info(f"[TASK] WebSocket event emitted for analysis {analysis.id}")
        except Exception as ws_err:
            logger.warning(f"[TASK] WebSocket emit failed (non-fatal): {ws_err}")

        logger.info(f"[TASK] Completed food analysis for file {file_id}, analysis_id={analysis.id}")
        return {"status": "completed", "analysis_id": analysis.id}

    except FileModel.DoesNotExist:
        logger.error(f"[TASK] File {file_id} not found")
        release_ai_generation_credit_by_id(reservation_id)
        return {"status": "failed", "error": "File not found"}

    except AnalysisUnavailable as e:
        # Deterministic: a missing API key or an unparseable response will fail
        # again in 60 seconds, so don't burn retries or make the user wait.
        logger.error(f"[TASK] Analysis unavailable for file {file_id}: {e}")
        _mark_failed(file_id, ANALYSIS_FAILED_MESSAGE)
        release_ai_generation_credit_by_id(reservation_id)
        return {"status": "failed", "error": str(e)}

    except Exception as e:
        logger.error(f"[TASK] Food analysis failed for file {file_id}: {e}\n{traceback.format_exc()}")

        # Huey counts retries down: `task.retries` is how many are left.
        retries_left = task.retries if task is not None else 0
        if retries_left <= 0:
            # Out of attempts — this is the only point at which the user is told
            # it failed, and the only point at which the allowance is refunded.
            _mark_failed(file_id, ANALYSIS_FAILED_MESSAGE)
            release_ai_generation_credit_by_id(reservation_id)
            return {"status": "failed", "error": str(e)}

        # Keep the analysis in PROCESSING and stay quiet: a retry may still win,
        # and the reservation is held so the user isn't refunded prematurely.
        # Re-raising is what makes Huey schedule the retry, 60 seconds out.
        attempt = ANALYSIS_MAX_RETRIES - retries_left + 1
        logger.warning(
            f"[TASK] Retrying analysis for file {file_id} "
            f"(attempt {attempt}/{ANALYSIS_MAX_RETRIES})"
        )
        raise


@signal(SIGNAL_INTERRUPTED)
def requeue_interrupted_analysis(signal_name, task, *args, **kwargs):
    """Put an analysis back on the queue when the worker is stopped mid-run.

    Railway stops the worker with SIGTERM on every redeploy, and Huey treats SIGTERM
    as "stop now", abandoning whatever is running. Without this, a photo analysed
    during a deploy would sit in PROCESSING forever with the user's credit held.
    The task is safe to run twice: it rewrites the analysis and its detected foods.
    """
    if not isinstance(task, analyze_food_image_task.task_class):
        return
    logger.warning(f"[TASK] Analysis task {task.id} interrupted by shutdown; re-queueing")
    HUEY.enqueue(task)


@db_periodic_task(crontab(minute="*/10"))
@once_per_slot
def fail_stuck_analyses():
    """Fail analyses whose task died without saying so, and refund the user.

    Covers what the interrupt hook cannot: the worker being killed outright (out of
    memory, SIGKILL), or a task lost before it ever started.
    """
    cutoff = timezone.now() - STUCK_ANALYSIS_AFTER
    stuck = FoodAnalysis.objects.filter(
        analysis_status__in=[
            enums.FoodAnalysisStatus.ANALYSIS_PENDING.value,
            enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value,
        ],
        date_last_modified__lt=cutoff,
    )

    failed_count = 0
    for analysis in stuck:
        _mark_failed(analysis.food_image_id, ANALYSIS_FAILED_MESSAGE)
        # The task carried the reservation id; the ledger row records which
        # analysis it was taken for, so it can be found without it.
        AIUsageLedger.objects.filter(
            feature_type=AIFeatureType.FOOD_ANALYSIS,
            metadata__analysis_id=str(analysis.id),
        ).delete()
        failed_count += 1

    if failed_count:
        logger.warning(f"[TASK] Failed {failed_count} stuck analyses and refunded them")
    return {"failed_count": failed_count}
