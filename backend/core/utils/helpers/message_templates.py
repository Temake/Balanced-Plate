from django.conf import settings
from core.utils.commons.datetime import DateTime


class MessageTemplates:

    @staticmethod
    def signup_email_verification_email(otp: int):
        ttl_minutes = DateTime.seconds_to_minutes(settings.SIGNUP_OTP_TTL_SECONDS)
        message = f"""
            <p>
                Use the OTP below to verify your email address.
                Note: The code is only valid for {ttl_minutes} minutes.
            </p>

            <div style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                { otp }
            </div>
        """
        return message


    @staticmethod
    def password_reset_email(otp: str):
        ttl_minutes = DateTime.seconds_to_minutes(settings.PASSWORD_RESET_OTP_TTL_SECONDS)
        message = f"""
            <p>
                Here is your OTP for your password reset verification.
                Please ignore if you did not make this request.
                Note: The code is only valid for {ttl_minutes} minutes.
            </p>

            <div style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                { otp }
            </div>
        """
        return message