from django.db import models
from django.db.models import (
    Q,
    F,
    Count,
    Sum,
    Avg,
    FloatField,
    Value,
    ExpressionWrapper,
    Case,
    When,
    DecimalField,
)
from django.db.models.functions import Coalesce
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from core.utils import enums


class UserQuerySet(models.QuerySet):

    def with_food_groups_data(self, start_date=None, end_date=None):
        """Annotate grams and percentages of detected food groups."""

        food_group_list = [
            member.name.lower() for member in enums.NutritionalContentType
        ]

        date_filter = Q()
        if start_date:
            date_filter &= Q(food_analyses__date_added__date__gte=start_date)
        if end_date:
            date_filter &= Q(food_analyses__date_added__date__lte=end_date)

        # grams annotations
        grams_annotations = {}

        for value in food_group_list:
            if value == "calories":
                grams_annotations[f"total_{value}"] = Coalesce(
                    Sum(
                        f"food_analyses__detected_foods__{value}",
                        filter=date_filter,
                    ),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            else:
                grams_annotations[f"total_{value}_grams"] = Coalesce(
                    Sum(
                        f"food_analyses__detected_foods__{value}",
                        filter=date_filter,
                    ),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )

        qs = self.annotate(**grams_annotations)

        # total macro grams annotation
        qs = qs.annotate(
            total_macro_grams=(
                F("total_protein_grams") 
                + F("total_carbs_grams") 
                + F("total_fat_grams")
                + F("total_vegetable_grams")
                + F("total_dairy_grams")
                + F("total_fruit_grams")
            )
        )

        # Percentage annotations
        percent_annotations = {}
        food_group_list.remove("calories")

        for value in food_group_list:
            percent_annotations[f"{value}_percent"] = Case(
                When(total_macro_grams=0, then=Value(0.0)),
                default=ExpressionWrapper(
                    F(f"total_{value}_grams") * 100.0 / F("total_macro_grams"),
                    output_field=FloatField(),
                ),
                output_field=FloatField(),
            )

        return qs.annotate(**percent_annotations)


    def with_weekly_balance_score(self, start_date=None, end_date=None):
        """
        Annotate average balance score for each day of the current week (Mon-Sun).
        """
        if start_date is None or end_date is None:
            today = timezone.localdate()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)

        day_map = {
            "monday": 2,
            "tuesday": 3,
            "wednesday": 4,
            "thursday": 5,
            "friday": 6,
            "saturday": 7,
            "sunday": 1,
        }

        annotations = {
            "avg_balance_score": Coalesce(
                Avg(
                    "food_analyses__balance_score",
                    filter=Q(
                        food_analyses__date_added__date__gte=start_date,
                        food_analyses__date_added__date__lte=end_date,
                    ),
                ),
                Value(0.0),
                output_field=FloatField(),
            ),
        }

        for day_name, day_num in day_map.items():
            annotations[f"{day_name}_balance"] = Coalesce(
                Avg(
                    "food_analyses__balance_score",
                    filter=Q(
                        food_analyses__date_added__date__gte=start_date,
                        food_analyses__date_added__date__lte=end_date,
                        food_analyses__date_added__week_day=day_num,
                    ),
                ),
                Value(0.0),
                output_field=FloatField(),
            )

        return self.annotate(**annotations)

    def with_current_day_hourly_calories(self, target_date=None):
        """Annotate sum of calories for each hour (06:00–22:00) of a specific day.

        Produces fields: h06_calories, h07_calories, ..., h22_calories
        """
        if target_date is None:
            target_date = timezone.localdate()
        
        exprs = {}
        for h in range(6, 23): 
            field_name = f"h{h:02d}_calories"
            exprs[field_name] = Coalesce(
                Sum(
                    "food_analyses__detected_foods__calories",
                    filter=(
                        Q(food_analyses__date_added__date=target_date) &
                        Q(food_analyses__date_added__hour=h)
                    ),
                ),
                Value(Decimal("0.00")),
                output_field=DecimalField(max_digits=17, decimal_places=2),
            )
        return self.annotate(**exprs)
    
    def with_meal_type_distribution(self, start_date=None, end_date=None):
        """
        Annotate meal type counts and percentages.
        """
        date_filter = Q()
        if start_date:
            date_filter &= Q(food_analyses__date_added__date__gte=start_date)
        if end_date:
            date_filter &= Q(food_analyses__date_added__date__lte=end_date)

        meal_type_map = {
            member.name.lower(): member.value
            for member in enums.MealType
        }

        count_annotations = {
            "total_meals": Count(
                "food_analyses",
                filter=date_filter,
                distinct=True,
            ),
        }

        for key, value in meal_type_map.items():
            count_annotations[f"{key}_count"] = Count(
                "food_analyses",
                filter=date_filter & Q(food_analyses__meal_type=value),
                distinct=True,
            )

        qs = self.annotate(**count_annotations)

        percent_annotations = {}
        for key in meal_type_map.keys():
            percent_annotations[f"{key}_percent"] = Case(
                When(total_meals=0, then=Value(0.0)),
                default=ExpressionWrapper(
                    F(f"{key}_count") * 100.0 / F("total_meals"),
                    output_field=FloatField(),
                ),
                output_field=FloatField(),
            )

        return qs.annotate(**percent_annotations)
