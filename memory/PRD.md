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

## Architecture
- **Backend** (FastAPI + emergentintegrations + Pillow)
  - `server.py` (316 lines) — routes, Pydantic models, AI prompts
  - `share_cards.py` (342 lines) — isolated Pillow card renderers with shared helpers (`_draw_background`, `_draw_header`, `_draw_footer`, `_draw_element_pills`, `pick_excerpt`, `_wrap`, `_font`)
  - `POST /api/reading` — Claude Sonnet 4.5, 4–6 paragraph poetic reading (EN/FR)
  - `POST /api/share-card` — thin endpoint dispatching to `share_cards.render_data_card` or `share_cards.render_testimonial`
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
