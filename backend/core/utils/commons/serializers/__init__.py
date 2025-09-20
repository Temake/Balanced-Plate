class Serializers:
    """
    common utilities for serializers. 
    Mainly used when serializers are processed/used outside view functions
    """

    @staticmethod
    def create(serializer_class, data) -> dict:
        serializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data