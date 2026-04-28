# GAIA — Earth-Calendar Astrology (PRD)

## Product summary
GAIA is a bilingual (FR/EN) Expo mobile app that inverts classical astrology: instead of planets writing the person, the **calendar, seasons, and civic rhythms** compose identity. From a birth date, GAIA produces a personal **Earth-chart**, a poetic AI reading, and a beautiful shareable PNG card.

## Core features (v1 MVP)
- Bilingual UI (FR/EN) with live toggle
- Home with daily "Earth weather" modulation
- Earth-chart generator (date + optional place + hemisphere + school cutoff)
- Earth-chart result: Calendar sign, 5-element wheel, solar/civic season, cohort position, festival proximity, weather-body imprint
- AI deep reading via Claude Sonnet 4.5 (Emergent LLM key)
- Browse 12 Calendar Signs, 5 Elements, 12 Inward Houses
- About — GAIA philosophy

## v1.1 additions
- **Shareable PNG card** — `POST /api/share-card` renders a 1080×1350 Instagram-portrait poster via Pillow, using bundled Cormorant Garamond + Manrope fonts. Includes starry field, gold nebula bloom, moss glow, sign title, element pills, chart data rows, bilingual labels. Frontend exposes a Share modal on `/result` with preview image + download/share button (web → PNG download; native → Share API).
- **Strict ISO date validator** on `ChartPayload.birth_date` (must match `YYYY-MM-DD` and be a real calendar date).
- **Full testID coverage** for automated testing (cta-explore, daily-card, hemisphere-N/S, deep-reading-text, open-share-card, share-card-modal, share-card-image, download-share-card, close-share-card, plus all nav/form IDs).

## Architecture
- **Backend** (FastAPI + emergentintegrations + Pillow)
  - `POST /api/reading` — Claude Sonnet 4.5, 4–6 paragraph poetic reading (EN/FR)
  - `POST /api/share-card` — Pillow-rendered PNG poster (1080×1350), bilingual labels
  - `GET /api/daily` — today's Earth weather
  - `GET /api/health` — probe
- **Frontend** (Expo Router, RN Web)
  - No auth, no MongoDB writes — stateless chart generation (URL param navigation)
  - Custom SVG starry background, 5-element wheel, Cormorant Garamond + Manrope typography
- **Data**: static bilingual JSON (12 signs, 5 elements, 12 houses) under `src/data/gaia.js`

## Integrations
- **Emergent LLM Universal Key** → Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

## Future ideas
- Expand cohort/festival rules per country/region
- Season-of-birth research citations panel
