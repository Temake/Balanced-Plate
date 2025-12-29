from .base import BaseEnum


class FoodGroup(BaseEnum):
    CARBS = "Carbs"
    PROTEINS = "Proteins"
    VEGETABLES = "Vegetables"
    FRUITS = "Fruits"
    DAIRY = "Dairy"


class FoodAnalysisStatus(BaseEnum):
    PENDING = "Pending"
    PROCESSING = "Processing"   
    COMPLETED = "Completed"
    FAILED = "Failed"