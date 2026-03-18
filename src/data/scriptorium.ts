export const scriptoriumSurfaces = [
  {
    eyebrow: 'Builder',
    title: 'Generate a deterministic recursive paper packet.',
    description:
      'Turn a topic, archive, or manuscript into a bounded paper packet with artifact classes, manuscript scans, Henry reviewer pressure, tests, and controls already in place.',
    href: '#scriptorium-builder',
    cta: 'Use the builder',
  },
  {
    eyebrow: 'Method',
    title: 'Work from the recursive method first.',
    description:
      'Scriptorium is governed by Martin Lepage’s deterministic recursive method: artifact hierarchy, bounded claims, interruption points, and interface-bound controls.',
    href: '#scriptorium-method',
    cta: 'Read the method',
  },
  {
    eyebrow: 'Project',
    title: 'Open the public project record.',
    description:
      'Return to the public-facing project entry that situates Scriptorium alongside the rest of the local-first app line.',
    href: '/projects/scriptorium/',
    cta: 'Open the project',
  },
  {
    eyebrow: 'Outputs',
    title: 'See what the live surface produces.',
    description:
      'The web surface now ingests long-form manuscript text or `.docx` files and generates recursive analysis packets, quote and reference scans, Henry reviewer sections, disclosure language, and reviewer-pressure scaffolds.',
    href: '#scriptorium-outputs',
    cta: 'View outputs',
  },
] as const;

export const scriptoriumMethodCommitments = [
  {
    title: 'Artifact hierarchy beats fluency.',
    body:
      'Polished synthesis does not outrank the source tree it compresses. Scriptorium starts by separating source-bearing, generated, control, and visualization artifacts.',
  },
  {
    title: 'Recursion has to earn another pass.',
    body:
      'If the next pass only adds polish, the method stops. Additional recursion is allowed only when it increases explanatory power or clarifies a real control problem.',
  },
  {
    title: 'Every claim needs a mechanism.',
    body:
      'The builder keeps the claim, the mechanism, and the consequence domain visibly linked so conclusions do not drift into unsupported certainty.',
  },
  {
    title: 'Controls bind to interfaces.',
    body:
      'A useful control names the failure pattern, the workflow interface, the accountable actor, the evidence artifact, and the review trigger.',
  },
  {
    title: 'Interruption stays available.',
    body:
      'Scriptorium assumes every serious packet needs a practical interruption point where an editor, operator, or reviewer can reopen the claim before authority hardens.',
  },
  {
    title: 'Human control remains explicit.',
    body:
      'AI can support clerical, structural, or epistemic mediation, but it is not treated as an evidentiary authority. Evidence hierarchy and normative judgment stay under human control.',
  },
] as const;

export const scriptoriumExecutionLayers = [
  {
    eyebrow: 'Archive map',
    title: 'Separate the packet before drafting.',
    body:
      'The builder begins with source-bearing artifacts, generated synthesis layers, control artifacts, and visualizations so the memo knows what each layer can actually support.',
  },
  {
    eyebrow: 'Recursive tests',
    title: 'Run the same bounded checks every time.',
    body:
      'Source-tree, re-entry, admissibility, method-lock, interruption, and escalation tests stay visible so recursion does not quietly become authority.',
  },
  {
    eyebrow: 'Controls',
    title: 'Translate failure into interface-bound controls.',
    body:
      'Each generated packet includes controls with owners, triggers, evidence requirements, and review intervals rather than vague calls for oversight.',
  },
  {
    eyebrow: 'Outputs',
    title: 'Export writing scaffolds, not fake certainty.',
    body:
      'The live site produces deterministic manuscript packets, quote and reference scans, Henry reviewer sections, and disclosure language. It still does not claim that software alone confers actual peer review.',
  },
] as const;

export const scriptoriumPaperApproaches = [
  {
    slug: 'theoretical-conceptual',
    label: 'Theoretical or conceptual',
    description:
      'Best for argument-led papers that clarify a mechanism, concept, or governing distinction rather than presenting new empirical fieldwork.',
    outline: [
      'Title',
      'Abstract',
      'Introduction and governing claim',
      'Literature and conceptual framing',
      'Core analytic distinction or mechanism',
      'Boundary conditions or counter-position',
      'Conclusion',
    ],
    methodPrompt:
      'Define the key concept early, clamp the scope, and make the mechanism do real explanatory work instead of decorative theoretical signaling.',
  },
  {
    slug: 'literature-review',
    label: 'Literature review',
    description:
      'Best for debate-mapping, field synthesis, gap identification, and evidence-led review essays.',
    outline: [
      'Title',
      'Abstract',
      'Introduction and review question',
      'Search strategy or inclusion logic',
      'Debate map',
      'Synthesis and tensions',
      'Gaps and implications',
      'Conclusion',
    ],
    methodPrompt:
      'Explain how sources were chosen, organize by problem or debate, and keep the synthesis argumentative rather than source-by-source.',
  },
  {
    slug: 'qualitative-empirical',
    label: 'Qualitative empirical',
    description:
      'Best for interview, ethnographic, discourse, archival, or case-based papers where interpretation depends on a clear design and corpus.',
    outline: [
      'Title',
      'Abstract',
      'Introduction',
      'Literature review',
      'Methods and corpus',
      'Findings or analytic sections',
      'Discussion',
      'Limitations',
      'Conclusion',
    ],
    methodPrompt:
      'Name the corpus, selection logic, analytic procedure, and limits clearly enough that a reviewer can see how the claims became possible.',
  },
  {
    slug: 'quantitative-empirical',
    label: 'Quantitative empirical',
    description:
      'Best for data-driven papers that depend on operationalization, inference discipline, and clear results reporting.',
    outline: [
      'Title',
      'Abstract',
      'Introduction',
      'Literature review',
      'Data and methods',
      'Results',
      'Robustness checks',
      'Discussion',
      'Limitations',
      'Conclusion',
    ],
    methodPrompt:
      'Operationalize constructs explicitly, match the claim strength to the design, and show what the data can and cannot support.',
  },
  {
    slug: 'mixed-methods',
    label: 'Mixed methods',
    description:
      'Best for papers combining qualitative and quantitative evidence that need clear integration rather than parallel underdeveloped halves.',
    outline: [
      'Title',
      'Abstract',
      'Introduction',
      'Literature review',
      'Design and data',
      'Qualitative findings',
      'Quantitative findings',
      'Integrated discussion',
      'Limitations',
      'Conclusion',
    ],
    methodPrompt:
      'Explain why both methods are needed, what each contributes, and where the integration actually changes the argument.',
  },
  {
    slug: 'humanities-interpretive',
    label: 'Humanities or interpretive',
    description:
      'Best for close reading, archival interpretation, historical argument, myth analysis, or conceptually dense humanities work.',
    outline: [
      'Title',
      'Abstract',
      'Introduction and stakes',
      'Corpus, archive, or historical frame',
      'Conceptual framing',
      'Interpretive analysis',
      'Boundary case or counter-reading',
      'Conclusion',
    ],
    methodPrompt:
      'Avoid anachronism, define the corpus, and keep interpretive leaps tethered to textual, archival, or historical evidence.',
  },
] as const;

export const scriptoriumManuscriptStages = [
  {
    slug: 'idea-formation',
    label: 'Idea formation',
    description:
      'Use when the paper is still emerging and the main need is a claim, scope, contribution ladder, and initial outline.',
  },
  {
    slug: 'outline-development',
    label: 'Outline development',
    description:
      'Use when the paper structure is being planned and each section still needs a clear job, question, and evidence demand.',
  },
  {
    slug: 'section-drafting',
    label: 'Section drafting',
    description:
      'Use when some prose exists but the manuscript still needs section-level strengthening, evidence discipline, and better transitions.',
  },
  {
    slug: 'full-manuscript-revision',
    label: 'Full manuscript revision',
    description:
      'Use when the draft exists end to end and needs stronger argument control, scope tightening, and reviewer-style pressure testing.',
  },
  {
    slug: 'reviewer-response-revision',
    label: 'Reviewer-response revision',
    description:
      'Use when the paper already has feedback and the next task is targeted repair rather than first-draft invention.',
  },
  {
    slug: 'submission-packaging',
    label: 'Submission packaging',
    description:
      'Use when the draft is close to submission and the main task is readiness, consistency, and boundary control.',
  },
] as const;

export const scriptoriumHenrySequence = [
  {
    slug: 'supportive-rigorous',
    label: 'Supportive but rigorous Reviewer',
    purpose:
      'Identifies promise, clarifies contribution, and suggests strengthening moves without relaxing standards.',
  },
  {
    slug: 'cold-methodological',
    label: 'Cold Methodological Reviewer',
    purpose:
      'Targets design flaws, causal overreach, construct ambiguity, inference gaps, and replicability weaknesses.',
  },
  {
    slug: 'harsh-reviewer-2',
    label: 'Classic Harsh Reviewer #2',
    purpose:
      'Hunts overclaiming, theoretical thinness, boundary failure, conceptual slippage, anachronism, and epistemic inflation.',
  },
  {
    slug: 'relaxed-reviewer-3',
    label: 'Overly Relaxed Reviewer #3',
    purpose:
      'Shows what weak review might let pass, so the stronger reviewers do not become optional.',
  },
] as const;

export const scriptoriumUsageSteps = [
  {
    label: '1. Name what you are working on.',
    body:
      'Start with the packet title or topic field. Use the name of a manuscript, archive, workflow problem, or research question you want the packet to organize.',
  },
  {
    label: '2. Choose the governing object.',
    body:
      'Pick the main kind of problem you are dealing with: a source tree, a recursive workflow, a governance failure, a disclosure problem, or a control design problem.',
  },
  {
    label: '3. Pick the kind of output you need.',
    body:
      'Select whether you want a recursive analysis memo, an evidence hierarchy note, a control register, disclosure language, or a reviewer-pressure memo.',
  },
  {
    label: '4. Choose the paper approach and manuscript stage.',
    body:
      'Tell Scriptorium what kind of paper you are building and how far along it is. The outline, review criteria, and revision priorities will change based on those choices.',
  },
  {
    label: '5. Add the manuscript or notes.',
    body:
      'Paste the manuscript, upload a `.txt`, `.md`, or `.docx` file, and optionally add quotes or a reference list. The app scans what you give it; it does not invent sources.',
  },
  {
    label: '6. Describe the packet conditions.',
    body:
      'Set the archive profile, consequence domain, and recursive pressure so Scriptorium knows what kind of evidence mix and risk level it is working with.',
  },
  {
    label: '7. Click Build packet.',
    body:
      'The app will generate a bounded packet scaffold with a paper outline, claim ladder, quote and reference scan, Henry reviewer sections, controls, disclosure language, and a markdown export.',
  },
  {
    label: '8. Read, adjust, then copy.',
    body:
      'Review the generated packet, make sure the claim boundary is right, then use Copy packet to move the markdown into your notes, manuscript, or working memo.',
  },
] as const;

export const scriptoriumFieldGuide = [
  {
    title: 'Packet title or topic',
    body:
      'Use this for the exact thing you are trying to frame. Good examples are a book chapter, a document packet, a recursive review loop, or a governance memo topic.',
  },
  {
    title: 'Governing object',
    body:
      'This tells the app what the packet is mainly about. If you are unsure, choose the problem that most strongly determines the rest of the analysis.',
  },
  {
    title: 'Output mode',
    body:
      'This chooses the shape of the result. Use the memo for broad analysis, the hierarchy note for messy evidence, the control register for workflow fixes, and disclosure when AI-use wording matters.',
  },
  {
    title: 'Paper approach',
    body:
      'Choose the kind of paper you are actually writing. Scriptorium uses this to shape the section outline and to decide what Henry should attack first.',
  },
  {
    title: 'Manuscript stage',
    body:
      'Pick the stage honestly. Early-stage packets get more scaffolding; later-stage packets get harder reviewer pressure and tighter readiness checks.',
  },
  {
    title: 'Consequence domain',
    body:
      'This tells Scriptorium where the consequences land most heavily: authorship, auditability, workflow, legitimacy, documentation, release, or review.',
  },
  {
    title: 'Archive profile',
    body:
      'Pick the profile that best matches your material. For example, choose source-heavy for direct records, mixed archive for layered packets, draft-heavy for revisions, and control-heavy for governance materials.',
  },
  {
    title: 'Recursive pressure',
    body:
      'Use bounded pass when the loop is still contained, active loop when derived packets are already shaping later rounds, and high recursion when governance packets are governing other governance packets.',
  },
] as const;

export const scriptoriumPracticalTips = [
  'If you are new to the method, start with `Recursive analysis memo`, `Mixed archive`, `Bounded pass`, and the paper approach that most honestly matches your manuscript.',
  'Long drafts are supported. A 10,000-word manuscript can be pasted or uploaded and exported as a full packet without a short-summary cap.',
  'If a polished summary already exists, use the source-tree and re-entry tests first before trusting it.',
  'If you upload a Word file, use `.docx`. Older `.doc` files should be resaved as `.docx` before uploading.',
  'If the packet is for publication or review, read the Henry sections, bounded conclusion, and disclosure language before copying it out.',
  'If the output feels too broad, narrow the governing object before changing anything else.',
] as const;

export const scriptoriumLineage = [
  {
    title: 'Method first, lineage second.',
    body:
      'Scriptorium is publicly framed around Martin Lepage’s deterministic recursive method, not around generic “one-click paper” claims.',
  },
  {
    title: 'Adapted from an MIT-licensed base.',
    body:
      'The local execution line is being adapted from the MIT-licensed AutoResearchClaw codebase by Aiming Lab, then reworked into Martin’s own Scriptorium framing and control language.',
  },
  {
    title: 'Bounded public claims.',
    body:
      'The public site does not claim autonomous publication-ready truth. It presents the builder honestly as a live deterministic packet surface with deeper local-first execution still under development.',
  },
] as const;

export const scriptoriumBuilderData = {
  governingObjects: [
    {
      slug: 'source-tree',
      label: 'Source tree',
      description:
        'Use when first-order notes, logs, correspondence, standards, or manuscripts should stay above later syntheses.',
      mechanism:
        'It holds factual and procedural claims close to first-order evidence instead of letting later compression take over.',
      interface:
        'archive intake and citation map',
      controlFocus:
        'Require each major claim to point back to the closest source-bearing artifact before any generated synthesis is allowed to summarize it.',
      keyQuestion:
        'Which material is closest to first-order evidence, and what downstream layer is trying to replace it?',
    },
    {
      slug: 'recursive-workflow',
      label: 'Recursive workflow',
      description:
        'Use when outputs, summaries, or governance packets re-enter the loop and start steering later rounds.',
      mechanism:
        'It diagnoses how derived artifacts re-enter as if they were source and where the loop hardens into authority.',
      interface:
        'stage handoff and packet promotion',
      controlFocus:
        'Gate re-entry by marking derived artifacts explicitly and requiring a human promotion decision before they can act as governing inputs.',
      keyQuestion:
        'Where did a derived artifact re-enter the loop as source, and what changed after that handoff?',
    },
    {
      slug: 'governance-failure',
      label: 'Governance failure',
      description:
        'Use when a system feels authoritative but no longer remains steerable, inspectable, or contestable.',
      mechanism:
        'It traces how missing interruption points and shifting admissibility rules turn a workflow problem into a legitimacy problem.',
      interface:
        'review gate and escalation path',
      controlFocus:
        'Bind every quality gate to a visible interruption point with owner, evidence requirement, and explicit appeal trigger.',
      keyQuestion:
        'Where did accountability disappear in practice even though governance language remained present?',
    },
    {
      slug: 'disclosure-problem',
      label: 'Disclosure problem',
      description:
        'Use when the packet needs precise language about clerical, structural, or epistemic AI mediation.',
      mechanism:
        'It distinguishes the layer of mediation from the source hierarchy so authorship claims stay specific and honest.',
      interface:
        'author note and release language',
      controlFocus:
        'Require disclosure language to name the exact mediation layer and forbid euphemisms that flatten epistemic assistance into proofreading.',
      keyQuestion:
        'What layer of reasoning did the system actually shape, and how should that be disclosed?',
    },
    {
      slug: 'control-design',
      label: 'Control design problem',
      description:
        'Use when the main task is translating recurring failure patterns into concrete workflow controls.',
      mechanism:
        'It turns drift, omission, and re-entry into interface-bound requirements instead of leaving them as narrative concerns.',
      interface:
        'workflow owner, evidence artifact, and review interval',
      controlFocus:
        'Convert each major finding into a testable control with owner, trigger, evidence, and review cadence.',
      keyQuestion:
        'What control would actually change behavior at the point where the failure pattern appears?',
    },
  ],
  outputModes: [
    {
      slug: 'recursive-analysis-memo',
      label: 'Recursive analysis memo',
      description:
        'A full packet with governing object, archive map, evidence hierarchy, recursive risks, controls, and bounded conclusion.',
      summaryLead:
        'Use the default memo structure when the packet is mixed and the main goal is a bounded governance reading rather than a loose thematic summary.',
      exportHeading: 'Recursive analysis memo',
    },
    {
      slug: 'evidence-hierarchy-note',
      label: 'Evidence hierarchy note',
      description:
        'A lighter output that ranks source-bearing material, process-diagnostic artifacts, and generated layers that should not be treated as source.',
      summaryLead:
        'Use this when the archive is messy, contested, or still being triaged and the immediate need is to stabilize what counts as evidence.',
      exportHeading: 'Evidence hierarchy note',
    },
    {
      slug: 'control-register',
      label: 'Control register',
      description:
        'A governance register focused on findings, mechanisms, controls, owners, evidence, review intervals, and consequence domains.',
      summaryLead:
        'Use this when the packet has already exposed a recurring failure pattern and the next step is operational control design.',
      exportHeading: 'Control register',
    },
    {
      slug: 'disclosure-language',
      label: 'Disclosure language',
      description:
        'A function-specific authorship note that distinguishes clerical, structural, and epistemic mediation.',
      summaryLead:
        'Use this when the main question is how to describe AI involvement without overstating or minimizing its role.',
      exportHeading: 'Disclosure language packet',
    },
    {
      slug: 'reviewer-pressure-memo',
      label: 'Reviewer-pressure memo',
      description:
        'A targeted memo for draft comparison, surviving claims, remaining warrant problems, and the next surgical fix.',
      summaryLead:
        'Use this when multiple drafts or reviewer rounds already exist and the concern is where the manuscript still overclaims.',
      exportHeading: 'Reviewer-pressure memo',
    },
  ],
  archiveProfiles: [
    {
      slug: 'source-heavy',
      label: 'Source-heavy packet',
      description:
        'Primary notes, logs, records, direct manuscripts, or correspondence dominate the packet.',
      sourceBearing:
        'notes, logs, direct records, primary manuscript passages, archived correspondence',
      generated:
        'clean copies, summaries, rewritten comparison notes, editorial compression',
      control:
        'method notes, review gates, citation rules, release checklists',
      visualization:
        'simple diagrams or timelines that render structure without settling the facts',
      evidencePriority:
        'Factual claims should stay anchored in the first-order record; generated layers may diagnose routing or omission but should not outrank the source tree.',
      evidenceArtifact:
        'a cited source-bearing passage or direct record',
      mainRisk:
        'a polished summary silently replacing the first-order record',
    },
    {
      slug: 'mixed-archive',
      label: 'Mixed archive',
      description:
        'Source material, generated synthesis, control artifacts, and visualizations all matter and need to stay visibly distinct.',
      sourceBearing:
        'notes, drafts, direct records, manuscript passages, standards, logged workflow events',
      generated:
        'revisions, clean summaries, AI rewrites, comparison packets, editorial syntheses',
      control:
        'method statements, review worksheets, control tables, release rules',
      visualization:
        'storyboards, diagrams, dashboards, HTML views, deck-style renderings',
      evidencePriority:
        'Source-bearing artifacts support factual claims, generated layers diagnose process, control artifacts support design inference, and visualizations show structure rather than settle disputes.',
      evidenceArtifact:
        'a paired source-bearing artifact plus the downstream packet that compresses it',
      mainRisk:
        'layer collapse that treats the whole archive as one flat evidentiary pool',
    },
    {
      slug: 'draft-heavy',
      label: 'Draft-heavy packet',
      description:
        'The packet is dominated by revised drafts, comparison files, clean copies, and reviewer-facing materials.',
      sourceBearing:
        'older draft sections, anchor citations, direct source notes, author annotations',
      generated:
        'comparison drafts, rewritten sections, AI cleanups, polished summary paragraphs',
      control:
        'revision notes, reviewer memos, claim-boundary instructions',
      visualization:
        'markup tables, track-change exports, version maps',
      evidencePriority:
        'Generated drafts are evidence of process and pressure, not automatic evidence of fact. Anchor the surviving claim to the strongest remaining source-bearing layer.',
      evidenceArtifact:
        'the strongest surviving source note plus the draft section it supports',
      mainRisk:
        'method lock caused by one edited path becoming the only visible account of the archive',
    },
    {
      slug: 'control-heavy',
      label: 'Control-heavy packet',
      description:
        'Rules, gates, checklists, decision tables, and governance materials dominate the packet.',
      sourceBearing:
        'governing instructions, operational records, issue logs, direct process evidence',
      generated:
        'policy rewrites, compliance summaries, executive synthesis notes',
      control:
        'decision rules, gate definitions, owner maps, review schedules, escalation conditions',
      visualization:
        'control matrices, dashboards, pipeline maps, policy diagrams',
      evidencePriority:
        'Control artifacts show how the workflow claims to govern itself; source-bearing records test whether those controls actually bind in practice.',
      evidenceArtifact:
        'a direct process record plus the control artifact that was supposed to govern it',
      mainRisk:
        'governance language appearing strong while the live interface remains weak or contest-free',
    },
  ],
  consequenceDomains: [
    {
      slug: 'authorship',
      label: 'Authorship',
      owner:
        'author or lead editor',
      risk:
        'AI mediation is misstated or hidden, leading to false claims about who shaped the reasoning',
      trigger:
        'when generated language or analysis materially changes how the argument is organized or interpreted',
      emphasis:
        'disclosure precision and mediation layer',
    },
    {
      slug: 'auditability',
      label: 'Auditability',
      owner:
        'workflow owner or reviewer',
      risk:
        'later readers cannot reconstruct how claims were admitted, escalated, or revised',
      trigger:
        'when the packet crosses a review gate or moves from draft to release',
      emphasis:
        'artifact traceability and evidence hierarchy',
    },
    {
      slug: 'workflow',
      label: 'Workflow',
      owner:
        'operator or process lead',
      risk:
        'handoffs become smooth but unanswerable, allowing recursive drift to accumulate',
      trigger:
        'when a derived packet becomes a new input to the next stage',
      emphasis:
        'handoff controls and stop rules',
    },
    {
      slug: 'legitimacy',
      label: 'Legitimacy',
      owner:
        'human author and final approver',
      risk:
        'authority hardens faster than explanation, making the system feel persuasive but uncontestable',
      trigger:
        'when a packet becomes the public-facing account or final published explanation',
      emphasis:
        'bounded claims and interruption points',
    },
    {
      slug: 'documentation',
      label: 'Documentation',
      owner:
        'documentation lead or archivist',
      risk:
        'artifact classes blur and the record loses its internal hierarchy',
      trigger:
        'when source material is cleaned, merged, or transformed for circulation',
      emphasis:
        'archive separation and source labels',
    },
    {
      slug: 'release',
      label: 'Release',
      owner:
        'release manager or publisher',
      risk:
        'a polished packet ships before its claim boundary and evidence path are reviewable',
      trigger:
        'when the memo moves from internal draft to external distribution',
      emphasis:
        'release gating and sign-off evidence',
    },
    {
      slug: 'review',
      label: 'Review',
      owner:
        'reviewer, peer reader, or editor',
      risk:
        'reviewers inherit a shaped narrative without seeing where the warrant still fails',
      trigger:
        'when revisions respond to feedback or prepare for another review round',
      emphasis:
        'reviewer-pressure, surviving claims, and next surgical fix',
    },
  ],
  recursivePressures: [
    {
      slug: 'bounded',
      label: 'Bounded pass',
      description:
        'One main pass plus a comparison pass. Good when the archive is still stable and the main goal is disciplined framing.',
      reviewInterval:
        'before the next draft or promotion step',
      tests: ['source-tree', 'admissibility', 'interruption'],
      riskNote:
        'The main risk is premature confidence before the evidence hierarchy is visible.',
    },
    {
      slug: 'active-loop',
      label: 'Active loop',
      description:
        'Several recursive passes already exist and some derived artifacts are shaping later interpretation.',
      reviewInterval:
        'at every major handoff between stages',
      tests: ['source-tree', 're-entry', 'method-lock', 'interruption', 'escalation'],
      riskNote:
        'The main risk is method lock: a repeated summary shape becoming the only visible account of the packet.',
    },
    {
      slug: 'high-recursion',
      label: 'High recursion',
      description:
        'Generated governance or analysis packets are re-entering the system as governing inputs and need stronger containment.',
      reviewInterval:
        'at each recursive pass and before any external release',
      tests: ['source-tree', 're-entry', 'admissibility', 'method-lock', 'interruption', 'escalation'],
      riskNote:
        'The main risk is governance-on-governance drift, where the loop begins governing itself through derived artifacts.',
    },
  ],
  testLibrary: {
    'source-tree': {
      label: 'Source-tree test',
      prompt:
        'What in this packet is closest to first-order evidence, and what downstream artifact is trying to replace it?',
    },
    're-entry': {
      label: 'Re-entry test',
      prompt:
        'Which derived artifact has re-entered the workflow as if it were source, and what governance-on-governance risk follows from that re-entry?',
    },
    admissibility: {
      label: 'Admissibility test',
      prompt:
        'What was allowed into the loop at each stage, what was excluded, and where did the governing object quietly change?',
    },
    'method-lock': {
      label: 'Method-lock test',
      prompt:
        'Has one summary path hardened into the only visible account of the archive, hiding competing branches or unstable inputs?',
    },
    interruption: {
      label: 'Interruption test',
      prompt:
        'Where can an editor, reviewer, operator, or affected party reopen the claim before authority hardens?',
    },
    escalation: {
      label: 'Escalation test',
      prompt:
        'Did the next recursive pass add explanatory power, or did it only add polish? If it only added polish, stop the loop.',
    },
  },
} as const;
