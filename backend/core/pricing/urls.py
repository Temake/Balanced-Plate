from django.urls import path

from .views import ListBudgetTiers, ListPriceAreas


urlpatterns = [
    path("budget-tiers/", ListBudgetTiers.as_view(), name="list-budget-tiers"),
    path("areas/", ListPriceAreas.as_view(), name="list-price-areas"),
]
