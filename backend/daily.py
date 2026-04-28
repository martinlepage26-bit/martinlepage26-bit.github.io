"""
GAIA — Daily modulation layer.

Three overlaid rhythms shape each moment:
  1. Calendar sign  (month)       — already in server.CAL_SIGNS
  2. Daily rising   (hour of day) — how the person crosses the threshold now
  3. Lunar phase    (moon)        — collective tide + inner rhythm

All computations are inward-astrology rephrasings: the time of day is not
a "rising sign" cast from stars, it is the daily edge at which the body
emerges into public time. The moon is not a celestial personality, it is
the shared tidal pressure of the night sky on sleep, feeling, and ritual.
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Literal

# ------------------------------------------------------------------
# Time-of-day bands
# ------------------------------------------------------------------
# Each band covers a contiguous hour window. Night wraps across midnight.
TimeBand = Literal["dawn", "morning", "midday", "afternoon", "evening", "night"]

TIME_BANDS: dict[TimeBand, dict] = {
    "dawn": {
        "hours": range(5, 9),  # 05:00–08:59
        "label_en": "Dawn",
        "label_fr": "Aube",
        "name_en": "The Threshold of Waking",
        "name_fr": "Le Seuil de l'Éveil",
        "mood_en": "The light is thin and honest. Small choices carry far before noon dilutes them.",
        "mood_fr": "La lumière est fine et honnête. Les petits choix portent loin avant que midi ne les dilue.",
    },
    "morning": {
        "hours": range(9, 12),  # 09:00–11:59
        "label_en": "Morning",
        "label_fr": "Matin",
        "name_en": "The Outbound",
        "name_fr": "Le Chemin Ouvert",
        "mood_en": "The door has opened. Now is the hour for sending, not for waiting.",
        "mood_fr": "La porte s'est ouverte. C'est l'heure d'envoyer, pas d'attendre.",
    },
    "midday": {
        "hours": range(12, 15),  # 12:00–14:59
        "label_en": "Midday",
        "label_fr": "Midi",
        "name_en": "The Exposed Hour",
        "name_fr": "L'Heure Exposée",
        "mood_en": "The sun is vertical. Shadows shorten and so do alibis. Be plainly who you are.",
        "mood_fr": "Le soleil est vertical. Les ombres raccourcissent, les alibis aussi. Sois pleinement qui tu es.",
    },
    "afternoon": {
        "hours": range(15, 18),  # 15:00–17:59
        "label_en": "Afternoon",
        "label_fr": "Après-midi",
        "name_en": "The Declining Light",
        "name_fr": "La Lumière Déclinante",
        "mood_en": "Something in the day begins to lean. Let your work soften without stopping.",
        "mood_fr": "Quelque chose du jour commence à s'incliner. Laisse le travail s'adoucir sans s'arrêter.",
    },
    "evening": {
        "hours": range(18, 21),  # 18:00–20:59
        "label_en": "Evening",
        "label_fr": "Soir",
        "name_en": "The Gathering Dusk",
        "name_fr": "Le Crépuscule Rassembleur",
        "mood_en": "The public day folds inward. Attend the small faces before the great ideas.",
        "mood_fr": "Le jour public se replie. Occupe-toi des petits visages avant des grandes idées.",
    },
    "night": {
        # Wraps midnight: 21:00–04:59
        "hours": None,
        "label_en": "Night",
        "label_fr": "Nuit",
        "name_en": "The Hidden Kingdom",
        "name_fr": "Le Royaume Caché",
        "mood_en": "What cannot be seen does most of the work. Sleep is a civic act tonight.",
        "mood_fr": "Ce qu'on ne voit pas fait l'essentiel du travail. Dormir est un acte civique ce soir.",
    },
}


def time_band_for_hour(hour: int) -> TimeBand:
    """Map a 0..23 local hour to one of six bands; night wraps midnight."""
    h = hour % 24
    if 5 <= h < 9:
        return "dawn"
    if 9 <= h < 12:
        return "morning"
    if 12 <= h < 15:
        return "midday"
    if 15 <= h < 18:
        return "afternoon"
    if 18 <= h < 21:
        return "evening"
    return "night"


# ------------------------------------------------------------------
# Lunar phase (synodic month, 8 phases)
# ------------------------------------------------------------------
# Reference new moon: 2000-01-06 18:14 UTC (a well-documented astronomical baseline).
_KNOWN_NEW_MOON = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)
_SYNODIC_DAYS = 29.530588853

MoonPhase = Literal[
    "new",
    "waxing_crescent",
    "first_quarter",
    "waxing_gibbous",
    "full",
    "waning_gibbous",
    "last_quarter",
    "waning_crescent",
]

MOON_PHASES: dict[MoonPhase, dict] = {
    "new": {
        "label_en": "New Moon",
        "label_fr": "Nouvelle Lune",
        "name_en": "The New Seed",
        "name_fr": "La Graine Neuve",
        "mood_en": "Darkness is not absence. It is privacy for what has not yet happened. Keep one intention un-said.",
        "mood_fr": "L'obscurité n'est pas une absence. C'est l'intimité de ce qui n'est pas encore. Garde une intention non-dite.",
    },
    "waxing_crescent": {
        "label_en": "Waxing Crescent",
        "label_fr": "Premier Croissant",
        "name_en": "The Gathering Breath",
        "name_fr": "Le Souffle qui Monte",
        "mood_en": "A thin silver edge. Courage without proof. Show up for the thing that isn't ready yet.",
        "mood_fr": "Un mince bord d'argent. Du courage sans preuve. Présente-toi pour ce qui n'est pas encore prêt.",
    },
    "first_quarter": {
        "label_en": "First Quarter",
        "label_fr": "Premier Quartier",
        "name_en": "The Decision Edge",
        "name_fr": "Le Seuil de Décision",
        "mood_en": "Half-bright. The moon is asking you to choose one side of a tension you've been balancing.",
        "mood_fr": "À moitié lumineuse. La lune te demande de choisir un côté d'une tension que tu équilibres.",
    },
    "waxing_gibbous": {
        "label_en": "Waxing Gibbous",
        "label_fr": "Lune Gibbeuse Croissante",
        "name_en": "The Near-Ripe",
        "name_fr": "La Presque-Pleine",
        "mood_en": "Almost full. Don't harvest yet. Refine, polish, walk once more around the field.",
        "mood_fr": "Presque pleine. Ne récolte pas encore. Raffine, polis, refais un tour du champ.",
    },
    "full": {
        "label_en": "Full Moon",
        "label_fr": "Pleine Lune",
        "name_en": "The Open Mirror",
        "name_fr": "Le Miroir Ouvert",
        "mood_en": "Maximum reflection. Whatever you have been feeding is visible tonight. No judgment, only clear seeing.",
        "mood_fr": "Reflet maximal. Ce que tu as nourri est visible ce soir. Sans jugement, seulement voir clair.",
    },
    "waning_gibbous": {
        "label_en": "Waning Gibbous",
        "label_fr": "Lune Gibbeuse Décroissante",
        "name_en": "The Generous Descent",
        "name_fr": "La Descente Généreuse",
        "mood_en": "The tide turns outward. Teach, share, loosen your grip on what you now know.",
        "mood_fr": "La marée se retourne. Enseigne, partage, desserre ton emprise sur ce que tu sais à présent.",
    },
    "last_quarter": {
        "label_en": "Last Quarter",
        "label_fr": "Dernier Quartier",
        "name_en": "The Releasing Edge",
        "name_fr": "Le Seuil du Lâcher",
        "mood_en": "Half-dim. Something needs to be put down before the next cycle. Make the quiet refusal.",
        "mood_fr": "À moitié obscure. Quelque chose doit être déposé avant le prochain cycle. Fais le refus tranquille.",
    },
    "waning_crescent": {
        "label_en": "Waning Crescent",
        "label_fr": "Dernier Croissant",
        "name_en": "The Threshold of Rest",
        "name_fr": "Le Seuil du Repos",
        "mood_en": "Near-dark again. Do less, notice more. Sleep is not defeat; it is the next seed pressing down.",
        "mood_fr": "Presque obscure à nouveau. Fais moins, remarque plus. Dormir n'est pas un échec ; c'est la prochaine graine qui pousse vers le bas.",
    },
}


# Phase-boundary table ordered by fraction of synodic month (0..1).
# Windows ~0.125 of synodic period each, with tight new/full windows (~0.06).
_PHASE_BOUNDARIES: list[tuple[float, MoonPhase]] = [
    (0.03,  "new"),
    (0.22,  "waxing_crescent"),
    (0.28,  "first_quarter"),
    (0.47,  "waxing_gibbous"),
    (0.53,  "full"),
    (0.72,  "waning_gibbous"),
    (0.78,  "last_quarter"),
    (0.97,  "waning_crescent"),
    (1.01,  "new"),  # wrap guard
]


def moon_phase_fraction(dt: datetime) -> float:
    """Return the synodic-month fraction for `dt` (UTC) — 0.0 = new, 0.5 = full."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff_days = (dt - _KNOWN_NEW_MOON).total_seconds() / 86400.0
    return (diff_days % _SYNODIC_DAYS) / _SYNODIC_DAYS


def moon_phase_for_datetime(dt: datetime) -> MoonPhase:
    """Classify a UTC datetime into one of the 8 synodic phases."""
    f = moon_phase_fraction(dt)
    for limit, phase in _PHASE_BOUNDARIES:
        if f < limit:
            return phase
    return "new"


def moon_phase_for_date(d: date) -> MoonPhase:
    """Classify a date at 12:00 UTC noon — one phase per calendar day."""
    return moon_phase_for_datetime(
        datetime(d.year, d.month, d.day, 12, 0, 0, tzinfo=timezone.utc)
    )


# ------------------------------------------------------------------
# Composition
# ------------------------------------------------------------------
def _pick_lang(block: dict, lang: str, key_en: str, key_fr: str) -> str:
    return block[key_fr] if lang == "fr" else block[key_en]


def build_rising(hour: int, lang: str) -> dict:
    band = time_band_for_hour(hour)
    info = TIME_BANDS[band]
    return {
        "band": band,
        "hour": hour,
        "label": _pick_lang(info, lang, "label_en", "label_fr"),
        "name": _pick_lang(info, lang, "name_en", "name_fr"),
        "mood": _pick_lang(info, lang, "mood_en", "mood_fr"),
    }


def build_moon(d: date, lang: str) -> dict:
    phase = moon_phase_for_date(d)
    info = MOON_PHASES[phase]
    return {
        "phase": phase,
        "label": _pick_lang(info, lang, "label_en", "label_fr"),
        "name": _pick_lang(info, lang, "name_en", "name_fr"),
        "mood": _pick_lang(info, lang, "mood_en", "mood_fr"),
    }
