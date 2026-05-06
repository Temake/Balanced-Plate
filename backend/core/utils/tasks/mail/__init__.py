from celery import shared_task
from loguru import logger

from core.utils.helpers.email import EmailClient


@shared_task
def send_email_to_address(email_address, subject, message, name=""):
    email_messaging_helper = EmailClient(
        email_address, subject=subject, message=message, receiver_name=name
    )
    email_messaging_helper.send_mail()