from django.urls import path
from .views import (
    CreateUser,
    RetrieveUpdateUser,
    CompleteOnboarding,
    Login,
    Logout,
    TokenRefresh,
    InitiatePasswordReset,
    FinalizePasswordReset,
    FinalizeEmailVerification,
    ResendSignupOtp,
    ChangePassword
)

urlpatterns = [
    path("accounts/", CreateUser.as_view(), name="account-list-create"),
    path("accounts/me/", RetrieveUpdateUser.as_view(), name="retrieve-update-user"),
    path("accounts/me/complete-onboarding/", CompleteOnboarding.as_view(), name="complete-onboarding"),
    path("accounts/password/reset/", ChangePassword.as_view(), name="change-password"),
    path("auth/login/", Login.as_view(), name="login"),
    path("auth/logout/", Logout.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefresh.as_view(), name="token-refresh"),
    path("auth/email/verify/finalize/", FinalizeEmailVerification.as_view(), name="finalize-email-verification"),
    path("auth/password/reset/initiate/", InitiatePasswordReset.as_view(), name="initiate-password-reset"),
    path("auth/password/reset/finalize/", FinalizePasswordReset.as_view(), name="finalize-password-reset"),
    path("auth/email/verify/", InitiatePasswordReset.as_view(), name="verify-email"),
    path("auth/otp/verify/", FinalizePasswordReset.as_view(), name="verify-otp"),
    path("auth/signup/verify-otp/", FinalizeEmailVerification.as_view(), name="signup-verify-otp"),
    path("auth/signup/resend-otp/", ResendSignupOtp.as_view(), name="signup-resend-otp"),
]
