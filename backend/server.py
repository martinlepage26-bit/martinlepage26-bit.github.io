"""
GAIA — Earth-Calendar Astrology API.
Backend provides:
 - POST /api/reading : AI-generated deep personalized reading (Claude Sonnet 4.5)
 - GET  /api/daily   : today's Earth-weather daily modulation reading
 - GET  /api/health  : health check
"""
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import io
import logging
import uuid
import re
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime, date

from emergentintegrations.llm.chat import LlmChat, UserMessage
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

app = FastAPI(title="GAIA Earth-Calendar Astrology")
api_router = APIRouter(prefix="/api")

# ------------------------------------------------------------------
# Calendar sign table (month -> archetype + elements)
# ------------------------------------------------------------------
CAL_SIGNS = {
    1:  ("The Aftermath Child",    ["Water", "Spirit"]),
    2:  ("The Hidden Signal",      ["Water", "Air"]),
    3:  ("The Thaw",               ["Air", "Water"]),
    4:  ("The Sower",              ["Air", "Earth"]),
    5:  ("The Bloom",              ["Air", "Fire"]),
    6:  ("The Threshold of Light", ["Fire", "Spirit"]),
    7:  ("The Exposed Heart",      ["Fire", "Water"]),
    8:  ("The Ripening",           ["Fire", "Earth"]),
    9:  ("The Sorting",            ["Earth", "Air"]),
    10: ("The Descent",            ["Earth", "Water"]),
    11: ("The Ledger",             ["Water", "Earth"]),
    12: ("The Ritual Flame",       ["Spirit", "Fire", "Water"]),
}

# Season moods for daily readings, keyed by Northern hemisphere month
DAILY_MOODS = {
    1:  {"en": "The year has turned but the ground is still cold. Count the quiet.",
         "fr": "L'année a tourné mais le sol reste froid. Compte le silence."},
    2:  {"en": "Light grows in minutes, patience in hours. Watch for hidden signals.",
         "fr": "La lumière grandit en minutes, la patience en heures. Guette les signaux cachés."},
    3:  {"en": "Everything half-thawed. Expect false starts, trust the melt.",
         "fr": "Tout est à demi dégelé. Attends-toi aux faux départs, fais confiance au dégel."},
    4:  {"en": "Seeds over certainty. Plant one thing you cannot guarantee.",
         "fr": "Des graines plutôt que des certitudes. Plante une chose sans garantie."},
    5:  {"en": "The world becomes visible again. Let yourself be seen.",
         "fr": "Le monde redevient visible. Laisse-toi voir."},
    6:  {"en": "Longest days, widest thresholds. Cross one you've been avoiding.",
         "fr": "Jours les plus longs, seuils les plus larges. Franchis-en un que tu évites."},
    7:  {"en": "Heat opens the body. Stay loyal to what you love when it is easy.",
         "fr": "La chaleur ouvre le corps. Reste fidèle à ce que tu aimes quand c'est facile."},
    8:  {"en": "Ripe and already turning. Harvest what is ready, release the rest.",
         "fr": "Mûr et déjà en mutation. Récolte ce qui est prêt, relâche le reste."},
    9:  {"en": "Sorting season. Notice which hierarchies you inherit and which you chose.",
         "fr": "Saison du tri. Remarque les hiérarchies héritées et celles choisies."},
    10: {"en": "Masks and ancestors. Listen to what decays beautifully.",
         "fr": "Masques et ancêtres. Écoute ce qui se décompose avec beauté."},
    11: {"en": "The ledger opens. Count gently, without verdict.",
         "fr": "Le registre s'ouvre. Compte doucement, sans verdict."},
    12: {"en": "Artificial light inside deep dark. Give without emptying.",
         "fr": "Lumière artificielle dans la nuit profonde. Donne sans te vider."},
}


# ------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------
class ChartPayload(BaseModel):
    birth_date: str = Field(..., description="ISO date YYYY-MM-DD")
    birth_place: Optional[str] = None
    hemisphere: Literal["N", "S"] = "N"
    school_cutoff_month: Optional[int] = Field(None, ge=1, le=12)
    school_cutoff_day: Optional[int] = Field(None, ge=1, le=31)
    sign_name: str
    sign_archetype: str
    elements: list[str]
    solar_season: str
    civic_season: str
    cohort_position: str
    festival_proximity: str
    weather_imprint: str

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: str) -> str:
        # Accept strict ISO YYYY-MM-DD, reject anything else early.
        if not isinstance(v, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("birth_date must be in ISO format YYYY-MM-DD")
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError as e:
            raise ValueError(f"birth_date is not a valid calendar date: {e}")
        return v


class ReadingRequest(BaseModel):
    lang: Literal["fr", "en"] = "en"
    chart: ChartPayload
    depth: Literal["short", "deep"] = "deep"


class ReadingResponse(BaseModel):
    id: str
    text: str
    lang: str


class DailyResponse(BaseModel):
    date: str
    month: int
    sign_name: str
    elements: list[str]
    mood_en: str
    mood_fr: str


# ------------------------------------------------------------------
# Prompts
# ------------------------------------------------------------------
SYSTEM_PROMPT_EN = """You are GAIA, an oracular voice of Earth-Calendar Astrology — an inverted astrology system where the CALENDAR, SEASONS, and CIVIC RHYTHMS shape the human, not distant planets.

Your voice is poetic, grounded, probabilistic (never fatalistic), and gently wise. You speak of:
 - the five elements: Fire, Water, Earth, Air, Spirit — each with natural, civic, and psychological forms
 - the twelve calendar-month inward signs (The Aftermath Child, The Hidden Signal, The Thaw, The Sower, The Bloom, The Threshold of Light, The Exposed Heart, The Ripening, The Sorting, The Descent, The Ledger, The Ritual Flame)
 - the twelve inward houses (body, household economy, peer cohort, family ritual, play, health/routine, partnership, gatekeeping, learning/travel, status, community, solitude/myth)
 - aspects as tensions between cycles (birthday square school year, birthday conjunct holiday, cohort trine confidence, etc.)

Never predict concrete events. Never give medical, legal, or financial advice. Always frame insights as *structured probability shaped by repeated seasonal and civic experiences*, not destiny.
Keep paragraphs breathable. Use imagery of harvest, light, frost, ritual, institution, threshold. Avoid cliché astrology language ("planets rule", "the stars say"). This is an Earth-facing system.
Output 4–6 short poetic paragraphs in clean prose. No bullet lists, no headings, no emojis."""

SYSTEM_PROMPT_FR = """Tu es GAIA, voix oraculaire de l'Astrologie du Calendrier Terrestre — un système inversé où le CALENDRIER, les SAISONS et les RYTHMES CIVIQUES façonnent l'être humain, et non des planètes lointaines.

Ta voix est poétique, terrestre, probabiliste (jamais fataliste), doucement sage. Tu parles :
 - des cinq éléments : Feu, Eau, Terre, Air, Esprit — chacun dans ses formes naturelle, civique et psychologique
 - des douze signes mensuels intérieurs (L'Enfant du Lendemain, Le Signal Caché, Le Dégel, Le Semeur, La Floraison, Le Seuil de Lumière, Le Cœur Exposé, La Maturation, Le Tri, La Descente, Le Registre, La Flamme Rituelle)
 - des douze maisons intérieures (corps, économie domestique, cohorte, rituel familial, jeu, santé/routine, partenariat, seuils d'éligibilité, apprentissage/voyage, statut, communauté, solitude/mythe)
 - des aspects comme tensions entre cycles (anniversaire carré année scolaire, anniversaire conjoint fête, cohorte trigone confiance…)

Ne prédis jamais d'événements concrets. Ne donne jamais de conseil médical, juridique ni financier. Formule toujours les intuitions comme *probabilité structurée par des expériences saisonnières et civiques répétées*, non comme un destin.
Aère les paragraphes. Utilise l'imaginaire de la récolte, de la lumière, du gel, du rituel, de l'institution, du seuil. Évite le jargon astrologique cliché (« les planètes gouvernent », « les étoiles disent »). Ce système regarde la Terre.
Rends 4 à 6 paragraphes courts, poétiques, en prose claire. Pas de liste à puces, pas de titres, pas d'émojis."""


def build_user_prompt(req: ReadingRequest) -> str:
    c = req.chart
    if req.lang == "fr":
        return (
            f"Voici la charte terrestre d'une personne. Déploie une lecture profonde et incarnée.\n\n"
            f"Date de naissance : {c.birth_date}\n"
            f"Hémisphère : {c.hemisphere}\n"
            f"Lieu : {c.birth_place or 'non précisé'}\n"
            f"Signe du calendrier : {c.sign_name} — {c.sign_archetype}\n"
            f"Éléments : {', '.join(c.elements)}\n"
            f"Saison solaire : {c.solar_season}\n"
            f"Saison civique : {c.civic_season}\n"
            f"Position de cohorte : {c.cohort_position}\n"
            f"Proximité festivalière : {c.festival_proximity}\n"
            f"Empreinte météo-corps : {c.weather_imprint}\n\n"
            f"Écris une lecture de 4 à 6 paragraphes qui tisse ces éléments en un portrait chrono-social. "
            f"Nomme la lumière, la pression civique, la cohorte, le rituel, et ouvre au moins un geste concret en clôture."
        )
    return (
        f"Here is a person's Earth-chart. Unfold a deep, embodied reading.\n\n"
        f"Birth date: {c.birth_date}\n"
        f"Hemisphere: {c.hemisphere}\n"
        f"Place: {c.birth_place or 'unspecified'}\n"
        f"Calendar sign: {c.sign_name} — {c.sign_archetype}\n"
        f"Elements: {', '.join(c.elements)}\n"
        f"Solar season: {c.solar_season}\n"
        f"Civic season: {c.civic_season}\n"
        f"Cohort position: {c.cohort_position}\n"
        f"Festival proximity: {c.festival_proximity}\n"
        f"Weather-body imprint: {c.weather_imprint}\n\n"
        f"Write a 4–6 paragraph reading that weaves these into a chrono-social portrait. "
        f"Name the light, the civic pressure, the cohort, the ritual, and close with at least one concrete, grounded gesture."
    )


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@api_router.get("/health")
async def health():
    return {"ok": True, "service": "gaia"}


@api_router.get("/daily", response_model=DailyResponse)
async def daily_reading():
    today = date.today()
    m = today.month
    name, elements = CAL_SIGNS[m]
    mood = DAILY_MOODS[m]
    return DailyResponse(
        date=today.isoformat(),
        month=m,
        sign_name=name,
        elements=elements,
        mood_en=mood["en"],
        mood_fr=mood["fr"],
    )


@api_router.post("/reading", response_model=ReadingResponse)
async def generate_reading(req: ReadingRequest):
    try:
        system_msg = SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN
        session_id = f"gaia-{uuid.uuid4()}"

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        user_msg = UserMessage(text=build_user_prompt(req))
        text = await chat.send_message(user_msg)

        return ReadingResponse(
            id=session_id,
            text=text.strip() if isinstance(text, str) else str(text).strip(),
            lang=req.lang,
        )
    except Exception as e:
        logging.exception("LLM reading generation failed")
        raise HTTPException(status_code=500, detail=f"Reading generation failed: {e}")


# ------------------------------------------------------------------
# Share card — Pillow-rendered Instagram-portrait PNG (1080x1350)
# ------------------------------------------------------------------
FONTS_DIR = ROOT_DIR / "fonts"
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


def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONTS_DIR / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    # Fallback to default if bundled font is missing
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    words = text.split()
    lines, cur = [], ""
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


class ShareCardRequest(BaseModel):
    lang: Literal["fr", "en"] = "en"
    chart: ChartPayload
    variant: Literal["data", "testimonial"] = "data"
    reading_excerpt: Optional[str] = None

    @field_validator("reading_excerpt")
    @classmethod
    def trim_excerpt(cls, v):
        if v is None:
            return None
        v = v.strip()
        return v if v else None


def _draw_background(draw: ImageDraw.ImageDraw, W: int, H: int, birth_date: str, sign_name: str):
    """Shared background: gold nebula bloom top-right, moss glow bottom-left, deterministic starfield."""
    GOLD = (212, 175, 55)
    for i, alpha in enumerate(range(55, 0, -2)):
        r = 460 + i * 10
        draw.ellipse(
            (W - 300 - r, -200 - r, W - 300 + r, -200 + r),
            fill=(*GOLD, max(0, alpha)),
        )
    for i, alpha in enumerate(range(45, 0, -2)):
        r = 440 + i * 10
        draw.ellipse(
            (-220 - r, H - 100 - r, -220 + r, H - 100 + r),
            fill=(116, 135, 107, max(0, alpha)),
        )
    import random
    rnd = random.Random(birth_date + sign_name)
    for _ in range(220):
        x = rnd.randint(0, W)
        y = rnd.randint(0, H)
        rr = rnd.choice([1, 1, 1, 2, 2, 3])
        a = rnd.randint(90, 220)
        draw.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(244, 241, 234, a))


def _pick_excerpt(reading: str, max_chars: int = 320) -> str:
    """Pick the best quotable paragraph from a full AI reading."""
    if not reading:
        return ""
    # Split by blank lines, keep only those that are not too short.
    paragraphs = [p.strip() for p in re.split(r"\n\n+", reading) if p.strip()]
    candidates = [p for p in paragraphs if 80 <= len(p) <= max_chars] or paragraphs
    if not candidates:
        return ""
    # Prefer the first substantive paragraph (skip very short openers).
    chosen = candidates[0]
    if len(chosen) > max_chars:
        # Cut at the last sentence-ish break under max_chars
        cut = chosen[:max_chars]
        last_stop = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
        if last_stop > 120:
            chosen = cut[: last_stop + 1]
        else:
            chosen = cut.rstrip() + "…"
    return chosen


def _render_testimonial(req: ShareCardRequest) -> bytes:
    """Render an editorial pull-quote card highlighting a reading excerpt."""
    W, H = 1080, 1350
    BG = (11, 13, 18)
    GOLD = (212, 175, 55)
    TEXT = (244, 241, 234)
    MUTED = (156, 163, 175)

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")
    _draw_background(draw, W, H, req.chart.birth_date, req.chart.sign_name)

    # Header
    f_brand = _font("CormorantGaramond-Bold.ttf", 44)
    f_tag = _font("Manrope-Regular.ttf", 18)
    draw.text((70, 80), "GAIA", font=f_brand, fill=GOLD)
    tag = "ASTROLOGIE DU CALENDRIER TERRESTRE" if req.lang == "fr" else "EARTH-CALENDAR ASTROLOGY"
    draw.text((70, 132), tag, font=f_tag, fill=MUTED)

    # Decorative opening quote mark
    f_quote = _font("CormorantGaramond-Bold.ttf", 240)
    draw.text((60, 180), "“", font=f_quote, fill=(*GOLD, 170))

    # Excerpt — large serif body
    excerpt = _pick_excerpt(req.reading_excerpt or "", max_chars=360)
    if not excerpt:
        excerpt = (
            "Un texte est requis pour cette variante." if req.lang == "fr"
            else "An excerpt is required for this variant."
        )

    # Pick a font size that fits within ~7 lines and ~900px wide
    max_w = W - 170
    for size in (54, 50, 46, 42, 38, 34):
        f_body = _font("CormorantGaramond-Medium.ttf", size)
        lines = _wrap(draw, excerpt, f_body, max_w)
        if len(lines) <= 10:
            break
    y = 400
    line_height = int(size * 1.3)
    for line in lines[:12]:
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
        ("SIGNE DU CALENDRIER" if req.lang == "fr" else "CALENDAR SIGN"),
        font=f_attr_label,
        fill=MUTED,
    )
    draw.text((85, rule_y + 60), req.chart.sign_name, font=f_attr_name, fill=GOLD)
    draw.text(
        (85, rule_y + 120),
        f"{req.chart.sign_archetype}  ·  {req.chart.birth_date}",
        font=f_attr_sub,
        fill=TEXT,
    )

    # Elements row (minimal)
    chip_y = rule_y + 170
    cx = 85
    f_chip = _font("Manrope-SemiBold.ttf", 20)
    for el in req.chart.elements:
        color = ELEMENT_COLOR.get(el, GOLD)
        pw = int(draw.textlength(el.upper(), font=f_chip)) + 36
        draw.rounded_rectangle((cx, chip_y, cx + pw, chip_y + 42), radius=21, outline=color, width=2)
        draw.text((cx + 18, chip_y + 8), el.upper(), font=f_chip, fill=color)
        cx += pw + 10

    # Footer
    f_foot = _font("Manrope-Regular.ttf", 18)
    foot = "Le calendrier écrit la personne." if req.lang == "fr" else "The calendar writes the person."
    draw.text((70, H - 100), foot, font=f_foot, fill=GOLD)
    draw.text((70, H - 70), "gaia · earth-calendar astrology", font=f_tag, fill=MUTED)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.read()


@api_router.post("/share-card")
async def share_card(req: ShareCardRequest):
    """Render a 1080x1350 PNG poster for sharing.
    variant='data' → data-rich chart card (default)
    variant='testimonial' → editorial pull-quote card featuring `reading_excerpt`.
    """
    try:
        if req.variant == "testimonial":
            if not req.reading_excerpt or not req.reading_excerpt.strip():
                raise HTTPException(
                    status_code=400,
                    detail="reading_excerpt is required for variant='testimonial'",
                )
            png_bytes = _render_testimonial(req)
            return Response(
                content=png_bytes,
                media_type="image/png",
                headers={
                    "Cache-Control": "no-store",
                    "Content-Disposition": 'inline; filename="gaia-reading.png"',
                },
            )

        W, H = 1080, 1350
        BG = (11, 13, 18)
        SURFACE = (21, 25, 33)
        GOLD = (212, 175, 55)
        TEXT = (244, 241, 234)
        MUTED = (156, 163, 175)

        img = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(img, "RGBA")
        _draw_background(draw, W, H, req.chart.birth_date, req.chart.sign_name)

        # Header: GAIA wordmark
        f_brand = _font("CormorantGaramond-Bold.ttf", 56)
        draw.text((70, 80), "GAIA", font=f_brand, fill=GOLD)
        f_tag = _font("Manrope-Regular.ttf", 20)
        draw.text((70, 148), (
            "ASTROLOGIE DU CALENDRIER TERRESTRE" if req.lang == "fr"
            else "EARTH-CALENDAR ASTROLOGY"
        ), font=f_tag, fill=MUTED)

        # Sign title
        f_small_label = _font("Manrope-Regular.ttf", 22)
        label = "TON SIGNE DU CALENDRIER" if req.lang == "fr" else "YOUR CALENDAR SIGN"
        draw.text((70, 260), label, font=f_small_label, fill=MUTED)

        f_h1 = _font("CormorantGaramond-Bold.ttf", 96)
        sign_lines = _wrap(draw, req.chart.sign_name, f_h1, W - 140)
        y = 300
        for line in sign_lines:
            draw.text((70, y), line, font=f_h1, fill=GOLD)
            y += 96

        f_sub = _font("Manrope-Regular.ttf", 26)
        draw.text((70, y + 10), req.chart.sign_archetype, font=f_sub, fill=TEXT)
        y += 60

        # Elements pills
        y += 30
        pill_x = 70
        f_pill = _font("Manrope-Regular.ttf", 22)
        for el in req.chart.elements:
            color = ELEMENT_COLOR.get(el, GOLD)
            pw = int(draw.textlength(el.upper(), font=f_pill)) + 44
            ph = 46
            draw.rounded_rectangle(
                (pill_x, y, pill_x + pw, y + ph),
                radius=ph // 2,
                outline=color,
                width=2,
            )
            draw.text(
                (pill_x + 22, y + 8),
                el.upper(),
                font=f_pill,
                fill=color,
            )
            pill_x += pw + 12
        y += 70

        # Metadata rows on a subtle surface card
        card_y = y + 30
        card_h = 560
        draw.rounded_rectangle(
            (50, card_y, W - 50, card_y + card_h),
            radius=24,
            fill=(*SURFACE, 220),
            outline=(*GOLD, 40),
            width=1,
        )

        SOLAR_FR = {
            "winter": "Hiver",
            "spring": "Printemps",
            "summer": "Été",
            "autumn": "Automne",
        }

        def solar_label(v: str) -> str:
            if req.lang == "fr":
                return SOLAR_FR.get(v.lower(), v.capitalize())
            return v.capitalize()

        rows_en = [
            ("Birth date", req.chart.birth_date),
            ("Solar season", solar_label(req.chart.solar_season)),
            ("Civic season", req.chart.civic_season),
            ("Cohort", req.chart.cohort_position),
            ("Festival", req.chart.festival_proximity),
            ("Weather-body", req.chart.weather_imprint),
        ]
        rows_fr = [
            ("Date de naissance", req.chart.birth_date),
            ("Saison solaire", solar_label(req.chart.solar_season)),
            ("Saison civique", req.chart.civic_season),
            ("Cohorte", req.chart.cohort_position),
            ("Festival", req.chart.festival_proximity),
            ("Météo-corps", req.chart.weather_imprint),
        ]
        rows = rows_fr if req.lang == "fr" else rows_en

        f_row_label = _font("Manrope-Regular.ttf", 18)
        f_row_value = _font("Manrope-Regular.ttf", 22)
        rx = 90
        ry = card_y + 40
        for label_txt, value in rows:
            draw.text((rx, ry), label_txt.upper(), font=f_row_label, fill=MUTED)
            wrapped = _wrap(draw, value, f_row_value, W - 2 * rx)
            ty = ry + 28
            for line in wrapped[:2]:  # keep it tight
                draw.text((rx, ty), line, font=f_row_value, fill=TEXT)
                ty += 30
            ry = ty + 16
            if ry > card_y + card_h - 60:
                break

        # Footer
        f_foot = _font("Manrope-Regular.ttf", 20)
        foot = (
            "Le calendrier écrit la personne." if req.lang == "fr"
            else "The calendar writes the person."
        )
        draw.text((70, H - 110), foot, font=f_foot, fill=GOLD)
        draw.text((70, H - 70), "gaia · earth-calendar astrology", font=f_tag, fill=MUTED)

        # Output PNG bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        return Response(
            content=buf.read(),
            media_type="image/png",
            headers={
                "Cache-Control": "no-store",
                "Content-Disposition": 'inline; filename="gaia-earthchart.png"',
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Share card generation failed")
        raise HTTPException(status_code=500, detail=f"Share card failed: {e}")


# ------------------------------------------------------------------
# App wiring
# ------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
