from .base import *


DATABASES = {
    "default": {
        "ENGINE": env.str(
            "POSTGRESQL_ENGINE", "django.db.backends.postgresql_psycopg2"
        ),
        "NAME": env.str("POSTGRES_NAME", "***"),
        "USER": env.str("POSTGRES_USER", "***"),
        "PASSWORD": env.str("POSTGRES_PASSWORD", "***"),
        "HOST": env.str("POSTGRES_HOST", "*****"),
        "PORT": env.int("POSTGRES_PORT", 5432),
    },
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
