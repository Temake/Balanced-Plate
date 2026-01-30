from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.analytics.views import (
    NutritionAnalyticsViewSet,
    MicronutrientsAnalyticsView,
    MealTimingAnalyticsView,
)

router = DefaultRouter()
router.register(r"analytics/nutrition", NutritionAnalyticsViewSet, basename="analytics-nutrition")


urlpatterns = [
    path("", include(router.urls)),
    path("analytics/micronutrients/", MicronutrientsAnalyticsView.as_view(), name="analytics-micronutrients"),
    path("analytics/meal-timing/", MealTimingAnalyticsView.as_view(), name="analytics-meal-timing"),
]
