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
        send_mail(
            self.subject,
            strip_tags(mail_body),
            "Balancedplate <{sender}>".format(sender=self.sender),
            [self.receiver_email],
            html_message=mail_body,
        )
