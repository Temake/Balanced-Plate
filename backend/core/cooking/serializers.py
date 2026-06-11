from rest_framework import serializers


class CookingGuideRequestSerializer(serializers.Serializer):
    dish_name = serializers.CharField(
        max_length=200,
        help_text="Name of the Nigerian dish to generate a cooking guide for"
    )
