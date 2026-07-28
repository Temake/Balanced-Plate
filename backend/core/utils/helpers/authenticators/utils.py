OTP_PURPOSE_SIGNUP = "signup"
OTP_PURPOSE_PASSWORD_RESET = "password_reset"

# A 6 digit OTP only has 10^6 possibilities, so the code alone is not a credential.
# Burning it after this many wrong guesses is what makes guessing impractical, and it
# holds regardless of how many IP addresses an attacker rotates through.
MAX_OTP_ATTEMPTS = 5


class OTPReferenceHelpers:

    @staticmethod
    def get_otp_cache_reference(email, purpose):
        return f"otp:{purpose}:{email}"

    @staticmethod
    def get_verified_otp_cache_reference(email, purpose):
        return f"otp:{purpose}:{email}:verified"

    @staticmethod
    def get_otp_attempts_cache_reference(email, purpose):
        return f"otp:{purpose}:{email}:attempts"

    @staticmethod
    def get_password_reset_token_reference(token_digest):
        return f"password-reset-token:{token_digest}"
