from django.core.management.base import BaseCommand
from django.conf import settings
from core.utils.helpers.email import EmailClient
from core.utils.tasks.mail import send_email_to_address


class Command(BaseCommand):
    help = "Test sending an email to verify Resend and backend email configuration"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            type=str,
            help="Email address to receive the test email",
        )
        parser.add_argument(
            "--async",
            action="store_true",
            dest="send_async",
            help="Send via Celery worker queue instead of direct synchronous call",
        )

    def handle(self, *args, **options):
        recipient = options["recipient"]
        send_async = options["send_async"]

        resend_key = getattr(settings, "RESEND_API_KEY", "") or ""
        masked_key = (
            f"{resend_key[:6]}...{resend_key[-4:]}"
            if len(resend_key) > 10
            else ("<NOT SET>" if not resend_key else "<INVALID/SHORT>")
        )
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "") or getattr(
            settings, "EMAIL_HOST_USER", "<NOT SET>"
        )

        self.stdout.write(self.style.NOTICE("═══════════════════════════════════════════"))
        self.stdout.write(self.style.NOTICE(" NutriLens Email Service Diagnostic"))
        self.stdout.write(self.style.NOTICE("═══════════════════════════════════════════"))
        self.stdout.write(f" RESEND_API_KEY     : {masked_key}")
        self.stdout.write(f" DEFAULT_FROM_EMAIL : {from_email}")
        self.stdout.write(f" Target Recipient   : {recipient}")
        self.stdout.write(f" Dispatch Mode      : {'Celery Async' if send_async else 'Synchronous Direct'}")
        self.stdout.write(self.style.NOTICE("───────────────────────────────────────────"))

        if not resend_key:
            self.stdout.write(
                self.style.ERROR(
                    "❌ ERROR: RESEND_API_KEY is not set in environment variables!\n"
                    "Please set RESEND_API_KEY in your .env.production file."
                )
            )
            return

        subject = "NutriLens Test Email"
        message = (
            "<p style='color: #059669; font-weight: bold;'>Hello from NutriLens!</p>"
            "<p>If you are seeing this email, your backend email configuration and Resend API integration are working correctly.</p>"
        )

        try:
            if send_async:
                self.stdout.write("Queueing test email to Celery (queue: email-notification)...")
                send_email_to_address.delay(
                    email_address=recipient,
                    subject=subject,
                    message=message,
                    name="Test User",
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Task queued to Celery successfully! Check celery-worker logs to confirm dispatch."
                    )
                )
            else:
                self.stdout.write("Sending email synchronously via Resend...")
                client = EmailClient(
                    receiver_email=recipient,
                    subject=subject,
                    message=message,
                    receiver_name="Test User",
                )
                response = client.send_mail()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Email sent successfully! Resend Response: {response}"
                    )
                )
        except Exception as exc:
            self.stdout.write(
                self.style.ERROR(f"❌ Failed to dispatch email: {exc}")
            )
            self.stdout.write(
                self.style.WARNING(
                    "\nCommon fixes:\n"
                    " 1. Ensure your sender domain is verified in Resend (https://resend.com/domains)\n"
                    " 2. Make sure DEFAULT_FROM_EMAIL is set to an address on your verified domain (e.g. noreply@nutrilens.site)\n"
                    " 3. Verify that RESEND_API_KEY begins with 're_' and has sending permissions."
                )
            )
