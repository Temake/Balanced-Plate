from django.urls import path
from .views import (
    UserListCreate
)

urlpatterns = [
    path("accounts/", UserListCreate.as_view(), name="create-account"),
]