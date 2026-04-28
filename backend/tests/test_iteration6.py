"""
GAIA Iteration 6 — HTTP tests against the deployed backend.

Covers:
  - /api/daily with optional on_date (birth-date trio)
  - /api/gaiascope (POST) personalized horoscope advice
  - Validation errors (422) for both endpoints
  - Regression sanity on unchanged endpoints
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
TIMEOUT = 60  # Claude calls can take 15-30s


# ---------------- /api/daily with on_date ----------------
class TestDailyOnDate:
    def test_daily_on_date_birth_trio(self):
        r = requests.get(
            f"{BASE_URL}/api/daily",
            params={"on_date": "1992-06-21", "hour": 14, "lang": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["date"] == "1992-06-21"
        assert d["month"] == 6
        assert d["sign_name"] == "The Threshold of Light"
        assert d["rising"] is not None
        assert d["rising"]["band"] == "midday"
        assert d["rising"]["name"] == "The Exposed Hour"
        assert d["moon"] is not None
        assert isinstance(d["moon"]["name"], str) and len(d["moon"]["name"]) > 0

    def test_daily_on_date_hour3_wraps_to_night(self):
        r = requests.get(
            f"{BASE_URL}/api/daily",
            params={"on_date": "2024-07-15", "hour": 3, "lang": "en"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        assert r.json()["rising"]["band"] == "night"

    def test_daily_on_date_wrong_format_returns_422(self):
        r = requests.get(
            f"{BASE_URL}/api/daily",
            params={"on_date": "06/21/92"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 422

    def test_daily_on_date_invalid_calendar_returns_422(self):
        r = requests.get(
            f"{BASE_URL}/api/daily",
            params={"on_date": "2024-02-30"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 422


# ---------------- /api/gaiascope ----------------
class TestGaiascope:
    def test_gaiascope_en_full(self):
        r = requests.post(
            f"{BASE_URL}/api/gaiascope",
            json={"lang": "en", "birth_date": "1992-08-29", "hour": 14},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user_sign_name"] == "The Ripening"
        assert isinstance(d["today_sign_name"], str) and len(d["today_sign_name"]) > 0
        assert isinstance(d["moon_name"], str) and len(d["moon_name"]) > 0
        assert isinstance(d["rising_name"], str) and len(d["rising_name"]) > 0
        assert isinstance(d["advice"], str)
        wc = len(d["advice"].split())
        assert 50 <= wc <= 220, f"advice word count {wc} out of range: {d['advice']}"
        # single paragraph (no double newline blocks)
        assert "\n\n" not in d["advice"].strip() or d["advice"].count("\n\n") <= 1

    def test_gaiascope_no_hour_rising_null(self):
        r = requests.post(
            f"{BASE_URL}/api/gaiascope",
            json={"lang": "en", "birth_date": "1992-08-29"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["rising_name"] is None
        assert d["user_sign_name"] == "The Ripening"
        assert isinstance(d["moon_name"], str) and len(d["moon_name"]) > 0
        assert isinstance(d["advice"], str) and len(d["advice"]) > 40

    def test_gaiascope_fr_returns_french(self):
        r = requests.post(
            f"{BASE_URL}/api/gaiascope",
            json={"lang": "fr", "birth_date": "1992-08-29", "hour": 14},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        text = d["advice"].lower()
        # Accept common FR function words or FR archetype markers
        fr_markers = [" le ", " la ", " tu ", " est ", " ton ", " tes ", "maturation", "aujourd"]
        assert any(m in (" " + text + " ") or m in text for m in fr_markers), d["advice"]

    def test_gaiascope_invalid_birthdate_format_422(self):
        r = requests.post(
            f"{BASE_URL}/api/gaiascope",
            json={"lang": "en", "birth_date": "08/29/92", "hour": 14},
            timeout=TIMEOUT,
        )
        assert r.status_code == 422

    def test_gaiascope_invalid_birthdate_calendar_422(self):
        r = requests.post(
            f"{BASE_URL}/api/gaiascope",
            json={"lang": "en", "birth_date": "2024-13-40", "hour": 14},
            timeout=TIMEOUT,
        )
        assert r.status_code == 422

    def test_gaiascope_hour_out_of_range_422(self):
        for bad in (24, -1):
            r = requests.post(
                f"{BASE_URL}/api/gaiascope",
                json={"lang": "en", "birth_date": "1992-08-29", "hour": bad},
                timeout=TIMEOUT,
            )
            assert r.status_code == 422, f"hour={bad} -> {r.status_code}"


# ---------------- Regression on unchanged endpoints ----------------
class TestRegression:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health", timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_daily_no_on_date(self):
        r = requests.get(f"{BASE_URL}/api/daily", params={"hour": 10, "lang": "en"}, timeout=TIMEOUT)
        assert r.status_code == 200
        d = r.json()
        assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", d["date"])
        assert d["rising"]["band"] == "morning"
        assert d["moon"] is not None

    def test_share_card_testimonial(self):
        chart = {
            "birth_date": "1992-06-21",
            "hemisphere": "N",
            "sign_name": "The Threshold of Light",
            "sign_archetype": "June",
            "elements": ["Fire", "Spirit"],
            "solar_season": "summer",
            "civic_season": "—",
            "cohort_position": "—",
            "festival_proximity": "—",
            "weather_imprint": "—",
        }
        r = requests.post(
            f"{BASE_URL}/api/share-card",
            json={
                "lang": "en",
                "chart": chart,
                "variant": "testimonial",
                "reading_excerpt": "The light is thin and honest today. Keep one intention un-said.",
            },
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        assert r.headers["content-type"] == "image/png"
        assert len(r.content) > 10_000  # non-trivial PNG

    def test_share_card_data(self):
        chart = {
            "birth_date": "1992-06-21", "hemisphere": "N",
            "sign_name": "The Threshold of Light", "sign_archetype": "June",
            "elements": ["Fire", "Spirit"], "solar_season": "summer",
            "civic_season": "—", "cohort_position": "—",
            "festival_proximity": "—", "weather_imprint": "—",
        }
        r = requests.post(f"{BASE_URL}/api/share-card",
                          json={"lang": "en", "chart": chart, "variant": "data"}, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.headers["content-type"] == "image/png"
