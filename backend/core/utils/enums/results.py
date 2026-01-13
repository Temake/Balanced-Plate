from .base import BaseEnum


class NutritionalContentType(BaseEnum):
    CARBS = "Carbs"
    PROTEIN = "Proteins"
    VEGETABLE = "Vegetables"
    FRUIT = "Fruits"
    DAIRY = "Dairy"
    FAT = "Fat"
    CALORIES = "Calories"

class MealType(BaseEnum):
    BREAKFAST = "Breakfast"
    LUNCH = "Lunch"
    DINNER = "Dinner"
    SNACK = "Snack"


class FoodAnalysisStatus(BaseEnum):
    PENDING = "Pending"
    PROCESSING = "Processing"   
    COMPLETED = "Completed"
    FAILED = "Failed"


class WeeklyRecommendationStatus(BaseEnum):
    PENDING = "Pending"
    PROCESSING = "Processing"   
    COMPLETED = "Completed"
    FAILED = "Failed"