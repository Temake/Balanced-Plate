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
    ANALYSIS_PENDING = "analysis_pending"
    ANALYSIS_PROCESSING = "analysis_processing"   
    ANALYSIS_COMPLETED = "analysis_completed"
    ANALYSIS_FAILED = "analysis_failed"
