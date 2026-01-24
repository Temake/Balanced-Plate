from enum import Enum


class NotificationType(Enum):
    WEEKLY_RECOMMENDATION = "weekly_recommendation"
    FOOD_ANALYSIS_COMPLETE = "food_analysis_complete"
    FOOD_ANALYSIS_FAILED = "food_analysis_failed"
    GENERAL_UPDATE = "general_update"


class NotificationEventType(Enum):
    notification_created = "notification_created"
    notification_read = "notification_read"
    weekly_recommendation = "weekly_recommendation"
    food_analysis_complete = "food_analysis_completed"
    food_analysis_failed = "food_analysis_failed"
    general_update = "general_update"