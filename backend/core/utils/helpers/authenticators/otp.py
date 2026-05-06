import secrets

from django.conf import settings

from core.utils.helpers.redis import RedisTools
from .utils import OTPReferenceHelpers

class Token:
    def generate_otp(no_of_digits=6):
        return "".join(str(secrets.randbelow(10)) for i in range(no_of_digits))


class OTPHelpers:
    @staticmethod
    def cache_otp(email, purpose, ttl):
        cache_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_otp_cache_reference(email, purpose),
            ttl=ttl
        )
        otp = Token.generate_otp()
        cache_instance.cache_value = {
            "email": email,
            "otp": otp
        }

        return otp

    @staticmethod
    def verify_otp(email, purpose, ttl, otp):
        cache_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_otp_cache_reference(email, purpose),
            ttl=ttl
        )

        if not cache_instance.cache_value:
            return False
        
        cached_otp = cache_instance.cache_value.get("otp")
        if cached_otp and int(cached_otp) == int(otp):
            cache_instance.redis_delete()
            return True
        return False

    @staticmethod
    def mark_otp_verified(email, purpose):
        cache_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_verified_otp_cache_reference(email, purpose),
            ttl=getattr(settings, "OTP_VERIFIED_TTL_SECONDS")
        )
        cache_instance.cache_value = True

    @staticmethod
    def is_otp_verified(email, purpose):
        cache_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_verified_otp_cache_reference(email, purpose),
            ttl=getattr(settings, "OTP_VERIFIED_TTL_SECONDS")
        )
        return cache_instance.redis_get()

    @staticmethod
    def clear_otp_verified(email, purpose):
        cache_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_verified_otp_cache_reference(email, purpose),
            ttl=getattr(settings, "OTP_VERIFIED_TTL_SECONDS")
        )
        return cache_instance.redis_delete()
