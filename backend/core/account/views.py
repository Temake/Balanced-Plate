from loguru import logger
from django.conf import settings

from rest_framework import status, response, views
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

from core.account.models import Account, UserSession
from core.account.serializers import UserSerializer
from utils.permissions import IsGuestUser


class CreateUser(views.APIView):
    http_method_names = ['get', 'post']
    permission_classes = [IsGuestUser, ]
    parser_classes = [JSONParser, ]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return super().get_permissions()

    @extend_schema(
        auth=[],
        description="endpoint for user creation",
        request=UserSerializer.Create,
        responses={201: UserSerializer.Retrieve},
    )
    def post(self, request):
        serializer = UserSerializer.Create(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        serializer = UserSerializer.Retrieve(instance=account)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)