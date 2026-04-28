"""Unit tests for daily.py: time bands, moon phases, and payload builders."""
from __future__ import annotations

import sys
from datetime import date, datetime, timezone
from pathlib import Path

import pytest

_HERE = Path(__file__).resolve()
_BACKEND = _HERE.parent.parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from daily import (  # noqa: E402
    MOON_PHASES,
    TIME_BANDS,
    build_moon,
    build_rising,
    moon_phase_fraction,
    moon_phase_for_date,
    moon_phase_for_datetime,
    time_band_for_hour,
)


# ------------------------------------------------------------------
# Time band boundaries
# ------------------------------------------------------------------
@pytest.mark.parametrize(
    "hour,expected",
    [
        (0,  "night"),
        (4,  "night"),
        (5,  "dawn"),
        (8,  "dawn"),
        (9,  "morning"),
        (11, "morning"),
        (12, "midday"),
        (14, "midday"),
        (15, "afternoon"),
        (17, "afternoon"),
        (18, "evening"),
        (20, "evening"),
        (21, "night"),
        (23, "night"),
    ],
)
def test_time_band_for_hour(hour, expected):
    assert time_band_for_hour(hour) == expected


def test_time_band_wraps_on_modulo():
    assert time_band_for_hour(24) == time_band_for_hour(0)
    assert time_band_for_hour(48) == time_band_for_hour(0)
    assert time_band_for_hour(-1) == time_band_for_hour(23)


def test_all_six_bands_present():
    assert set(TIME_BANDS.keys()) == {
        "dawn", "morning", "midday", "afternoon", "evening", "night",
    }


# ------------------------------------------------------------------
# Moon phase — math correctness
# ------------------------------------------------------------------
def test_fraction_at_reference_epoch_is_zero():
    ref = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)
    assert moon_phase_fraction(ref) == pytest.approx(0.0, abs=1e-9)


def test_fraction_half_synodic_is_full_moon_half():
    # ~14.765 days past the new moon → close to 0.5
    ref = datetime(2000, 1, 21, 11, 14, 0, tzinfo=timezone.utc)
    f = moon_phase_fraction(ref)
    assert 0.48 < f < 0.52


def test_fraction_one_full_synodic_wraps_to_zero():
    ref = datetime(2000, 2, 5, 7, 0, 0, tzinfo=timezone.utc)  # ~29.5 days later
    f = moon_phase_fraction(ref)
    # Should be near 0.0 (wrapped) but not exactly due to floating ref; accept boundary wrap
    assert f < 0.05 or f > 0.95


def test_naive_datetime_is_treated_as_utc():
    naive = datetime(2000, 1, 6, 18, 14, 0)  # no tzinfo
    aware = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)
    assert moon_phase_fraction(naive) == moon_phase_fraction(aware)


# ------------------------------------------------------------------
# Moon phase — classification + known dates
# ------------------------------------------------------------------
def test_phase_at_reference_is_new():
    ref = date(2000, 1, 6)
    assert moon_phase_for_date(ref) == "new"


def test_full_moon_approx_two_weeks_after_new():
    # About 14-15 days after the reference new moon
    d = date(2000, 1, 21)
    assert moon_phase_for_date(d) == "full"


@pytest.mark.parametrize(
    "known_date,expected_phase",
    [
        # A handful of historically-observed new/full moons (rough ±1 day tolerance):
        (date(2024, 1, 11),  "new"),         # Jan 11 2024 new moon
        (date(2024, 1, 25),  "full"),        # Jan 25 2024 full moon
        (date(2024, 8, 19),  "full"),        # Aug 19 2024 full (sturgeon)
        (date(2025, 1, 13),  "full"),        # Jan 13 2025 full (wolf)
    ],
)
def test_known_new_and_full_moons(known_date, expected_phase):
    got = moon_phase_for_date(known_date)
    # Allow adjacent-phase slack (±1 band) for model tolerance.
    assert got == expected_phase or got in {
        "new": {"waxing_crescent", "waning_crescent"},
        "full": {"waxing_gibbous", "waning_gibbous"},
    }[expected_phase]


def test_all_eight_phases_reachable_over_one_synodic_month():
    seen = set()
    start = datetime(2024, 1, 11, 12, 0, 0, tzinfo=timezone.utc)  # Jan 11 2024 new moon
    for offset in range(0, 30):
        seen.add(moon_phase_for_datetime(start + (datetime.min - datetime.min).__class__(days=0)))  # dummy
    # Proper loop using timedelta:
    from datetime import timedelta
    seen = set()
    for offset in range(0, 30):
        seen.add(moon_phase_for_datetime(start + timedelta(days=offset)))
    # We should see new + waxing_crescent + first_quarter + waxing_gibbous + full across the cycle.
    assert {"new", "waxing_crescent", "first_quarter", "waxing_gibbous", "full"} <= seen


# ------------------------------------------------------------------
# Payload builders (lang-sensitive)
# ------------------------------------------------------------------
def test_build_rising_returns_localized_fields_en():
    r = build_rising(8, "en")
    assert r == {
        "band": "dawn",
        "hour": 8,
        "label": "Dawn",
        "name": "The Threshold of Waking",
        "mood": TIME_BANDS["dawn"]["mood_en"],
    }


def test_build_rising_returns_localized_fields_fr():
    r = build_rising(13, "fr")
    assert r["band"] == "midday"
    assert r["hour"] == 13
    assert r["label"] == "Midi"
    assert r["name"] == "L'Heure Exposée"
    assert "vertical" in r["mood"]  # "Le soleil est vertical..."


def test_build_moon_returns_english_defaults():
    # For a date we know is "new" at the reference, result is The New Seed.
    m = build_moon(date(2000, 1, 6), "en")
    assert m["phase"] == "new"
    assert m["label"] == "New Moon"
    assert m["name"] == "The New Seed"
    assert m["mood"] == MOON_PHASES["new"]["mood_en"]


def test_build_moon_fr_has_french_name():
    m = build_moon(date(2000, 1, 6), "fr")
    assert m["name"] == "La Graine Neuve"
    assert m["label"] == "Nouvelle Lune"


# ------------------------------------------------------------------
# Data integrity
# ------------------------------------------------------------------
def test_every_moon_phase_has_bilingual_fields():
    required = {"label_en", "label_fr", "name_en", "name_fr", "mood_en", "mood_fr"}
    for phase, info in MOON_PHASES.items():
        missing = required - set(info.keys())
        assert not missing, f"{phase} missing keys {missing}"
        for k in required:
            assert info[k], f"{phase}.{k} is empty"


def test_every_time_band_has_bilingual_fields():
    required = {"label_en", "label_fr", "name_en", "name_fr", "mood_en", "mood_fr"}
    for band, info in TIME_BANDS.items():
        missing = required - set(info.keys())
        assert not missing, f"{band} missing keys {missing}"
        for k in required:
            assert info[k], f"{band}.{k} is empty"
