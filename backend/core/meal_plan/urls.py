from django.urls import path

from . import views


urlpatterns = [
    path("meal-plans/", views.ListMealPlans.as_view(), name="list-meal-plans"),
    path("meal-plans/create/", views.CreateMealPlan.as_view(), name="create-meal-plan"),
    path("meal-plans/generate/", views.GenerateAIMealPlan.as_view(), name="generate-ai-meal-plan"),
    path("meal-plans/<int:pk>/", views.RetrieveMealPlan.as_view(), name="retrieve-meal-plan"),
    path("meal-plans/<int:pk>/delete/", views.DeleteMealPlan.as_view(), name="delete-meal-plan"),
]
