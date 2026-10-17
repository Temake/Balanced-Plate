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

    def __init__(
        self, receiver_email: str, subject: str, message: str, receiver_name: str = None
    ):
        self.receiver_email = receiver_email
        self.receiver_name = receiver_name or ""
        self.subject = subject
        self.message = mark_safe(message)

    @property
    def sender(self) -> str:
        sender_email = (
            getattr(settings, "DEFAULT_FROM_EMAIL", "")
            or getattr(settings, "EMAIL_HOST_USER", "")
            or "noreply@nutrilens.site"
        )
        return sender_email.strip()

    def send_mail(self):
        api_key = getattr(settings, "RESEND_API_KEY", "").strip()
        if not api_key:
            err_msg = (
                f"Cannot send email to {self.receiver_email}: "
                f"RESEND_API_KEY is not configured in backend environment variables."
            )
            logger.error(err_msg)
            raise ValueError(err_msg)

        context = {
            "subject": self.subject,
            "name": self.receiver_name,
            "message": self.message,
        }

        mail_body = render_to_string(self.mail_template, context)
        resend.api_key = api_key

        from_header = (
            self.sender
            if ("<" in self.sender and ">" in self.sender)
            else f"NutriLens <{self.sender}>"
        )

        try:
            params = {
                "from": from_header,
                "to": [self.receiver_email],
                "subject": self.subject,
                "html": mail_body,
            }
            email = resend.Emails.send(params)
            logger.info(
                f"Email successfully dispatched to {self.receiver_email} (subject: '{self.subject}')"
            )
            return email
        except Exception as e:
            logger.error(
                f"Failed to send email to {self.receiver_email} via Resend. "
                f"Sender: '{from_header}'. Error: {e}"
            )
            raise e
    
