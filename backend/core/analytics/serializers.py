from rest_framework import serializers


class NutritionAnalyticsSerializer:
    class FoodGroupGrams(serializers.Serializer):
        total_carbs_grams = serializers.IntegerField()
        total_protein_grams = serializers.IntegerField()
        total_fat_grams = serializers.IntegerField()
        total_vegetable_grams = serializers.IntegerField()
        total_dairy_grams = serializers.IntegerField()
        total_fruit_grams = serializers.IntegerField()


    class FoodGroupPercentage(serializers.Serializer):
        carbs_percent = serializers.FloatField()
        protein_percent = serializers.FloatField()
        vegetable_percent = serializers.FloatField()
        fruit_percent = serializers.FloatField()
        dairy_percent = serializers.FloatField()


    class DailyBalanceScore(serializers.Serializer):
        monday_balance = serializers.FloatField()
        tuesday_balance = serializers.FloatField()
        wednesday_balance = serializers.FloatField()
        thursday_balance = serializers.FloatField()
        friday_balance = serializers.FloatField()
        saturday_balance = serializers.FloatField()
        sunday_balance = serializers.FloatField()


class HourlyCaloriesSerializer(serializers.Serializer):
    h06_calories = serializers.FloatField()
    h07_calories = serializers.FloatField()
    h08_calories = serializers.FloatField()
    h09_calories = serializers.FloatField()
    h10_calories = serializers.FloatField()
    h11_calories = serializers.FloatField()
    h12_calories = serializers.FloatField()
    h13_calories = serializers.FloatField()
    h14_calories = serializers.FloatField()
    h15_calories = serializers.FloatField()
    h16_calories = serializers.FloatField()
    h17_calories = serializers.FloatField()
    h18_calories = serializers.FloatField()
    h19_calories = serializers.FloatField()
    h20_calories = serializers.FloatField()
    h21_calories = serializers.FloatField()
    h22_calories = serializers.FloatField()


class MicronutrientItemSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.FloatField()
    percent = serializers.FloatField()


class MicronutrientsAnalyticsSerializer(serializers.Serializer):
    micronutrients = MicronutrientItemSerializer(many=True)

