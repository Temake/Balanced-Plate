from rest_framework import serializers

from .models import BudgetTier, PriceArea


class BudgetTierSerializer(serializers.ModelSerializer):
    naira_per_person_per_day = serializers.SerializerMethodField()
    weekly_naira = serializers.SerializerMethodField()

    def get_naira_per_person_per_day(self, obj):
        return round(obj.kobo_per_person_per_day / 100, 2)

    def get_weekly_naira(self, obj):
        """Weekly total for the requested household, so the UI can show a real figure
        on the chip instead of the word 'Low'."""
        household_size = self.context.get("household_size", 1)
        return round(obj.weekly_kobo(household_size) / 100, 2)

    class Meta:
        model = BudgetTier
        fields = ["key", "label", "description", "naira_per_person_per_day", "weekly_naira"]


class PriceAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceArea
        fields = ["id", "name", "state", "latitude", "longitude", "is_default"]


class LocateRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    area_id = serializers.IntegerField(required=False, allow_null=True)


class LocateResponseSerializer(serializers.Serializer):
    price_area = PriceAreaSerializer()
    distance_km = serializers.FloatField(allow_null=True)
    is_outside_nigeria = serializers.BooleanField(default=False)

