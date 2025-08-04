from django.urls import path
from .views import (
    CreateUser
)

urlpatterns = [
    path("accounts/", CreateUser.as_view(), name="create-account"),
]