from loguru import logger
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.contrib.auth.hashers import make_password

from rest_framework import status, response, views
from rest_framework.decorators import (
    api_view, 
    permission_classes, 
    parser_classes, 
    renderer_classes, 
    authentication_classes
)
from rest_framework.generics import UpdateAPIView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated

from core.account.models import Account, UserSession
from core.account.serializers import (
    UserSerializer, 
    TokenSerializer,
    AuthSerializer,
    PasswordResetSerializer
)
from core.utils import exceptions
from core.utils.permissions import IsGuestUser, IsOTPVerified
from core.utils.helpers import email as email_client, authenticators


@extend_schema(tags=["Account"])
class CreateUser(views.APIView):
    http_method_names = ['post']
    permission_classes = [IsGuestUser, ]

    @extend_schema(
        auth=[],
        description="endpoint for user creation",
        request=UserSerializer.Create,
        responses={201: AuthSerializer.AccountRetrieve},
    )
    def post(self, request):
        serializer = UserSerializer.Create(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        logger.info(f"created user with email {account.email}")

        auth_token = account.retrieve_auth_token()

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
        response_data = {"user": serializer.data,  "token": auth_token}
        return response.Response(response_data, status=status.HTTP_201_CREATED)
    

@extend_schema(tags=["Account"])
class RetrieveUpdateUser(views.APIView):
    http_method_names = ["get", "patch"]


    @extend_schema(
        description="endpoint for retrieving details of the authenticated user",
        request=None,
        responses={200: UserSerializer.Retrieve},
    )
    def get(self, request):
        serializer = UserSerializer.Retrieve(request.user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


    @extend_schema(
        description="endpoint for updating details of the authenticated user",
        request=UserSerializer.Update, 
        responses={200: UserSerializer.Retrieve},
    )
    def patch(self, request):
        serializer = UserSerializer.Update(
            instance=request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        serializer = UserSerializer.Retrieve(instance=account)
        response_data = {"message": "details successfully updated", "data": serializer.data}
        return response.Response(data=response_data, status=status.HTTP_200_OK)
    

@extend_schema(tags=["Auth"])
class Login(views.APIView):
    http_method_names = ['post']
    permission_classes = [IsGuestUser, ]


    @extend_schema(
        auth=[],
        description="endpoint for user login",
        request=AuthSerializer.Login,
        responses={200: AuthSerializer.AccountRetrieve},
    )
    def post(self, request):
        serializer = AuthSerializer.Login(data=request.data)
        serializer.is_valid(raise_exception=True)
        email=serializer.validated_data["email"]
        password=serializer.validated_data["password"]
        account = authenticate(request, email=email, password=password)

        if not account:
            logger.error("Authentication failed")
            raise exceptions.CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid credentials"
            )

        auth_token = account.retrieve_auth_token()

        logger.info("CREATING NEW SESSION")
        UserSession.objects.create(
            user=account,
            refresh=auth_token["refresh"],
            access=auth_token["access"],
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT"),
            is_active=True,
        )
        logger.info(f"User {account.email} logged in successfully")

        serializer = UserSerializer.Retrieve(instance=account)
        response_data = {"user": serializer.data,  "token": auth_token}
       
        return response.Response(response_data, status=status.HTTP_200_OK)
    

@extend_schema(tags=["Auth"])
class Logout(views.APIView):
    http_method_names = ['post']
    permission_classes = [IsAuthenticated, ]


    @extend_schema(
        description="endpoint for user logout",
        request=AuthSerializer.Logout,
        responses={200: None},
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            UserSession.objects.get(refresh=refresh_token).delete()
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # Ignore if token has already expired
        except UserSession.DoesNotExist:
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="user does not have an active session"
            )
        else:
            logger.info(f"User {request.user.email} logged out successfully")
            return response.Response(status=status.HTTP_205_RESET_CONTENT)
        

@extend_schema(tags=["Auth"])
class TokenRefresh(views.APIView):
    http_method_names = ['post']
    permission_classes = [IsGuestUser, ]


    @extend_schema(
        auth=[],
        description="endpoint for refreshing user access token after it expires",
        request=AuthSerializer.TokenRefresh,
        responses={200: TokenSerializer}
    )
    def post(self, request):
        serializer = AuthSerializer.TokenRefresh(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data["refresh"]
        try:
            session = UserSession.objects.get(refresh=refresh_token)
            RefreshToken(refresh_token).blacklist()

            token = session.user.retrieve_auth_token()
            session.access = token["access"]
            session.refresh = token["refresh"]
            session.save()
            return response.Response(status=status.HTTP_200_OK, data=token)

        except TokenError as err:
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message=str(err),
                errors=["refresh token error"],
            )
        except UserSession.DoesNotExist:
            raise exceptions.CustomException(
                message="Session not found.",
            )
        

@extend_schema(
    tags=["Auth"],
    auth=[],
    methods=["POST"],
    description="endpoint for verifying user email before sending otp",
    request=PasswordResetSerializer.VerifyEmail,
    responses={200: None},
)
@api_view(["POST", ])
@permission_classes([IsGuestUser, ])
def verify_email(request):
    serializer = PasswordResetSerializer.VerifyEmail(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    try:
        user = Account.objects.get(email=email)
        otp = authenticators.generate_otp(email)
        client = email_client.PasswordResetEmail(user, otp)
        client.send_mail()
        return response.Response(
            data={"message": "otp sent to your email"}, status=status.HTTP_200_OK 
        )
    except Account.DoesNotExist:
        raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="invalid credentials"
            )


@extend_schema(
    tags=["Auth"],
    auth=[],
    methods=["POST"],
    parameters=[
        OpenApiParameter(
            name="email",
            type=str,
            location=OpenApiParameter.QUERY,
            description="email of the user to verify otp for",
            required=True,
        ),
    ],
    description="endpoint that verifies if the inputed otp is the same as the generated otp",
    request=PasswordResetSerializer.VerifyOTP,
    responses={200: None},
)
@api_view(["POST", ])
@permission_classes([IsGuestUser, ])
def verify_otp(request):
    serializer = PasswordResetSerializer.VerifyOTP(data=request.data)
    serializer.is_valid(raise_exception=True)
    otp = serializer.validated_data["otp"]
    email = request.query_params.get("email")
    try:
        user = Account.objects.get(email=email)
        cached_otp = cache.get(f"{email}_otp")
        if cached_otp and cached_otp == otp:
            cache.delete(f"{email}_otp")
            cache.set(f"{email}_otp_verified", True, 300)
            return response.Response(
                data={"message": "otp verified"}, status=status.HTTP_200_OK
            )
        else:
            raise exceptions.CustomException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="invalid otp"
                )
    except Account.DoesNotExist:
        raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="invalid credentials"
            )
    

@extend_schema(tags=["Account"])
class ChangePassword(UpdateAPIView):
    authentication_classes = ([])
    permission_classes = ([IsOTPVerified, ])
    serializer_class = PasswordResetSerializer.ResetPassword
    model = Account

    def get_object(self, queryset=None): 
        email = self.request.query_params.get('email')
        if not email:
            raise exceptions.CustomException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="please add user's email"
                )
        else:
            try:
                obj = Account.objects.get(email=email)
                return obj 
            except Account.DoesNotExist:
                raise exceptions.CustomException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="invalid credentials"
            )

    @extend_schema(
        auth=[],
        parameters=[
            OpenApiParameter(
                name="email",
                type=str,
                location=OpenApiParameter.QUERY,
                description="email of the user resetting password",
                required=True,
            ),
        ],
        description="endpoint that verifies if the inputed otp is the same as the generated otp",
        request=serializer_class,
        responses={200: None},
    )
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['password']
        confirm_password = serializer.validated_data['confirm_password']

        if confirm_password != new_password:
            raise exceptions.CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="passwords do not match"
            )
        
        user.password = make_password(new_password)
        user.save()
        return response.Response({
            'message': 'password changed successfully!'}, 
            status=status.HTTP_200_OK
        )