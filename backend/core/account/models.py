from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin,
)
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from core.utils import enums
from core.utils.mixins import BaseModelMixin


class AccountManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(
        self, email: str, first_name: str, last_name: str,  password: str, **extra_fields
    ):
        if not email:
            raise ValueError("The email field is required")
        if not first_name:
            raise ValueError("The first name field is required")
        if not last_name:
            raise ValueError("The last name field is required")
        
        email = self.normalize_email(email)
        user = self.model(
            email=email, 
            first_name=first_name, 
            last_name=last_name, 
            **extra_fields
        )
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(
            self, email: str, first_name: str, last_name: str, password: str = None, **extra_fields
        ):
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, first_name, last_name, password, **extra_fields)

    def create_superuser(
        self,
        email: str,
        first_name: str, 
        last_name: str, 
        password: str,
        account_type: str = enums.UserAccountType.SUPER_ADMINISTRATOR.value,
        **extra_fields,
    ):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)

        assert (
            account_type == enums.UserAccountType.SUPER_ADMINISTRATOR.value
            and account_type in enums.UserAccountType.values()
        )
        extra_fields.setdefault("account_type", account_type)
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, first_name, last_name, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin, BaseModelMixin):
    """Default account profiles for Balanced Plate backend"""

    first_name = models.CharField(
        _("First Name"), null=False, blank=False, max_length=255
    )
    last_name = models.CharField(_("Last Name"), null=False, blank=False, max_length=255)
    email = models.EmailField(
        _("Email"), null=True, blank=False, max_length=225, unique=True
    )
    is_email_verified = models.BooleanField(
        _("Email Verified?"), default=False, blank=True, null=False
    )
    account_type = models.CharField(
        _("Account Type"),
        choices=enums.UserAccountType.choices(),
        null=False,
        blank=True,
        default=enums.UserAccountType.USER.value,
        max_length=20,
    )
    dob = models.DateField(_("Date of Birth"), null=True, blank=True)
    gender = models.CharField(
        _("Gender"),
        choices=enums.UserGenderType.choices(),
        null=True,
        blank=True,
        max_length=50,
    )
    is_banned = models.BooleanField(
        _("User account has been banned"), null=False, blank=False, default=False
    )
    ban_expiry_date = models.DateTimeField(
        _("User account ban expiry date"), null=True, blank=True
    )
    ban_duration_in_minutes = models.PositiveIntegerField(
        _("Ban duration in minutes"), null=False, blank=False, default=0
    )
    phone_number = models.CharField(
        _("Phone Number"), max_length=50, null=True, blank=True, unique=True
    )
    is_phone_number_verified = models.BooleanField(
        _("Phone Number Verified?"), default=False, blank=True, null=False
    )
    country = models.CharField(_("Country"), null=True, blank=True, max_length=255)
    state = models.CharField(_("State"), null=True, blank=True, max_length=255)
    city = models.CharField(_("City"), null=True, blank=True, max_length=255)
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = AccountManager()

    class Meta:
        verbose_name = _("Account")
        verbose_name_plural = _("Accounts")


    def retrieve_auth_token(self):
        data = {}
        refresh = RefreshToken.for_user(self)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        return data

    def __str__(self):
        return f"< {type(self).__name__}({self.id}) ({self.first_name})  {self.email}>"


class UserSession(BaseModelMixin):
    user = models.ForeignKey(
        Account, 
        on_delete=models.CASCADE,
        related_name="sessions",
        null=False
    )
    refresh = models.CharField(max_length=255, unique=True, null=True, blank=True)
    access = models.CharField(max_length=255, unique=True, null=True, blank=True)
    ip_address = models.CharField(max_length=255, null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Account Session"
        verbose_name_plural = "Account Sessions"

    def __str__(self):
        return f"{self.user.email} - {self.ip_address}"
