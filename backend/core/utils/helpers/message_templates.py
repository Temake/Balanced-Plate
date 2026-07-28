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

    @staticmethod
    def subscription_renewal_reminder(plan_name: str, renewal_date: str):
        return f"""
            <p>
                Your Balanced Plate {plan_name} subscription renews on {renewal_date}.
                Please make sure your payment method is ready so your analytics,
                reports, AI meal planning, and AI cooking guide access continue smoothly.
            </p>
        """

    @staticmethod
    def subscription_payment_failed(plan_name: str, grace_end: str):
        return f"""
            <p>
                We could not renew your Balanced Plate {plan_name} subscription.
                Your paid access will remain active until {grace_end}.
                Please update your payment method before then to keep using paid features.
            </p>
        """

    @staticmethod
    def subscription_expired(plan_name: str):
        return f"""
            <p>
                Your Balanced Plate {plan_name} subscription period has ended and we
                did not receive a renewal payment. Paid features are now paused.
                Renew from the billing page to pick up where you left off.
            </p>
        """

    @staticmethod
    def subscription_grace_expired(plan_name: str):
        return f"""
            <p>
                Your Balanced Plate {plan_name} subscription grace period has ended.
                Paid features are now paused until your subscription is renewed.
            </p>
        """
