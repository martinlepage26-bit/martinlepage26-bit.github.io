---
title: "Authored Governance Tree and Skill Ecosystem Maps"
originalTitle: "martin_lepage_governance_tree.html + skill_ecosystem_tree.html"
titleNote: "Original authored map labels are preserved in source paths and interpreted as explicit taxonomy artifacts."
navLabel: "Authored Tree Maps"
subtitle: "Crosswalking authored HTML tree maps to the implemented methods architecture"
year: 2026
status: "Ingested from external authored artifacts"
type: "Taxonomy governance artifact"
family: "Methods and Infrastructure"
phase: "Phase 1.5 · Taxonomy reconciliation"
entryRole: "major"
whatItDoes: "Converts authored tree-map HTML files into explicit governance taxonomy evidence and aligns them with the site's normalized methods architecture."
abstract: "This entry treats authored HTML tree maps as governance evidence, not decorative prototypes. The files `martin_lepage_governance_tree.html` and `skill_ecosystem_tree.html` encode explicit top-level families, role labels, and relationship assumptions for research, methods, infrastructure, and the SKILL ecosystem. By ingesting them directly, the site architecture can be reconciled against authored intent rather than inferred from filenames alone. The contribution is a crosswalk layer: preserving source labels exactly, introducing normalized navigation labels only where needed for consistency, and documenting where ambiguity remains. This prevents taxonomy drift, clarifies authority over section structure, and improves portability to future suites because the tree itself becomes a reviewable governance artifact."
tags:
  - taxonomy governance
  - authored tree map
  - skill ecosystem
  - architecture crosswalk
  - provenance
  - portability
featured: true
order: 15
relatedWorks:
  - hephaistos-skill-operating-system
  - corpus-ingestion-and-governance-tree
  - scriptorium-deterministic-recursive-infrastructure
  - repository-verification-and-merge-controls
  - soft-post-control-post-experiment-implementation
sourcePaths:
  - /mnt/c/Users/softinfo/Downloads/martin_lepage_governance_tree.html
  - /mnt/c/Users/softinfo/Downloads/skill_ecosystem_tree.html
  - /mnt/c/Users/softinfo/Downloads/pharos-preview.html
  - docs/external-corpus-inventory.json
  - docs/external-corpus-inventory.md
  - scripts/generate-external-corpus-inventory.py
links: []
---

## What this piece does

This piece establishes that authored tree maps are part of the governance layer. It ingests the external HTML map files and translates them into a reviewable taxonomy crosswalk for this site.

## Core argument

A taxonomy map is a control artifact.

When the corpus author publishes a tree in executable HTML, that tree is not mere presentation. It encodes:

- which domains are first-class,
- what counts as parent vs child,
- what is promoted to card-level visibility,
- how methods, infrastructure, and companion materials are separated.

Treating those files as optional inspiration would hand architecture authority to the implementer by default. This entry argues for the opposite: authored maps must be ingested as evidence, then reconciled with the running site structure in explicit, auditable steps.

## Governance method and methodological contribution

The method introduced here is **authored-map reconciliation**.

1. Parse authored map artifacts as source evidence.
2. Preserve source labels and route references in metadata.
3. Build a normalized naming layer only for legibility and routing consistency.
4. Record any divergence from source maps as explicit deltas.

In this pass, the authored map confirms a three-family public frame:

- `Research`
- `Method`
- `Governance Infrastructure`

The skill map confirms the SKILL subsystem as governance infrastructure, not secondary utility content, and separates capability lanes (research, writing, strategy, orchestration, architecture).

## Power dynamics examined

Tree ownership is authority ownership.

If map interpretation remains implicit, whoever edits routes can quietly redefine conceptual center and relegation boundaries. That is a governance risk: structural decisions look technical while functioning as editorial power.

This entry reduces that risk by binding tree decisions to source artifacts and publishing the crosswalk logic. It does not remove editorial power, but it makes exercise of that power visible.

## Ethical stakes

The ethical issue is representational accuracy.

If the site claims to represent a methods corpus but omits authored tree evidence, readers may see an implementation-centered taxonomy that was never intended by the source author. That is a subtle form of misrepresentation.

By anchoring section structure to authored map files, the architecture can remain professional and scalable without erasing authorial conceptual force.

## Recursive and systemic implications

This reconciliation pattern scales.

- New map revisions can be ingested as deltas.
- Existing entries can be reclassified without deleting provenance.
- Migration to future suites can carry both source map and normalized map in parallel.

Systemically, this turns site architecture from static layout into governed metadata with explicit source-control lineage.

## Relation to other entries in the corpus

- [Corpus Ingestion and Governance Tree](/governance/methods/corpus-ingestion-and-governance-tree/) defines baseline ingestion logic and dual-layer naming.
- [Scriptorium as Deterministic Recursive Infrastructure](/governance/methods/scriptorium-deterministic-recursive-infrastructure/) shows how implementation pipelines become governance constraints.
- [Repository Verification and Merge Controls](/governance/methods/repository-verification-and-merge-controls/) covers hard technical gates that protect structural changes.
- [Soft Post-Control, Post-Experiment Implementation](/governance/methods/soft-post-control-post-experiment-implementation/) covers editorial control after experiment-phase drafting.

## Why it matters

Without authored-map reconciliation, taxonomy drift accumulates invisibly and portability claims become weak. With it, the site carries both interpretive discipline and architectural flexibility: source labels remain intact, normalized labels remain legible, and future migrations can reconstruct why each structural decision was made.
