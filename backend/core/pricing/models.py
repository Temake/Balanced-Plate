from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin


class PriceSource(models.TextChoices):
    """Where an observation came from, cheapest-to-trust last.

    ADMIN_SURVEY is a hand-collected market survey, RTFP is the World Bank
    Real-Time Food Prices feed, and USER is a price a user reported paying.
    """

    ADMIN_SURVEY = "admin_survey", _("Market survey")
    USER = "user", _("User reported")
    RTFP = "rtfp", _("World Bank RTFP")
    ESTIMATE = "estimate", _("Unverified estimate")


class Unit(models.TextChoices):
    """Units people actually buy in, not units a nutritionist would choose.

    Costing only works if the AI quotes quantities in the same unit the price was
    collected in, so this list is deliberately small and is injected into the prompt.
    """

    KG = "kg", _("Kilogram")
    GRAM = "g", _("Gram")
    LITRE = "litre", _("Litre")
    DERICA = "derica", _("Derica (milk cup)")
    MUDU = "mudu", _("Mudu")
    PAINT = "paint", _("Paint bucket")
    BUNCH = "bunch", _("Bunch")
    PIECE = "piece", _("Piece")
    BOTTLE = "bottle", _("Bottle")
    SACHET = "sachet", _("Sachet")
    CONGO = "congo", _("Congo")


class IngredientCategory(models.TextChoices):
    STAPLE = "staple", _("Staples and swallow")
    PROTEIN = "protein", _("Protein")
    VEGETABLE = "vegetable", _("Vegetables")
    FRUIT = "fruit", _("Fruit")
    OIL = "oil", _("Oils and fats")
    SEASONING = "seasoning", _("Seasoning")
    DAIRY = "dairy", _("Dairy and eggs")
    DRINK = "drink", _("Drinks")
    OTHER = "other", _("Other")


class PriceArea(BaseModelMixin):
    """A place prices are collected for — a city, not a market.

    Market-level granularity is not useful yet: the World Bank feed has a single
    market for the whole of Lagos and none at all for Port Harcourt or Abuja, so
    pretending to price by market would be false precision.
    """

    name = models.CharField(_("Area Name"), max_length=100, unique=True)
    state = models.CharField(_("State"), max_length=100)
    latitude = models.FloatField(_("Latitude"), null=True, blank=True)
    longitude = models.FloatField(_("Longitude"), null=True, blank=True)
    is_default = models.BooleanField(
        _("Default Area"),
        default=False,
        help_text=_("Used when a user has not told us where they shop."),
    )
    is_active = models.BooleanField(_("Active"), default=True)

    class Meta:
        verbose_name = _("Price Area")
        verbose_name_plural = _("Price Areas")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}, {self.state}"


class Ingredient(BaseModelMixin):
    """A thing you can buy in a Nigerian market, priced in one canonical unit."""

    name = models.CharField(_("Name"), max_length=120, unique=True)
    aliases = models.JSONField(
        _("Aliases"),
        default=list,
        blank=True,
        help_text=_(
            "Other names the AI or a user might use, e.g. ['ugwu', 'pumpkin leaf']. "
            "Matched case-insensitively when costing a meal."
        ),
    )
    category = models.CharField(
        _("Category"),
        max_length=20,
        choices=IngredientCategory.choices,
        default=IngredientCategory.OTHER,
    )
    unit = models.CharField(
        _("Pricing Unit"),
        max_length=20,
        choices=Unit.choices,
        help_text=_("The unit every price for this ingredient is quoted in."),
    )
    protein_g_per_unit = models.DecimalField(
        _("Protein (g) per unit"),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Used to answer 'cheapest way to hit my protein today'."),
    )
    kcal_per_unit = models.DecimalField(
        _("Energy (kcal) per unit"),
        max_digits=9,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(_("Active"), default=True)
    include_in_prompt = models.BooleanField(
        _("Include in AI catalogue"),
        default=True,
        help_text=_(
            "The AI may only use ingredients from this catalogue, so anything "
            "excluded here cannot appear in a costed plan."
        ),
    )

    class Meta:
        verbose_name = _("Ingredient")
        verbose_name_plural = _("Ingredients")
        ordering = ["category", "name"]
        indexes = [models.Index(fields=["is_active", "include_in_prompt"])]

    def __str__(self):
        return f"{self.name} (per {self.unit})"

    def matches(self, candidate):
        """Case-insensitive match against the canonical name or any alias."""
        needle = (candidate or "").strip().lower()
        if not needle:
            return False
        if needle == self.name.lower():
            return True
        return needle in {str(a).strip().lower() for a in (self.aliases or [])}


class PriceObservation(BaseModelMixin):
    """One price, true on one date, in one place.

    Append-only on purpose. There is deliberately no `current_price` field anywhere
    in this app: "what does garri cost now" is a question you answer by resolving
    observations, not a column somebody can overwrite. `observed_on` is when the
    price was true, which is not the same as when the row was written — an import
    running today inserts observations dated weeks ago.
    """

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="observations",
        verbose_name=_("Ingredient"),
    )
    area = models.ForeignKey(
        PriceArea,
        on_delete=models.CASCADE,
        related_name="observations",
        verbose_name=_("Area"),
    )
    unit = models.CharField(_("Unit"), max_length=20, choices=Unit.choices)
    price_kobo = models.PositiveIntegerField(_("Price (kobo)"))
    observed_on = models.DateField(
        _("Observed On"),
        db_index=True,
        help_text=_("The date this price was true, not the date it was recorded."),
    )
    source = models.CharField(
        _("Source"),
        max_length=20,
        choices=PriceSource.choices,
        default=PriceSource.ADMIN_SURVEY,
    )
    note = models.CharField(_("Note"), max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Price Observation")
        verbose_name_plural = _("Price Observations")
        ordering = ["-observed_on"]
        indexes = [
            models.Index(fields=["ingredient", "area", "-observed_on"]),
            models.Index(fields=["area", "-observed_on"]),
        ]

    def __str__(self):
        return f"{self.ingredient.name} @ {self.area.name} — ₦{self.price_kobo / 100:,.0f} ({self.observed_on})"

    @property
    def price_naira(self):
        return self.price_kobo / 100


class BudgetTier(BaseModelMixin):
    """Turns "low / medium / flexible" into an actual naira figure.

    These were adjectives in the meal-plan prompt, which meant the AI decided what
    "low" meant and nothing could check the answer. Keeping them in the database
    rather than in code matters because food inflation moves them: the anchor is the
    NBS cost of a healthy diet, which was ₦1,589 per adult per day in April 2026.
    """

    key = models.CharField(_("Key"), max_length=20, unique=True)
    label = models.CharField(_("Label"), max_length=60)
    description = models.CharField(_("Description"), max_length=200, blank=True, default="")
    kobo_per_person_per_day = models.PositiveIntegerField(
        _("Budget (kobo) per person per day"),
    )
    sort_order = models.PositiveSmallIntegerField(_("Sort Order"), default=0)
    is_active = models.BooleanField(_("Active"), default=True)

    class Meta:
        verbose_name = _("Budget Tier")
        verbose_name_plural = _("Budget Tiers")
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.label} (₦{self.kobo_per_person_per_day / 100:,.0f}/person/day)"

    def weekly_kobo(self, household_size=1):
        return self.kobo_per_person_per_day * 7 * max(int(household_size or 1), 1)
