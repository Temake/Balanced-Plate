from celery import shared_task
from loguru import logger

from django.conf import settings

from core.file_storage.models import FileModel
from .models import FoodAnalysis, DetectedFood
from .services import gemini_service
from .mock import get_mock_analysis_response
from core.utils import enums


@shared_task(bind=True, max_retries=3, queue="email-notification")
def analyze_food_image_task(self, file_id: str, use_mock: bool = False):
    try:
        file_obj = FileModel.objects.get(id=file_id)
        file_obj.currently_under_processing = True
        file_obj.save()

        analysis = FoodAnalysis.objects.filter(food_image=file_obj).first()
        if not analysis:
            analysis = FoodAnalysis.objects.create(
                owner=file_obj.owner,
                food_image=file_obj,
                analysis_status=enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value
            )
        else:
            analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_PROCESSING.value
            analysis.save()

        if use_mock:
            result, is_mock = get_mock_analysis_response(), True
        else:
            if not settings.USING_MANAGED_STORAGE:
                image_path = file_obj.file.path
                result, is_mock = gemini_service.analyze_image(image_path)
            else:
                image_url = file_obj.file.url
                result, is_mock = gemini_service.analyze_image_from_url(image_url)

        analysis.meal_type = result.get("meal_type")
        analysis.balance_score = result.get("balance_score")
        analysis.next_meal_recommendations = result.get("next_meal_recommendations", {})
        analysis.is_mock_data = is_mock
        analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value
        analysis.save()
        analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_COMPLETED.value.lower())

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
            )

        file_obj.currently_under_processing = False
        file_obj.save()

        logger.info(f"Completed food analysis for file {file_id}")
        return {"status": "completed", "analysis_id": analysis.id}

    except FileModel.DoesNotExist:
        logger.error(f"File {file_id} not found")
        return {"status": "failed", "error": "File not found"}

    except Exception as e:
        logger.error(f"Food analysis failed: {e}")
        
        try:
            analysis = FoodAnalysis.objects.filter(food_image_id=file_id).first()
            if analysis:
                analysis.analysis_status = enums.FoodAnalysisStatus.ANALYSIS_FAILED.value
                analysis.error_message = str(e)
                analysis.save()
                analysis.emit_event(enums.FoodAnalysisStatus.ANALYSIS_FAILED.value.lower())
            
            file_obj = FileModel.objects.get(id=file_id)
            file_obj.currently_under_processing = False
            file_obj.save()
        except Exception:
            pass

        raise self.retry(exc=e, countdown=60)
