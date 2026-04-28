"""HTTP-level tests for /api/daily and /api/daily/deep."""
from __future__ import annotations

import os
import re

import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- /api/daily ---
class TestDailyEndpoint:
    def test_daily_no_hour_has_moon_no_rising(self, client):
        r = client.get(f"{BASE_URL}/api/daily")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["rising"] is None
        assert d["moon"] is not None
        assert d["moon"]["phase"] in {
            "new", "waxing_crescent", "first_quarter", "waxing_gibbous",
            "full", "waning_gibbous", "last_quarter", "waning_crescent",
        }
        assert d["mood_en"]
        assert d["mood_fr"]
        assert d["sign_name"]

    def test_daily_hour8_en_dawn(self, client):
        r = client.get(f"{BASE_URL}/api/daily", params={"hour": 8, "lang": "en"})
        assert r.status_code == 200
        d = r.json()
        assert d["rising"]["band"] == "dawn"
        assert d["rising"]["name"] == "The Threshold of Waking"
        assert d["moon"]["name"]  # English

    def test_daily_hour13_fr_midday(self, client):
        r = client.get(f"{BASE_URL}/api/daily", params={"hour": 13, "lang": "fr"})
        assert r.status_code == 200
        d = r.json()
        assert d["rising"]["band"] == "midday"
        assert d["rising"]["name"] == "L'Heure Exposée"
        assert d["rising"]["label"] == "Midi"
        # FR moon names are French (check against a FR word list)
        fr_moon_names = {
            "La Graine Neuve", "Le Souffle qui Monte", "Le Seuil de Décision",
            "La Presque-Pleine", "Le Miroir Ouvert", "La Descente Généreuse",
            "Le Seuil du Lâcher", "Le Seuil du Repos",
        }
        assert d["moon"]["name"] in fr_moon_names

    @pytest.mark.parametrize("bad_hour", [24, -1, 100])
    def test_daily_invalid_hour_422(self, client, bad_hour):
        r = client.get(f"{BASE_URL}/api/daily", params={"hour": bad_hour})
        assert r.status_code == 422

    @pytest.mark.parametrize(
        "hour,band",
        [(3, "night"), (6, "dawn"), (10, "morning"),
         (13, "midday"), (16, "afternoon"), (19, "evening"), (22, "night")],
    )
    def test_daily_band_mapping(self, client, hour, band):
        r = client.get(f"{BASE_URL}/api/daily", params={"hour": hour})
        assert r.status_code == 200
        assert r.json()["rising"]["band"] == band

    def test_daily_fr_has_french_fields(self, client):
        r = client.get(f"{BASE_URL}/api/daily", params={"lang": "fr", "hour": 8})
        d = r.json()
        assert d["rising"]["label"] == "Aube"
        assert d["moon"]["label"] in {
            "Nouvelle Lune", "Premier Croissant", "Premier Quartier",
            "Lune Gibbeuse Croissante", "Pleine Lune",
            "Lune Gibbeuse Décroissante", "Dernier Quartier", "Dernier Croissant",
        }


# --- /api/daily/deep ---
class TestDailyDeepEndpoint:
    def test_deep_en_hour10(self, client):
        r = client.post(
            f"{BASE_URL}/api/daily/deep",
            json={"lang": "en", "hour": 10},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"] and d["text"] and d["lang"] == "en"
        assert d["sign_name"]
        assert d["rising_name"] == "The Outbound"
        assert d["moon_name"]
        # 3 paragraphs separated by blank lines
        paras = re.split(r"\n\s*\n", d["text"].strip())
        assert len(paras) == 3, f"expected 3 paragraphs, got {len(paras)}"
        for p in paras:
            assert len(p.strip()) > 20

    def test_deep_fr_hour19(self, client):
        r = client.post(
            f"{BASE_URL}/api/daily/deep",
            json={"lang": "fr", "hour": 19},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["lang"] == "fr"
        low = d["text"].lower()
        assert any(w in low for w in ("crépuscule", "soir", "seuil"))

    @pytest.mark.parametrize("bad_hour", [25, -3, 100])
    def test_deep_invalid_hour_422(self, client, bad_hour):
        r = client.post(
            f"{BASE_URL}/api/daily/deep",
            json={"lang": "en", "hour": bad_hour},
        )
        assert r.status_code == 422

    def test_deep_bad_iso_date_422(self, client):
        r = client.post(
            f"{BASE_URL}/api/daily/deep",
            json={"lang": "en", "hour": 10, "iso_date": "bad-date"},
        )
        assert r.status_code == 422
