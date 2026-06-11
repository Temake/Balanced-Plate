import traceback

from celery import shared_task
from loguru import logger

from django.conf import settings

from core.file_storage.models import FileModel
from .models import FoodAnalysis, DetectedFood
from .services import gemini_service
from .mock import get_mock_analysis_response
from core.utils import enums


@shared_task(bind=True, max_retries=3, queue="analysis")
def analyze_food_image_task(self, file_id: str, use_mock: bool = False):
    logger.info(f"[CELERY] Starting food analysis task for file_id={file_id}, use_mock={use_mock}")
    try:
        file_obj = FileModel.objects.get(id=file_id)
        file_obj.currently_under_processing = True
        file_obj.save(update_fields=["currently_under_processing"])

        # Build user health profile for personalized AI feedback
        user = file_obj.owner
        user_profile = {
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
            analysis.save(update_fields=["analysis_status"])

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

        for food_data in result.get("detected_foods", []):
            nutritional_info = food_data.get("nutritional_info", {})
            DetectedFood.objects.create(
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

        file_obj.currently_under_processing = False
        file_obj.save(update_fields=["currently_under_processing"])

        # Emit WebSocket event — wrapped in try/catch so a WebSocket
        # failure doesn't cause a Celery retry when analysis itself succeeded
        try:
            analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value.lower())
            logger.info(f"[CELERY] WebSocket event emitted for analysis {analysis.id}")
        except Exception as ws_err:
            logger.warning(f"[CELERY] WebSocket emit failed (non-fatal): {ws_err}")

        logger.info(f"[CELERY] Completed food analysis for file {file_id}, analysis_id={analysis.id}")
        return {"status": "completed", "analysis_id": analysis.id}

    except FileModel.DoesNotExist:
        logger.error(f"[CELERY] File {file_id} not found")
        return {"status": "failed", "error": "File not found"}

    except Exception as e:
        logger.error(f"[CELERY] Food analysis failed for file {file_id}: {e}\n{traceback.format_exc()}")
        
        try:
            analysis = FoodAnalysis.objects.filter(food_image_id=file_id).first()
            if analysis:
                analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_FAILED.value
                analysis.error_message = str(e)
                analysis.save(update_fields=["analysis_status", "error_message"])
                try:
                    analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_FAILED.value.lower())
                except Exception:
                    logger.warning("[CELERY] Failed to emit failure WebSocket event")
            
            file_obj = FileModel.objects.get(id=file_id)
            file_obj.currently_under_processing = False
            file_obj.save(update_fields=["currently_under_processing"])
        except Exception as cleanup_err:
            logger.error(f"[CELERY] Cleanup after failure also failed: {cleanup_err}")

        raise self.retry(exc=e, countdown=60)
