from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from .models import Account, UserSession
from django.contrib.auth.models import Group

admin.site.unregister(Group)


@admin.register(Account)
class UserAdmin(BaseUserAdmin, ModelAdmin):

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "password1", "password2"),
            },
        ),
    )
    fieldsets = (
        (
            _("User"),
            {
                "classes": ["tab"],
                "fields": (
                    "email",
                    "password",
                ),
            },
        ),
        (
            _("Personal info"),
            {
                "classes": ["tab"],
                "fields": (
                    "first_name",
                    "last_name",
                    "gender",
                    "dob",
                    "country",
                    "state",
                    "city",
                ),
            },
        ),
        (
            _("Meta Information"),
            {
                "classes": ["tab"],
                "fields": (
                    "phone_number",
                    "is_phone_number_verified",
                    "is_email_verified",
                    "account_type",
                ),
            },
        ),
        (
            _("Permissions"),
            {
                "classes": ["tab"],
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_banned",
                    "user_permissions",
                ),
            },
        ),
        (
            _("Important dates"),
            {
                "classes": ["tab"],
                "fields": ("last_login", "date_added", "date_last_modified"),
            },
        ),
    )

    list_display = [
        "email",
        "account_type",
        "id",
        "first_name",
        "last_name",
    ]
    search_fields = ["email", "first_name", "last_name"]
    readonly_fields = ["date_added", "date_last_modified"]
    ordering = ["email"]


@admin.register(UserSession)
class AccountSessionAdmin(ModelAdmin):
    list_display = ["user", "ip_address", "user_agent"]
