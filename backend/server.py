"""
GAIA — Earth-Calendar Astrology API.
Backend provides:
 - POST /api/reading : AI-generated deep personalized reading (Claude Sonnet 4.5)
 - GET  /api/daily   : today's Earth-weather daily modulation reading
 - GET  /api/health  : health check
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime, date

from emergentintegrations.llm.chat import LlmChat, UserMessage

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
