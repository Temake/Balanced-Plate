from django.conf import settings
from django.db import connections
from django.http import JsonResponse
from django.db.utils import OperationalError
from django.utils import timezone
from django_redis import get_redis_connection
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from rest_framework import views, status, response, generics, permissions as drf_permissions
from loguru import logger
from core.utils import permissions
from . import models, serializers



def root(request):
    return JsonResponse(
        {
            "message": "Welcome to NutriLens AI Your AI-powered nutrition companion",
            "status": "ok",
        }
    )


@extend_schema(
    summary="Health Check",
    description="Checks the status of API, database, and Redis connections.",
    auth=[],
    responses={
        200: OpenApiResponse(
            response={
                "status": "ok",
                "timestamp": "2025-10-28T09:00:00Z",
                "data": {"database": "ok", "redis": "ok"},
            },
            description="All systems operational",
            examples=[
                OpenApiExample(
                    "All Services Healthy",
                    value={
                        "status": "ok",
                        "timestamp": "2025-10-28T09:00:00Z",
                        "data": {"database": "ok", "redis": "ok"},
                    },
                ),
                OpenApiExample(
                    "Partial Outage",
                    value={
                        "status": "ok",
                        "timestamp": "2025-10-28T09:00:00Z",
                        "data": {"database": "unreachable", "redis": "ok"},
                    },
                ),
            ],
        ),
        503: OpenApiResponse(
            description="One or more services are unavailable",
            examples=[
                OpenApiExample(
                    "Service Unavailable",
                    value={
                        "status": "error",
                        "timestamp": "2025-10-28T09:00:00Z",
                        "data": {"database": "unreachable", "redis": "unreachable"},
                    },
                )
            ],
        ),
    },
)
class HealthCheckView(views.APIView):
    """
    get:
    Perform a health check for the API, Database, and Redis.

    Returns:
    - `status`: Status of the API endpoint.
    - `database`: Database connectivity status.
    - `redis`: Redis cache connection status.
    """

    permission_classes = [permissions.IsGuestUser]

    def get(self, request):
        _response = {
            "status": "ok",
            "timestamp": timezone.now().isoformat(),
            "data": {"database": "unknown", "redis": "unknown"},
        }

        try:
            db_conn = connections["default"]
            db_conn.cursor()
            _response["data"]["database"] = "ok"
        except OperationalError as db_err:
            logger.error(db_err)
            _response["data"]["database"] = "unreachable"

        # Caching service
        try:
            conn = get_redis_connection("default")
            conn.ping()
            _response["data"]["redis"] = "ok"
        except Exception as err:
            logger.error(err)
            _response["data"]["redis"] = "unreachable"

        all_ok = all(v == "ok" for v in _response["data"].values())
        _status = status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE

        return response.Response(_response, status=_status)


@extend_schema(
    summary="Submit User Feedback",
    description="Submit feedback (bug report, suggestion, feature request, general, or other) and notify the development team.",
    request=serializers.FeedbackSerializer,
    responses={201: serializers.FeedbackSerializer},
)
class FeedbackCreateView(generics.CreateAPIView):
    queryset = models.Feedback.objects.all()
    serializer_class = serializers.FeedbackSerializer
    permission_classes = [drf_permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user and self.request.user.is_authenticated else None
        feedback = serializer.save(user=user)

        # Notify via email
        recipient = getattr(settings, "FEEDBACK_RECIPIENT_EMAIL", "temedia005@gmail.com")
        category_label = feedback.get_category_display() if hasattr(feedback, "get_category_display") else feedback.category
        
        email_subject = f"[NutriLens Feedback] [{category_label}] {feedback.subject}"
        user_info = f"{feedback.name} ({feedback.email})" if feedback.name else feedback.email
        email_content = f"""
        <h3>New Feedback Received</h3>
        <p><strong>Category:</strong> {category_label}</p>
        <p><strong>Sender:</strong> {user_info}</p>
        <p><strong>Subject:</strong> {feedback.subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">{feedback.message}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">Submitted on {feedback.date_added}</p>
        """
        try:
            from core.utils.tasks.mail import send_email_to_address
            send_email_to_address.delay(
                email_address=recipient,
                subject=email_subject,
                message=email_content,
                name="NutriLens Team",
            )
        except Exception as err:
            logger.warning(f"Celery email dispatch failed, sending directly: {err}")
            try:
                from core.utils.tasks.mail import send_email_to_address
                send_email_to_address(
                    email_address=recipient,
                    subject=email_subject,
                    message=email_content,
                    name="NutriLens Team",
                )
            except Exception as direct_err:
                logger.error(f"Failed to send feedback email: {direct_err}")