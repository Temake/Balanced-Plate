from django.urls import path

from .views import ListBudgetTiers, ListPriceAreas, LocatePriceAreaView


urlpatterns = [
    path("budget-tiers/", ListBudgetTiers.as_view(), name="list-budget-tiers"),
    path("areas/", ListPriceAreas.as_view(), name="list-price-areas"),
    path("locate/", LocatePriceAreaView.as_view(), name="locate-price-area"),
]

