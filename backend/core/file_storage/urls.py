from django.urls import path
from .views import (
    ListCreateFile,
)

urlpatterns = [
    path("files/", ListCreateFile.as_view(), name="file-list-create"),
    
]