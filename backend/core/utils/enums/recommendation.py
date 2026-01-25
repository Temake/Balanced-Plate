from .base import BaseEnum


class RecommendationEventType(BaseEnum):
    RECOMMENDATION_READY = "recommendation_ready"
    RECOMMENDATION_READ = "recommendation_read"