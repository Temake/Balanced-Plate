from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password
from phonenumbers import parse, is_valid_number
from phonenumbers.phonenumberutil import NumberParseException
from .models import Account, UserSession
from core.utils import enums



class BaseUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = [
            "id",
            "first_name",
            "last_name",
            "phone_number",
            "date_added",
        ]

class UserSerializer:
    class Retrieve(serializers.ModelSerializer):
        class Meta:
            model = Account
            exclude = [
                "password",
                "is_active",
                "ban_duration_in_minutes",
                "ban_expiry_date",
                "date_added",
                "date_last_modified",
                "groups",
                "user_permissions",
                "last_login",
            ]
    
    class Create(serializers.ModelSerializer):
        password2 = serializers.CharField(
            write_only=True,
            required=True,
            style={"input_type": "password"},
            help_text=_("Confirm Password"),
        )

        class Meta:
            model = Account
            fields = [
                "email",
                "first_name",
                "last_name",
                "phone_number",
                "gender",
                "dob",
                "country",
                "state",
                "city",
                "password",
                "password2",
            ]

        def validate(self, attrs):
            password = attrs.get("password")
            password2 = attrs.pop("password2", None)

            if password and password2 and password != password2:
                raise serializers.ValidationError(
                    {"password": _("Passwords do not match.")}
                )

            return attrs
        
        def validate_phone_number(self, value):
            value = ("+" + value) if not value.startswith("+") else value
            try:
                phone_number_instance = parse(value)
                if not is_valid_number(phone_number_instance):
                    message = (
                        f"Kindly provide a valid phone number, Note: Phone number must be provided in "
                        f"international format and must start with '+'"
                    )
                    raise serializers.ValidationError(message, "invalid phone number")
            except NumberParseException as err:
                message = err._msg
                raise serializers.ValidationError(message, "invalid phone number")
            return value
        
        def create(self, validated_data):
            validated_data["password"] = make_password(validated_data["password"])
            return super().create(validated_data)
        

    class Update(serializers.ModelSerializer):

        class Meta:
            model = Account
            fields = [
                "first_name",
                "last_name",
                "phone_number",
                "gender",
                "country",
                "state",
                "city",
            ]
        
        def validate_phone_number(self, value):
            value = ("+" + value) if not value.startswith("+") else value
            try:
                phone_number_instance = parse(value)
                if not is_valid_number(phone_number_instance):
                    message = (
                        f"Kindly provide a valid phone number, Note: Phone number must be provided in "
                        f"international format and must start with '+'"
                    )
                    raise serializers.ValidationError(message, "invalid phone number")
            except NumberParseException as err:
                message = err._msg
                raise serializers.ValidationError(message, "invalid phone number")
            return value
        

class TokenSerializer(serializers.Serializer):
    access = serializers.CharField(help_text=_("Access token (short-lived JWT)"))
    refresh = serializers.CharField(help_text=_("Refresh token (long-lived JWT)"))


class AuthSerializer:

    class Login(serializers.Serializer):
        email = serializers.EmailField(required=True, help_text=_("Email"))
        password = serializers.CharField(
            write_only=True, required=True, style={"input_type": "password"}, help_text=_("Password")
        )


    class AccountRetrieve(serializers.Serializer):
        user = UserSerializer.Retrieve(help_text=_("User details"))
        token = TokenSerializer(help_text=_("JWT token pair"))     

    class RegistrationResponse(serializers.Serializer):
        user = UserSerializer.Retrieve(help_text=_("User details"))
        message = serializers.CharField(help_text=_("Response message"))


    class TokenRefresh(serializers.Serializer):
        refresh = serializers.CharField(
            required=True,
            help_text=_("This is the 'refresh' key in account AccessToken"),
        )


    class Logout(serializers.Serializer):
        refresh = serializers.CharField()


class PasswordResetSerializer:
    class Initiate(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)

    class Finalize(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)
        otp = serializers.IntegerField(
            required=True,
            write_only=True,
            help_text=_("OTP sent to user's email")
        )

    class VerifyEmail(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)

    class VerifyOTP(serializers.Serializer):
        otp = serializers.IntegerField(
            required=True, 
            write_only=True, 
            help_text=_("OTP sent to user's email")
        )

    class ResetPassword(serializers.Serializer):
        password = serializers.CharField(
            write_only=True,
            required=True,
            style={"input_type": "password"},
            help_text=_("New Password")
        )
        confirm_password = serializers.CharField(
            write_only=True,
            required=True,
            style={"input_type": "password"},
            help_text=_("Confirm New Password")
        )


class SignupVerificationSerializer:
    class VerifyOTP(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)
        otp = serializers.IntegerField(
            required=True,
            write_only=True,
            help_text=_("OTP sent to user's email")
        )

    class ResendOTP(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)
        purpose = serializers.ChoiceField(
            required=True,
            choices=enums.OTPPurpose.choices(),
            help_text=_("OTP purpose: signup or password_reset"),
        )


class EmailVerificationSerializer:
    class Finalize(serializers.Serializer):
        email = serializers.EmailField(required=True, write_only=True)
        otp = serializers.IntegerField(
            required=True,
            write_only=True,
            help_text=_("OTP sent to user's email")
        )