from django.urls import path
from .views import (
    ListCreateFile,
    RetrieveFile,
)

urlpatterns = [
    path("files/", ListCreateFile.as_view(), name="file-list-create"),
    path("files/<str:pk>/", RetrieveFile.as_view(), name="file-retrieve"),
]