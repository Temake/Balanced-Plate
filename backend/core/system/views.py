from django.conf import settings
from django.db import connections
from django.http import JsonResponse
from django.db.utils import OperationalError
from django.utils import timezone
from django_redis import get_redis_connection
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from rest_framework import views, status, response
from loguru import logger
from core.utils import permissions


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