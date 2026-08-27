from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import response, status, views

from .models import PriceArea
from .serializers import BudgetTierSerializer, PriceAreaSerializer
from .services import get_budget_tiers, get_default_area


@extend_schema(tags=["Pricing"])
class ListBudgetTiers(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description=(
            "Budget presets with the naira figure each one works out to. Pass "
            "household_size so the weekly total reflects how many people are being fed."
        ),
        parameters=[
            OpenApiParameter(
                name="household_size",
                type=int,
                required=False,
                description="Defaults to 1.",
            )
        ],
        responses={200: BudgetTierSerializer(many=True)},
    )
    def get(self, request):
        try:
            household_size = max(int(request.query_params.get("household_size", 1)), 1)
        except (TypeError, ValueError):
            household_size = 1

        serializer = BudgetTierSerializer(
            get_budget_tiers(),
            many=True,
            context={"household_size": household_size},
        )
        area = get_default_area()
        return response.Response(
            data={
                "tiers": serializer.data,
                "household_size": household_size,
                "price_area": PriceAreaSerializer(area).data if area else None,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Pricing"])
class ListPriceAreas(views.APIView):
    http_method_names = ["get"]

    @extend_schema(
        description="Cities we currently hold prices for.",
        responses={200: PriceAreaSerializer(many=True)},
    )
    def get(self, request):
        areas = PriceArea.objects.filter(is_active=True).order_by("name")
        return response.Response(
            data=PriceAreaSerializer(areas, many=True).data,
            status=status.HTTP_200_OK,
        )
