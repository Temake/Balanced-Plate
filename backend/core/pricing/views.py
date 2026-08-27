from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import response, status, views

from .models import PriceArea
from .serializers import (
    BudgetTierSerializer,
    LocateRequestSerializer,
    LocateResponseSerializer,
    PriceAreaSerializer,
)
from .services import (
    find_nearest_price_area,
    get_budget_tiers,
    get_default_area,
    resolve_area,
)


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
        user = request.user if request.user.is_authenticated else None
        area = resolve_area(user=user)
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


@extend_schema(tags=["Pricing"])
class LocatePriceAreaView(views.APIView):
    http_method_names = ["post"]

    @extend_schema(
        description="Locate nearest PriceArea using GPS coordinates (lat, lon) or explicit area_id.",
        request=LocateRequestSerializer,
        responses={200: LocateResponseSerializer},
    )
    def post(self, request):
        serializer = LocateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        area_id = data.get("area_id")
        lat = data.get("latitude")
        lon = data.get("longitude")

        if area_id:
            try:
                area = PriceArea.objects.get(id=area_id, is_active=True)
                distance_km = None
                is_outside_nigeria = False
            except PriceArea.DoesNotExist:
                return response.Response(
                    {"detail": "Price area not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            area, distance_km, is_outside_nigeria = find_nearest_price_area(lat, lon)

        if request.user.is_authenticated and area:
            request.user.price_area = area
            request.user.save(update_fields=["price_area"])

        return response.Response(
            data={
                "price_area": PriceAreaSerializer(area).data if area else None,
                "distance_km": distance_km,
                "is_outside_nigeria": is_outside_nigeria,
            },
            status=status.HTTP_200_OK,
        )

