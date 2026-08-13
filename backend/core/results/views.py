from django.conf import settings
from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import response, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from datetime import datetime

from .dispatch import (
    AnalysisAlreadyExists,
    AnalysisAlreadyRunning,
    dispatch_food_analysis,
)
from core.utils.mixins import PaginationMixin
from core.utils.exceptions import exceptions
from core.utils.permissions import IsObjectOwner
from core.file_storage.models import FileModel
from core.utils.enums import FilePurposeType

from .models import FoodAnalysis
from .serializers import FoodAnalysisSerializer, AnalyzeRequestSerializer


@extend_schema(tags=["Food Analysis"])
class ListAnalysis(PaginationMixin, views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="List all food analyses for the authenticated user",
        request=None,
        responses={200: FoodAnalysisSerializer.List(many=True)}
    )
    def get(self, request, *args, **kwargs):
        analyses = FoodAnalysis.objects.filter(owner=request.user).order_by('-date_added')
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                analyses = analyses.filter(date_added__date__gte=start)
            except ValueError:
                pass
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                analyses = analyses.filter(date_added__date__lte=end)
            except ValueError:
                pass
        
        paginated_queryset = self.paginate_queryset(analyses)
        if paginated_queryset is not None:
            serializer = FoodAnalysisSerializer.List(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = FoodAnalysisSerializer.List(analyses, many=True)
        return response.Response(data=serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Food Analysis"])
class RetrieveAnalysis(views.APIView):
    http_method_names = ["get"]
    permission_classes = [IsAuthenticated, IsObjectOwner]

    @extend_schema(
        description="Retrieve a specific food analysis by ID",
        request=None,
        responses={200: FoodAnalysisSerializer.Detail}
    )
    def get(self, request, pk):
        try:
            analysis = FoodAnalysis.objects.get(id=pk)
            self.check_object_permissions(request, analysis)
            serializer = FoodAnalysisSerializer.Detail(instance=analysis)
            return response.Response(data=serializer.data, status=status.HTTP_200_OK)
        except FoodAnalysis.DoesNotExist:
            raise exceptions.CustomException(
                message="Analysis not found",
                status_code=status.HTTP_404_NOT_FOUND
            )


@extend_schema(tags=["Food Analysis"])
class TriggerAnalysis(views.APIView):
    http_method_names = ["post"]
    # Each analysis is a paid vision call, so it gets its own ceiling rather than
    # sharing the 120/minute default with read-only endpoints.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "food_analysis"

    @extend_schema(
        description="Trigger food analysis for an uploaded image. The analysis runs asynchronously.",
        request=AnalyzeRequestSerializer,
        responses={
            202: {"type": "object", "properties": {
                "message": {"type": "string"},
                "analysis_id": {"type": "integer"}
            }}
        }
    )
    def post(self, request):
        serializer = AnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file_id = serializer.validated_data["file_id"]
        # `use_mock` arrives from the client, so it is only honoured where mock AI
        # is explicitly enabled. In production it is always False.
        use_mock = bool(
            serializer.validated_data.get("use_mock", False)
        ) and settings.ALLOW_MOCK_AI

        try:
            file_obj = FileModel.objects.get(id=file_id, owner=request.user)
        except FileModel.DoesNotExist:
            raise exceptions.CustomException(
                message="File not found or does not belong to you",
                status_code=status.HTTP_404_NOT_FOUND
            )

        if file_obj.purpose != FilePurposeType.FOOD_IMAGE.value:
            raise exceptions.CustomException(
                message="File is not a food image",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if file_obj.currently_under_processing:
            raise exceptions.CustomException(
                message="This file is already being processed",
                status_code=status.HTTP_409_CONFLICT
            )

        # The duplicate checks, the allowance reservation and the dispatch all live
        # in `dispatch_food_analysis`, shared with the upload endpoint — metering
        # only one of the two callers would leave the other as a free path to a
        # paid vision call.
        try:
            analysis = dispatch_food_analysis(request.user, file_obj, use_mock=use_mock)
        except AnalysisAlreadyExists as already:
            serializer = FoodAnalysisSerializer.Detail(instance=already.analysis)
            return response.Response(
                data={"message": "Analysis already exists", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except AnalysisAlreadyRunning:
            raise exceptions.CustomException(
                message="This image is already being analysed",
                status_code=status.HTTP_409_CONFLICT
            )

        logger.info(f"Triggered analysis for file {file_id}")

        return response.Response(
            data={"message": "Analysis started", "analysis_id": analysis.id},
            status=status.HTTP_202_ACCEPTED
        )
