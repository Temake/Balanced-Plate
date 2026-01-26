from django.urls import path

from . import views


urlpatterns = [
    path("recommendations/", views.ListRecommendation.as_view(), name="list-recommendation"),
    path("recommendations/<int:pk>/", views.RetrieveRecommendation.as_view(), name="retrieve-recommendation"),
    path("recommendation/<int:pk>/read/", views.ReadRecommendation.as_view(), name="read-recommendation"),
]