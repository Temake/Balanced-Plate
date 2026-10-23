from datetime import timedelta
from unittest import mock

from django.test import TestCase
from django.utils import timezone

from core.account.models import Account
from core.utils import enums

from .models import WeeklyRecommendation
from .tasks import generate_weekly_recommendations_for_all_users

run_weekly = generate_weekly_recommendations_for_all_users.call_local.__wrapped__


def last_week():
    today = timezone.localdate()
    end = today - timedelta(days=today.weekday() + 1)
    return end - timedelta(days=6), end


@mock.patch("core.recommendations.tasks.has_active_paid_subscription", return_value=True)
@mock.patch("core.recommendations.tasks.weekly_recommendation_service")
class WeeklyRecommendationCatchUpTests(TestCase):
    def setUp(self):
        self.done = Account.objects.create_user(
            email="done@example.com", first_name="A", last_name="B", password="x"
        )
        self.missing = Account.objects.create_user(
            email="missing@example.com", first_name="C", last_name="D", password="x"
        )
        start, end = last_week()
        WeeklyRecommendation.objects.create(
            owner=self.done,
            week_start_date=start,
            week_end_date=end,
            status=enums.WeeklyRecommendationStatus.COMPLETED.value,
        )

    def test_only_users_without_last_weeks_recommendation_are_generated(self, service, _paid):
        run_weekly()
        generated_for = [call.kwargs["user"] for call in service.generate_recommendation.call_args_list]
        self.assertEqual(generated_for, [self.missing])

    def test_one_failure_does_not_stop_the_run(self, service, _paid):
        other = Account.objects.create_user(
            email="other@example.com", first_name="E", last_name="F", password="x"
        )
        service.generate_recommendation.side_effect = [RuntimeError("gemini down"), mock.Mock()]
        result = run_weekly()
        self.assertEqual((result["success_count"], result["error_count"]), (1, 1))
        self.assertEqual(service.generate_recommendation.call_count, 2)
        self.assertNotIn(self.done, [c.kwargs["user"] for c in service.generate_recommendation.call_args_list])
        self.assertIsNotNone(other)
