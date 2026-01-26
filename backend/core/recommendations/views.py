from rest_framework import status, views, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from loguru import logger

from core.recommendations.models import WeeklyRecommendation
from core.recommendations.serializers import WeeklyRecommendationSerializer
from core.utils.exceptions import exceptions
from core.utils.mixins import PaginationMixin
from core.utils.permissions import IsObjectOwner


class ListRecommendation(PaginationMixin, views.APIView):
    http_method_names = ["get"]

    def get(self, request):
        queryset = WeeklyRecommendation.objects.filter(
            owner=request.user
        ).order_by("-week_start_date")
        paginated_queryset = self.paginate_queryset(queryset)
        if paginated_queryset is not None:
            serializer = serializer = WeeklyRecommendationSerializer.RecommendationList(
                paginated_queryset, many=True
            )
            logger.info("retrieved paginated recommendations list for user")
            return self.get_paginated_response(serializer.data)
        
        serializer = serializer = WeeklyRecommendationSerializer.RecommendationList(
            queryset, many=True
        )
        logger.info("retrieved unpaginated recommendations list for user")
        return response.Response(data=serializer.data, status=status.HTTP_200_OK)
 

class RetrieveRecommendation(views.APIView):
    http_method_names = ["get"]
    permission_classes = [IsAuthenticated, IsObjectOwner]

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


class ReadRecommendation(views.APIView):
    permission_classes = [IsAuthenticated, IsObjectOwner]

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