from rest_framework import serializers

from core.recommendations.models import WeeklyRecommendation
from core.account.serializers import BaseUserSerializer


class WeeklyRecommendationSerializer:

    class RecommendationDetails(serializers.ModelSerializer):    
        owner = BaseUserSerializer()
        
        class Meta:
            model = WeeklyRecommendation
            fields = "__all__"


    class RecommendationList(serializers.ModelSerializer):
        
        class Meta:
            model = WeeklyRecommendation
            fields = [
                "id",
                "week_start_date",
                "week_end_date",
                "health_report",
                "recommendations",
                "priority_actions",
                "weekly_goals",
                "status",
                "is_mock_data",
                "is_read",
                "date_added",
            ]


