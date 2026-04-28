"""
Iteration 3: Tests for /api/share-card variant='testimonial' (pull-quote card).
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
        "sign_name": "The Ripening",
        "sign_archetype": "Harvest that already decides what it will become",
        "elements": ["Fire", "Earth"],
        "solar_season": "summer",
        "civic_season": "School year starting",
        "cohort_position": "Oldest in class",
        "festival_proximity": "Near Labour Day",
        "weather_imprint": "Dry warmth, dust in the air",
    }


LONG_EN = (
    "You were shaped in ripening heat, between harvest and institution. "
    "The light you remember is gold on dust, a summer that already knew it "
    "was turning. What the world asks of you is a steady counting — to "
    "notice what is ready, to release what has passed its sweetness, and "
    "to keep a generous ledger of your own fruiting seasons.\n\n"
    "A second paragraph with more depth that continues the thought and offers a grounded ritual."
)

LONG_FR = (
    "Tu as été façonné dans la chaleur mûrissante, entre la récolte et l'institution. "
    "La lumière dont tu te souviens est dorée sur la poussière, un été qui savait "
    "déjà qu'il tournait. Ce que le monde te demande, c'est un comptage patient — "
    "remarquer ce qui est prêt, relâcher ce qui a dépassé sa douceur, tenir un "
    "registre généreux de tes propres saisons de fructification.\n\n"
    "Un deuxième paragraphe qui approfondit la pensée et propose un geste concret."
)


# ---- Testimonial variant: EN returns valid PNG ----
def test_testimonial_png_en(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "testimonial",
              "reading_excerpt": LONG_EN, "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    body = r.content
    assert len(body) > 50_000, f"PNG too small: {len(body)} bytes"
    assert body[:8] == b"\x89PNG\r\n\x1a\n"
    from PIL import Image
    img = Image.open(io.BytesIO(body))
    assert img.size == (1080, 1350)


# ---- Testimonial variant: FR returns valid PNG and differs from EN ----
def test_testimonial_png_fr_differs_from_en(client):
    r_en = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "testimonial",
              "reading_excerpt": LONG_EN, "chart": _chart()},
        timeout=30,
    )
    r_fr = client.post(
        f"{API}/share-card",
        json={"lang": "fr", "variant": "testimonial",
              "reading_excerpt": LONG_FR, "chart": _chart()},
        timeout=30,
    )
    assert r_en.status_code == 200
    assert r_fr.status_code == 200
    assert r_en.content != r_fr.content, "EN and FR testimonial cards should be byte-different"
    from PIL import Image
    assert Image.open(io.BytesIO(r_fr.content)).size == (1080, 1350)


# ---- Testimonial variant: missing/empty excerpt → 400 ----
@pytest.mark.parametrize("excerpt", [None, "", "   ", "\n\n"])
def test_testimonial_missing_excerpt_400(client, excerpt):
    payload = {"lang": "en", "variant": "testimonial", "chart": _chart()}
    if excerpt is not None:
        payload["reading_excerpt"] = excerpt
    r = client.post(f"{API}/share-card", json=payload, timeout=15)
    assert r.status_code == 400, f"Expected 400 for excerpt={excerpt!r}, got {r.status_code}: {r.text[:200]}"
    body = r.json()
    assert "detail" in body
    assert "reading_excerpt" in str(body["detail"]).lower() or "excerpt" in str(body["detail"]).lower()


# ---- Data variant still works (default & explicit) ----
def test_data_variant_default_still_works(client):
    r = client.post(f"{API}/share-card", json={"lang": "en", "chart": _chart()}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    assert len(r.content) > 50_000


def test_data_variant_explicit_still_works(client):
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "data", "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert len(r.content) > 50_000


# ---- Data and testimonial should be visually distinct ----
def test_data_vs_testimonial_byte_differ(client):
    r_data = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "data", "chart": _chart()},
        timeout=30,
    )
    r_test = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "testimonial",
              "reading_excerpt": LONG_EN, "chart": _chart()},
        timeout=30,
    )
    assert r_data.status_code == 200 and r_test.status_code == 200
    assert r_data.content != r_test.content, "data and testimonial variants must produce different PNGs"


# ---- Testimonial variant handles very long excerpts gracefully ----
def test_testimonial_trims_long_excerpt(client):
    huge = ("This is a very long poetic paragraph about harvest and frost. " * 80)
    # huge is > 4800 chars
    assert len(huge) > 3000
    r = client.post(
        f"{API}/share-card",
        json={"lang": "en", "variant": "testimonial",
              "reading_excerpt": huge, "chart": _chart()},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("image/png")
    assert len(r.content) > 50_000
    from PIL import Image
    img = Image.open(io.BytesIO(r.content))
    assert img.size == (1080, 1350)
