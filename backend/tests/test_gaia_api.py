"""
GAIA Backend API tests — health, daily, reading (EN + FR, variation between births).
"""
import os
import pytest
import requests
from datetime import date

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to frontend .env file
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL must be set"

API = f"{BASE_URL}/api"

ARCHETYPES = {
    "The Aftermath Child", "The Hidden Signal", "The Thaw", "The Sower",
    "The Bloom", "The Threshold of Light", "The Exposed Heart", "The Ripening",
    "The Sorting", "The Descent", "The Ledger", "The Ritual Flame",
}


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
def test_health(client):
    r = client.get(f"{API}/health", timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j.get("ok") is True
    assert j.get("service") == "gaia"


# ---- Daily ----
def test_daily(client):
    r = client.get(f"{API}/daily", timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["date"] == date.today().isoformat()
    assert 1 <= j["month"] <= 12
    assert j["sign_name"] in ARCHETYPES
    assert isinstance(j["elements"], list) and len(j["elements"]) >= 2
    assert isinstance(j["mood_en"], str) and len(j["mood_en"]) > 5
    assert isinstance(j["mood_fr"], str) and len(j["mood_fr"]) > 5


# ---- Reading helpers ----
def _chart(birth_date: str, sign_name: str, archetype: str, elements: list):
    return {
        "birth_date": birth_date,
        "birth_place": "Montréal",
        "hemisphere": "N",
        "school_cutoff_month": 9,
        "school_cutoff_day": 1,
        "sign_name": sign_name,
        "sign_archetype": archetype,
        "elements": elements,
        "solar_season": "Late summer heat tilting toward harvest",
        "civic_season": "School year starting",
        "cohort_position": "Oldest in class",
        "festival_proximity": "Near Labour Day",
        "weather_imprint": "Dry warmth, dust in the air",
    }


# ---- Reading EN ----
def test_reading_en(client):
    payload = {
        "lang": "en",
        "depth": "deep",
        "chart": _chart(
            "1990-08-29", "The Ripening", "Harvest that already decides what it will become",
            ["Fire", "Earth"],
        ),
    }
    r = client.post(f"{API}/reading", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["lang"] == "en"
    assert isinstance(j["id"], str) and len(j["id"]) > 5
    assert isinstance(j["text"], str)
    # 4-6 paragraphs expected
    paras = [p for p in j["text"].split("\n\n") if p.strip()]
    assert len(paras) >= 3, f"Expected 3+ paragraphs, got {len(paras)}: {j['text'][:200]}"
    assert len(j["text"]) > 400


# ---- Reading FR ----
def test_reading_fr(client):
    payload = {
        "lang": "fr",
        "depth": "deep",
        "chart": _chart(
            "1985-12-25", "The Ritual Flame", "Flame held through the deepest dark",
            ["Spirit", "Fire", "Water"],
        ),
    }
    r = client.post(f"{API}/reading", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["lang"] == "fr"
    text = j["text"].lower()
    # Check for common French words / accented characters
    french_markers = ["é", "è", "à", "ê", " le ", " la ", " tu ", " les ", " une ", " un "]
    assert any(m in text for m in french_markers), f"No French markers found in: {text[:200]}"
    assert len(j["text"]) > 400


# ---- Reading variation ----
def test_reading_varies_between_births(client):
    p1 = {"lang": "en", "depth": "deep", "chart": _chart(
        "1990-08-29", "The Ripening", "Harvest",
        ["Fire", "Earth"])}
    p2 = {"lang": "en", "depth": "deep", "chart": _chart(
        "1985-12-25", "The Ritual Flame", "Flame in darkness",
        ["Spirit", "Fire", "Water"])}
    r1 = client.post(f"{API}/reading", json=p1, timeout=90)
    r2 = client.post(f"{API}/reading", json=p2, timeout=90)
    assert r1.status_code == 200 and r2.status_code == 200
    t1, t2 = r1.json()["text"], r2.json()["text"]
    assert t1 != t2, "Readings should differ between birth dates"
    # Overlap check — should not be largely identical
    common = len(set(t1.split()) & set(t2.split()))
    total = max(len(set(t1.split())), 1)
    assert common / total < 0.85, "Readings too similar"
