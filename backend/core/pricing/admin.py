from django.contrib import admin
from django.utils import timezone

from .models import BudgetTier, Ingredient, PriceArea, PriceObservation
from .services import MAX_PRICE_AGE_DAYS, resolve_price


@admin.register(PriceArea)
class PriceAreaAdmin(admin.ModelAdmin):
    list_display = ("name", "state", "is_default", "is_active")
    list_filter = ("is_active", "is_default", "state")
    search_fields = ("name", "state")


@admin.register(BudgetTier)
class BudgetTierAdmin(admin.ModelAdmin):
    list_display = ("label", "key", "naira_per_person_per_day", "weekly_for_four", "is_active")
    list_editable = ("is_active",)
    ordering = ("sort_order",)

    @admin.display(description="Per person / day")
    def naira_per_person_per_day(self, obj):
        return f"₦{obj.kobo_per_person_per_day / 100:,.0f}"

    @admin.display(description="Week, family of 4")
    def weekly_for_four(self, obj):
        return f"₦{obj.weekly_kobo(4) / 100:,.0f}"


class PriceObservationInline(admin.TabularInline):
    model = PriceObservation
    extra = 0
    fields = ("area", "unit", "price_kobo", "observed_on", "source", "note")
    ordering = ("-observed_on",)


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "unit", "current_price", "price_age", "include_in_prompt")
    list_filter = ("category", "is_active", "include_in_prompt", "unit")
    search_fields = ("name", "aliases")
    inlines = [PriceObservationInline]

    @admin.display(description="Current price")
    def current_price(self, obj):
        from .services import get_default_area

        area = get_default_area()
        if area is None:
            return "—"
        resolved = resolve_price(obj, area)
        if resolved is None:
            return "no recent price"
        suffix = " (projected)" if resolved.was_projected else ""
        return f"₦{resolved.price_kobo / 100:,.0f}/{resolved.unit}{suffix}"

    @admin.display(description="Price age")
    def price_age(self, obj):
        from .services import get_default_area

        area = get_default_area()
        if area is None:
            return "—"
        resolved = resolve_price(obj, area)
        if resolved is None:
            return f"older than {MAX_PRICE_AGE_DAYS}d"
        return f"{resolved.days_stale}d"


@admin.register(PriceObservation)
class PriceObservationAdmin(admin.ModelAdmin):
    list_display = ("ingredient", "area", "naira", "unit", "observed_on", "source", "is_stale")
    list_filter = ("source", "area", "observed_on", "ingredient__category")
    search_fields = ("ingredient__name", "note")
    date_hierarchy = "observed_on"
    autocomplete_fields = ("ingredient",)

    @admin.display(description="Price")
    def naira(self, obj):
        return f"₦{obj.price_kobo / 100:,.2f}"

    @admin.display(boolean=True, description="Stale")
    def is_stale(self, obj):
        return (timezone.localdate() - obj.observed_on).days > MAX_PRICE_AGE_DAYS
