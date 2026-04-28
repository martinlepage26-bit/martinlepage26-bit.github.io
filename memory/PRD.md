# GAIA — Earth-Calendar Astrology (PRD)

## Product summary
GAIA is a bilingual (FR/EN) Expo mobile app that inverts classical astrology: instead of planets writing the person, the **calendar, seasons, and civic rhythms** compose identity. Born from the user-provided philosophical text and the reference site `martin.govern-ai.ca/gaia`, the app gives each user a personal **Earth-chart** from a birth date, plus poetic, probabilistic readings grounded in seasonality and civic time.

## Core features
- **Bilingual UI (FR/EN)** with live toggle (EN ↔ FR)
- **Home** with daily "Earth weather" modulation pulled from the backend
- **Earth-chart generator** (birth date + optional place + hemisphere + optional school cutoff)
- **Earth-chart result**
  - Calendar sign (1 of 12 poetic archetypes: The Aftermath Child → The Ritual Flame)
  - 5-element wheel highlighting the sign's active elements (Fire / Water / Earth / Air / Spirit)
  - Solar season, civic season, cohort position, festival proximity, weather-body imprint
  - AI-generated deep reading (Claude Sonnet 4.5 via Emergent LLM key)
- **Browse 12 Calendar Signs** with element chips, themes, imprint, shadow, ritual gesture
- **Browse 5 Elements** with natural, civic, psychological, and shadow forms
- **Browse 12 Inward Houses** (body, household economy, peer cohort, family ritual…)
- **About** — the GAIA philosophy of structured probability

## Architecture
- **Backend** (FastAPI + emergentintegrations)
  - `POST /api/reading` — Claude Sonnet 4.5 generates a 4–6 paragraph poetic reading per language
  - `GET /api/daily` — today's Earth weather based on current month
  - `GET /api/health` — service probe
- **Frontend** (Expo Router, RN Web)
  - No auth, no persistence, stateless chart generation (params-based navigation)
  - Custom SVG starry background, 5-element wheel, and typography (Cormorant Garamond + Manrope)
- **Data**: static bilingual JSON content (12 signs, 5 elements, 12 houses) under `src/data/gaia.js`

## Integrations
- **Emergent LLM Universal Key** → Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

## Business enhancement (future)
- **Shareable "card of the year"**: generate a beautifully styled image of the user's Earth-chart (calendar sign, elements, season, daily mood) that can be shared on social networks. Converts ephemeral readings into organic distribution — perfect for a poetic, philosophical brand with no auth friction.
