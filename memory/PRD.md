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
- **Shareable PNG cards** — `POST /api/share-card` renders Pillow posters with bundled Cormorant Garamond + Manrope fonts. Three variants:
  - `variant='data'` (default, 1080×1350): data-rich chart card with element pills and labeled rows.
  - `variant='testimonial'` (1080×1350): editorial pull-quote card featuring an AI-reading excerpt.
  - `variant='story'` (1080×1920): Instagram-story sticker — centered, airy, glance-able.
- Frontend `/result` exposes three share buttons:
  - "Share this chart" (always) → data card
  - "Share this reading" (only after AI reading) → testimonial card
  - "Share as story (9:16)" (always) → story sticker
- Per-variant URI cache on the client, automatically invalidated on language switch via `useEffect(lang)`.
- **Strict ISO date validator** on `ChartPayload.birth_date`.
- **39/39 pytest assertions** across `test_pick_excerpt.py` (21 tests: empty/None/whitespace/unicode/CJK/boundary/parametrized caps), `test_testimonial_variant.py` (10 tests), and `test_story_variant.py` (8 tests).
- **Full testID coverage** for automated testing.

## v1.5 — Deep daily analysis (rising × moon × sign)
- **3 layered daily rhythms** on home:
  1. **Calendar sign** (month archetype, existing)
  2. **Daily rising** (time-of-day — 6 bands: dawn, morning, midday, afternoon, evening, night — each with a poetic inward-astrology name: The Threshold of Waking, The Outbound, The Exposed Hour, The Declining Light, The Gathering Dusk, The Hidden Kingdom)
  3. **Lunar phase** (8 synodic phases with poetic names: The New Seed, The Gathering Breath, The Decision Edge, The Near-Ripe, The Open Mirror, The Generous Descent, The Releasing Edge, The Threshold of Rest)
- **`POST /api/daily/deep`** — AI endpoint (Claude Sonnet 4.5) that weaves sign × rising × moon into a **3-paragraph observation / invitation / shadow-caution** reading, in EN or FR.
- Home `/api/daily` accepts optional `hour` + `lang` query params, returns enriched payload. Auto-refreshes every 5 min so time-band transitions are reflected.
- Frontend: daily card shows 3 sections with color-coded icons (gold/terracotta/air-blue) and a "Weave today's reading" AI CTA.
- Moon phase math: synodic-month reference epoch 2000-01-06 18:14 UTC, period 29.530588853 days; 8 named phases with tight new/full windows.

## Architecture
- **Backend** (FastAPI + emergentintegrations + Pillow)
  - `server.py` — routes, Pydantic models, AI prompts (sign reading, daily deep reading)
  - `share_cards.py` — 3 Pillow renderers (data / testimonial / story)
  - `daily.py` — time-band + moon-phase logic with bilingual archetype dictionaries
  - `POST /api/reading` — Claude Sonnet 4.5, 4–6 paragraph chart reading (EN/FR)
  - `POST /api/daily/deep` — Claude Sonnet 4.5, 3 paragraph daily weave (EN/FR)
  - `POST /api/share-card` — dispatcher to `share_cards.render_{data_card,testimonial,story_sticker}`
  - `GET /api/daily?hour=&lang=` — enriched 3-layer daily payload
  - `GET /api/health` — probe
- **Frontend** (Expo Router, RN Web)
  - No auth, no MongoDB writes — stateless chart generation (URL param navigation)
  - Custom SVG starry background, 5-element wheel, Cormorant Garamond + Manrope typography
  - Home `/api/daily` auto-refresh loop
- **Data**: static bilingual JSON (12 signs, 5 elements, 12 houses) under `src/data/gaia.js`

## Integrations
- **Emergent LLM Universal Key** → Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

## Future ideas
- Expand cohort/festival rules per country/region
- Season-of-birth research citations panel
