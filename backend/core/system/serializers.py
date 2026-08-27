from rest_framework import serializers
from .models import Feedback, FeedbackCategory


class FeedbackSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id",
            "user",
            "email",
            "name",
            "category",
            "category_display",
            "subject",
            "message",
            "is_reviewed",
            "date_added",
        ]
        read_only_fields = ["id", "user", "is_reviewed", "date_added"]

    def validate_category(self, value):
        valid_choices = FeedbackCategory.values()
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid category. Must be one of: {', '.join(valid_choices)}"
            )
        return value
