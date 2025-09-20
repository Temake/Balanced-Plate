from rest_framework import serializers
from core.utils import enums
from .models import FileModel


class BaseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileModel
        fields = ["id", "file", "purpose"]
        

class FileSerializer:
    class Create(serializers.ModelSerializer):
        id = serializers.CharField(
            allow_null=True, allow_blank=True, max_length=100, required=False
        )

        class Meta:
            model = FileModel
            exclude = [
                "date_added",
                "date_last_modified",
                "upload_session_id", 
                "currently_under_processing"
            ]


    class ListRetrieve(serializers.ModelSerializer):
        size = serializers.SerializerMethodField()

        def get_size(self, obj):
            return obj.file.size if obj.file else None

        class Meta:
            model = FileModel
            exclude = ["date_last_modified"]