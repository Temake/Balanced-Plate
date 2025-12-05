from rest_framework import serializers

from .models import FoodAnalysis, DetectedFood


class DetectedFoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectedFood
        fields = [
            "id",
            "name",
            "confidence",
            "portion_estimate",
            "calories",
            "protein",
            "carbs",
            "fat",
        ]


class FoodAnalysisSerializer:
    class List(serializers.ModelSerializer):
        detected_foods = DetectedFoodSerializer(many=True, read_only=True)
        total_calories = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_protein = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_carbs = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_fat = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        image_url = serializers.SerializerMethodField()

        def get_image_url(self, obj):
            if obj.food_image and obj.food_image.file:
                return obj.food_image.file.url
            return None

        class Meta:
            model = FoodAnalysis
            fields = [
                "id",
                "food_image",
                "image_url",
                "meal_type",
                "balance_score",
                "suggestions",
                "is_mock_data",
                "analysis_status",
                "error_message",
                "detected_foods",
                "total_calories",
                "total_protein",
                "total_carbs",
                "total_fat",
                "date_added",
            ]


    class Detail(serializers.ModelSerializer):
        detected_foods = DetectedFoodSerializer(many=True, read_only=True)
        total_calories = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_protein = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_carbs = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        total_fat = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
        image_url = serializers.SerializerMethodField()
        owner_name = serializers.SerializerMethodField()

        def get_image_url(self, obj):
            if obj.food_image and obj.food_image.file:
                return obj.food_image.file.url
            return None

        def get_owner_name(self, obj):
            return f"{obj.owner.first_name} {obj.owner.last_name}"

        class Meta:
            model = FoodAnalysis
            fields = [
                "id",
                "owner",
                "owner_name",
                "food_image",
                "image_url",
                "meal_type",
                "balance_score",
                "suggestions",
                "is_mock_data",
                "analysis_status",
                "error_message",
                "detected_foods",
                "total_calories",
                "total_protein",
                "total_carbs",
                "total_fat",
                "date_added",
                "date_last_modified",
            ]


class AnalyzeRequestSerializer(serializers.Serializer):
    file_id = serializers.CharField(help_text="ID of the uploaded food image file")
    use_mock = serializers.BooleanField(
        default=False, 
        required=False,
        help_text="Use mock data instead of AI analysis (for testing)"
    )
