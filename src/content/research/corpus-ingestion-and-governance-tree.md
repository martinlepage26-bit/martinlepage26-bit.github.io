---
title: "Corpus Ingestion and Governance Tree"
originalTitle: "In-repo corpus inventory (Phase 1)"
titleNote: "Normalized title used for architecture. Source records remain under their original collection titles and slugs."
navLabel: "Corpus Tree"
subtitle: "Metadata extraction, professional normalization, and boundary discipline"
year: 2026
status: "Phase 1 implemented"
type: "Methods framework"
family: "Methods and Infrastructure"
phase: "Phase 1 · Corpus ingestion"
entryRole: "major"
whatItDoes: "Defines how files are classified, named, and grouped without erasing source-author titles."
abstract: "This entry documents the ingestion protocol used for the current repository corpus: source-first metadata extraction, explicit classification logic, and a dual-layer naming system that preserves original titles while introducing a professional architecture layer for cards, navigation, and migration."
tags:
  - corpus ingestion
  - metadata governance
  - naming normalization
  - method architecture
  - migration readiness
featured: true
order: 10
relatedWorks:
  - authored-governance-tree-and-skill-ecosystem-maps
  - recursive-governance-under-constraint
  - sealed-card-protocol-accountability-seams
  - scriptorium-deterministic-recursive-infrastructure
  - repository-verification-and-merge-controls
sourcePaths:
  - docs/corpus-inventory.json
  - docs/corpus-inventory.md
  - docs/external-corpus-inventory.json
  - docs/external-corpus-inventory.md
  - scripts/generate-corpus-inventory.mjs
  - scripts/generate-external-corpus-inventory.py
  - src/content/projects/*
  - src/content/papers/*
  - src/content/writings/*
  - src/content/talks/*
links: []
---

## What this piece does

This piece establishes the methodological contract for Phase 1 of the governance-methods section. It specifies what was ingested, what was not available, how metadata was extracted, how naming was normalized, and how the resulting information tree was built for publication use without flattening authorial language.

## Core argument

A corpus architecture is already a governance decision. The moment files are sorted into sections, renamed for display, or promoted into “major” vs “supporting” layers, power is exercised over meaning. The argument here is that this power should be explicit, inspectable, and reversible.

The ingestion protocol therefore begins with bounded claims:

1. The active corpus is what exists in this repository now.
2. Referenced Windows-path files are logged as pending, not inferred.
3. Source titles are preserved; professional normalization is additive, not substitutive.

This method avoids two common errors. The first is archival overconfidence, where absent files are treated as if they had been read. The second is aesthetic sanitization, where naming cleanup quietly erases conceptual force from source material.

## Governance method and methodological contribution

The method has four operational commitments.

1. Source-first extraction. Metadata comes from file path, collection schema, frontmatter, and body text before any conceptual reframing.
2. Dual-layer naming. Each entry can carry both source title and normalized title. The normalized layer serves navigation and scale; the source layer preserves authorial and historical trace.
3. Proportional representation. Major entries receive full pages. Secondary or unstable records are represented with lighter weight and explicit status.
4. Boundary registry. Missing but referenced files are recorded in a pending register so future ingestion can reconcile without rewriting history.

This is implemented concretely in `scripts/generate-corpus-inventory.mjs`, which produces:

- `docs/corpus-inventory.json` for machine-readable classification,
- `docs/corpus-inventory.md` for a human-readable boundary and counts snapshot.

The output currently classifies 72 in-repo rows across projects, papers, writings, talks, and governance infrastructure artifacts.

## Power dynamics examined

The central power dynamic is editorial authority over legitimacy.

When a site labels one file as “major” and another as “supporting,” it does more than organize reading flow. It redistributes epistemic authority: what is interpreted as canonical, what is treated as context, and what is pushed into appendix status. That redistribution shapes how outside readers understand the project’s intellectual center.

This entry treats that power as a first-order governance issue. Classification rules are visible, and uncertainty is retained where evidence is incomplete. The method resists default prestige hierarchies (for example, privileging polished prose over operational artifacts) by explicitly recognizing that scripts, workflow files, and templates can function as governance constitutions.

## Ethical stakes

The ethical stakes are fidelity and accountability.

Fidelity means not claiming to have ingested material that is absent. Accountability means documenting why a naming or grouping decision was made, and where that decision can be revised.

Without those protections, architecture becomes narrative laundering: rough, conflictual, or transitional material disappears behind polished section labels. This protocol instead preserves roughness as data. If a source title is informal, that informality is kept in provenance while the navigation layer can still become legible to readers.

## Recursive and systemic implications

This method is recursively governable because it can audit itself. The inventory generator can be rerun as corpus state changes, and outputs can be diffed over time. That allows the architecture to evolve without losing traceability:

- new files enter through the same classification channel,
- changed statuses become explicit diffs,
- renamed navigation labels can be compared against preserved source titles.

In system terms, the corpus moves from ad hoc curation to a repeatable governance pipeline.

## Relation to other entries in the corpus

This entry is the structural parent for the method atlas.

- [Recursive Governance Under Constraint](/governance/methods/recursive-governance-under-constraint/) contributes the conceptual control model.
- [The Sealed Card Protocol and Accountability Seams](/governance/methods/sealed-card-protocol-accountability-seams/) contributes the protocol design logic.
- [Scriptorium as Deterministic Recursive Infrastructure](/governance/methods/scriptorium-deterministic-recursive-infrastructure/) contributes execution-level method tooling.
- [Repository Verification and Merge Controls](/governance/methods/repository-verification-and-merge-controls/) contributes merge/deploy governance enforcement.

## Why it matters

If this section is meant to migrate into a larger Pharos suite later, portability has to be earned now. Portability is not mainly a framework question. It is a governance question: whether naming, classification, and evidence boundaries are explicit enough to survive context transfer.

This entry establishes that baseline. It turns “site organization” into a reviewable method with preserved provenance, bounded claims, and repeatable outputs.
