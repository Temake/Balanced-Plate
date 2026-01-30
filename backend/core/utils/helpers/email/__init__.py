from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe

from utils.tasks.mail import send_mail_async


class EmailClient:
    __slots__ = ["receiver_email", "receiver_name", "subject", "message", "template"]
    sender: str = settings.DEFAULT_FROM_EMAIL

    def __init__(
        self, receiver_email: str, subject: str, message: str, template: str, receiver_name: str = None
    ):
        self.receiver_email = receiver_email
        self.receiver_name = receiver_name or ""
        self.subject = subject
        self.message = mark_safe(message)
        self.template = template

    def get_context(self):
        context = {
            "subject": self.subject,
            "name": self.receiver_name,
            "message": self.message,
        }

        return context

    def send_mail(self):
        mail_body = render_to_string(self.template, self.get_context())
        send_mail_async.delay(
            self.subject, strip_tags(mail_body), self.sender, [self.receiver_email], mail_body
        )


class PasswordResetEmail(EmailClient):
    def __init__(self, user, otp):
        super().__init__(
            receiver_email=user.email,
            receiver_name=user.first_name,
            subject="Reset Your Password",
            message=''' 
            Here is your OTP for your password reset verification. Please ignore if you did not make this request.
            Note: The code is only valid for 5 minutes
            ''',
            template="email/password_reset.html",
        )
        self.one_time_password = otp
    
    
    def get_context(self):
        context = super().get_context()
        context.update({
            "otp": self.one_time_password
        })
        return context