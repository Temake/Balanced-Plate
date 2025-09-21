# Create your views here.
import mimetypes
import threading

from drf_spectacular.utils import extend_schema
from loguru import logger
from rest_framework import exceptions, response, status, views
from rest_framework.parsers import MultiPartParser

from core.utils import enums
from core.utils.helpers.decorators import RequestDataManipulationsDecorators
from core.utils.mixins import PaginationMixin

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
        file = serializer.save()
        serializer = serializers.FileSerializer.ListRetrieve(instance=file)
        return response.Response(data=serializer.data, status=status.HTTP_201_CREATED)


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
