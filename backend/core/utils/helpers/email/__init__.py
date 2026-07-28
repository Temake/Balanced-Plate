import resend
from loguru import logger

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe


class EmailClient:
    __slots__ = ["receiver_email", "receiver_name", "subject", "message"]
    mail_template = "email/message.html"
    sender: str = settings.DEFAULT_FROM_EMAIL

    def __init__(
        self, receiver_email: str, subject: str, message: str, receiver_name: str = None
    ):
        self.receiver_email = receiver_email
        self.receiver_name = receiver_name or ""
        self.subject = subject
        self.message = mark_safe(message)

    def send_mail(self):

        context = {
            "subject": self.subject,
            "name": self.receiver_name,
            "message": self.message,
        }

        mail_body = render_to_string(self.mail_template, context)
        resend.api_key = settings.RESEND_API_KEY
        try:
            params = {
                "from": "NutriLens <{sender}>".format(sender=self.sender),
                "to": [self.receiver_email],
                "subject": self.subject,
                "html": mail_body,
            }
            email = resend.Emails.send(params)
        except Exception as e:
            logger.error(f"Failed to send email to {self.receiver_email}: {e}")
            raise e
    
