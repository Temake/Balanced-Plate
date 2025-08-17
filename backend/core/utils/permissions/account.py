from django.core.cache import cache
from rest_framework.permissions import BasePermission
from core.utils import enums


class IsGuestUser(BasePermission):
    """
    Allows access only to non-authenticated accounts.
    """

    message: str

    def has_permission(self, request, view):
        self.message = "You are already logged in"
        return not request.user.is_authenticated
    

class IsOTPVerified(BasePermission):
    message  = "Permissio Denied. Try again"


    def has_permission(self, request, view):
        email = request.query_params.get("email")
        return cache.get(f"{email}_otp_verified")