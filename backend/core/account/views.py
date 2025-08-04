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


class UserListCreate(views.APIView):
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
        logger.info(f"created user with email {account.email}")

        auth_token = account.retrieve_auth_token()
        logger.info(f"\n\nUser Auth\n{auth_token}")

        logger.info("CREATING SESSION FOR THE NEW USER")
        UserSession.objects.create(
            user=account,
            refresh=auth_token["refresh"],
            access=auth_token["access"],
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT"),
            is_active=True,
        )

        serializer = UserSerializer.Retrieve(instance=account)
        response_data = {"user": serializer.data, "token": auth_token}
        return response.Response(response_data, status=status.HTTP_201_CREATED)