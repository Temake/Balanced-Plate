from django.urls import path
from .views import (
    CreateUser,
    RetrieveUpdateUser,
    Login,
    Logout,
    TokenRefresh,
    verify_email,
    verify_otp,
    ChangePassword
)

urlpatterns = [
    path("accounts/", CreateUser.as_view(), name="account-list-create"),
    path("accounts/me/", RetrieveUpdateUser.as_view(), name="retrieve-update-user"),
    path("accounts/password/reset/", ChangePassword.as_view(), name="change-password"),
    path("auth/login/", Login.as_view(), name="login"),
    path("auth/logout/", Logout.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefresh.as_view(), name="token-refresh"),
    path("auth/email/verify/", verify_email, name="verify-email"),
    path("auth/otp/verify/", verify_otp, name="verify otp"), 
]