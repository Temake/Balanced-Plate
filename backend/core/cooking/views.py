from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import response, status, views

from core.utils.exceptions import exceptions
from core.billing.entitlements import (
    finalize_ai_generation_usage,
    release_ai_generation_credit,
    reserve_ai_generation_credit,
)
from core.billing.models import AIFeatureType

from .serializers import CookingGuideRequestSerializer
from .services import cooking_assistant_service


@extend_schema(tags=["Cooking Assistant"])
class GenerateCookingGuide(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Generate a step-by-step cooking guide for a Nigerian dish. "
                    "The guide is personalized based on the user's dietary preferences and health conditions.",
        request=CookingGuideRequestSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "is_mock": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "dish_name": {"type": "string"},
                            "servings": {"type": "integer"},
                            "total_prep_time_minutes": {"type": "integer"},
                            "difficulty": {"type": "string"},
                            "ingredients": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "quantity": {"type": "string"},
                                        "is_essential": {"type": "boolean"},
                                    },
                                },
                            },
                            "steps": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "step_number": {"type": "integer"},
                                        "instruction": {"type": "string"},
                                        "duration_minutes": {"type": "integer"},
                                        "tip": {"type": "string"},
                                    },
                                },
                            },
                            "health_notes": {"type": "string"},
                        },
                    },
                },
            }
        },
    )
    def post(self, request):
        serializer = CookingGuideRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dish_name = serializer.validated_data["dish_name"]
        user = request.user

        dietary_preference = getattr(user, "dietary_preference", "none")
        health_conditions = getattr(user, "health_conditions", None)

        # The credit is consumed up front, under lock, so parallel requests cannot all
        # clear the same remaining balance. It is refunded below if generation fails.
        reservation = reserve_ai_generation_credit(user, AIFeatureType.COOKING_GUIDE)

        try:
            result, is_mock = cooking_assistant_service.generate_cooking_guide(
                dish_name=dish_name,
                dietary_preference=dietary_preference,
                health_conditions=health_conditions,
            )
        except Exception as e:
            release_ai_generation_credit(reservation)
            logger.error(f"Failed to generate cooking guide for '{dish_name}': {e}")
            raise exceptions.CustomException(
                message="Failed to generate cooking guide. Please try again later.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info(
            f"Generated cooking guide for '{dish_name}' "
            f"(user={user.id}, mock={is_mock})"
        )
        finalize_ai_generation_usage(reservation, metadata={"dish_name": dish_name})

        return response.Response(
            data={
                "message": "Cooking guide generated successfully",
                "is_mock": is_mock,
                "data": result,
            },
            status=status.HTTP_200_OK,
        )
