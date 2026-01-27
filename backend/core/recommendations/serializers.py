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
                "status",
                "is_read",
                "date_added",
            ]


