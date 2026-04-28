"""Unit tests for share_cards.pick_excerpt — isolated from HTTP layer."""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Allow running from repo root OR from /app/backend.
_HERE = Path(__file__).resolve()
_BACKEND = _HERE.parent.parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from share_cards import pick_excerpt  # noqa: E402


# ------------------------------------------------------------------
# Empty / degenerate inputs
# ------------------------------------------------------------------
def test_empty_string_returns_empty():
    assert pick_excerpt("") == ""


def test_none_returns_empty():
    # pick_excerpt guards on falsy input; None is falsy.
    assert pick_excerpt(None) == ""  # type: ignore[arg-type]


def test_whitespace_only_returns_empty():
    assert pick_excerpt("   \n\n  \t  ") == ""


def test_single_newline_only_returns_empty():
    assert pick_excerpt("\n\n\n") == ""


# ------------------------------------------------------------------
# Single-paragraph inputs
# ------------------------------------------------------------------
def test_short_single_paragraph_under_max_is_returned_verbatim():
    text = "You were born in light. Brief but real."
    # Shorter than any reasonable max, single paragraph → returned as-is.
    out = pick_excerpt(text, max_chars=320)
    assert out == text


def test_single_paragraph_at_exact_max_is_returned_verbatim():
    text = "a" * 320
    out = pick_excerpt(text, max_chars=320)
    assert out == text


def test_single_paragraph_over_max_trims_at_sentence_break():
    # First sentence > 120 chars so last_stop > 120 triggers the sentence-break cut.
    s1 = "You were born at the hinge of light, when the calendar exhales and the earth tilts full-face toward the long sun of June."
    s2 = "June holds the longest day, and you arrived in its widest breath."
    s3 = "Everything after is contraction toward winter."
    text = " ".join([s1, s2, s3])
    # Use a max just below s1+space+s2 so the cut must land after s1 or s2 — function picks last ". " in cut.
    out = pick_excerpt(text, max_chars=200)
    # Must end at a sentence break, no ellipsis, and be one of the prefixes through "."
    assert out.endswith(".")
    assert not out.endswith("…")
    assert out in {s1, f"{s1} {s2}"}


def test_single_paragraph_over_max_without_sentence_break_uses_ellipsis():
    # No sentence-ending punctuation → forced ellipsis after hard cut.
    text = "a" * 500
    out = pick_excerpt(text, max_chars=200)
    assert out.endswith("…")
    assert len(out) == 200 + 1  # 200 chars + single ellipsis


# ------------------------------------------------------------------
# Multi-paragraph inputs
# ------------------------------------------------------------------
def test_multi_paragraph_picks_first_substantive_paragraph():
    p1 = "Short opener."  # < 80 chars → skipped
    p2 = "You arrived in the long light of June, when the world feels widest and the year pauses to remember its warmth."  # ~117 chars, within range
    p3 = "A third paragraph that would also qualify but should not be chosen first."
    text = "\n\n".join([p1, p2, p3])
    out = pick_excerpt(text, max_chars=320)
    assert out == p2


def test_all_paragraphs_too_short_falls_back_to_first():
    p1 = "First."
    p2 = "Second."
    text = "\n\n".join([p1, p2])
    # None match the 80..320 band, so candidates==paragraphs → chosen = first.
    out = pick_excerpt(text, max_chars=320)
    assert out == p1


def test_paragraphs_separated_by_many_newlines_still_split():
    p1 = "A" * 90
    p2 = "B" * 90
    text = p1 + "\n\n\n\n\n" + p2
    out = pick_excerpt(text, max_chars=320)
    assert out == p1


def test_first_paragraph_too_long_is_trimmed():
    p1 = "Sentence one. " + ("Sentence two is longer and longer and longer. " * 20)
    p2 = "Short trailing paragraph."
    text = "\n\n".join([p1, p2])
    out = pick_excerpt(text, max_chars=200)
    # Must be trimmed (len ≤ ~201) and start with the first paragraph's opening.
    assert len(out) <= 201
    assert out.startswith("Sentence one.")


# ------------------------------------------------------------------
# Unicode
# ------------------------------------------------------------------
def test_unicode_french_accents_preserved():
    text = "Tu es né·e au cœur de l'été, quand le ciel éclaire les champs mûrs et l'âme retrouve sa chaleur d'enfance dans la lumière longue."
    out = pick_excerpt(text, max_chars=320)
    assert "é" in out and "œ" in out and "·" in out and "l'" in out
    assert out == text


def test_unicode_typographic_punctuation_respected_in_trim():
    # Use typographic quote + em-dash + ellipsis chars.
    text = "Tu arrives « au seuil » — entre deux saisons. Le calendrier te place là où tout pivote, et rien n'est jamais simple à cet endroit du temps, jamais."
    out = pick_excerpt(text, max_chars=80)
    # Expect ellipsis fallback because there's no ". " early enough.
    assert out.endswith(("…", ".", ". ")) or len(out) <= 81


def test_unicode_cjk_mixed_with_latin():
    text = "光の年輪 — you were born at the solstice. 夏至. The earth tipped full-face toward the sun."
    out = pick_excerpt(text, max_chars=320)
    assert "夏至" in out
    assert "solstice" in out


# ------------------------------------------------------------------
# Parametrized custom max_chars
# ------------------------------------------------------------------
@pytest.mark.parametrize("cap", [50, 120, 200, 400, 1000])
def test_respects_custom_max_chars_cap(cap: int):
    text = ("Beautiful long sentence about the calendar writing the person. " * 40).strip()
    out = pick_excerpt(text, max_chars=cap)
    # Output length must never exceed cap + 1 (sentence break or ellipsis tolerance).
    assert len(out) <= cap + 1


def test_exact_80_char_paragraph_is_quotable():
    # Boundary of the 80..max range in _pick_excerpt's filter.
    p80 = "X" * 80
    text = "tiny.\n\n" + p80
    out = pick_excerpt(text, max_chars=320)
    assert out == p80
