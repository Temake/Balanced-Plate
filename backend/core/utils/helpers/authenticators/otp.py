import hashlib
import secrets

from django.conf import settings

from core.utils.helpers.redis import RedisTools
from .utils import MAX_OTP_ATTEMPTS, OTPReferenceHelpers

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
        attempts_instance = RedisTools(
            cache_key=OTPReferenceHelpers.get_otp_attempts_cache_reference(email, purpose),
            ttl=ttl,
        )

        if not cache_instance.cache_value:
            return False

        attempts = attempts_instance.redis_get(default=0) or 0
        if attempts >= MAX_OTP_ATTEMPTS:
            # Guessed at too many times. Burn the code so it cannot be brute forced;
            # the user has to request a fresh one.
            cache_instance.redis_delete()
            attempts_instance.redis_delete()
            return False

        cached_otp = str(cache_instance.cache_value.get("otp") or "")
        # Compared as fixed width strings: `int()` made "000123", "123" and 123 all
        # equal, which both shrank the search space and blew up on non numeric input.
        # Zero padding keeps codes with a leading zero working when the client sends
        # the OTP as a number.
        supplied_otp = str(otp).strip().zfill(len(cached_otp))
        if cached_otp and secrets.compare_digest(cached_otp, supplied_otp):
            cache_instance.redis_delete()
            attempts_instance.redis_delete()
            return True

        attempts_instance.redis_set(attempts + 1)
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


class PasswordResetTokenHelpers:
    """Single use bearer token proving the holder completed the OTP step.

    The password change used to be authorised by `?email=<address>` plus a Redis
    "this email verified an OTP" flag. Since the caller supplied the email, the
    endpoint trusted the request to name its own subject, and the flag stayed valid
    for its whole TTL. A token that is issued once, resolves to the email server
    side, and is destroyed on use removes both properties.
    """

    @staticmethod
    def _digest(token):
        return hashlib.sha256(token.encode()).hexdigest()

    @classmethod
    def _instance(cls, token):
        return RedisTools(
            cache_key=OTPReferenceHelpers.get_password_reset_token_reference(
                cls._digest(token)
            ),
            ttl=getattr(settings, "OTP_VERIFIED_TTL_SECONDS"),
        )

    @classmethod
    def issue(cls, email):
        # Only the digest is stored, so a dump of the cache does not hand out usable
        # reset tokens.
        token = secrets.token_urlsafe(32)
        cls._instance(token).cache_value = {"email": email}
        return token

    @classmethod
    def consume(cls, token):
        """Resolve a token to its email and destroy it. Returns None if unusable."""
        if not token:
            return None
        cache_instance = cls._instance(token)
        payload = cache_instance.cache_value
        if not payload:
            return None
        cache_instance.redis_delete()
        return payload.get("email")
