from django.urls import path

from . import views


urlpatterns = [
    path("results/", views.ListAnalysis.as_view(), name="list-analyses"),
    path("results/<int:pk>/", views.RetrieveAnalysis.as_view(), name="retrieve-analysis"),
    path("results/analyze/", views.TriggerAnalysis.as_view(), name="trigger-analysis"),
]
