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
        
        # Auto-trigger food analysis for food images
        analysis_id = None
        if file_obj.purpose == enums.FilePurposeType.FOOD_IMAGE.value:
            from core.results.tasks import analyze_food_image_task
            from core.results.models import FoodAnalysis
            
            # Create the analysis record first
            analysis = FoodAnalysis.objects.create(
                owner=file_obj.owner,
                food_image=file_obj,
            )
            analysis_id = analysis.id
            
            # Trigger async analysis task
            analyze_food_image_task.delay(str(file_obj.id), use_mock=False)
            logger.info(f"Auto-triggered food analysis for file {file_obj.id}")
        
        serializer = serializers.FileSerializer.ListRetrieve(instance=file_obj)
        response_data = serializer.data
        
        # Include analysis_id in response if analysis was triggered
        if analysis_id:
            response_data["analysis_id"] = analysis_id
            
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
