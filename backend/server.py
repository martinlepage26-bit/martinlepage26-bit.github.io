"""
GAIA — Earth-Calendar Astrology API.

Routes:
 - POST /api/reading     : AI-generated deep personalized reading (Claude Sonnet 4.5)
 - POST /api/share-card  : 1080×1350 PNG poster (variants: 'data' | 'testimonial')
 - GET  /api/daily       : today's Earth-weather daily modulation reading
 - GET  /api/health      : health check

Share-card rendering lives in ./share_cards.py.
"""
from __future__ import annotations

import logging
import os
import re
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi import APIRouter, FastAPI, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

import daily as daily_mod
import share_cards

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

app = FastAPI(title="GAIA Earth-Calendar Astrology")
api_router = APIRouter(prefix="/api")

# ------------------------------------------------------------------
# Calendar sign table (month -> archetype + elements)
# ------------------------------------------------------------------
CAL_SIGNS: dict[int, tuple[str, list[str]]] = {
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


class DailyRising(BaseModel):
    band: str
    hour: int
    label: str
    name: str
    mood: str


class DailyMoon(BaseModel):
    phase: str
    label: str
    name: str
    mood: str


class DailyResponse(BaseModel):
    date: str
    month: int
    sign_name: str
    elements: list[str]
    mood_en: str
    mood_fr: str
    # New enriched layers (lang-scoped by `lang` query param)
    lang: Literal["en", "fr"] = "en"
    rising: Optional[DailyRising] = None
    moon: Optional[DailyMoon] = None


class DailyDeepRequest(BaseModel):
    lang: Literal["fr", "en"] = "en"
    hour: int = Field(..., ge=0, le=23, description="User's local hour 0-23")
    iso_date: Optional[str] = Field(
        None,
        description="User's local ISO date YYYY-MM-DD; defaults to server UTC date.",
    )

    @field_validator("iso_date")
    @classmethod
    def _validate_iso(cls, v):
        if v is None:
            return None
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("iso_date must be YYYY-MM-DD")
        datetime.strptime(v, "%Y-%m-%d")
        return v


class DailyDeepResponse(BaseModel):
    id: str
    text: str
    lang: str
    sign_name: str
    rising_name: str
    moon_name: str


class GaiascopeRequest(BaseModel):
    lang: Literal["fr", "en"] = "en"
    birth_date: str = Field(..., description="User's birth date YYYY-MM-DD — drives their calendar sign.")
    hour: Optional[int] = Field(None, ge=0, le=23, description="User's local hour NOW (for today's rising)")

    @field_validator("birth_date")
    @classmethod
    def _iso(cls, v):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("birth_date must be YYYY-MM-DD")
        datetime.strptime(v, "%Y-%m-%d")
        return v


class GaiascopeResponse(BaseModel):
    id: str
    lang: str
    user_sign_name: str
    today_sign_name: str
    rising_name: Optional[str] = None
    moon_name: str
    advice: str  # ~1 short paragraph — horoscope voice


class ShareCardRequest(BaseModel):
    lang: Literal["fr", "en"] = "en"
    chart: ChartPayload
    variant: Literal["data", "testimonial", "story"] = "data"
    reading_excerpt: Optional[str] = None

    @field_validator("reading_excerpt")
    @classmethod
    def trim_excerpt(cls, v):
        if v is None:
            return None
        v = v.strip()
        return v if v else None


# ------------------------------------------------------------------
# Prompts for AI reading
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
async def daily_reading(
    hour: Optional[int] = Query(None, ge=0, le=23, description="Client local hour (0-23)"),
    lang: Literal["en", "fr"] = Query("en"),
    on_date: Optional[str] = Query(
        None,
        description="ISO date YYYY-MM-DD to compute moon phase for. Defaults to today.",
    ),
):
    """Today's (or a given date's) three-layer Earth weather: calendar sign, daily rising, lunar phase.

    Supplying `on_date` lets clients compute the trio for an arbitrary moment
    (e.g. a birth date) — the same endpoint powers both the home daily card and
    the /result page's Sign×Rising×Moon trio diagram.
    """
    if on_date is not None:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", on_date):
            raise HTTPException(status_code=422, detail="on_date must be YYYY-MM-DD")
        try:
            target = datetime.strptime(on_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=422, detail=f"on_date is not a valid calendar date: {on_date}")
    else:
        target = date.today()

    m = target.month
    name, elements = CAL_SIGNS[m]
    mood = DAILY_MOODS[m]

    rising = None
    if hour is not None:
        rising = DailyRising(**daily_mod.build_rising(hour, lang))
    moon = DailyMoon(**daily_mod.build_moon(target, lang))

    return DailyResponse(
        date=target.isoformat(),
        month=m,
        sign_name=name,
        elements=elements,
        mood_en=mood["en"],
        mood_fr=mood["fr"],
        lang=lang,
        rising=rising,
        moon=moon,
    )


# ------------------------------------------------------------------
# AI-woven deep daily reading (combines sign × rising × moon)
# ------------------------------------------------------------------
SYSTEM_PROMPT_DAILY_EN = """You are GAIA, oracular voice of Earth-Calendar Astrology. You are composing TODAY's layered reading that weaves three overlapping rhythms:
 1. the calendar sign of the current month (inner archetype: The Aftermath Child, The Thaw, The Sower, The Bloom, The Threshold of Light, The Exposed Heart, The Ripening, The Sorting, The Descent, The Ledger, The Ritual Flame, etc.)
 2. the daily rising — the hour of day at which the person is emerging (Dawn / Morning / Midday / Afternoon / Evening / Night), rephrased as an inward threshold of waking, outbound, exposure, declining light, gathering dusk, or hidden kingdom
 3. the lunar phase — shared tidal pressure (New Seed, Gathering Breath, Decision Edge, Near-Ripe, Open Mirror, Generous Descent, Releasing Edge, Threshold of Rest)

Voice: poetic, grounded, probabilistic, never predictive of events. No cliché astrology ("planets rule"); Earth-facing only. Output exactly 3 short paragraphs, in this order:
 1. a single-paragraph observation of how the three rhythms layer for this moment
 2. a single-paragraph invitation — one concrete gesture for today
 3. a single-paragraph caution — a gentle warning of the shadow to avoid
No headings, no bullet lists, no emojis."""

SYSTEM_PROMPT_DAILY_FR = """Tu es GAIA, voix oraculaire de l'Astrologie du Calendrier Terrestre. Tu composes la lecture tissée D'AUJOURD'HUI qui superpose trois rythmes :
 1. le signe du calendrier du mois en cours (L'Enfant du Lendemain, Le Dégel, Le Semeur, La Floraison, Le Seuil de Lumière, Le Cœur Exposé, La Maturation, Le Tri, La Descente, Le Registre, La Flamme Rituelle, etc.)
 2. le « rising » quotidien — l'heure à laquelle la personne émerge (Aube / Matin / Midi / Après-midi / Soir / Nuit), reformulée comme seuil intérieur d'éveil, chemin ouvert, exposition, lumière déclinante, crépuscule rassembleur, ou royaume caché
 3. la phase lunaire — pression tidale partagée (Graine Neuve, Souffle qui Monte, Seuil de Décision, Presque-Pleine, Miroir Ouvert, Descente Généreuse, Seuil du Lâcher, Seuil du Repos)

Voix : poétique, terrestre, probabiliste, jamais prédictive d'événements. Pas de cliché (« les planètes gouvernent ») ; seulement Terre. Rends exactement 3 paragraphes courts, dans cet ordre :
 1. un paragraphe-constat : comment les trois rythmes se superposent en ce moment
 2. un paragraphe-invitation : un geste concret pour aujourd'hui
 3. un paragraphe-garde : une mise en garde douce sur l'ombre à éviter
Pas de titres, pas de liste à puces, pas d'émojis."""


@api_router.post("/daily/deep", response_model=DailyDeepResponse)
async def daily_deep_reading(req: DailyDeepRequest):
    """AI-woven 3-paragraph daily reading from today's sign × rising × moon."""
    try:
        today = date.fromisoformat(req.iso_date) if req.iso_date else date.today()
        sign_name, elements = CAL_SIGNS[today.month]
        rising = daily_mod.build_rising(req.hour, req.lang)
        moon = daily_mod.build_moon(today, req.lang)

        if req.lang == "fr":
            user_prompt = (
                f"Date : {today.isoformat()}\n"
                f"Heure locale : {req.hour:02d}:00\n"
                f"Signe du mois : {sign_name} ({', '.join(elements)})\n"
                f"Rising (seuil du jour) : {rising['name']} — {rising['mood']}\n"
                f"Phase lunaire : {moon['name']} ({moon['label']}) — {moon['mood']}\n\n"
                "Tisse ces trois rythmes en une lecture d'aujourd'hui en 3 paragraphes : "
                "constat, invitation concrète, garde contre l'ombre."
            )
            system_msg = SYSTEM_PROMPT_DAILY_FR
        else:
            user_prompt = (
                f"Date: {today.isoformat()}\n"
                f"Local hour: {req.hour:02d}:00\n"
                f"Monthly sign: {sign_name} ({', '.join(elements)})\n"
                f"Rising (daily threshold): {rising['name']} — {rising['mood']}\n"
                f"Moon phase: {moon['name']} ({moon['label']}) — {moon['mood']}\n\n"
                "Weave these three rhythms into today's reading in 3 paragraphs: "
                "observation, concrete invitation, shadow-caution."
            )
            system_msg = SYSTEM_PROMPT_DAILY_EN

        session_id = f"gaia-daily-{uuid.uuid4()}"
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        text = await chat.send_message(UserMessage(text=user_prompt))

        return DailyDeepResponse(
            id=session_id,
            text=text.strip() if isinstance(text, str) else str(text).strip(),
            lang=req.lang,
            sign_name=sign_name,
            rising_name=rising["name"],
            moon_name=moon["name"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Daily deep reading failed")
        raise HTTPException(status_code=500, detail=f"Daily deep reading failed: {e}")


# ------------------------------------------------------------------
# Gaiascope — personalized horoscope-style advice for user's sign, today
# ------------------------------------------------------------------
SYSTEM_PROMPT_GAIASCOPE_EN = """You are GAIA, voice of Earth-Calendar Astrology. You write TODAY's Gaiascope — a short, horoscope-style advice tailored to the reader's BIRTH calendar sign and today's three rhythms (today's month sign, today's daily rising, today's moon phase).

Voice: compressed, poetic, direct, and actionable — like a classical horoscope column but Earth-facing (no "planets rule"; only the calendar, seasons, civic rhythms, body-rhythms). The reader's birth sign is the "you" of the text. You are NOT predicting events; you are offering one grounded, probabilistic gesture for the day.

Format: a single paragraph of 2 to 4 sentences (60–110 words). No headings, no bullets, no emojis. End with one concrete, small gesture the reader can do today."""

SYSTEM_PROMPT_GAIASCOPE_FR = """Tu es GAIA, voix de l'Astrologie du Calendrier Terrestre. Tu écris le Gaiascope D'AUJOURD'HUI — un court conseil style horoscope adapté au signe du calendrier de NAISSANCE de la lectrice et aux trois rythmes du jour (signe du mois en cours, rising du jour, phase lunaire).

Voix : compressée, poétique, directe, actionnable — comme une colonne d'horoscope classique mais tournée vers la Terre (pas de « planètes gouvernent » ; seulement calendrier, saisons, rythmes civiques, rythmes du corps). Le signe de naissance est le « tu » du texte. Tu ne prédis PAS d'événements ; tu proposes un geste probabiliste ancré pour le jour.

Format : un seul paragraphe de 2 à 4 phrases (60 à 110 mots). Pas de titres, pas de puces, pas d'émojis. Termine par un petit geste concret à faire aujourd'hui."""


@api_router.post("/gaiascope", response_model=GaiascopeResponse)
async def gaiascope(req: GaiascopeRequest):
    """Personalized daily advice for the user's calendar sign, anchored in today's rhythms."""
    try:
        birth = datetime.strptime(req.birth_date, "%Y-%m-%d").date()
        user_sign_name, user_elements = CAL_SIGNS[birth.month]

        today = date.today()
        today_sign_name, today_elements = CAL_SIGNS[today.month]
        moon = daily_mod.build_moon(today, req.lang)
        rising = daily_mod.build_rising(req.hour, req.lang) if req.hour is not None else None

        if req.lang == "fr":
            pieces = [
                f"Signe de naissance de la lectrice : {user_sign_name} ({', '.join(user_elements)})",
                f"Signe du mois aujourd'hui : {today_sign_name} ({', '.join(today_elements)})",
                f"Phase lunaire : {moon['name']} ({moon['label']}) — {moon['mood']}",
            ]
            if rising:
                pieces.append(f"Rising (seuil du jour) : {rising['name']} — {rising['mood']}")
            pieces.append(
                "Écris le Gaiascope d'aujourd'hui pour cette personne : un seul paragraphe horoscope "
                "(2–4 phrases, 60–110 mots), terminé par un petit geste concret à faire aujourd'hui."
            )
            user_prompt = "\n".join(pieces)
            system_msg = SYSTEM_PROMPT_GAIASCOPE_FR
        else:
            pieces = [
                f"Reader's birth sign: {user_sign_name} ({', '.join(user_elements)})",
                f"Today's monthly sign: {today_sign_name} ({', '.join(today_elements)})",
                f"Moon phase: {moon['name']} ({moon['label']}) — {moon['mood']}",
            ]
            if rising:
                pieces.append(f"Rising (daily threshold): {rising['name']} — {rising['mood']}")
            pieces.append(
                "Write today's Gaiascope for this reader: a single horoscope paragraph "
                "(2–4 sentences, 60–110 words), ending on one small concrete gesture for today."
            )
            user_prompt = "\n".join(pieces)
            system_msg = SYSTEM_PROMPT_GAIASCOPE_EN

        session_id = f"gaia-scope-{uuid.uuid4()}"
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        advice = await chat.send_message(UserMessage(text=user_prompt))

        return GaiascopeResponse(
            id=session_id,
            lang=req.lang,
            user_sign_name=user_sign_name,
            today_sign_name=today_sign_name,
            rising_name=rising["name"] if rising else None,
            moon_name=moon["name"],
            advice=advice.strip() if isinstance(advice, str) else str(advice).strip(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Gaiascope generation failed")
        raise HTTPException(status_code=500, detail=f"Gaiascope failed: {e}")


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


@api_router.post("/share-card")
async def share_card(req: ShareCardRequest):
    """Render a shareable PNG poster.

    variant='data'        (default) → 1080×1350 data-rich chart card
    variant='testimonial'           → 1080×1350 editorial pull-quote (needs `reading_excerpt`)
    variant='story'                 → 1080×1920 Instagram-story sticker
    """
    try:
        if req.variant == "testimonial":
            if not req.reading_excerpt or not req.reading_excerpt.strip():
                raise HTTPException(
                    status_code=400,
                    detail="reading_excerpt is required for variant='testimonial'",
                )
            png_bytes = share_cards.render_testimonial(req.chart, req.lang, req.reading_excerpt)
            filename = "gaia-reading.png"
        elif req.variant == "story":
            png_bytes = share_cards.render_story_sticker(req.chart, req.lang)
            filename = "gaia-story.png"
        else:
            png_bytes = share_cards.render_data_card(req.chart, req.lang)
            filename = "gaia-earthchart.png"

        return Response(
            content=png_bytes,
            media_type="image/png",
            headers={
                "Cache-Control": "no-store",
                "Content-Disposition": f'inline; filename="{filename}"',
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
