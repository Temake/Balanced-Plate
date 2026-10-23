import datetime
from unittest import mock

from django.test import TestCase

from .models import Ingredient, PriceArea, PriceObservation
from .services import resolve_price
from .tasks import check_price_freshness

run_freshness_check = check_price_freshness.call_local.__wrapped__


class LatePriceFallbackTests(TestCase):
    """When a new month's prices haven't landed, the last known price is used."""

    def setUp(self):
        self.area = PriceArea.objects.create(name="Testville", state="Test")
        self.garri = Ingredient.objects.create(name="Test garri", unit="kg")

    def observe(self, price_naira, observed_on):
        return PriceObservation.objects.create(
            ingredient=self.garri,
            area=self.area,
            unit="kg",
            price_kobo=price_naira * 100,
            observed_on=observed_on,
        )

    def test_four_month_old_price_is_still_used_and_aged_for_inflation(self):
        self.observe(1000, datetime.date(2026, 6, 1))
        resolved = resolve_price(self.garri, self.area, as_of=datetime.date(2026, 10, 1))
        self.assertIsNotNone(resolved)
        self.assertTrue(resolved.was_projected)
        self.assertGreater(resolved.price_kobo, 1000 * 100)

    def test_newest_price_wins_once_it_arrives(self):
        self.observe(1000, datetime.date(2026, 6, 1))
        self.observe(1200, datetime.date(2026, 9, 1))
        resolved = resolve_price(self.garri, self.area, as_of=datetime.date(2026, 9, 15))
        self.assertEqual(resolved.price_kobo, 1200 * 100)

    def test_price_older_than_the_limit_is_dropped(self):
        self.observe(1000, datetime.date(2026, 1, 1))
        self.assertIsNone(resolve_price(self.garri, self.area, as_of=datetime.date(2026, 10, 1)))


@mock.patch("core.pricing.tasks.mail_tasks.send_email_to_address")
@mock.patch("core.pricing.tasks.timezone.localdate")
class PriceFreshnessAlertTests(TestCase):
    def setUp(self):
        # The seed migration writes estimates dated the day it ran; start clean.
        PriceObservation.objects.all().delete()
        area = PriceArea.objects.create(name="Alertville", state="Test")
        ingredient = Ingredient.objects.create(name="Test rice", unit="kg")
        self.observation = PriceObservation.objects.create(
            ingredient=ingredient, area=area, unit="kg", price_kobo=1, observed_on=datetime.date(2026, 6, 1)
        )

    def test_no_check_before_the_eleventh(self, today, send):
        today.return_value = datetime.date(2026, 10, 5)
        self.assertEqual(run_freshness_check(), {"checked": False})
        send.assert_not_called()

    def test_stale_prices_send_one_alert_per_week(self, today, send):
        today.return_value = datetime.date(2026, 10, 12)
        run_freshness_check()
        run_freshness_check()
        self.assertEqual(send.call_count, 1)
        self.assertIn("June 01, 2026", send.call_args.args[2])

    def test_fresh_prices_send_nothing(self, today, send):
        today.return_value = datetime.date(2026, 7, 15)
        result = run_freshness_check()
        self.assertFalse(result["stale"])
        send.assert_not_called()
