from celery import shared_task
from loguru import logger

from django.core.mail import send_mail


@shared_task
def send_mail_async(subject, message, sender, recipients, html=None):
    send_mail(
        subject, 
        message, 
        sender, 
        recipients, 
        html_message=html, 
        fail_silently=False
    )
    logger.info(f"Email sent to {recipients} with subject: {subject}")
    return True