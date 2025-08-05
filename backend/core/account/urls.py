from django.urls import path
from .views import (
    UserListCreate,
    Login,
)

urlpatterns = [
    path("accounts/", UserListCreate.as_view(), name="create-account"),
    path("auth/login/", Login.as_view(), name="login"),
]