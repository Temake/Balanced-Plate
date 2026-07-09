from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin


class BillingPlanKey(models.TextChoices):
    FREE = "free", _("Free")
    PLUS = "plus", _("Plus")
    PRO = "pro", _("Pro")


class BillingInterval(models.TextChoices):
    MONTHLY = "monthly", _("Monthly")


class SubscriptionStatus(models.TextChoices):
    FREE = "free", _("Free")
    PENDING = "pending", _("Pending")
    ACTIVE = "active", _("Active")
    GRACE = "grace", _("Grace")
    CANCELLED = "cancelled", _("Cancelled")
    EXPIRED = "expired", _("Expired")
    DISABLED = "disabled", _("Disabled")


class PaymentStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    SUCCESS = "success", _("Success")
    FAILED = "failed", _("Failed")
    ABANDONED = "abandoned", _("Abandoned")
    REVERSED = "reversed", _("Reversed")


class AIFeatureType(models.TextChoices):
    MEAL_PLAN = "meal_plan", _("AI Meal Plan")
    MEAL_PLAN_DAY = "meal_plan_day", _("AI Day Meal Plan")
    COOKING_GUIDE = "cooking_guide", _("AI Cooking Guide")


class BillingPlan(BaseModelMixin):
    key = models.CharField(
        _("Plan Key"),
        max_length=20,
        choices=BillingPlanKey.choices,
        unique=True,
    )
    name = models.CharField(_("Plan Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True, default="")
    price_kobo = models.PositiveIntegerField(_("Price (kobo)"), default=0)
    currency = models.CharField(_("Currency"), max_length=3, default="NGN")
    interval = models.CharField(
        _("Billing Interval"),
        max_length=20,
        choices=BillingInterval.choices,
        default=BillingInterval.MONTHLY,
    )
    paystack_plan_code = models.CharField(
        _("Paystack Plan Code"),
        max_length=100,
        blank=True,
        default="",
        help_text=_("Dashboard-created Paystack plan code for paid plans."),
    )
    ai_generation_limit = models.PositiveIntegerField(
        _("Monthly AI Generation Limit"),
        default=0,
        help_text=_("Monthly credits for AI planning and AI cooking guides."),
    )
    analytics_enabled = models.BooleanField(_("Analytics Enabled"), default=False)
    reports_enabled = models.BooleanField(_("Reports Enabled"), default=False)
    ai_planning_enabled = models.BooleanField(_("AI Planning Enabled"), default=False)
    ai_cooking_enabled = models.BooleanField(_("AI Cooking Enabled"), default=False)
    is_active = models.BooleanField(_("Is Active"), default=True)
    sort_order = models.PositiveSmallIntegerField(_("Sort Order"), default=0)

    class Meta:
        verbose_name = _("Billing Plan")
        verbose_name_plural = _("Billing Plans")
        ordering = ["sort_order", "price_kobo"]

    def __str__(self):
        return f"{self.name} ({self.currency} {self.price_kobo / 100:.0f})"


class Subscription(BaseModelMixin):
    owner = models.OneToOneField(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="subscription",
        verbose_name=_("Subscription Owner"),
    )
    plan = models.ForeignKey(
        to=BillingPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
        verbose_name=_("Billing Plan"),
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.FREE,
        db_index=True,
    )
    paystack_customer_code = models.CharField(
        _("Paystack Customer Code"),
        max_length=100,
        blank=True,
        default="",
    )
    paystack_subscription_code = models.CharField(
        _("Paystack Subscription Code"),
        max_length=100,
        blank=True,
        default="",
    )
    paystack_email_token = models.CharField(
        _("Paystack Email Token"),
        max_length=100,
        blank=True,
        default="",
    )
    current_period_start = models.DateTimeField(
        _("Current Period Start"),
        null=True,
        blank=True,
    )
    current_period_end = models.DateTimeField(
        _("Current Period End"),
        null=True,
        blank=True,
    )
    grace_ends_at = models.DateTimeField(_("Grace Ends At"), null=True, blank=True)
    cancel_at_period_end = models.BooleanField(_("Cancel At Period End"), default=False)
    cancelled_at = models.DateTimeField(_("Cancelled At"), null=True, blank=True)
    renewal_reminder_7d_sent_at = models.DateTimeField(
        _("7-day Renewal Reminder Sent At"),
        null=True,
        blank=True,
    )
    renewal_reminder_1d_sent_at = models.DateTimeField(
        _("1-day Renewal Reminder Sent At"),
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Subscription")
        verbose_name_plural = _("Subscriptions")
        ordering = ["-date_last_modified"]

    @property
    def is_paid_access_active(self):
        if self.status == SubscriptionStatus.ACTIVE:
            return True
        if self.status == SubscriptionStatus.GRACE and self.grace_ends_at:
            return timezone.now() <= self.grace_ends_at
        return False

    def __str__(self):
        return f"{self.owner.email} - {self.plan.name} - {self.status}"


class PaymentTransaction(BaseModelMixin):
    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="payment_transactions",
        verbose_name=_("Payment Owner"),
    )
    plan = models.ForeignKey(
        to=BillingPlan,
        on_delete=models.PROTECT,
        related_name="payment_transactions",
        verbose_name=_("Billing Plan"),
    )
    subscription = models.ForeignKey(
        to=Subscription,
        on_delete=models.SET_NULL,
        related_name="payment_transactions",
        null=True,
        blank=True,
    )
    reference = models.CharField(_("Paystack Reference"), max_length=120, unique=True)
    amount_kobo = models.PositiveIntegerField(_("Amount (kobo)"))
    currency = models.CharField(_("Currency"), max_length=3, default="NGN")
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    paystack_access_code = models.CharField(
        _("Paystack Access Code"),
        max_length=120,
        blank=True,
        default="",
    )
    paystack_authorization_url = models.URLField(
        _("Paystack Authorization URL"),
        max_length=500,
        blank=True,
        default="",
    )
    paid_at = models.DateTimeField(_("Paid At"), null=True, blank=True)
    raw_response = models.JSONField(_("Raw Paystack Response"), default=dict, blank=True)

    class Meta:
        verbose_name = _("Payment Transaction")
        verbose_name_plural = _("Payment Transactions")
        ordering = ["-date_added"]

    def __str__(self):
        return f"{self.reference} - {self.status}"


class PaystackWebhookEvent(BaseModelMixin):
    event_type = models.CharField(_("Event Type"), max_length=100, db_index=True)
    reference = models.CharField(
        _("Reference"),
        max_length=120,
        blank=True,
        default="",
        db_index=True,
    )
    payload_hash = models.CharField(_("Payload Hash"), max_length=128, unique=True)
    processed = models.BooleanField(_("Processed"), default=False)
    processed_at = models.DateTimeField(_("Processed At"), null=True, blank=True)
    payload = models.JSONField(_("Payload"), default=dict)

    class Meta:
        verbose_name = _("Paystack Webhook Event")
        verbose_name_plural = _("Paystack Webhook Events")
        ordering = ["-date_added"]

    def __str__(self):
        return f"{self.event_type} - {self.reference or self.payload_hash[:10]}"


class AIUsageLedger(BaseModelMixin):
    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="ai_usage_ledger",
        verbose_name=_("Usage Owner"),
    )
    feature_type = models.CharField(
        _("Feature Type"),
        max_length=40,
        choices=AIFeatureType.choices,
    )
    billing_month = models.DateField(
        _("Billing Month"),
        help_text=_("First day of the month this usage belongs to."),
    )
    credits_used = models.PositiveIntegerField(_("Credits Used"), default=1)
    metadata = models.JSONField(_("Metadata"), default=dict, blank=True)

    class Meta:
        verbose_name = _("AI Usage Ledger Entry")
        verbose_name_plural = _("AI Usage Ledger Entries")
        ordering = ["-date_added"]
        indexes = [
            models.Index(fields=["owner", "billing_month"]),
            models.Index(fields=["owner", "feature_type", "billing_month"]),
        ]

    def __str__(self):
        return f"{self.owner.email} - {self.feature_type} - {self.billing_month}"


class DemoAccessInvite(BaseModelMixin):
    token_hash = models.CharField(_("Token Hash"), max_length=64, unique=True)
    created_by = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.SET_NULL,
        related_name="created_demo_access_invites",
        null=True,
        blank=True,
    )
    expires_at = models.DateTimeField(_("Expires At"), db_index=True)
    max_redemptions = models.PositiveIntegerField(_("Max Redemptions"), default=1)
    redemption_count = models.PositiveIntegerField(_("Redemption Count"), default=0)
    access_duration_days = models.PositiveIntegerField(_("Access Duration Days"), default=150)
    revoked_at = models.DateTimeField(_("Revoked At"), null=True, blank=True)
    note = models.CharField(_("Note"), max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Demo Access Invite")
        verbose_name_plural = _("Demo Access Invites")
        ordering = ["-date_added"]

    @property
    def is_redeemable(self):
        return (
            self.revoked_at is None
            and timezone.now() <= self.expires_at
            and self.redemption_count < self.max_redemptions
        )

    def __str__(self):
        return f"Demo invite {self.id} ({self.redemption_count}/{self.max_redemptions})"


class FeatureEntitlement(BaseModelMixin):
    SOURCE_DEMO_INVITE = "demo_invite"
    SOURCE_MANUAL = "manual"
    SOURCE_CHOICES = (
        (SOURCE_DEMO_INVITE, _("Demo Invite")),
        (SOURCE_MANUAL, _("Manual")),
    )

    owner = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.CASCADE,
        related_name="feature_entitlements",
        verbose_name=_("Entitlement Owner"),
    )
    source = models.CharField(_("Source"), max_length=40, choices=SOURCE_CHOICES)
    all_features = models.BooleanField(_("All Features"), default=True)
    starts_at = models.DateTimeField(_("Starts At"), default=timezone.now)
    expires_at = models.DateTimeField(_("Expires At"), db_index=True)
    granted_by = models.ForeignKey(
        to=get_user_model(),
        on_delete=models.SET_NULL,
        related_name="granted_feature_entitlements",
        null=True,
        blank=True,
    )
    invite = models.ForeignKey(
        to=DemoAccessInvite,
        on_delete=models.SET_NULL,
        related_name="entitlements",
        null=True,
        blank=True,
    )
    note = models.CharField(_("Note"), max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Feature Entitlement")
        verbose_name_plural = _("Feature Entitlements")
        ordering = ["-expires_at"]
        indexes = [
            models.Index(fields=["owner", "starts_at", "expires_at"]),
        ]

    @property
    def is_active(self):
        now = timezone.now()
        return self.starts_at <= now <= self.expires_at

    def __str__(self):
        return f"{self.owner.email} - {self.source} until {self.expires_at:%Y-%m-%d}"


def get_default_billing_plans():
    return [
        {
            "key": BillingPlanKey.FREE,
            "name": "Free",
            "description": "Unlimited photo analysis, manual meal planning, and basic app access.",
            "price_kobo": 0,
            "paystack_plan_code": "",
            "ai_generation_limit": 0,
            "analytics_enabled": False,
            "reports_enabled": False,
            "ai_planning_enabled": False,
            "ai_cooking_enabled": False,
            "sort_order": 0,
        },
        {
            "key": BillingPlanKey.PLUS,
            "name": "Plus",
            "description": "Analytics, reports, AI meal planning, and AI cooking guide.",
            "price_kobo": 240000,
            "paystack_plan_code": getattr(settings, "PAYSTACK_PLUS_PLAN_CODE", ""),
            "ai_generation_limit": 30,
            "analytics_enabled": True,
            "reports_enabled": True,
            "ai_planning_enabled": True,
            "ai_cooking_enabled": True,
            "sort_order": 1,
        },
        {
            "key": BillingPlanKey.PRO,
            "name": "Pro",
            "description": "Higher AI limits for regular planning and cooking support.",
            "price_kobo": 450000,
            "paystack_plan_code": getattr(settings, "PAYSTACK_PRO_PLAN_CODE", ""),
            "ai_generation_limit": 100,
            "analytics_enabled": True,
            "reports_enabled": True,
            "ai_planning_enabled": True,
            "ai_cooking_enabled": True,
            "sort_order": 2,
        },
    ]
