from django.urls import path
from .views import (
    UserListCreate,
    Login,
    Logout,
    TokenRefresh
)

urlpatterns = [
    path("accounts/", UserListCreate.as_view(), name="account-list-create"),
    path("auth/login/", Login.as_view(), name="login"),
    path("auth/logout/", Logout.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefresh.as_view(), name="token-refresh"),
]