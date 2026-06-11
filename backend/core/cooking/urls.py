from django.urls import path
from . import views

urlpatterns = [
    path("cooking/generate/", views.GenerateCookingGuide.as_view(), name="generate-cooking-guide"),
]
