# HEPHAISTOS Skill Taxonomy Table

Source basis:

- `/mnt/c/Users/softinfo/Desktop/SKILLS Claude/prompt engineering vs context engin.txt`
- `/mnt/c/Users/softinfo/Desktop/SKILLS Claude/SKILL_*.md`

| Skill file | Runtime identity (real job) | Typical trigger domain | Primary output shape | Rename recommendation |
| --- | --- | --- | --- | --- |
| `SKILL_gov.md` | Recursive governance archive parser | Mixed archives, governance drift, disclosure language | Bounded findings + control map | Keep runtime name `recursive-governance-method` |
| `SKILL_trace.md` | Governance document diff engine | Authority/accountability drift across policy packs | Trace map (evidence/inference split) | Keep `trace-investigator` |
| `SKILL_PhD.md` | Philosophy and governance debate engine | Value tensions, thinker clashes, epistemic conflicts | Structured philosophical analysis + debate verdict | Keep runtime name `philosopher`; keep file as historical alias |
| `SKILL_qualit.md` | Qualitative method-selection engine | Study design, coding lens, interpretation strategy | Method recommendation with rationale | Keep `qualitative` |
| `SKILL_red.md` | Authorized red-team design layer | RoE design, exercise framing, leadership reporting | Red-team plan and finding framing | Keep `red-team` |
| `SKILL_hum.md` | Policy-to-behavior translation layer | Rewriting rigid rules for real behavior | Humanized policy/SOP text | Keep `humanize` |
| `SKILL_peer.md` | Publication-grade academic writing layer | Journal manuscripts, reviewer responses | Structured manuscript sections | Keep `peer-reviewed-paper-writer` |
| `SKILL_publish.md` | Manuscript packaging strategy layer | Book positioning, metadata, editorial packaging | Editorial package and positioning artifacts | Keep `publisher` |
| `SKILL_brandID.md` | Diagnose-before-generate brand strategy layer | Consultancy/research identity and website direction | Brand strategy and identity system outputs | Keep `brand-identity-system` |
| `SKILL_novel.md` | Fiction development and revision studio | Concept to draft revision and positioning | Narrative architecture + revision guidance | Keep `novelist` |
| `SKILL_speech.md` | Deterministic text-to-speech adapter | Narration, accessibility, batch voice output | Audio generation commands/assets | Keep `speech` |
| `SKILL_pair.md` | Two-stage workflow router | Analysis->writing, diagnosis->revision handoff | Paired execution flow + handoff artifact | Keep `skill-pairing` |
| `SKILL_tri.md` | Deterministic triangulation utility | Bearing-angle location and triangle solving | Computed geometry output | Keep `triangulation` |
| `SKILL_MA.md` | Arts-and-letters academic framework layer | MA structure, disciplinary pathway framing | Program-comparison and formation framing | Recenter wording to "MA arts-and-letters framework" (less counseling tone) |

## System-level grouping

1. Governance and institutional analysis
2. Academic and research production
3. Creative/publishing/brand transformation
4. Coordination and utilities

## Architecture note

The stack is governed as a dual-engine system:

1. Brain: prompt-execution logic.
2. Map: context retrieval and tool routing.

Together these units function as the HEPHAISTOS operating layer.

## Current runtime baseline

- Governance is primary for constraints, admissibility, escalation, and validation.
- `philosopher` and `fully-rounded-power-analyst` are the two co-equal right-arms.
- Public Hephaistos narratives and the authored tree artifacts publish from `https://martin.govern-ai.ca`.
- PHAROS product, service, and mail operations stay on `https://pharos-ai.ca` and in `pharos-suite`.
