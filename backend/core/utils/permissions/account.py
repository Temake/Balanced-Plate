from rest_framework.permissions import BasePermission
from core.utils import enums
from core.utils.helpers import authenticators


class IsGuestUser(BasePermission):
    """
    Allows access only to non-authenticated accounts.
    """

    message: str

    def has_permission(self, request, view):
        self.message = "You are already logged in"
        return not request.user.is_authenticated
    

class IsOTPVerified(BasePermission):
    message  = "Permission Denied. Try again"


    def has_permission(self, request, view):
        email = request.query_params.get("email")
        if not email:
            return False
        return authenticators.OTPHelpers.is_otp_verified(
            email,
            authenticators.OTP_PURPOSE_PASSWORD_RESET,
        )