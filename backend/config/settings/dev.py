from .base import *


INSTALLED_APPS += ["debug_toolbar"]
INTERNAL_IPS = ["127.0.0.1"]

if not PRODUCTION and USE_MEMORY_DATABASE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": env.str(
                "DJANGO_POSTGRESQL_ENGINE", "django.db.backends.postgresql_psycopg2"
            ),
            "NAME": env.str("DJANGO_POSTGRES_NAME", "***"),
            "USER": env.str("DJANGO_POSTGRES_USER", "***"),
            "PASSWORD": env.str("DJANGO_POSTGRES_PASSWORD", "***"),
            "HOST": env.str("DJANGO_POSTGRES_HOST", "*****"),
            "PORT": env.int("DJANGO_POSTGRES_PORT", 5432),
        },
    }


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATIC_URL = "/static/"


MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"