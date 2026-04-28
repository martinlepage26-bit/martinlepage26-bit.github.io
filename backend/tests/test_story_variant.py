"""
Iteration 4: Tests for /api/share-card variant='story' (1080x1920 Instagram-story sticker).
Also includes regression sanity for data + testimonial variants and unknown-variant validation.
"""
import io
import os
from pathlib import Path

import pytest
import requests
from PIL import Image

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
        "sign_name": "The Ripening",
        "sign_archetype": "Harvest that already decides what it will become",
        "elements": ["Fire", "Earth"],
        "solar_season": "summer",
        "civic_season": "School year starting",
        "cohort_position": "Oldest in class",
        "festival_proximity": "Near Labour Day",
        "weather_imprint": "Dry warmth, dust in the air",
    }


# ---- Story variant: EN returns 1080x1920 PNG ----
def test_story_png_en(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "story", "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    assert r.content[:8] == b"\x89PNG\r\n\x1a\n"
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1920), f"Expected 1080x1920, got {img.size}"


# ---- Story variant: FR returns 1080x1920 PNG and differs byte-wise from EN ----
def test_story_png_fr_differs_from_en(client):
    r_en = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "story", "chart": _chart()},
        timeout=30,
    )
    r_fr = client.post(
        f"{API}/share-card",
        json={"lang": "fr", "variant": "story", "chart": _chart()},
        timeout=30,
    )
    assert r_en.status_code == 200
    assert r_fr.status_code == 200
    assert Image.open(io.BytesIO(r_fr.content)).size == (1080, 1920)
    assert r_en.content != r_fr.content, "EN and FR story cards must be byte-different"


# ---- Story variant ignores reading_excerpt (does NOT require it) ----
def test_story_does_not_require_reading_excerpt(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "story", "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1920)


def test_story_accepts_but_ignores_excerpt(client):
    r = client.post(
        f"{API}/share-card",
        json={
            "lang": "en",
            "variant": "story",
            "reading_excerpt": "This should be ignored by the story renderer.",
            "chart": _chart(),
        },
        timeout=30,
    )
    assert r.status_code == 200
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1920)


# ---- Regression: default (no variant) returns 1080x1350 ----
def test_default_no_variant_returns_1080x1350(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1350)


# ---- Regression: testimonial still 1080x1350 ----
def test_testimonial_still_1080x1350(client):
    r = client.post(
        f"{API}/share-card",
        json={
            "lang": "en",
            "variant": "testimonial",
            "reading_excerpt": (
                "You were shaped in ripening heat, between harvest and institution. "
                "The light you remember is gold on dust, a summer that already knew "
                "it was turning. What the world asks of you is a steady counting."
            ),
            "chart": _chart(),
        },
        timeout=30,
    )
    assert r.status_code == 200
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1350)


# ---- Unknown variant → 422 from Pydantic Literal validation ----
def test_unknown_variant_returns_422(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "potato", "chart": _chart()},
        timeout=15,
    )
    assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text[:200]}"


# ---- Story variant must byte-differ from data variant ----
def test_story_differs_from_data(client):
    r_data = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "data", "chart": _chart()},
        timeout=30,
    )
    r_story = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "story", "chart": _chart()},
        timeout=30,
    )
    assert r_data.status_code == 200 and r_story.status_code == 200
    assert r_data.content != r_story.content
    assert Image.open(io.BytesIO(r_data.content)).size == (1080, 1350)
    assert Image.open(io.BytesIO(r_story.content)).size == (1080, 1920)
