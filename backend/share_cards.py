"""
GAIA — Share-card renderers (Pillow).

Three PNG variants:
 - `render_data_card(chart, lang)`        — 1080×1350 data-rich poster
 - `render_testimonial(chart, lang, x)`   — 1080×1350 editorial pull-quote
 - `render_story_sticker(chart, lang)`    — 1080×1920 Instagram-story sticker

All variants share a common starry/gold/moss background and bundled
Cormorant Garamond + Manrope fonts under ./fonts.
"""
from __future__ import annotations

import io
import random
import re
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

# ------------------------------------------------------------------
# Constants
# ------------------------------------------------------------------
FONTS_DIR = Path(__file__).parent / "fonts"
CARD_W, CARD_H = 1080, 1350
STORY_W, STORY_H = 1080, 1920

BG = (11, 13, 18)
SURFACE = (21, 25, 33)
GOLD = (212, 175, 55)
TEXT = (244, 241, 234)
MUTED = (156, 163, 175)
MOSS = (116, 135, 107)

ELEMENT_COLOR = {
    "Fire": (194, 122, 98),    # terracotta
    "Water": (110, 140, 168),  # water blue
    "Earth": (116, 135, 107),  # moss
    "Air": (163, 184, 204),    # pale blue
    "Spirit": (212, 175, 55),  # gold
    # French fallbacks
    "Feu": (194, 122, 98),
    "Eau": (110, 140, 168),
    "Terre": (116, 135, 107),
    "Esprit": (212, 175, 55),
}

SOLAR_FR = {
    "winter": "Hiver",
    "spring": "Printemps",
    "summer": "Été",
    "autumn": "Automne",
}


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONTS_DIR / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    """Greedy word-wrap to fit within max_w pixels."""
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        candidate = (cur + " " + w).strip()
        if draw.textlength(candidate, font=font) <= max_w:
            cur = candidate
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _draw_background(
    draw: ImageDraw.ImageDraw,
    w: int,
    h: int,
    seed: str,
) -> None:
    """Gold nebula bloom top-right, moss glow bottom-left, deterministic starfield."""
    for i, alpha in enumerate(range(55, 0, -2)):
        r = 460 + i * 10
        draw.ellipse(
            (w - 300 - r, -200 - r, w - 300 + r, -200 + r),
            fill=(*GOLD, max(0, alpha)),
        )
    for i, alpha in enumerate(range(45, 0, -2)):
        r = 440 + i * 10
        draw.ellipse(
            (-220 - r, h - 100 - r, -220 + r, h - 100 + r),
            fill=(*MOSS, max(0, alpha)),
        )
    rnd = random.Random(seed)
    for _ in range(220):
        x = rnd.randint(0, w)
        y = rnd.randint(0, h)
        rr = rnd.choice([1, 1, 1, 2, 2, 3])
        a = rnd.randint(90, 220)
        draw.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(*TEXT, a))


def _solar_label(value: str, lang: str) -> str:
    if lang == "fr":
        return SOLAR_FR.get(value.lower(), value.capitalize())
    return value.capitalize()


def pick_excerpt(reading: str, max_chars: int = 320) -> str:
    """Pick the first substantive paragraph, trimmed to ~max_chars at a sentence break."""
    if not reading:
        return ""
    paragraphs = [p.strip() for p in re.split(r"\n\n+", reading) if p.strip()]
    candidates = [p for p in paragraphs if 80 <= len(p) <= max_chars] or paragraphs
    if not candidates:
        return ""
    chosen = candidates[0]
    if len(chosen) > max_chars:
        cut = chosen[:max_chars]
        last_stop = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
        chosen = cut[: last_stop + 1] if last_stop > 120 else cut.rstrip() + "…"
    return chosen


def _to_png_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.read()


def _draw_header(draw: ImageDraw.ImageDraw, lang: str, brand_size: int = 56, tag_size: int = 20) -> None:
    """Shared top-left GAIA wordmark + tagline."""
    f_brand = _font("CormorantGaramond-Bold.ttf", brand_size)
    f_tag = _font("Manrope-Regular.ttf", tag_size)
    draw.text((70, 80), "GAIA", font=f_brand, fill=GOLD)
    tag = (
        "ASTROLOGIE DU CALENDRIER TERRESTRE" if lang == "fr"
        else "EARTH-CALENDAR ASTROLOGY"
    )
    draw.text((70, 80 + brand_size + 12), tag, font=f_tag, fill=MUTED)


def _draw_footer(draw: ImageDraw.ImageDraw, h: int, lang: str) -> None:
    """Shared bottom tagline + brand."""
    f_foot = _font("Manrope-Regular.ttf", 20)
    f_tag = _font("Manrope-Regular.ttf", 18)
    foot = (
        "Le calendrier écrit la personne." if lang == "fr"
        else "The calendar writes the person."
    )
    draw.text((70, h - 110), foot, font=f_foot, fill=GOLD)
    draw.text((70, h - 70), "gaia · earth-calendar astrology", font=f_tag, fill=MUTED)


def _draw_element_pills(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    elements: list[str],
    *,
    font_size: int = 22,
    pad_x: int = 22,
    pad_y: int = 8,
    height: int = 46,
    font_name: str = "Manrope-Regular.ttf",
) -> None:
    """Render element chip pills side-by-side starting at (x, y)."""
    f_pill = _font(font_name, font_size)
    cx = x
    for el in elements:
        color = ELEMENT_COLOR.get(el, GOLD)
        pw = int(draw.textlength(el.upper(), font=f_pill)) + pad_x * 2
        draw.rounded_rectangle(
            (cx, y, cx + pw, y + height),
            radius=height // 2,
            outline=color,
            width=2,
        )
        draw.text((cx + pad_x, y + pad_y), el.upper(), font=f_pill, fill=color)
        cx += pw + 12


# ------------------------------------------------------------------
# Data-rich chart card
# ------------------------------------------------------------------
def render_data_card(chart: Any, lang: str) -> bytes:
    """1080×1350 poster with sign title + element pills + labeled data rows."""
    img = Image.new("RGB", (CARD_W, CARD_H), BG)
    draw = ImageDraw.Draw(img, "RGBA")
    _draw_background(draw, CARD_W, CARD_H, chart.birth_date + chart.sign_name)
    _draw_header(draw, lang, brand_size=56, tag_size=20)

    # Sign title
    f_small_label = _font("Manrope-Regular.ttf", 22)
    label = "TON SIGNE DU CALENDRIER" if lang == "fr" else "YOUR CALENDAR SIGN"
    draw.text((70, 260), label, font=f_small_label, fill=MUTED)

    f_h1 = _font("CormorantGaramond-Bold.ttf", 96)
    sign_lines = _wrap(draw, chart.sign_name, f_h1, CARD_W - 140)
    y = 300
    for line in sign_lines:
        draw.text((70, y), line, font=f_h1, fill=GOLD)
        y += 96

    f_sub = _font("Manrope-Regular.ttf", 26)
    draw.text((70, y + 10), chart.sign_archetype, font=f_sub, fill=TEXT)
    y += 60 + 30

    _draw_element_pills(draw, 70, y, list(chart.elements))
    y += 70

    # Metadata rows on a subtle surface card
    card_y = y + 30
    card_h = 560
    draw.rounded_rectangle(
        (50, card_y, CARD_W - 50, card_y + card_h),
        radius=24,
        fill=(*SURFACE, 220),
        outline=(*GOLD, 40),
        width=1,
    )

    if lang == "fr":
        rows = [
            ("Date de naissance", chart.birth_date),
            ("Saison solaire", _solar_label(chart.solar_season, lang)),
            ("Saison civique", chart.civic_season),
            ("Cohorte", chart.cohort_position),
            ("Festival", chart.festival_proximity),
            ("Météo-corps", chart.weather_imprint),
        ]
    else:
        rows = [
            ("Birth date", chart.birth_date),
            ("Solar season", _solar_label(chart.solar_season, lang)),
            ("Civic season", chart.civic_season),
            ("Cohort", chart.cohort_position),
            ("Festival", chart.festival_proximity),
            ("Weather-body", chart.weather_imprint),
        ]

    f_row_label = _font("Manrope-Regular.ttf", 18)
    f_row_value = _font("Manrope-Regular.ttf", 22)
    rx = 90
    ry = card_y + 40
    for label_txt, value in rows:
        draw.text((rx, ry), label_txt.upper(), font=f_row_label, fill=MUTED)
        wrapped = _wrap(draw, value, f_row_value, CARD_W - 2 * rx)
        ty = ry + 28
        for line in wrapped[:2]:
            draw.text((rx, ty), line, font=f_row_value, fill=TEXT)
            ty += 30
        ry = ty + 16
        if ry > card_y + card_h - 60:
            break

    _draw_footer(draw, CARD_H, lang)
    return _to_png_bytes(img)


# ------------------------------------------------------------------
# Testimonial / pull-quote card
# ------------------------------------------------------------------
def render_testimonial(chart: Any, lang: str, excerpt_source: str) -> bytes:
    """1080×1350 editorial pull-quote poster featuring a reading excerpt."""
    img = Image.new("RGB", (CARD_W, CARD_H), BG)
    draw = ImageDraw.Draw(img, "RGBA")
    _draw_background(draw, CARD_W, CARD_H, chart.birth_date + chart.sign_name)
    _draw_header(draw, lang, brand_size=44, tag_size=18)

    # Decorative opening quote mark
    f_quote = _font("CormorantGaramond-Bold.ttf", 240)
    draw.text((60, 180), "\u201c", font=f_quote, fill=(*GOLD, 170))

    # Excerpt — large serif body, auto-sized to fit
    excerpt = pick_excerpt(excerpt_source, max_chars=360) or (
        "Un texte est requis pour cette variante." if lang == "fr"
        else "An excerpt is required for this variant."
    )
    max_w = CARD_W - 170
    chosen_size = 34
    chosen_lines: list[str] = []
    for size in (54, 50, 46, 42, 38, 34):
        f_body = _font("CormorantGaramond-Medium.ttf", size)
        lines = _wrap(draw, excerpt, f_body, max_w)
        if len(lines) <= 10:
            chosen_size = size
            chosen_lines = lines
            break
    else:
        chosen_lines = _wrap(draw, excerpt, _font("CormorantGaramond-Medium.ttf", 34), max_w)

    f_body = _font("CormorantGaramond-Medium.ttf", chosen_size)
    y = 400
    line_height = int(chosen_size * 1.3)
    for line in chosen_lines[:12]:
        draw.text((85, y), line, font=f_body, fill=TEXT)
        y += line_height

    # Rule + attribution block
    rule_y = y + 40
    draw.rectangle((85, rule_y, 200, rule_y + 2), fill=GOLD)

    f_attr_label = _font("Manrope-Regular.ttf", 18)
    f_attr_name = _font("CormorantGaramond-Bold.ttf", 46)
    f_attr_sub = _font("Manrope-Regular.ttf", 22)
    draw.text(
        (85, rule_y + 28),
        "SIGNE DU CALENDRIER" if lang == "fr" else "CALENDAR SIGN",
        font=f_attr_label,
        fill=MUTED,
    )
    draw.text((85, rule_y + 60), chart.sign_name, font=f_attr_name, fill=GOLD)
    draw.text(
        (85, rule_y + 120),
        f"{chart.sign_archetype}  \u00b7  {chart.birth_date}",
        font=f_attr_sub,
        fill=TEXT,
    )

    _draw_element_pills(
        draw,
        85,
        rule_y + 170,
        list(chart.elements),
        font_size=20,
        pad_x=18,
        height=42,
        font_name="Manrope-SemiBold.ttf",
    )

    _draw_footer(draw, CARD_H, lang)
    return _to_png_bytes(img)


# ------------------------------------------------------------------
# Story-sticker card (Instagram Story, 1080×1920)
# ------------------------------------------------------------------
def _center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font,
    fill,
    w: int,
) -> None:
    """Horizontally center a single line of text at y within width w."""
    tw = draw.textlength(text, font=font)
    draw.text(((w - tw) // 2, y), text, font=font, fill=fill)


def render_story_sticker(chart: Any, lang: str) -> bytes:
    """1080×1920 Instagram-story sticker: centered, sparse, glance-able."""
    w, h = STORY_W, STORY_H
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img, "RGBA")
    _draw_background(draw, w, h, chart.birth_date + chart.sign_name)

    # Top brand block (centered)
    f_brand = _font("CormorantGaramond-Bold.ttf", 64)
    f_tag = _font("Manrope-Regular.ttf", 20)
    _center_text(draw, "GAIA", 140, f_brand, GOLD, w)
    tag = (
        "ASTROLOGIE DU CALENDRIER TERRESTRE" if lang == "fr"
        else "EARTH-CALENDAR ASTROLOGY"
    )
    _center_text(draw, tag, 220, f_tag, MUTED, w)

    # Small label
    f_label = _font("Manrope-Regular.ttf", 22)
    label = "TON SIGNE DU CALENDRIER" if lang == "fr" else "YOUR CALENDAR SIGN"
    _center_text(draw, label, 560, f_label, MUTED, w)

    # Huge sign name — auto-size to fit width
    max_w_title = w - 160
    chosen_size = 72
    for size in (128, 116, 104, 96, 88, 80, 72):
        f_h = _font("CormorantGaramond-Bold.ttf", size)
        if draw.textlength(chart.sign_name, font=f_h) <= max_w_title:
            chosen_size = size
            break
    f_h = _font("CormorantGaramond-Bold.ttf", chosen_size)
    # If still too wide, wrap to 2 lines
    title_lines = _wrap(draw, chart.sign_name, f_h, max_w_title)
    line_h = int(chosen_size * 1.05)
    title_y = 620
    for line in title_lines[:2]:
        _center_text(draw, line, title_y, f_h, GOLD, w)
        title_y += line_h

    # Subtitle line: archetype · date
    f_sub = _font("Manrope-Regular.ttf", 28)
    subtitle = f"{chart.sign_archetype}  \u00b7  {chart.birth_date}"
    _center_text(draw, subtitle, title_y + 20, f_sub, TEXT, w)

    # Gold rule divider
    rule_y = title_y + 90
    rule_w = 140
    draw.rectangle(((w - rule_w) // 2, rule_y, (w + rule_w) // 2, rule_y + 2), fill=GOLD)

    # Centered element chips
    f_chip = _font("Manrope-SemiBold.ttf", 22)
    chips = [el.upper() for el in chart.elements]
    pad_x, height = 24, 52
    chip_widths = [int(draw.textlength(c, font=f_chip)) + pad_x * 2 for c in chips]
    gap = 16
    row_w = sum(chip_widths) + gap * (len(chips) - 1)
    cx = (w - row_w) // 2
    chip_y = rule_y + 46
    for c, cw in zip(chips, chip_widths):
        color = ELEMENT_COLOR.get(c.capitalize(), ELEMENT_COLOR.get(c, GOLD))
        draw.rounded_rectangle(
            (cx, chip_y, cx + cw, chip_y + height),
            radius=height // 2,
            outline=color,
            width=2,
        )
        draw.text((cx + pad_x, chip_y + 12), c, font=f_chip, fill=color)
        cx += cw + gap

    # Solar season badge underneath
    f_season_label = _font("Manrope-Regular.ttf", 18)
    f_season_value = _font("CormorantGaramond-Medium.ttf", 42)
    season_y = chip_y + 140
    _center_text(
        draw,
        ("SAISON SOLAIRE" if lang == "fr" else "SOLAR SEASON"),
        season_y,
        f_season_label,
        MUTED,
        w,
    )
    _center_text(
        draw,
        _solar_label(chart.solar_season, lang),
        season_y + 30,
        f_season_value,
        TEXT,
        w,
    )

    # Bottom tagline + brand
    f_foot = _font("Manrope-Regular.ttf", 22)
    foot = (
        "Le calendrier écrit la personne." if lang == "fr"
        else "The calendar writes the person."
    )
    _center_text(draw, foot, h - 200, f_foot, GOLD, w)
    _center_text(draw, "gaia \u00b7 earth-calendar astrology", h - 150, f_tag, MUTED, w)

    return _to_png_bytes(img)
