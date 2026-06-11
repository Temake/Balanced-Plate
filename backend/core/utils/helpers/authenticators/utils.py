OTP_PURPOSE_SIGNUP = "signup"
OTP_PURPOSE_PASSWORD_RESET = "password_reset"

class OTPReferenceHelpers:

    @staticmethod
    def get_otp_cache_reference(email, purpose):
        return f"otp:{purpose}:{email}"

    @staticmethod
    def get_verified_otp_cache_reference(email, purpose):
        return f"otp:{purpose}:{email}:verified"
