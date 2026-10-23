from datetime import timedelta
from unittest import mock

from django.test import TestCase
from django.utils import timezone

from core.account.models import Account

from .models import BillingPlan, BillingPlanKey, Subscription, SubscriptionStatus
from .tasks import send_subscription_renewal_reminders

# The task body without the once-per-minute guard, so a test can run it repeatedly.
run_reminders = send_subscription_renewal_reminders.call_local.__wrapped__


@mock.patch("core.billing.tasks._send_subscription_email")
class RenewalReminderTests(TestCase):
    def setUp(self):
        self.user = Account.objects.create_user(
            email="renewal@example.com", first_name="Ada", last_name="Obi", password="x"
        )
        plan, _ = BillingPlan.objects.get_or_create(
            key=BillingPlanKey.PLUS, defaults={"name": "Plus"}
        )
        self.subscription, _ = Subscription.objects.update_or_create(
            owner=self.user,
            defaults={"plan": plan, "status": SubscriptionStatus.ACTIVE},
        )

    def renews_in(self, days, hours=12):
        self.subscription.current_period_end = timezone.now() + timedelta(days=days, hours=hours)
        self.subscription.save()

    def subjects(self, send_mock):
        return [call.args[1] for call in send_mock.call_args_list]

    def test_missed_seven_day_reminder_is_caught_up(self, send_mock):
        # The run on the day it was exactly 7 days out never happened.
        self.renews_in(5)
        run_reminders()
        self.assertEqual(self.subjects(send_mock), ["Subscription Renewal Reminder"])

    def test_reminder_is_sent_once_per_period(self, send_mock):
        self.renews_in(5)
        run_reminders()
        run_reminders()
        self.assertEqual(send_mock.call_count, 1)

    def test_previous_periods_reminder_does_not_block_this_one(self, send_mock):
        # Sent before last month's renewal; this used to suppress reminders forever.
        self.subscription.renewal_reminder_7d_sent_at = timezone.now() - timedelta(days=35)
        self.subscription.renewal_reminder_1d_sent_at = timezone.now() - timedelta(days=29)
        self.renews_in(5)
        run_reminders()
        self.assertEqual(self.subjects(send_mock), ["Subscription Renewal Reminder"])

    def test_late_catch_up_sends_only_the_one_day_reminder(self, send_mock):
        self.renews_in(1, hours=2)
        run_reminders()
        self.assertEqual(self.subjects(send_mock), ["Subscription Renews Tomorrow"])

    def test_far_off_renewal_sends_nothing(self, send_mock):
        self.renews_in(20)
        run_reminders()
        send_mock.assert_not_called()
