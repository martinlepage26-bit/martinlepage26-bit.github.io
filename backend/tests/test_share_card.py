"""
Tests for /api/share-card and strict ISO date validator on ChartPayload.
"""
import io
import os
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _chart(birth_date="1990-08-29"):
    return {
        "birth_date": birth_date,
        "birth_place": "Montréal",
        "hemisphere": "N",
        "school_cutoff_month": 9,
        "school_cutoff_day": 1,
        "sign_name": "The Ripening",
        "sign_archetype": "Harvest that already decides what it will become",
        "elements": ["Fire", "Earth"],
        "solar_season": "summer",
        "civic_season": "School year starting",
        "cohort_position": "Oldest in class",
        "festival_proximity": "Near Labour Day",
        "weather_imprint": "Dry warmth, dust in the air",
    }


# ---- Share card: EN ----
def test_share_card_png_en(client):
    r = client.post(f"{API}/share-card",
                    json={"lang": "en", "chart": _chart()},
                    timeout=30)
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    body = r.content
    assert len(body) > 50_000, f"PNG too small: {len(body)} bytes"
    # PNG magic number
    assert body[:8] == b"\x89PNG\r\n\x1a\n"
    # Dimensions via PIL
    from PIL import Image
    img = Image.open(io.BytesIO(body))
    assert img.size == (1080, 1350), f"Expected 1080x1350, got {img.size}"


# ---- Share card: FR ----
def test_share_card_png_fr(client):
    r = client.post(f"{API}/share-card",
                    json={"lang": "fr", "chart": _chart()},
                    timeout=30)
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    from PIL import Image
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1350)
    assert len(r.content) > 50_000


# ---- Share card differs between EN / FR ----
def test_share_card_lang_variation(client):
    r_en = client.post(f"{API}/share-card", json={"lang": "en", "chart": _chart()}, timeout=30)
    r_fr = client.post(f"{API}/share-card", json={"lang": "fr", "chart": _chart()}, timeout=30)
    assert r_en.status_code == 200 and r_fr.status_code == 200
    assert r_en.content != r_fr.content, "EN and FR cards should have different content"


# ---- Strict ISO validator on /share-card ----
@pytest.mark.parametrize("bad_date", ["06/21/1992", "1992-6-21", "abc", "1992/06/21", "", "2020-13-01", "2020-02-30"])
def test_share_card_rejects_bad_date(client, bad_date):
    r = client.post(f"{API}/share-card",
                    json={"lang": "en", "chart": _chart(birth_date=bad_date)},
                    timeout=15)
    assert r.status_code == 422, f"Expected 422 for {bad_date!r}, got {r.status_code}: {r.text[:300]}"
    body = r.json()
    assert "detail" in body
    # make sure validation error mentions birth_date
    text = str(body).lower()
    assert "birth_date" in text or "iso" in text or "yyyy" in text


# ---- Strict ISO validator on /reading ----
@pytest.mark.parametrize("bad_date", ["06/21/1992", "1992-6-21", "abc"])
def test_reading_rejects_bad_date(client, bad_date):
    payload = {
        "lang": "en",
        "depth": "deep",
        "chart": _chart(birth_date=bad_date),
    }
    r = client.post(f"{API}/reading", json=payload, timeout=15)
    assert r.status_code == 422, f"Expected 422 for {bad_date!r}, got {r.status_code}"


def test_reading_accepts_iso_date(client):
    """Sanity: a well-formed ISO date should not raise 422 (accept 200)."""
    payload = {
        "lang": "en",
        "depth": "deep",
        "chart": _chart(birth_date="1990-08-29"),
    }
    r = client.post(f"{API}/reading", json=payload, timeout=90)
    # Should be 200 (LLM call). Not 422.
    assert r.status_code != 422, r.text
    assert r.status_code == 200, r.text
