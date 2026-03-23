export const methodsPageMeta = {
  title: 'Governance Methods Atlas',
  description:
    'A corpus-grounded governance methods section: conceptual framing, protocols, recursive control structures, and implementation-level governance artifacts.',
} as const;

export const inferredTree = [
  {
    id: 'conceptual-frames',
    title: 'Conceptual Governance Frames',
    rationale:
      'Pieces that define the argument boundary: legitimacy, interruption, provenance, and the interpretive conditions of control.',
  },
  {
    id: 'protocol-design',
    title: 'Protocol and Procedural Design',
    rationale:
      'Entries that translate framing into repeatable protocol forms, mediation logic, and accountability pathways.',
  },
  {
    id: 'methods-infrastructure',
    title: 'Methods and Infrastructure',
    rationale:
      'Operational artifacts where governance becomes executable: app workbenches, CI gates, review templates, and runbooks.',
  },
  {
    id: 'public-translation',
    title: 'Companion and Public Translation Layer',
    rationale:
      'Public writing, talks, and supporting records that interpret or stress-test the method from outside the core protocol layer.',
  },
] as const;

export const infrastructureEvidence = [
  {
    title: 'Verify CI workflow',
    path: '.github/workflows/verify.yml',
    role: 'Check gate on pull requests and pushes to main.',
  },
  {
    title: 'Smoke route harness',
    path: 'scripts/smoke.mjs',
    role: 'Build-and-preview route verification over key public surfaces.',
  },
  {
    title: 'Ownership map',
    path: '.github/CODEOWNERS',
    role: 'Default ownership declaration for review accountability.',
  },
  {
    title: 'PR accountability template',
    path: '.github/pull_request_template.md',
    role: 'Contributor verification and governance-change declarations.',
  },
  {
    title: 'Maintainer governance runbook',
    path: 'README.md',
    role: 'Manual GitHub and Cloudflare controls documented outside code execution.',
  },
] as const;

export const pendingExternalCorpus = [
  {
    title: 'To Codex for Website cards.zip',
    locationHint: 'Local archive: To Codex for Website cards.zip',
    note: 'Referenced by user; canonical imported copy is not yet linked in-repo.',
  },
  {
    title: 'For Her Alone to Wield The Infras.txt',
    locationHint: 'Local document: For Her Alone to Wield The Infras.txt',
    note: 'Path referenced by user; authoritative source file still pending explicit integration.',
  },
  {
    title: 'HEPHAISTOS AGENT artifacts',
    locationHint: 'Expected as dedicated source packet if methodologically central',
    note: 'Skill-stack operating-system layer is now documented; standalone canonical runtime manifest is still pending.',
  },
] as const;
