# Create your views here.
import mimetypes
import threading

from drf_spectacular.utils import extend_schema
from rest_framework import exceptions, response, status, views
from rest_framework.parsers import MultiPartParser

from core.utils import enums
from core.utils.helpers.decorators import RequestDataManipulationsDecorators

from . import models, serializers


@extend_schema(tags=["Files"])
class ListCreateFile(views.APIView):
    http_method_names = ["get", "post"]
    parser_classes = [MultiPartParser, ]
    

    @staticmethod
    def get_file_mimetype(file):
        mime_type, *_ = mimetypes.guess_type(file.name)
        return mime_type


    @extend_schema(
        description="endpoint to upload a file",
        request=serializers.FileSerializer.Create,
        responses={202: None}
    )
    @RequestDataManipulationsDecorators.update_request_data_with_owner_data("owner")
    @RequestDataManipulationsDecorators.mutable_request_data
    def post(self, request, *args, **kwargs):
        file = request.data.get("file")
        if file:
            request.data["mime_type"] = self.get_file_mimetype(file)

        # TODO: call background file upload task
        response_data= {
            "status": "Uploading",
            "message": "file upload in progress"
        }
        response.Response(data=response_data, status=status.HTTP_202_ACCEPTED)


    @extend_schema(
        description="List all food image files uploaded by a user",
        request=None,
        responses={202: serializers.FileSerializer.ListRetrieve}
    )
    def get(self, request, *args, **kwargs):
        images = models.FileModel.objects.filter(owner=request.user, purpose=enums.FilePurposeType.FOOD_IMAGE.value)
        serializer = serializers.FileSerializer.ListRetrieve(images, many=True)
        response.Response(data=serializer.data, status=status.HTTP_200_OK)
