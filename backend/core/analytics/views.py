from rest_framework import views, response, status, viewsets
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action

from loguru import logger

from core.analytics.serializers import (
	NutritionAnalyticsSerializer,
	MicronutrientsAnalyticsSerializer,
	HourlyCaloriesSerializer
)
from core.account.models import Account
from core.results.models import FoodAnalysis, DetectedFood
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from core.utils.helpers import analytics
from core.utils import exceptions


@extend_schema(tags=["Analytics"])
class NutritionAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Account.objects
    serializer_class = NutritionAnalyticsSerializer	

    def get_queryset(self):
        if self.action in ["food_classes", "distribution"]:
            qs = self.queryset.with_food_groups_data()
        elif self.action == "balance_score":
            qs = self.queryset.with_weekly_balance_score()
        return qs
	
    def get_serializer_class(self):
        if self.action == "food_classes":
            return NutritionAnalyticsSerializer.FoodGroupCount
        elif self.action == "distribution":
            return NutritionAnalyticsSerializer.FoodGroupPercentage
        elif self.action == "balance_score":
            return NutritionAnalyticsSerializer.DailyBalanceScore
		
        return super().get_serializer_class()


    @extend_schema(
		description="Get food group counts for the authenticated user",
		responses={200: NutritionAnalyticsSerializer.FoodGroupCount},
	)
    @action(detail=True, methods=["get"], url_path="food-group-count")
    def food_classes(self, request, pk):
        """Returns count of foods per food group."""
        if request.user.id != pk:
            logger.error("Permission Denied")
            raise exceptions.CustomException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="action not allowed"
            )
        
        user = self.get_object()
        if not user:
            logger.error(f"Not Found: User with id {pk} does not exist.")
            raise exceptions.CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                message="User not found."
            )
        
        serializer = NutritionAnalyticsSerializer.FoodGroupCount(instance=user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
		description="Get food group percentages for the authenticated user",
		responses={200: NutritionAnalyticsSerializer.FoodGroupPercentage},
	)
    @action(detail=True, methods=["get"], url_path="food-group-percentage")
    def distribution(self, request, pk):
        """Returns percentage distribution of food groups."""
        if request.user.id != pk:
            logger.error("Permission Denied")
            raise exceptions.CustomException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="action not allowed"
            )
        
        user = self.get_object()
        if not user:
            logger.error(f"Not Found: User with id {pk} does not exist.")
            raise exceptions.CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                message="User not found."
            )
        serializer = NutritionAnalyticsSerializer.FoodGroupPercentage(instance=user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
		description="Get weekly balance scores for the authenticated user",
		responses={200: NutritionAnalyticsSerializer.DailyBalanceScore},
	)
    @action(detail=True, methods=["get"], url_path="daily-balance-score")
    def balance_score(self, request, pk):
        """Returns balance scores for each day of the current week."""
        if request.user.id != pk:
            logger.error("Permission Denied")
            raise exceptions.CustomException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="action not allowed"
            )
        
        user = self.get_object()
        if not user:
            logger.error(f"Not Found: User with id {pk} does not exist.")
            raise exceptions.CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                message="User not found."
            )
        serializer = NutritionAnalyticsSerializer.DailyBalanceScore(instance=user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)



@extend_schema(tags=["Analytics"]) 
class MicronutrientsAnalyticsView(views.APIView):
	http_method_names = ["get"]

	@extend_schema(
		description="Micronutrients percentages for the authenticated user",
		responses={200: MicronutrientsAnalyticsSerializer},
	)
	def get(self, request):

		helper = analytics.UserDashboardAnalyticsHelper(request.user)
		result = helper.get_current_day_micronutrient_percentages()
		return response.Response(result, status=status.HTTP_200_OK)


@extend_schema(tags=["Analytics"]) 
class MealTimingAnalyticsView(views.APIView):
	http_method_names = ["get"]

	@extend_schema(
		description="Meal timing distribution and calory totals for the authenticated user",
		responses={200: HourlyCaloriesSerializer},
	)
	def get(self, request):
		user = (
			Account.objects
			.filter(id=request.user.id)
			.with_current_day_hourly_calories()
		).first()
		serializer = HourlyCaloriesSerializer(instance=user)

		return response.Response(serializer.data, status=status.HTTP_200_OK)
