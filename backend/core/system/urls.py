from django.urls import path
from . import views

urlpatterns = [
    path("", views.root, name="system"),
    path("health/", views.HealthCheckView.as_view(), name="health"),
    path("feedback/", views.FeedbackCreateView.as_view(), name="feedback"),
    path("api/feedback/", views.FeedbackCreateView.as_view(), name="api_feedback"),
]