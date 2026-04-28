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

## v1.6 — Birth Trio × Gaiascope × Share daily weave
- **Birth Trio on `/result`** — optional `birth_hour` field on the chart form unlocks a `Sign × Rising × Moon` diagram for the user's birth moment. A new `TrioDiagram` SVG component renders three color-coded nodes (gold Sign · terracotta Rising · air-blue Moon) linked by a gold gradient thread. `GET /api/daily` now accepts `on_date=YYYY-MM-DD` so the same endpoint powers both the home daily card and the birth trio.
- **Gaiascope on `/result`** — new `POST /api/gaiascope` endpoint (Claude Sonnet 4.5) generates a horoscope-style 60–110 word advice paragraph ending in one concrete gesture, personalized to the reader's calendar sign and today's three rhythms. Auto-fetched on mount, regenerated on lang toggle, with a "New advice" refresh button.
- **Share today's weave** — new "Share today's weave" button on the home daily card. When the user has generated the woven daily reading, it opens a Pillow testimonial PNG (1080×1350) built from today's sign + the AI weave text. Reuses the existing `/api/share-card` endpoint with no new backend work — the frontend constructs a synthetic chart payload from today's daily data.

## Architecture
- **Backend** (FastAPI + emergentintegrations + Pillow)
  - `server.py` — routes, Pydantic models, AI prompts (chart / daily / gaiascope)
  - `share_cards.py` — 3 Pillow renderers (data / testimonial / story)
  - `daily.py` — time-band + moon-phase logic with bilingual archetype dictionaries
  - `POST /api/reading` — Claude Sonnet 4.5, 4–6 paragraph chart reading (EN/FR)
  - `POST /api/daily/deep` — Claude Sonnet 4.5, 3 paragraph daily weave (EN/FR)
  - `POST /api/gaiascope` — Claude Sonnet 4.5, 60–110 word horoscope advice personalized to user's birth sign
  - `POST /api/share-card` — 3-variant PNG dispatcher (data / testimonial / story)
  - `GET /api/daily?hour=&lang=&on_date=` — enriched 3-layer payload (today or arbitrary date)
  - `GET /api/health`
- **Frontend** (Expo Router, RN Web)
  - No auth, no MongoDB writes
  - Starry background, 5-element wheel, Trio diagram, Cormorant Garamond + Manrope typography
  - Home `/api/daily` auto-refresh every 5 min; daily weave button → share-as-testimonial button
  - `/result` fetches birth trio (if birth_hour) + Gaiascope in parallel
- **Testing**: 125 pytest assertions passing (test_daily 33, test_pick_excerpt 21, test_testimonial_variant 10, test_story_variant 8, test_daily_api 20+, test_iteration6 adds gaiascope coverage)

## Integrations
- **Emergent LLM Universal Key** → Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

## Future ideas
- Expand cohort/festival rules per country/region
- Season-of-birth research citations panel
