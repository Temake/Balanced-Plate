# Create your views here.
import mimetypes
import threading

from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import response, status, views
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated

from core.utils import enums
from core.utils.helpers.decorators import RequestDataManipulationsDecorators
from core.utils.mixins import PaginationMixin
from core.utils.exceptions import exceptions
from core.utils.permissions import IsObjectOwner

from . import models, serializers


@extend_schema(tags=["Files"])
class ListCreateFile(PaginationMixin, views.APIView):
    http_method_names = ["get", "post"]
    parser_classes = [MultiPartParser, ]
    

    @staticmethod
    def get_file_mimetype(file):
        mime_type, *_ = mimetypes.guess_type(file.name)
        return mime_type


    @extend_schema(
        description="endpoint to upload a file",
        request=serializers.FileSerializer.CreateFile,
        responses={201: serializers.FileSerializer.ListRetrieve}
    )
    @RequestDataManipulationsDecorators.update_request_data_with_owner_data("owner")
    @RequestDataManipulationsDecorators.mutable_request_data
    def post(self, request, *args, **kwargs):
        file = request.data.get("file")
        if file:
            request.data["mime_type"] = self.get_file_mimetype(file)

        serializer = serializers.FileSerializer.CreateFile(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.save()
        logger.success(f"successfully created file with id {file_obj.id}")
        
        # Auto-trigger food analysis for food images. This is the path most users
        # actually take, so it goes through the same metered dispatch as the
        # explicit trigger endpoint rather than queueing the task directly.
        analysis_id = None
        analysis_error = None
        if file_obj.purpose == enums.FilePurposeType.FOOD_IMAGE.value:
            try:
                from core.results.dispatch import (
                    AnalysisAlreadyExists,
                    AnalysisAlreadyRunning,
                    dispatch_food_analysis,
                )

                try:
                    analysis = dispatch_food_analysis(file_obj.owner, file_obj)
                except (AnalysisAlreadyExists, AnalysisAlreadyRunning) as already:
                    # Nothing to do and nothing to charge; point the client at the
                    # analysis that is already there.
                    analysis = already.analysis
                analysis_id = analysis.id
                logger.info(
                    f"Auto-triggered food analysis for file {file_obj.id}, "
                    f"analysis_id={analysis_id}"
                )
            except exceptions.CustomException as quota_err:
                # Out of daily allowance. The upload itself succeeded, so report the
                # reason instead of failing the request — the client shows it and
                # offers the upgrade.
                analysis_error = quota_err.message
                logger.info(
                    f"Analysis not started for file {file_obj.id}: {quota_err.message}"
                )
            except Exception as e:
                logger.error(f"Failed to dispatch analysis task for file {file_obj.id}: {e}")
                analysis_error = (
                    "We couldn't start the analysis for this photo. Please try again."
                )

        serializer = serializers.FileSerializer.ListRetrieve(instance=file_obj)
        response_data = serializer.data

        # Include analysis_id in response if analysis was triggered
        if analysis_id:
            response_data["analysis_id"] = analysis_id
        if analysis_error:
            response_data["analysis_error"] = analysis_error

        return response.Response(data=response_data, status=status.HTTP_201_CREATED)


    @extend_schema(
        description="List all food image files uploaded by a user",
        request=None,
        responses={202: serializers.FileSerializer.ListRetrieve}
    )
    def get(self, request, *args, **kwargs):
        images = models.FileModel.objects.filter(owner=request.user, purpose=enums.FilePurposeType.FOOD_IMAGE.value)
        paginated_queryset = self.paginate_queryset(images)
        if paginated_queryset is not None:
            serializer = serializers.FileSerializer.ListRetrieve(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = serializers.FileSerializer.ListRetrieve(images, many=True)
        logger.info("Pagination class not set, returning unpaginated queryset!")
        return response.Response(data=serializer.data, status=status.HTTP_200_OK)
    

@extend_schema(tags=["Files"])
class RetrieveFile(views.APIView):
    http_method_names = ["get", ]
    permission_classes = [IsAuthenticated, IsObjectOwner]


    @extend_schema(
        description="endpoint for retrieving a specific file",
        request=None,
        responses={200: serializers.FileSerializer.ListRetrieve},
    )
    def get(self, request, pk):
        try: 
            file = models.FileModel.objects.get(id=pk) 
            self.check_object_permissions(request, file)       
            serializer = serializers.FileSerializer.ListRetrieve(instance=file)
            logger.info(f"Retrieved file with ID: {pk}")
            return response.Response(data=serializer.data, status=status.HTTP_200_OK)
        except models.FileModel.DoesNotExist:
            raise exceptions.CustomException(
                message="File not found", 
                status_code=status.HTTP_404_NOT_FOUND
            )
