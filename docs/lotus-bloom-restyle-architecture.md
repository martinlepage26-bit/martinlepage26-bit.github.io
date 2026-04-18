# Lotus Bloom Restyle Architecture

Prepared: 2026-03-30

## Objective

Turn Lotus from its current multi-panel browser scoring surface into a single-bloom, vertically progressive journaling experience that matches the provided UX specification without losing accessibility, clarity, or product coherence.

## Task Type

Public-facing product and interaction architecture for design, Figma exploration, and later frontend implementation.

## Activated Skills

- Primary: `skill-architect`
- Control layer: `HEPHAISTOS`

## Consequence Domain

Public-facing UX and product-definition work on the Martin surface.

## Governing Constraints

- Lotus remains on `martin-lepage-site`.
- The metaphor is load-bearing, but it must never outrank comprehension.
- The interaction model is vertical only: one active question, one active bloom, one active writing surface.
- Motion must communicate state, not decoration.
- Reduced-motion, keyboard, and screen-reader behavior are first-class constraints, not cleanup tasks.

## Delta-First Audit

The current Lotus implementation does not yet match the target product.

Current live shape:
- [`src/pages/lotus/index.astro`](/home/cerebrhoe/martin-lepage-site/src/pages/lotus/index.astro) presents Lotus as a multi-section landing page.
- [`src/components/lotus/LotusWorkbench.astro`](/home/cerebrhoe/martin-lepage-site/src/components/lotus/LotusWorkbench.astro) is a browser note-scoring tool with title field, textarea, samples, metrics, matched-term cards, and export panel.
- [`src/components/lotus/LotusVectorWorkbench.astro`](/home/cerebrhoe/martin-lepage-site/src/components/lotus/LotusVectorWorkbench.astro) mounts a separate React vector tool.
- [`src/data/lotus.ts`](/home/cerebrhoe/martin-lepage-site/src/data/lotus.ts) frames Lotus as a scoring framework, signal library, and research surface.

Target shape from the UX spec:
- one bloom
- one question
- one input surface
- one vertical stalk
- backward navigation only through prior nodes
- no lateral tool switching inside the bloom experience

Conclusion:
- this is not a cosmetic restyle
- this is a product-mode and information-architecture shift

## Brain

### Product Behavior

Lotus should behave as a slow, sequential writing ritual, not as a browser analytics tool. The core user loop is:

1. open bloom
2. read one question
3. write into one contained surface
4. submit through a deliberate gesture
5. watch the bloom close and the stalk grow
6. pause before opening the next bloom

### Non-Negotiable Interaction Rules

- Never show more than one editable answer at a time.
- Never expose prior answer text in forward mode.
- Never auto-open the next bloom after submission.
- Never let animation block typing or obscure cursor/focus state.
- Never rely on symbolism alone for input, back, submit, saved, or word-limit comprehension.

### UX Acceptance Criteria

- A first-time user can identify where to write within 2 seconds of bloom opening.
- A first-time user can identify how to submit without tutorial text after the first bloom.
- The user always knows whether they are advancing or reviewing.
- At `80+` words, the system signals fullness before the hard limit is reached.
- At `100` words, input blocks quietly and the submit path becomes clearer, not harsher.

## Map

### Recommended Product Split

The current Lotus materials should be split into two layers:

1. `Lotus Bloom`
   - the new primary `/lotus/` experience
   - sequential journaling only
   - bloom, stalk, question, input, submit, back, completion

2. `Lotus Research Tools`
   - the current scoring and vector logic
   - moved out of the primary ritual surface
   - retained as supporting research artifacts on a secondary route

Recommended routing:
- `/lotus/` -> bloom journaling experience
- `/projects/lotus/` -> project record and conceptual explanation
- secondary workbench route, recommended:
  - `/lotus/research/` or `/lotus/lab/`

This keeps the public Lotus identity coherent while preserving the real work already built.

### Component Architecture

#### Route Shell

- `LotusBloomPage`
- fixed-height viewport
- persistent top rail with:
  - back/review affordance
  - position indicator
  - optional status label

#### Core Visual System

- `LotusStalk`
  - renders completed closed nodes below current bloom
  - renders upward growth during progression
- `LotusBloom`
  - supports states: `bud`, `opening`, `active`, `near-limit`, `closing`, `closed`, `reopened-review`
- `LotusPetalInput`
  - standard textarea behavior inside controlled bloom mask/container
- `LotusMotionLayer`
  - owns state-transition timing, reduced-motion fallbacks, and view translation

#### Interaction Controls

- `LotusSubmitControl`
  - disabled until at least one word exists
  - designed as deliberate action, not accidental tap
- `LotusBackControl`
  - explicit reviewing affordance
- `LotusWordCount`
  - neutral -> warm -> full
- `LotusDraftIndicator`
  - quiet draft persistence state

#### State Surfaces

- `LotusCompletionView`
- `LotusSaveErrorInline`
- `LotusReturnStateResume`

### State Model

Minimum app state:

```ts
type LotusFlowMode = 'forward' | 'review';
type LotusBloomState = 'bud' | 'opening' | 'active' | 'near-limit' | 'closing' | 'closed' | 'reopened-review';

interface LotusAnswerNode {
  id: string;
  questionId: string;
  questionText: string;
  answerText: string;
  submittedAt: string;
  draftUpdatedAt?: string;
}

interface LotusSessionState {
  mode: LotusFlowMode;
  currentIndex: number;
  totalQuestions: number | null;
  activeQuestionId: string;
  activeQuestionText: string;
  activeDraft: string;
  bloomState: LotusBloomState;
  answers: LotusAnswerNode[];
  saveState: 'idle' | 'draft-saving' | 'saved' | 'error';
}
```

### Data and Persistence

- Draft autosave: local storage, debounced `500ms`
- Submission save: local first, remote second if sync exists
- Re-entry behavior:
  - restore current bloom
  - restore current draft
  - restore completed stalk nodes

### Figma Exploration Pack

Design should not begin with a single screen. It should begin with a state set.

Required Figma frames:

1. Entry bud
2. First bloom opening
3. Active empty bloom
4. Active writing bloom
5. Near-limit bloom
6. Submit confirmation beat
7. Closing bloom + stalk growth
8. Next bud pause state
9. Back-navigation review state
10. Completion state
11. Mobile with keyboard open
12. Reduced-motion state equivalents

Required component studies:

- bud vs closed node distinction
- bloom text region protection
- word-count placements
- submit control variants
- top rail variants
- review-state palette shift

### Engineering Sequencing

#### Phase 1 — Product Cut

- decide that `/lotus/` becomes the bloom experience
- move current scoring workbench out of the primary route
- preserve current research logic on a secondary route

#### Phase 2 — Interaction Skeleton

- implement viewport shell
- implement stalk + bud state machine
- implement one-question bloom flow with mock data
- implement autosave and review navigation

#### Phase 3 — Motion and Input Fidelity

- add open/close/grow/downward-review motion
- enforce word-cap behavior
- add focus, keyboard, and reduced-motion handling

#### Phase 4 — Visual Refinement

- tune petal geometry
- tune ambient motion
- tune completion state
- validate contrast and mobile ergonomics

## Highest-Risk Failure Points

1. Treating the bloom as a fancy wrapper around a normal form.
   - This would preserve old product logic and produce metaphor theater.

2. Keeping the scoring workbench inside the primary Lotus route.
   - This would break the one-surface, one-thought rule immediately.

3. Over-designing the petals and under-designing the input zone.
   - If the cursor feels lost, the whole experience fails.

4. Underestimating mobile keyboard constraints.
   - This is likely the hardest implementation constraint in the entire concept.

5. Making review mode visually identical to forward mode.
   - Users will lose orientation.

## Recommendation

Treat this as a product rewrite of the Lotus primary surface, not a styling pass.

The correct move is:
- keep the current analytical Lotus logic alive, but move it off the main `/lotus/` route
- redesign `/lotus/` around the bloom/stalk writing ritual
- prototype the state machine in Figma before touching implementation-heavy petal animation

If we skip that product split and try to layer the bloom metaphor over the current scoring workbench, we will get the worst possible version of both ideas: too symbolic to be usable, too tool-like to feel ceremonial.

## Artifact Produced

This file is the governing architecture note for the Lotus bloom restyle.

## Open Risks Or Limits

- Question corpus design is not defined yet.
- Save backend policy is still unspecified; current recommendation assumes local-first persistence.
- Review mode editability needs an explicit product decision: editable-on-return vs read-only-with-edit-action.
- Mobile keyboard handling needs prototype evidence before motion language is finalized.

## Next-Step Recommendation

Do these in order:

1. Approve the route split: primary bloom experience vs secondary research workbench.
2. Build the 12-frame Figma exploration pack from this architecture.
3. Implement a low-fidelity state-machine prototype before high-fidelity bloom illustration work.
