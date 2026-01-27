from rest_framework import status, views, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from loguru import logger
from drf_spectacular.utils import extend_schema

from core.recommendations.models import WeeklyRecommendation
from core.recommendations.serializers import WeeklyRecommendationSerializer
from core.utils.exceptions import exceptions
from core.utils.mixins import PaginationMixin
from core.utils.permissions import IsObjectOwner


@extend_schema(tags=["Recommendations"])
class ListRecommendation(PaginationMixin, views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="List all weekly recommendations for the authenticated user",
        responses={200: WeeklyRecommendationSerializer.RecommendationList(many=True)}
    )
    def get(self, request):
        queryset = WeeklyRecommendation.objects.filter(
            owner=request.user
        ).order_by("-week_start_date")
        paginated_queryset = self.paginate_queryset(queryset)
        if paginated_queryset is not None:
            serializer = WeeklyRecommendationSerializer.RecommendationList(
                paginated_queryset, many=True
            )
            logger.info("retrieved paginated recommendations list for user")
            return self.get_paginated_response(serializer.data)
        
        serializer = WeeklyRecommendationSerializer.RecommendationList(
            queryset, many=True
        )
        logger.info("retrieved unpaginated recommendations list for user")
        return response.Response(data=serializer.data, status=status.HTTP_200_OK)
 

@extend_schema(tags=["Recommendations"])
class RetrieveRecommendation(views.APIView):
    http_method_names = ["get"]
    permission_classes = [IsAuthenticated, IsObjectOwner]

    @extend_schema(
        description="Retrieve a specific weekly recommendation by ID",
        responses={200: WeeklyRecommendationSerializer.RecommendationDetails}
    )
    def get(self, request, pk):
        try:
            recommendation = WeeklyRecommendation.objects.get(id=pk)
            self.check_object_permissions(request, recommendation)
    
            mark_read = request.query_params.get("mark_read", None)
            if mark_read and not recommendation.is_read:
                recommendation.mark_as_read()

            serializer = WeeklyRecommendationSerializer.RecommendationDetails(recommendation)
            return response.Response(serializer.data)
        except WeeklyRecommendation.DoesNotExist:
            raise exceptions.CustomException(
                message="Recommendation not found",
                status_code=status.HTTP_404_NOT_FOUND
            )


@extend_schema(tags=["Recommendations"])
class ReadRecommendation(views.APIView):
    permission_classes = [IsAuthenticated, IsObjectOwner]

    @extend_schema(
        description="Mark a recommendation as read",
        request=None,
        responses={200: None}
    )
    def post(self, request, pk):
        try:
            recommendation = WeeklyRecommendation.objects.get(id=pk)
            self.check_object_permissions(request, recommendation)
    
            if  recommendation.is_read:
                return response.Response(status=status.HTTP_200_OK)
            
            recommendation.mark_as_read()
            return response.Response(status=status.HTTP_200_OK)
        except WeeklyRecommendation.DoesNotExist:
            raise exceptions.CustomException(
                message="Recommendation not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

# @extend_schema(tags=["Recommendations"])
# class WeeklyRecommendationTriggerView(views.APIView):
#     """
#     POST: Manually trigger recommendation generation for the user.
    
#     This is useful for testing or allowing users to request
#     a new recommendation on-demand.
    
#     Query Parameters:
#         - force: If "true", regenerate even if one exists (default: false)
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         from core.recommendations.tasks import generate_weekly_recommendation_for_user
        
#         force = request.query_params.get("force", "false").lower() == "true"
        
#         today = timezone.localdate()
#         days_since_monday = today.weekday()
        
#         # Calculate previous week (Monday to Sunday)
#         if days_since_monday == 0:
#             # Today is Monday, use last week
#             end_date = today - timedelta(days=1)
#         else:
#             end_date = today - timedelta(days=days_since_monday + 1)
#         start_date = end_date - timedelta(days=6)

#         # Check if recommendation already exists
#         existing = WeeklyRecommendation.objects.filter(
#             owner=request.user,
#             week_start_date=start_date,
#         ).first()

#         if existing and not force:
#             if existing.status == "completed":
#                 return Response({
#                     "message": "Recommendation already exists for this week",
#                     "recommendation_id": existing.id,
#                     "status": existing.status,
#                 })
#             elif existing.status == "processing":
#                 return Response({
#                     "message": "Recommendation is currently being generated",
#                     "recommendation_id": existing.id,
#                     "status": existing.status,
#                 })

#         # Delete existing if force regeneration
#         if existing and force:
#             existing.delete()

#         # Trigger async task
#         task = generate_weekly_recommendation_for_user.delay(request.user.id)

#         return Response({
#             "message": "Recommendation generation started",
#             "task_id": task.id,
#             "week_start": start_date.isoformat(),
#             "week_end": end_date.isoformat(),
#         }, status=status.HTTP_202_ACCEPTED)