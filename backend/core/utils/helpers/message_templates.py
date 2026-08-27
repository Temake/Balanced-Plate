from django.conf import settings
from core.utils.commons.datetime import DateTime


class MessageTemplates:

    @staticmethod
    def signup_email_verification_email(otp: int):
        ttl_minutes = DateTime.seconds_to_minutes(settings.SIGNUP_OTP_TTL_SECONDS)
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                Thank you for creating an account with NutriLens! Please enter the verification code below to confirm your email address.
            </p>

            <div style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #059669; font-family: monospace;">
                    {otp}
                </span>
            </div>

            <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">
                ⏰ This code is valid for <strong>{ttl_minutes} minutes</strong>. If you did not create a NutriLens account, you can safely ignore this email.
            </p>
        """

    @staticmethod
    def password_reset_email(otp: str):
        ttl_minutes = DateTime.seconds_to_minutes(settings.PASSWORD_RESET_OTP_TTL_SECONDS)
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                We received a request to reset the password for your NutriLens account. Use the one-time code below to proceed with resetting your password:
            </p>

            <div style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #059669; font-family: monospace;">
                    {otp}
                </span>
            </div>

            <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">
                ⏰ This code is valid for <strong>{ttl_minutes} minutes</strong>. If you did not request a password reset, please secure your account or ignore this message.
            </p>
        """

    @staticmethod
    def welcome_email(name: str = ""):
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                Welcome to <strong>NutriLens</strong>! We are excited to support your journey toward balanced, nutritious, and culturally familiar food habits.
            </p>

            <p style="margin: 0 0 12px 0; color: #0f172a; font-weight: 600; font-size: 15px;">
                Here is what you can do right away:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 24px 0;">
                <tr>
                    <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                        <strong style="color: #059669;">📸 Scan Your Food:</strong> Snap any meal to get nutrient estimates and a 0–100 Nutritional Balance Score.
                    </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                    <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                        <strong style="color: #059669;">📅 7-Day Meal Planning:</strong> Build daily meals or generate full weekly schedules tailored to your goals.
                    </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                    <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                        <strong style="color: #059669;">👨‍🍳 Cooking Assistant:</strong> Step-by-step recipes with smart ingredient measurements and built-in timers.
                    </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                    <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <strong style="color: #059669;">📊 Weekly Health Insights:</strong> Condition-aware health tips and downloadable nutrition summaries.
                    </td>
                </tr>
            </table>

            <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px;">
                Ready to explore? Log in and scan your first meal!
            </p>
        """

    @staticmethod
    def subscription_renewal_reminder(plan_name: str, renewal_date: str):
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                Your NutriLens <strong>{plan_name}</strong> subscription will renew on <strong>{renewal_date}</strong>.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">
                Please ensure your payment method is active to continue enjoying uninterrupted meal analyses, weekly AI plans, and cooking assistant guides.
            </p>
        """

    @staticmethod
    def subscription_payment_failed(plan_name: str, grace_end: str):
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                We could not process the renewal payment for your NutriLens <strong>{plan_name}</strong> subscription.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">
                Your access remains active until <strong>{grace_end}</strong>. Please update your payment method from the billing dashboard to avoid service disruption.
            </p>
        """

    @staticmethod
    def subscription_expired(plan_name: str):
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                Your NutriLens <strong>{plan_name}</strong> subscription period has ended.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">
                Paid features are currently paused. You can renew anytime from your billing page to pick up right where you left off.
            </p>
        """

    @staticmethod
    def subscription_grace_expired(plan_name: str):
        return f"""
            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
                The grace period for your NutriLens <strong>{plan_name}</strong> subscription has ended.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">
                Paid features are now paused until your subscription is renewed.
            </p>
        """

