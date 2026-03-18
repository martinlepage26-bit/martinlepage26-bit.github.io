import {
  scriptoriumBuilderData,
  scriptoriumHenrySequence,
  scriptoriumManuscriptStages,
  scriptoriumPaperApproaches,
} from '../data/scriptorium';

type Slugged = {
  slug: string;
};

type TestStatus = 'stable' | 'watch' | 'stop';

type OutlineStatus = 'present' | 'needed';

type ReviewerSeverity = 'promising' | 'repair' | 'blocker';

type LabeledReading = {
  label: string;
  body: string;
};

export type ScriptoriumState = {
  title: string;
  object: string;
  mode: string;
  profile: string;
  domain: string;
  pressure: string;
  approach: string;
  stage: string;
  manuscript: string;
  quoteNotes: string;
  references: string;
  sourceLabel: string;
};

export type ScriptoriumPacket = ReturnType<typeof buildScriptoriumPacket>;

const COMMON_SECTION_TITLES = new Set([
  'abstract',
  'introduction',
  'background',
  'literature review',
  'review of literature',
  'theory',
  'theoretical framing',
  'conceptual framing',
  'methods',
  'methodology',
  'data',
  'data and methods',
  'results',
  'findings',
  'analysis',
  'discussion',
  'limitations',
  'conclusion',
  'references',
  'bibliography',
  'works cited',
  'sources',
  'appendix',
]);

const REFERENCE_SECTION_TITLES = new Set(['references', 'bibliography', 'works cited', 'sources']);

const OVERCLAIM_PATTERNS = [
  {
    label: 'proof language',
    pattern: /\b(prove|proves|proved|proven|proof)\b/i,
    guidance: 'Replace proof language with support language unless the evidence genuinely warrants stronger certainty.',
  },
  {
    label: 'certainty language',
    pattern: /\b(definitive(?:ly)?|undeniable|unquestionable|beyond doubt|irrefutable|conclusive)\b/i,
    guidance: 'Clamp certainty to the actual evidentiary base and name the remaining uncertainty directly.',
  },
  {
    label: 'totalizing language',
    pattern: /\b(always|never|everyone|no one|all cases|every case|entirely|completely)\b/i,
    guidance: 'Swap totalizing language for bounded scope language that names actors, corpus, period, or conditions.',
  },
  {
    label: 'novelty theater',
    pattern: /\b(first(?: ever)?|unprecedented|wholly new|entirely original|groundbreaking)\b/i,
    guidance: 'State the contribution concretely instead of leaning on unverified novelty claims.',
  },
  {
    label: 'causal overreach',
    pattern: /\b(produces|causes|determines|drives|leads to|results in)\b/i,
    guidance: 'Make sure causal verbs match the design and evidence rather than outrunning them.',
  },
];

const CLAIM_VERB_PATTERN =
  /\b(argue|argues|argued|show|shows|showed|demonstrate|demonstrates|demonstrated|suggest|suggests|suggested|propose|proposes|proposed|contend|contends|contended|reveal|reveals|revealed|find|finds|found|examine|examines|examined|trace|traces|traced|map|maps|mapped|identify|identifies|identified|reframe|reframes|reframed|explain|explains|explained)\b/i;

const LIMITATION_PATTERN =
  /\b(limit|limits|limitation|limitations|constraint|constraints|caveat|caveats|boundary|boundaries|bounded|scope|future research|further research)\b/i;

const QUALITATIVE_CUES = ['interview', 'ethnograph', 'archive', 'archival', 'corpus', 'fieldwork', 'thematic', 'coding', 'discourse', 'case study'];
const QUANTITATIVE_CUES = ['dataset', 'survey', 'sample', 'regression', 'model', 'variable', 'coefficient', 'statistical', 'significant', 'n =', 'n='];
const REVIEW_CUES = ['search strategy', 'inclusion', 'exclusion', 'database', 'screening', 'reviewed', 'synthesis'];
const THEORY_CUES = ['concept', 'framework', 'mechanism', 'theory', 'theoretical', 'conceptual'];
const HUMANITIES_CUES = ['archive', 'text', 'corpus', 'manuscript', 'chronology', 'historical', 'close reading', 'interpretive', 'myth', 'period'];
const COUNTER_CUES = ['however', 'although', 'counter', 'limit', 'boundary', 'exception', 'nevertheless'];
const INTERVIEW_CUES = ['interview', 'focus group', 'participant', 'respondent', 'open-ended'];
const FIELD_CUES = ['fieldnote', 'observation', 'observed', 'shadowing', 'participant observation', 'ethnograph'];
const DOCUMENT_CUES = ['policy', 'document', 'speech', 'media', 'report', 'memo', 'guideline', 'charter', 'checklist'];
const LIFE_CUES = ['life story', 'life-history', 'memoir', 'diary', 'autobiograph', 'narrative'];
const GOVERNANCE_CUES = ['must', 'should', 'may', 'required', 'approval', 'exception', 'compliance', 'control', 'oversight', 'audit', 'review'];
const ACTOR_GROUPS = [
  { label: 'authors', cues: ['author', 'authors', 'researcher', 'researchers', 'writer', 'writers'] },
  { label: 'reviewers', cues: ['reviewer', 'reviewers', 'peer review', 'editor', 'editors'] },
  { label: 'participants', cues: ['participant', 'participants', 'respondent', 'respondents', 'interviewee', 'interviewees'] },
  { label: 'institutions', cues: ['institution', 'institutions', 'agency', 'department', 'organization', 'committee'] },
  { label: 'communities', cues: ['community', 'communities', 'public', 'audience', 'stakeholder', 'stakeholders'] },
] as const;

export const scriptoriumDefaultState: ScriptoriumState = {
  title: 'Scriptorium manuscript packet',
  object: 'recursive-workflow',
  mode: 'reviewer-pressure-memo',
  profile: 'draft-heavy',
  domain: 'review',
  pressure: 'active-loop',
  approach: 'theoretical-conceptual',
  stage: 'full-manuscript-revision',
  manuscript: '',
  quoteNotes: '',
  references: '',
  sourceLabel: 'Paste text or upload a file',
};

function findBySlug<T extends Slugged>(items: readonly T[], slug: string) {
  return items.find((item) => item.slug === slug) ?? items[0];
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, '').replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function countWords(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function normalizeLabel(value: string) {
  return compactWhitespace(value).toLowerCase().replace(/[.:]+$/g, '');
}

function splitSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map((sentence) => compactWhitespace(sentence)).filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => compactWhitespace(value)).filter(Boolean)));
}

function cleanCandidateText(value: string) {
  return compactWhitespace(value)
    .replace(/^[|_\-.\s]+|[|_\-.\s]+$/g, '')
    .replace(/^\d{1,4}\s+(?=[A-Za-z])/u, '')
    .replace(/^[ .;:\-|]+|[ .;:\-|]+$/g, '');
}

function inferHeadingLabel(lines: string[], index: number) {
  const raw = lines[index]?.trim() ?? '';

  if (!raw) {
    return '';
  }

  if (/^#{1,6}\s+/.test(raw)) {
    return cleanCandidateText(raw.replace(/^#{1,6}\s+/, ''));
  }

  const normalized = normalizeLabel(raw);

  if (COMMON_SECTION_TITLES.has(normalized)) {
    return raw.replace(/[:.]+$/g, '');
  }

  const previousBlank = index === 0 || !lines[index - 1]?.trim();
  const nextBlank = index === lines.length - 1 || !lines[index + 1]?.trim();

  if (
    previousBlank &&
    nextBlank &&
    raw.length <= 80 &&
    countWords(raw) <= 8 &&
    /^[A-Z0-9][A-Za-z0-9 ,:&/'-]+$/.test(raw) &&
    !/[.!?]$/.test(raw)
  ) {
    return raw;
  }

  return '';
}

function extractParagraphs(text: string) {
  return normalizeWhitespace(text)
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

type ParsedSection = {
  label: string;
  text: string;
  wordCount: number;
};

function buildChunkedSections(paragraphs: string[]): ParsedSection[] {
  if (!paragraphs.length) {
    return [];
  }

  const chunkSize = paragraphs.length > 9 ? 3 : 2;
  const sections: ParsedSection[] = [];

  for (let index = 0; index < paragraphs.length; index += chunkSize) {
    const chunk = paragraphs.slice(index, index + chunkSize);
    const text = chunk.join('\n\n');
    sections.push({
      label: `Passage ${sections.length + 1}`,
      text,
      wordCount: countWords(text),
    });
  }

  return sections;
}

function parseSections(text: string) {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return [] as ParsedSection[];
  }

  const lines = normalized.split('\n');
  const sections: ParsedSection[] = [];
  let sawHeading = false;
  let currentLabel = 'Opening';
  let currentLines: string[] = [];

  const pushCurrent = () => {
    const body = currentLines.join('\n').trim();
    if (!body && currentLabel === 'Opening') {
      currentLines = [];
      return;
    }

    if (body) {
      sections.push({
        label: currentLabel,
        text: body,
        wordCount: countWords(body),
      });
    }

    currentLines = [];
  };

  lines.forEach((line, index) => {
    const heading = inferHeadingLabel(lines, index);
    if (heading) {
      sawHeading = true;
      pushCurrent();
      currentLabel = heading;
      return;
    }

    currentLines.push(line);
  });

  pushCurrent();

  if (!sawHeading) {
    return buildChunkedSections(extractParagraphs(normalized));
  }

  return sections.filter((section) => section.text.trim());
}

function getReferenceSections(sections: ParsedSection[]) {
  return sections.filter((section) => REFERENCE_SECTION_TITLES.has(normalizeLabel(section.label)));
}

function looksLikeReferenceEntry(value: string) {
  const line = compactWhitespace(value);
  if (line.length < 18) {
    return false;
  }

  return (
    /\b(19|20)\d{2}[a-z]?\b/.test(line) ||
    /doi\.org|https?:\/\//i.test(line) ||
    /\bvol\.\b|\bno\.\b|\bpp?\.\b/i.test(line) ||
    /[A-Z][A-Za-z'`-]+,\s+[A-Z]/.test(line)
  );
}

function extractReferenceEntries(referencesField: string, sections: ParsedSection[]) {
  const manuscriptReferenceLines = getReferenceSections(sections)
    .flatMap((section) => section.text.split(/\n+/))
    .map(cleanCandidateText)
    .filter(looksLikeReferenceEntry);

  const manualReferenceLines = referencesField
    .split(/\n+/)
    .map(cleanCandidateText)
    .filter(looksLikeReferenceEntry);

  return uniqueStrings([...manualReferenceLines, ...manuscriptReferenceLines]);
}

function extractQuoteEntries(text: string, quoteNotes: string) {
  const inlineQuotes = Array.from(text.matchAll(/[“"]([^"”\n]{8,600})[”"]/g), (match) => cleanCandidateText(match[1] ?? ''));
  const blockQuotes = text
    .split('\n')
    .filter((line) => line.trim().startsWith('>'))
    .map((line) => cleanCandidateText(line.replace(/^>\s*/, '')));
  const manualQuotes = quoteNotes
    .split(/\n+/)
    .map(cleanCandidateText)
    .filter(Boolean);

  return uniqueStrings([...manualQuotes, ...inlineQuotes, ...blockQuotes]).filter((entry) => entry.length >= 8);
}

function extractInlineCitations(text: string) {
  const parenthetical = Array.from(
    text.matchAll(/\(([A-Z][A-Za-z'`-]+(?:\s+(?:et al\.|and\s+[A-Z][A-Za-z'`-]+))?,\s*(?:19|20)\d{2}[a-z]?(?:;\s*[A-Z][A-Za-z'`-]+,\s*(?:19|20)\d{2}[a-z]?)*?)\)/g),
    (match) => match[0],
  );
  const numeric = Array.from(text.matchAll(/\[\d+(?:\s*,\s*\d+)*\]/g), (match) => match[0]);
  const narrative = Array.from(text.matchAll(/\b[A-Z][A-Za-z'`-]+\s*\((?:19|20)\d{2}[a-z]?\)/g), (match) => match[0]);

  return uniqueStrings([...parenthetical, ...numeric, ...narrative]);
}

type OverclaimSignal = {
  label: string;
  sentence: string;
  guidance: string;
};

function collectOverclaimSignals(text: string) {
  const signals: OverclaimSignal[] = [];

  splitSentences(text).forEach((sentence) => {
    OVERCLAIM_PATTERNS.forEach((entry) => {
      if (entry.pattern.test(sentence)) {
        signals.push({
          label: entry.label,
          sentence,
          guidance: entry.guidance,
        });
      }
    });
  });

  return signals;
}

function includesAny(text: string, cues: readonly string[]) {
  const normalized = text.toLowerCase();
  return cues.some((cue) => normalized.includes(cue.toLowerCase()));
}

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function findClaimSentence(text: string) {
  const sentences = splitSentences(text);
  const claimSentence = sentences.find((sentence) => CLAIM_VERB_PATTERN.test(sentence) && sentence.length >= 60);
  return claimSentence ?? sentences.find((sentence) => sentence.length >= 80) ?? '';
}

function summarizeStrengths(
  text: string,
  sections: ParsedSection[],
  quotes: string[],
  references: string[],
  inlineCitations: string[],
) {
  const strengths: string[] = [];

  if (sections.length >= 4) {
    strengths.push(`The draft already shows visible architecture across ${sections.length} sections, which gives the argument a workable spine.`);
  }

  if (references.length >= 5 || inlineCitations.length >= 5) {
    strengths.push('There is a usable citation footprint to build from, which means the next revision can tighten claims instead of inventing a bibliography from scratch.');
  }

  if (quotes.length > 0) {
    strengths.push('Quoted material is present, so the manuscript has at least some anchor points where analysis can be made more explicit and accountable.');
  }

  if (LIMITATION_PATTERN.test(text)) {
    strengths.push('The manuscript already gestures toward limits or scope, which is a strong starting condition for bounded revision.');
  }

  if (!strengths.length) {
    strengths.push('The manuscript has enough topic visibility to support a disciplined revision path once the evidence hierarchy and section jobs are sharpened.');
  }

  return strengths;
}

function buildMethodConcerns(
  text: string,
  sections: ParsedSection[],
  approach: (typeof scriptoriumPaperApproaches)[number],
  stage: (typeof scriptoriumManuscriptStages)[number],
  references: string[],
  inlineCitations: string[],
) {
  const concerns: string[] = [];
  const normalizedText = text.toLowerCase();
  const hasMethodSection = sections.some((section) => ['methods', 'methodology', 'data and methods', 'data'].includes(normalizeLabel(section.label)));
  const hasDiscussionSection = sections.some((section) => ['discussion', 'conclusion', 'limitations'].includes(normalizeLabel(section.label)));

  if (stage.slug !== 'idea-formation' && countWords(text) >= 1800 && sections.length < 3) {
    concerns.push('The manuscript is long enough to need clearer section architecture, but the current sectioning remains thin or implicit.');
  }

  if (stage.slug !== 'idea-formation' && references.length === 0 && inlineCitations.length === 0) {
    concerns.push('The draft makes load-bearing moves without a visible reference trail, so the evidence path is not yet reviewable.');
  }

  if (!hasDiscussionSection && stage.slug !== 'idea-formation') {
    concerns.push('The draft needs a clearer limit, implication, or conclusion section so the argument can close without blur.');
  }

  switch (approach.slug) {
    case 'theoretical-conceptual':
      if (!includesAny(normalizedText, THEORY_CUES)) {
        concerns.push('The paper is marked as theoretical or conceptual, but the core concept or mechanism is not yet defined clearly enough to carry the argument.');
      }
      if (!includesAny(normalizedText, COUNTER_CUES)) {
        concerns.push('A conceptual paper still needs boundary conditions or a counter-position; right now the manuscript risks sounding unilateral.');
      }
      break;
    case 'literature-review':
      if (!includesAny(normalizedText, REVIEW_CUES)) {
        concerns.push('A literature review needs selection logic or inclusion language, and that logic is not yet visible in the current draft.');
      }
      if (references.length < 5 && inlineCitations.length < 5) {
        concerns.push('The review posture is not yet supported by a sufficiently visible citation base.');
      }
      break;
    case 'qualitative-empirical':
      if (!hasMethodSection) {
        concerns.push('The manuscript is framed as qualitative empirical work, but the design and corpus are not yet separated into a recognizable methods section.');
      }
      if (!includesAny(normalizedText, QUALITATIVE_CUES)) {
        concerns.push('Qualitative claims are appearing without enough visibility into corpus, fieldwork, interview, archive, or coding procedure.');
      }
      break;
    case 'quantitative-empirical':
      if (!hasMethodSection) {
        concerns.push('The manuscript is framed as quantitative, but the design, variables, or model logic are not clearly surfaced.');
      }
      if (!includesAny(normalizedText, QUANTITATIVE_CUES)) {
        concerns.push('Quantitative inference requires operationalization cues, and the current draft does not show enough data or model language yet.');
      }
      break;
    case 'mixed-methods':
      if (!includesAny(normalizedText, QUALITATIVE_CUES) || !includesAny(normalizedText, QUANTITATIVE_CUES)) {
        concerns.push('A mixed-methods paper needs both qualitative and quantitative visibility plus an integration logic; one side is still under-specified.');
      }
      break;
    case 'humanities-interpretive':
      if (!includesAny(normalizedText, HUMANITIES_CUES)) {
        concerns.push('Interpretive work still needs a visible corpus, archive, chronology, or textual frame; that object is not yet sharp enough here.');
      }
      if (!includesAny(normalizedText, COUNTER_CUES)) {
        concerns.push('The humanities reading needs a counter-reading, boundary case, or historicizing limit so interpretation does not harden into anachronistic certainty.');
      }
      break;
    default:
      break;
  }

  return uniqueStrings(concerns);
}

function buildContributionLadder(
  topic: string,
  claimSentence: string,
  governingObject: (typeof scriptoriumBuilderData.governingObjects)[number],
  consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number],
  approach: (typeof scriptoriumPaperApproaches)[number],
) {
  const descriptive =
    claimSentence || `The manuscript is building an argument about ${topic.toLowerCase()} through a ${approach.label.toLowerCase()} approach.`;

  const analytic = `The analytic payoff should come from showing how ${governingObject.label.toLowerCase()} organizes the manuscript's main mechanism rather than letting the paper drift into summary alone.`;

  const fieldLevel = `The field-level contribution should stay bounded to ${consequenceDomain.label.toLowerCase()} consequences and should say exactly what debate, workflow, or interpretive problem changes if the claim survives review.`;

  return [
    { label: 'Descriptive contribution', body: descriptive },
    { label: 'Analytic contribution', body: analytic },
    { label: 'Field-level contribution', body: fieldLevel },
  ];
}

function buildOutline(
  sections: ParsedSection[],
  approach: (typeof scriptoriumPaperApproaches)[number],
  stage: (typeof scriptoriumManuscriptStages)[number],
) {
  const normalizedSectionLabels = sections.map((section) => normalizeLabel(section.label));

  return approach.outline.map((entry) => {
    const normalizedEntry = normalizeLabel(entry);
    const present = normalizedSectionLabels.some(
      (label) => label.includes(normalizedEntry) || normalizedEntry.includes(label),
    );

    return {
      label: entry,
      status: present ? ('present' as OutlineStatus) : ('needed' as OutlineStatus),
      note: present
        ? 'Present in the current draft.'
        : stage.slug === 'idea-formation'
          ? 'Still expected later, but not a blocker at the idea stage.'
          : 'Add or sharpen this section so the manuscript can survive review pressure.',
    };
  });
}

function inferSectionFunction(label: string, index: number, total: number) {
  const normalized = normalizeLabel(label);

  if (normalized.includes('abstract')) {
    return 'Problem, object, method, main finding, and contribution snapshot.';
  }
  if (normalized.includes('introduction')) {
    return 'State the problem, governing claim, object, and stakes early.';
  }
  if (normalized.includes('literature') || normalized.includes('review')) {
    return 'Map debates, tensions, and gaps rather than stacking citations.';
  }
  if (normalized.includes('method') || normalized.includes('data')) {
    return 'Show design, corpus, selection logic, and analytic procedure clearly enough for review.';
  }
  if (normalized.includes('result') || normalized.includes('finding') || normalized.includes('analysis')) {
    return 'Deliver claim-led analysis with evidence and implication in the same section.';
  }
  if (normalized.includes('discussion')) {
    return 'Reconnect the findings to the field-level payoff and the bounded implications.';
  }
  if (normalized.includes('limit')) {
    return 'Name what the evidence cannot support and where the argument stops.';
  }
  if (normalized.includes('conclusion')) {
    return 'Close with a bounded restatement of the argument and its consequence.';
  }
  if (normalized.includes('reference') || normalized.includes('bibliography') || normalized.includes('works cited')) {
    return 'Document the visible source base behind the argument.';
  }
  if (index === 0) {
    return 'Open the argument and make the governing claim legible immediately.';
  }
  if (index === total - 1) {
    return 'Close the loop by naming the consequence and the limit together.';
  }
  return 'Carry a discrete piece of the argument instead of acting as transitional filler.';
}

function buildSectionDiagnostics(
  sections: ParsedSection[],
  stage: (typeof scriptoriumManuscriptStages)[number],
) {
  return sections.map((section, index) => {
    const citations = extractInlineCitations(section.text).length;
    const quotes = extractQuoteEntries(section.text, '').length;
    const overclaims = collectOverclaimSignals(section.text);

    let pressure = 'Clarify the exact job of this section and keep it linked to the governing claim.';
    let revision = 'Open the section with its claim, then add the exact evidence or citation that earns the paragraph-level inference.';

    if (overclaims.length) {
      pressure = `This section contains ${overclaims.length} overclaim signal(s), so the language is outrunning the visible warrant.`;
      revision = 'Tone down the strongest phrasing, then name the actual boundary or condition that limits the claim.';
    } else if (section.wordCount >= 220 && citations === 0 && quotes === 0 && !normalizeLabel(section.label).includes('conclusion')) {
      pressure = 'This section carries argumentative weight without enough visible quote or citation anchors.';
      revision = 'Add source anchors or empirical support before increasing rhetorical force.';
    } else if (section.wordCount < 90 && stage.slug !== 'idea-formation') {
      pressure = 'This section may be too thin to do a real argumentative job.';
      revision = 'Either merge it with a stronger neighboring section or give it a clearer claim and evidence payload.';
    } else if (normalizeLabel(section.label).includes('method') && !includesAny(section.text, [...QUALITATIVE_CUES, ...QUANTITATIVE_CUES, ...REVIEW_CUES])) {
      pressure = 'The section is labeled as method, but the design logic still remains too implicit.';
      revision = 'State the corpus, selection logic, analytic procedure, and limits in explicit terms.';
    }

    return {
      label: section.label,
      wordCount: section.wordCount,
      function: inferSectionFunction(section.label, index, sections.length),
      evidenceSignal: `${quotes} quote signal(s), ${citations} inline citation(s), ${overclaims.length} overclaim signal(s).`,
      pressure,
      revision,
    };
  });
}

function buildSupportCorroboration(
  claimSentence: string,
  quoteEntries: string[],
  referenceEntries: string[],
  inlineCitations: string[],
  overclaimSignals: OverclaimSignal[],
) {
  const activeSupportPoints = [quoteEntries.length > 0, inlineCitations.length > 0, referenceEntries.length > 0].filter(Boolean).length;

  let headline = 'No support anchors are visible yet, so the manuscript still reads mainly as assertion.';
  if (activeSupportPoints === 3) {
    headline = 'Three-point support is visible across quotations, inline citations, and the reference trail.';
  } else if (activeSupportPoints === 2) {
    headline = 'Support is partially triangulated, but one anchor type is still missing from the packet.';
  } else if (activeSupportPoints === 1) {
    headline = 'Only one support anchor is visible so far, which keeps the warrant thinner than the prose currently suggests.';
  }

  const bullets = [
    quoteEntries.length
      ? `${quoteEntries.length} quoted passage(s) are available as direct textual anchors.`
      : 'No quoted passages are currently visible, so textual support is still thin.',
    inlineCitations.length
      ? `${inlineCitations.length} inline citation signal(s) were detected inside the manuscript body.`
      : 'No inline citation signals were detected in the manuscript body.',
    referenceEntries.length
      ? `${referenceEntries.length} reference entry or entries were detected in the visible packet.`
      : 'No stable reference list is visible yet, so external warrant remains hard to audit.',
  ];

  const claimLevels: LabeledReading[] = [
    {
      label: 'Direct evidence',
      body: quoteEntries.length || inlineCitations.length || referenceEntries.length
        ? `The packet visibly contains ${quoteEntries.length} quote anchor(s), ${inlineCitations.length} inline citation signal(s), and ${referenceEntries.length} reference entry(ies).`
        : 'No direct support anchors are visible yet.',
    },
    {
      label: 'Supported inference',
      body: claimSentence
        ? `The governing claim can be pressure-tested against the visible anchors, but it still needs each major section to stay tied back to that evidence path.`
        : 'The draft has enough material to infer a topic, but not yet a strong governing claim with visible support.',
    },
    {
      label: 'Speculation boundary',
      body: overclaimSignals.length
        ? 'Overclaim signals show where the language is outrunning the current support trail and needs to be tightened.'
        : 'Even where the language is calm, unsupported claims should still be treated as provisional until the reference trail is fuller.',
    },
  ];

  return {
    headline,
    bullets,
    claimLevels,
  };
}

function buildRecursiveTriangulation(
  quoteEntries: string[],
  referenceEntries: string[],
  inlineCitations: string[],
  overclaimSignals: OverclaimSignal[],
  recursivePressure: (typeof scriptoriumBuilderData.recursivePressures)[number],
) {
  const anchorCount = [quoteEntries.length > 0, inlineCitations.length > 0, referenceEntries.length > 0].filter(Boolean).length;

  const beforePass =
    anchorCount >= 2
      ? 'Before each recursive pass, the packet shows enough support variety to keep revising without drifting fully into unsupported summary.'
      : 'Before the next recursive pass, stop and add more support variety. One anchor type alone is not enough for safe promotion.';

  const afterPass =
    overclaimSignals.length
      ? 'After each recursive pass, rerun the corroboration gate and tighten any new high-heat language before the draft is allowed to travel onward.'
      : 'After each recursive pass, rerun the corroboration gate to confirm the rewrite did not shed quotes, citations, or reference visibility.';

  return {
    headline: 'Every recursive step now carries a pre-pass and post-pass triangulation gate.',
    steps: [
      {
        label: 'Intake gate',
        body:
          anchorCount >= 1
            ? `At intake, the packet shows ${anchorCount} visible support channel(s). Keep building, but do not confuse intake with sufficient corroboration.`
            : 'At intake, no visible support channels are present yet. The packet should stay in a bounded diagnostic mode.',
      },
      {
        label: 'Before recursion',
        body: beforePass,
      },
      {
        label: 'After recursion',
        body: afterPass,
      },
      {
        label: 'Re-entry rule',
        body: `Under ${recursivePressure.label.toLowerCase()}, no recursive output should re-enter as a governing input unless the corroboration gate still passes after the rewrite.`,
      },
    ],
  };
}

function inferQualitativeMethod(text: string) {
  if (includesAny(text, INTERVIEW_CUES) && includesAny(text, LIFE_CUES)) {
    return {
      label: 'Narrative inquiry or life-history analysis',
      reason: 'The draft points toward interviews plus life-course or identity material, so sequence and turning points matter as much as themes.',
    };
  }

  if (includesAny(text, INTERVIEW_CUES)) {
    return {
      label: 'Thematic analysis',
      reason: 'Interview or open-ended material is visible, so patterned coding and theme-building are the most legible first pass.',
    };
  }

  if (includesAny(text, FIELD_CUES)) {
    return {
      label: 'Ethnographic or participant-observation analysis',
      reason: 'Observed routines or field materials are visible, which makes practice-in-context more important than decontextualized coding alone.',
    };
  }

  if (includesAny(text, DOCUMENT_CUES)) {
    return {
      label: 'Discourse analysis',
      reason: 'Documentary or policy material is doing the work, so framing, language, ideology, and power carried through wording deserve direct analysis.',
    };
  }

  return {
    label: 'Archival or interpretive thematic analysis',
    reason: 'The material looks text-heavy or archival, so the method should stay close to corpus definition, coding logic, and interpretive restraint.',
  };
}

function buildMethodFit(
  text: string,
  approach: (typeof scriptoriumPaperApproaches)[number],
  stage: (typeof scriptoriumManuscriptStages)[number],
) {
  switch (approach.slug) {
    case 'qualitative-empirical': {
      const bestFit = inferQualitativeMethod(text);
      return {
        headline: `${bestFit.label} is the best current qualitative fit for this manuscript.`,
        bullets: [
          bestFit.reason,
          'Use purposive sampling unless the paper is explicitly building categories inductively enough to justify theoretical sampling.',
          'Make reflexivity, positionality, and field ethics explicit when the researcher is part of the interpretive chain or the participants are vulnerable.',
        ],
      };
    }
    case 'mixed-methods': {
      const bestFit = inferQualitativeMethod(text);
      return {
        headline: 'The mixed-methods version only works if integration changes the argument rather than sitting beside it.',
        bullets: [
          `On the qualitative side, ${bestFit.label.toLowerCase()} currently looks like the strongest fit.`,
          'On the quantitative side, constructs, variables, and robustness logic need to be explicit enough that the causal language does not outrun the design.',
          'Name where the two strands meet and what changes because both are present; otherwise the paper will read like two partial studies stapled together.',
        ],
      };
    }
    case 'quantitative-empirical':
      return {
        headline: 'Method fit depends on operationalization discipline more than prose confidence.',
        bullets: [
          'Define the constructs, variables, and identification logic early enough that the results section is not carrying conceptual ambiguity downstream.',
          'Use robustness language only where the design and checks genuinely warrant it.',
          `At the ${stage.label.toLowerCase()} stage, every causal verb should be audited against the actual data structure and inference design.`,
        ],
      };
    case 'literature-review':
      return {
        headline: 'A review paper is strongest when the source-selection logic is as visible as the synthesis itself.',
        bullets: [
          'State how sources were chosen, grouped, and excluded so the review reads as a methodical map rather than a personal reading list.',
          'Organize the review by debate, mechanism, or problem instead of author-by-author summary.',
          'Use the conclusion to name unresolved tensions, not just to compress what the reader already saw.',
        ],
      };
    case 'humanities-interpretive':
      return {
        headline: 'Interpretive fit depends on corpus control, chronology, and a disciplined counter-reading.',
        bullets: [
          'Define the corpus or archive sharply enough that the reader knows what is in bounds and what is not.',
          'Historicize the reading so the argument does not drift into presentist certainty or myth-history conflation.',
          'Bring in at least one counter-reading, exception, or pressure point so interpretation remains argumentative rather than declarative.',
        ],
      };
    case 'theoretical-conceptual':
    default:
      return {
        headline: 'Conceptual fit depends on naming the mechanism early and keeping the boundary conditions visible.',
        bullets: [
          'Define the core concept in plain language before asking it to do field-level work.',
          'Show what mechanism or distinction changes once the concept is introduced; do not let theory act as atmosphere alone.',
          'State what the argument does not cover so the paper can stay sharp without inflating its jurisdiction.',
        ],
      };
  }
}

function inferActorLabels(text: string, consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number]) {
  const actorLabels = ACTOR_GROUPS.filter((group) => includesAny(text, group.cues)).map((group) => group.label);
  return uniqueStrings([consequenceDomain.owner, ...actorLabels]);
}

function buildInstitutionalStakes(
  text: string,
  governingObject: (typeof scriptoriumBuilderData.governingObjects)[number],
  consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number],
  archiveProfile: (typeof scriptoriumBuilderData.archiveProfiles)[number],
) {
  const mustCount = countMatches(text, /\bmust\b/gi);
  const shouldCount = countMatches(text, /\bshould\b/gi);
  const mayCount = countMatches(text, /\bmay\b/gi);
  const actorLabels = inferActorLabels(text, consequenceDomain);

  let modalityReading = 'The draft is not currently dominated by rule language, so the main pressure sits in argument structure rather than obligation wording.';
  if (mustCount || shouldCount || mayCount || includesAny(text, GOVERNANCE_CUES)) {
    modalityReading =
      mustCount >= shouldCount && mustCount >= mayCount
        ? `The wording currently leans more mandatory than advisory (${mustCount} must / ${shouldCount} should / ${mayCount} may), which raises the cost of getting the evidence path wrong.`
        : `The wording currently leans more advisory or discretionary (${mustCount} must / ${shouldCount} should / ${mayCount} may), which can soften accountability if the paper is making governance claims.`;
  }

  return {
    headline: 'The structural stakes sit around who gets to stabilize, soften, or reopen the claim before it travels outward.',
    bullets: [
      `Primary decision surface: ${governingObject.interface}.`,
      `Formal accountable actor in this packet: ${consequenceDomain.owner}.`,
      actorLabels.length > 1
        ? `Visible or implied actors in the draft include ${actorLabels.join(', ')}.`
        : `The manuscript does not yet name many actors explicitly, which can hide who benefits, decides, or absorbs the cost.`,
      `Hidden-rule risk: ${archiveProfile.mainRisk}.`,
      modalityReading,
    ],
  };
}

function buildAuthorityTravel(
  claimSentence: string,
  quoteEntries: string[],
  referenceEntries: string[],
  inlineCitations: string[],
  governingObject: (typeof scriptoriumBuilderData.governingObjects)[number],
  consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number],
) {
  const headline =
    quoteEntries.length || referenceEntries.length || inlineCitations.length
      ? `Authority is currently traveling from visible support anchors into section-level synthesis through ${governingObject.interface}.`
      : `Authority is currently traveling mainly through summary language at the ${governingObject.interface}, which makes the packet easier to read than to verify.`;

  const levels: LabeledReading[] = [
    {
      label: 'Direct evidence',
      body: quoteEntries.length || referenceEntries.length || inlineCitations.length
        ? `The packet contains visible traces a reviewer can inspect: ${quoteEntries.length} quote anchor(s), ${inlineCitations.length} inline citation signal(s), and ${referenceEntries.length} reference entry(ies).`
        : 'There are no visible support traces yet beyond the draft prose itself.',
    },
    {
      label: 'Inference',
      body: claimSentence
        ? `The manuscript is asking the reader to let the governing claim move toward ${consequenceDomain.label.toLowerCase()} consequences; that move is only as strong as the source trail underneath it.`
        : 'The packet implies an argument is present, but the governing claim still needs to be stated explicitly before authority can be audited properly.',
    },
    {
      label: 'Speculation boundary',
      body:
        'Without fuller reference history, revision history, or stronger section-level anchors, we cannot yet say whether the current wording reflects the strongest available evidence or only the latest surviving draft path.',
    },
  ];

  return {
    headline,
    levels,
  };
}

function buildReaderTraction(
  text: string,
  sections: ParsedSection[],
  claimSentence: string,
  consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number],
) {
  const firstSection = sections[0]?.text ?? text;
  const lastSection = sections.at(-1)?.text ?? text;
  const openingWindow = firstSection.slice(0, 500);
  const openingHasClaim =
    Boolean(claimSentence) &&
    openingWindow.toLowerCase().includes(claimSentence.slice(0, Math.min(claimSentence.length, 48)).toLowerCase());
  const openingHasQuestion = /\?/.test(openingWindow);
  const veryLongSections = sections.filter((section) => section.wordCount >= 1100);
  const hasTurn = includesAny(text, COUNTER_CUES);
  const endingHasLimit = LIMITATION_PATTERN.test(lastSection);

  return {
    headline: 'The manuscript needs reader traction as well as evidentiary discipline if it is going to survive a real review pass.',
    bullets: [
      openingHasClaim || openingHasQuestion
        ? 'The opening gives the reader either a live question or an argument quickly enough to create initial traction.'
        : 'The opening still needs earlier pressure: state the central claim, question, or stakes sooner.',
      veryLongSections.length
        ? `${veryLongSections.length} section(s) are long enough to risk flattening momentum unless they are broken by clearer turns or subsections.`
        : 'Section length is not currently the main pacing problem.',
      hasTurn
        ? 'A counter-position, tension point, or limiting turn is visible, which helps the argument avoid one-track certainty.'
        : 'The manuscript still needs a visible turn, counter-reading, or pressure point so the reasoning has friction.',
      endingHasLimit
        ? `The ending appears to acknowledge a boundary, which helps the ${consequenceDomain.label.toLowerCase()} stakes stay proportional.`
        : 'The ending still needs a cleaner closing consequence and limit so the paper lands with force instead of blur.',
    ],
  };
}

function buildPlainLanguagePlan(
  claimSentence: string,
  revisionPriorities: string[],
  controls: ReturnType<typeof buildControls>,
) {
  const leadControl = controls[0];
  const firstPriority = revisionPriorities[0] ?? 'Tighten the governing claim.';

  return {
    headline: 'In plain language, the next pass should make the paper easier to follow and harder to overstate.',
    steps: [
      claimSentence
        ? `State the paper’s main claim just as plainly as this: ${claimSentence}`
        : 'Write the main claim in one direct sentence near the start of the paper.',
      firstPriority,
      `Before the draft moves on, apply the ${leadControl.heading.toLowerCase()} by showing the exact source, citation, or passage that earns the section’s main inference.`,
    ],
  };
}

function buildReadinessCall(
  stage: (typeof scriptoriumManuscriptStages)[number],
  methodConcerns: string[],
  overclaimSignals: OverclaimSignal[],
  references: string[],
  wordCount: number,
) {
  const riskScore =
    methodConcerns.length +
    Math.min(overclaimSignals.length, 3) +
    (references.length === 0 && wordCount > 0 ? 2 : 0) +
    (wordCount === 0 ? 3 : 0);

  if (stage.slug === 'submission-packaging' || stage.slug === 'full-manuscript-revision') {
    if (riskScore >= 6) {
      return 'Not submission-ready yet. Henry would still expect argument, method, or evidence repairs before external review.';
    }
    if (riskScore >= 3) {
      return 'Promising but still under revision pressure. The draft is no longer formative, but it still needs targeted repair before submission.';
    }
    return 'Structurally viable for another human review pass, but still not a substitute for actual peer review or source verification.';
  }

  if (stage.slug === 'idea-formation' || stage.slug === 'outline-development') {
    return 'Early-stage packet. Focus on claim, scope, outline, and evidence planning before chasing polish.';
  }

  return 'Workable drafting packet. The manuscript has enough material to revise productively, but Henry still expects human judgment and evidence checking.';
}

function buildRecursiveTests(
  quoteEntries: string[],
  referenceEntries: string[],
  inlineCitations: string[],
  overclaimSignals: OverclaimSignal[],
  text: string,
  pressure: (typeof scriptoriumBuilderData.recursivePressures)[number],
) {
  return pressure.tests
    .map((slug) => scriptoriumBuilderData.testLibrary[slug])
    .filter(Boolean)
    .map((test) => {
      let status: TestStatus = 'stable';
      let reading = '';

      if (test.label === 'Source-tree test') {
        status = quoteEntries.length || referenceEntries.length || inlineCitations.length ? 'stable' : 'watch';
        reading =
          status === 'stable'
            ? `Visible anchors exist through ${quoteEntries.length} quote signal(s) and ${referenceEntries.length || inlineCitations.length} reference signal(s); keep later syntheses tied back to them.`
            : 'The manuscript currently lacks enough visible source anchors, so later summary language could outrun the evidence base.';
      } else if (test.label === 'Re-entry test') {
        status = overclaimSignals.length ? 'watch' : 'stable';
        reading = overclaimSignals.length
          ? 'Some derived prose already reads as settled authority. Tighten the claim before this draft re-enters the loop as if it were source.'
          : 'Re-entry risk is present but not dominant yet; keep the next pass focused on evidence and boundary rather than fluency alone.';
      } else if (test.label === 'Admissibility test') {
        status = referenceEntries.length || inlineCitations.length ? 'stable' : 'stop';
        reading =
          status === 'stable'
            ? 'The packet shows at least a provisional admissibility rule because some references or inline citations are visible.'
            : 'The admissibility rule is too weak right now: the packet does not yet show what counts as support and what remains assertion.';
      } else if (test.label === 'Method-lock test') {
        status = overclaimSignals.length >= 2 ? 'watch' : 'stable';
        reading =
          status === 'watch'
            ? 'Repeated high-heat phrasing suggests the current summary path may be hardening into authority faster than the evidence warrants.'
            : 'No obvious method-lock signal dominates yet, but keep competing readings visible as revisions continue.';
      } else if (test.label === 'Interruption test') {
        status = LIMITATION_PATTERN.test(text) ? 'stable' : 'watch';
        reading =
          status === 'stable'
            ? 'The draft contains at least some boundary or limitation language, which gives reviewers an interruption point before authority hardens.'
            : 'The draft needs a clearer interruption point where scope, limit, or uncertainty is named explicitly.';
      } else if (test.label === 'Escalation test') {
        status = 'watch';
        reading = 'Only recurse again if the next pass adds evidence, method clarity, or scope control. If it adds polish alone, stop.';
      }

      return {
        label: test.label,
        prompt: test.prompt,
        status,
        reading,
      };
    });
}

function buildControls(
  governingObject: (typeof scriptoriumBuilderData.governingObjects)[number],
  archiveProfile: (typeof scriptoriumBuilderData.archiveProfiles)[number],
  consequenceDomain: (typeof scriptoriumBuilderData.consequenceDomains)[number],
  recursivePressure: (typeof scriptoriumBuilderData.recursivePressures)[number],
  approach: (typeof scriptoriumPaperApproaches)[number],
) {
  return [
    {
      heading: 'Source boundary control',
      finding: `${archiveProfile.mainRisk} can distort ${consequenceDomain.label.toLowerCase()} decisions.`,
      mechanism: governingObject.mechanism,
      control: governingObject.controlFocus,
      owner: consequenceDomain.owner,
      evidence: `Require ${archiveProfile.evidenceArtifact} before any section in the ${approach.label.toLowerCase()} packet is allowed to harden into summary.`,
      review: recursivePressure.reviewInterval,
    },
    {
      heading: 'Citation integrity gate',
      finding: 'Quoted passages and reference claims can be reused rhetorically without staying tied to their original warrant.',
      mechanism: 'Manuscript-scale revision often detaches polished prose from the page, note, or source that originally grounded it.',
      control: 'Keep a visible quote/reference register and treat missing source anchors as a stop condition for load-bearing claims.',
      owner: 'author, reviewer, or lead editor',
      evidence: 'A quote scan, a reference list, and at least one visible anchor for each major section claim.',
      review: recursivePressure.reviewInterval,
    },
    {
      heading: 'Triangulation gate',
      finding: 'Recursive passes can outrun their support trail when a rewritten section is promoted without fresh corroboration.',
      mechanism: 'Each recursion can strengthen fluency while weakening the visible connection between claims, quotes, inline citations, and the reference list.',
      control:
        'Before each recursive step and again after it finishes, confirm that the packet still shows at least two visible support channels and record any anchors that were lost.',
      owner: 'author, reviewer, or final approver',
      evidence: 'A short pre-pass and post-pass corroboration note naming quote anchors, inline citations, and reference visibility.',
      review: recursivePressure.reviewInterval,
    },
    {
      heading: 'Re-entry gate',
      finding: 'Derived packets can re-enter the workflow as if they were first-order evidence.',
      mechanism: 'Recursive handoffs can harden generated synthesis into authority unless the artifact class stays visible across stages.',
      control:
        'Mark each promoted artifact by class, record what changed at handoff, and require a human decision before a generated packet can govern the next pass.',
      owner: 'human reviewer or final approver',
      evidence: 'A visible archive map plus a short handoff note naming what was added, removed, or newly admitted.',
      review: recursivePressure.reviewInterval,
    },
    {
      heading: 'Interruption point',
      finding: consequenceDomain.risk,
      mechanism: 'Authority becomes unstable when no one can reopen the claim before it reaches release, review, or workflow enforcement.',
      control: `Create an interruption step at the ${governingObject.interface} where the surviving claim, mechanism, and consequence domain must be named explicitly.`,
      owner: consequenceDomain.owner,
      evidence: `A signed review note triggered ${consequenceDomain.trigger}.`,
      review: recursivePressure.reviewInterval,
    },
  ];
}

function buildHenryReviews(
  text: string,
  strengths: string[],
  methodConcerns: string[],
  overclaimSignals: OverclaimSignal[],
  references: string[],
  sectionDiagnostics: ReturnType<typeof buildSectionDiagnostics>,
  approach: (typeof scriptoriumPaperApproaches)[number],
  stage: (typeof scriptoriumManuscriptStages)[number],
) {
  const coreSectionPressure = sectionDiagnostics[0]?.pressure ?? 'The draft still needs a clearer first repair target.';
  const claimSentence = findClaimSentence(text);

  const supportive = {
    ...findBySlug(scriptoriumHenrySequence, 'supportive-rigorous'),
    severity: 'promising' as ReviewerSeverity,
    findings: [
      strengths[0] ?? 'The draft has a viable topic and enough material to shape into a reviewable argument.',
      strengths[1] ?? `The chosen ${approach.label.toLowerCase()} frame gives the paper a legible route to contribution if the claim is tightened.`,
      claimSentence
        ? `The draft already contains a provisional governing claim worth refining: "${claimSentence}".`
        : 'The next step is to state the governing claim early and in direct language so the rest of the paper knows its job.',
    ],
    strategies: [
      'Clarify the paper’s contribution ladder in three moves: what it shows, what mechanism it explains, and what debate or practice changes if it is right.',
      'Move the governing claim closer to the start of the manuscript, ideally within the first two paragraphs or the abstract.',
      `Use the ${approach.label.toLowerCase()} outline as a discipline tool rather than a template you decorate after the fact.`,
    ],
  };

  const coldMethodological = {
    ...findBySlug(scriptoriumHenrySequence, 'cold-methodological'),
    severity: methodConcerns.length ? ('repair' as ReviewerSeverity) : ('promising' as ReviewerSeverity),
    findings: methodConcerns.length
      ? methodConcerns.slice(0, 4)
      : ['No single methodological flaw dominates the current scan, but the draft still needs human verification of the evidence path and design logic.'],
    strategies: [
      `Match the evidence strength to the ${stage.label.toLowerCase()} stage instead of writing as though the paper is already submission-ready.`,
      'Wherever the paper implies causality, generalizability, or replicability, make the design conditions visible in the same section.',
      'If a section is doing interpretive or empirical work, give the reviewer a concrete reason to trust how that inference became possible.',
    ],
  };

  const harshFindings = overclaimSignals.length
    ? overclaimSignals.slice(0, 4).map((signal) => `Overclaim signal detected in this sentence: "${signal.sentence}"`)
    : [
        references.length === 0
          ? 'The manuscript risks epistemic inflation because it still asks the reader to trust argument force without a visible source trail.'
          : 'The manuscript is not obviously overclaiming sentence by sentence, but it still needs tighter boundaries between what is shown, suggested, and merely hoped.',
        coreSectionPressure,
      ];

  const harshStrategies = uniqueStrings([
    ...overclaimSignals.slice(0, 3).map((signal) => signal.guidance),
    'Identify exactly where the claim boundary sits, then restate the key conclusion in language that does not outrun that boundary.',
    'Add one counter-reading, exception, or limiting condition so the manuscript cannot be dismissed as conceptually thin.',
  ]);

  const harsh = {
    ...findBySlug(scriptoriumHenrySequence, 'harsh-reviewer-2'),
    severity: overclaimSignals.length || references.length === 0 ? ('blocker' as ReviewerSeverity) : ('repair' as ReviewerSeverity),
    findings: harshFindings,
    strategies: harshStrategies,
  };

  const shouldAppendRelaxed = stage.slug !== 'idea-formation' && (countWords(text) >= 2500 || references.length >= 6);

  const relaxed = shouldAppendRelaxed
    ? {
        ...findBySlug(scriptoriumHenrySequence, 'relaxed-reviewer-3'),
        severity: 'repair' as ReviewerSeverity,
        findings: [
          'A weak reviewer might be reassured by the surface structure, citation density, or rhetorical fluency and miss the remaining warrant problems.',
          'That is exactly why the stronger reviewer passes stay in the packet: surface coherence is not the same thing as method clarity or bounded argument.',
        ],
        strategies: [
          'Treat any “looks good to me” reaction as a prompt to reopen the claim boundary rather than a reason to stop.',
          'Use the cold methodological and harsh reviewer findings as the real stop gates before the manuscript moves outward.',
        ],
      }
    : null;

  return [supportive, coldMethodological, harsh, ...(relaxed ? [relaxed] : [])];
}

function buildRevisionPriorities(
  methodConcerns: string[],
  overclaimSignals: OverclaimSignal[],
  outline: ReturnType<typeof buildOutline>,
  references: string[],
  quotes: string[],
  inlineCitations: string[],
  approach: (typeof scriptoriumPaperApproaches)[number],
  stage: (typeof scriptoriumManuscriptStages)[number],
) {
  const priorities: string[] = [];

  priorities.push(...methodConcerns);

  if (overclaimSignals.length) {
    priorities.push('Reduce the highest-heat claim language first, then rebuild those sentences around what the evidence can actually support.');
  }

  const missingOutlineItems = outline.filter((item) => item.status === 'needed');
  if (missingOutlineItems.length && stage.slug !== 'idea-formation') {
    priorities.push(`The draft is still missing expected section work: ${missingOutlineItems.slice(0, 3).map((item) => item.label).join(', ')}.`);
  }

  if (!references.length) {
    priorities.push('Add or surface a visible reference trail before treating the manuscript as externally reviewable.');
  }

  const corroborationCount = [quotes.length > 0, references.length > 0, inlineCitations.length > 0].filter(Boolean).length;
  if (corroborationCount < 2) {
    priorities.push('Do not recurse again until the packet shows at least two visible support channels, then rerun the corroboration gate after the rewrite.');
  }

  if (!quotes.length && ['qualitative-empirical', 'humanities-interpretive'].includes(approach.slug)) {
    priorities.push('Bring forward a few load-bearing quotations or source passages so the interpretive or qualitative claim is visibly anchored.');
  }

  if (!priorities.length) {
    priorities.push('The draft is structurally coherent enough for another human pass; use that pass to verify citations and tighten the final claim boundary.');
  }

  return uniqueStrings(priorities);
}

export function buildScriptoriumPacket(state: ScriptoriumState) {
  const topic = state.title.trim() || 'Untitled manuscript packet';
  const manuscript = normalizeWhitespace(state.manuscript);
  const governingObject = findBySlug(scriptoriumBuilderData.governingObjects, state.object);
  const outputMode = findBySlug(scriptoriumBuilderData.outputModes, state.mode);
  const archiveProfile = findBySlug(scriptoriumBuilderData.archiveProfiles, state.profile);
  const consequenceDomain = findBySlug(scriptoriumBuilderData.consequenceDomains, state.domain);
  const recursivePressure = findBySlug(scriptoriumBuilderData.recursivePressures, state.pressure);
  const paperApproach = findBySlug(scriptoriumPaperApproaches, state.approach);
  const manuscriptStage = findBySlug(scriptoriumManuscriptStages, state.stage);
  const quoteEntries = extractQuoteEntries(manuscript, state.quoteNotes);
  const sections = parseSections(manuscript);
  const referenceEntries = extractReferenceEntries(state.references, sections);
  const inlineCitations = extractInlineCitations(manuscript);
  const overclaimSignals = collectOverclaimSignals(manuscript);
  const methodConcerns = buildMethodConcerns(manuscript, sections, paperApproach, manuscriptStage, referenceEntries, inlineCitations);
  const strengths = summarizeStrengths(manuscript, sections, quoteEntries, referenceEntries, inlineCitations);
  const claimSentence = findClaimSentence(manuscript);
  const sectionDiagnostics = buildSectionDiagnostics(sections, manuscriptStage);
  const outline = buildOutline(sections, paperApproach, manuscriptStage);
  const supportCorroboration = buildSupportCorroboration(claimSentence, quoteEntries, referenceEntries, inlineCitations, overclaimSignals);
  const recursiveTriangulation = buildRecursiveTriangulation(
    quoteEntries,
    referenceEntries,
    inlineCitations,
    overclaimSignals,
    recursivePressure,
  );
  const methodFit = buildMethodFit(manuscript, paperApproach, manuscriptStage);
  const institutionalStakes = buildInstitutionalStakes(manuscript, governingObject, consequenceDomain, archiveProfile);
  const authorityTravel = buildAuthorityTravel(
    claimSentence,
    quoteEntries,
    referenceEntries,
    inlineCitations,
    governingObject,
    consequenceDomain,
  );
  const tests = buildRecursiveTests(quoteEntries, referenceEntries, inlineCitations, overclaimSignals, manuscript, recursivePressure);
  const controls = buildControls(governingObject, archiveProfile, consequenceDomain, recursivePressure, paperApproach);
  const contributionLadder = buildContributionLadder(topic, claimSentence, governingObject, consequenceDomain, paperApproach);
  const readerTraction = buildReaderTraction(manuscript, sections, claimSentence, consequenceDomain);
  const henryReviews = buildHenryReviews(
    manuscript,
    strengths,
    methodConcerns,
    overclaimSignals,
    referenceEntries,
    sectionDiagnostics,
    paperApproach,
    manuscriptStage,
  );
  const revisionPriorities = buildRevisionPriorities(
    methodConcerns,
    overclaimSignals,
    outline,
    referenceEntries,
    quoteEntries,
    inlineCitations,
    paperApproach,
    manuscriptStage,
  );
  const plainLanguagePlan = buildPlainLanguagePlan(claimSentence, revisionPriorities, controls);

  const manuscriptStats = {
    wordCount: countWords(manuscript),
    paragraphCount: extractParagraphs(manuscript).length,
    sectionCount: sections.length,
    quoteCount: quoteEntries.length,
    inlineCitationCount: inlineCitations.length,
    referenceCount: referenceEntries.length,
    overclaimCount: overclaimSignals.length,
  };

  const overview = manuscript
    ? `Scriptorium built a ${outputMode.label.toLowerCase()} for a ${paperApproach.label.toLowerCase()} manuscript at the ${manuscriptStage.label.toLowerCase()} stage. The current draft shows ${manuscriptStats.wordCount} words, ${manuscriptStats.sectionCount} section block(s), ${manuscriptStats.quoteCount} quote signal(s), and ${manuscriptStats.referenceCount} reference entry(ies).`
    : 'Paste a manuscript or upload a `.txt`, `.md`, or `.docx` file to generate the full packet. The workbench will then scan the draft, build the outline, and run the Henry reviewer stack automatically.';

  const readinessCall = buildReadinessCall(
    manuscriptStage,
    methodConcerns,
    overclaimSignals,
    referenceEntries,
    manuscriptStats.wordCount,
  );

  const disclosure =
    `Generative AI was used for structural and epistemic mediation around ${topic}, including manuscript intake, quote and reference scanning, recursive claim-boundary testing, and simulated reviewer pressure through the Henry sequence. It was not treated as an evidentiary authority or as a substitute for actual external peer review. Source selection, citation verification, interpretation, and final submission decisions remain under human control.`;

  const boundedConclusion = manuscript
    ? `This packet supports a ${outputMode.label.toLowerCase()} on ${topic} bounded to the ${paperApproach.label.toLowerCase()} frame, the ${governingObject.label.toLowerCase()}, and the ${consequenceDomain.label.toLowerCase()} consequences presently in view. It does not certify factual accuracy, peer-reviewed status, or submission readiness beyond the visible evidence path and human verification still required.`
    : 'No manuscript has been loaded yet, so Scriptorium can only show the packet scaffold. Peer-review pressure begins once the actual text, quotations, and references are present.';

  const exportMarkdown = [
    `# ${outputMode.exportHeading}: ${topic}`,
    '',
    '## Packet settings',
    `- source label: ${state.sourceLabel || 'Pasted manuscript'}`,
    `- governing object: ${governingObject.label}`,
    `- output mode: ${outputMode.label}`,
    `- paper approach: ${paperApproach.label}`,
    `- manuscript stage: ${manuscriptStage.label}`,
    `- archive profile: ${archiveProfile.label}`,
    `- consequence domain: ${consequenceDomain.label}`,
    `- recursive pressure: ${recursivePressure.label}`,
    '',
    '## Manuscript scan',
    `- words: ${manuscriptStats.wordCount}`,
    `- paragraphs: ${manuscriptStats.paragraphCount}`,
    `- sections: ${manuscriptStats.sectionCount}`,
    `- quote signals: ${manuscriptStats.quoteCount}`,
    `- inline citations: ${manuscriptStats.inlineCitationCount}`,
    `- reference entries: ${manuscriptStats.referenceCount}`,
    `- overclaim signals: ${manuscriptStats.overclaimCount}`,
    '',
    '## Governing claim',
    claimSentence || 'No governing claim could be extracted yet. State the claim directly near the start of the manuscript.',
    '',
    '## Contribution ladder',
    ...contributionLadder.map((entry) => `- ${entry.label}: ${entry.body}`),
    '',
    '## Support corroboration',
    supportCorroboration.headline,
    ...supportCorroboration.bullets.map((entry) => `- ${entry}`),
    ...supportCorroboration.claimLevels.map((entry) => `- ${entry.label}: ${entry.body}`),
    '',
    '## Recursive triangulation',
    recursiveTriangulation.headline,
    ...recursiveTriangulation.steps.map((entry) => `- ${entry.label}: ${entry.body}`),
    '',
    '## Method fit',
    methodFit.headline,
    ...methodFit.bullets.map((entry) => `- ${entry}`),
    '',
    '## Institutional stakes',
    institutionalStakes.headline,
    ...institutionalStakes.bullets.map((entry) => `- ${entry}`),
    '',
    '## Authority travel',
    authorityTravel.headline,
    ...authorityTravel.levels.map((entry) => `- ${entry.label}: ${entry.body}`),
    '',
    '## Reader traction',
    readerTraction.headline,
    ...readerTraction.bullets.map((entry) => `- ${entry}`),
    '',
    '## Approach outline',
    ...outline.map((item) => `- [${item.status === 'present' ? 'present' : 'needed'}] ${item.label}: ${item.note}`),
    '',
    '## Quote scan',
    ...(quoteEntries.length ? quoteEntries.map((entry) => `- ${entry}`) : ['- No quoted passages detected yet.']),
    '',
    '## Reference scan',
    ...(referenceEntries.length ? referenceEntries.map((entry) => `- ${entry}`) : ['- No reference entries detected yet.']),
    '',
    '## Inline citation scan',
    ...(inlineCitations.length ? inlineCitations.map((entry) => `- ${entry}`) : ['- No inline citations detected yet.']),
    '',
    '## Section diagnostics',
    ...(sectionDiagnostics.length
      ? sectionDiagnostics.flatMap((section) => [
          `### ${section.label}`,
          `- words: ${section.wordCount}`,
          `- function: ${section.function}`,
          `- evidence signal: ${section.evidenceSignal}`,
          `- pressure: ${section.pressure}`,
          `- revision move: ${section.revision}`,
          '',
        ])
      : ['- No manuscript sections detected yet.', '']),
    '## Recursive tests',
    ...tests.map((test) => `- ${test.label} [${test.status}]: ${test.reading}`),
    '',
    '## Henry reviewer stack',
    ...henryReviews.flatMap((review) => [
      `### ${review.label}`,
      `- purpose: ${review.purpose}`,
      `- severity: ${review.severity}`,
      ...review.findings.map((finding) => `- finding: ${finding}`),
      ...review.strategies.map((strategy) => `- revision strategy: ${strategy}`),
      '',
    ]),
    '## Priority revisions',
    ...revisionPriorities.map((entry) => `- ${entry}`),
    '',
    '## Plain-language next pass',
    plainLanguagePlan.headline,
    ...plainLanguagePlan.steps.map((entry) => `- ${entry}`),
    '',
    '## Controls',
    ...controls.flatMap((control) => [
      `### ${control.heading}`,
      `- finding: ${control.finding}`,
      `- mechanism: ${control.mechanism}`,
      `- control: ${control.control}`,
      `- owner: ${control.owner}`,
      `- evidence: ${control.evidence}`,
      `- review interval: ${control.review}`,
      '',
    ]),
    '## Readiness call',
    readinessCall,
    '',
    '## Bounded conclusion',
    boundedConclusion,
    '',
    '## Disclosure language',
    disclosure,
  ].join('\n');

  return {
    topic,
    manuscript,
    sourceLabel: state.sourceLabel || 'Pasted manuscript',
    governingObject,
    outputMode,
    archiveProfile,
    consequenceDomain,
    recursivePressure,
    paperApproach,
    manuscriptStage,
    manuscriptStats,
    overview,
    readinessCall,
    claimSentence:
      claimSentence || 'No governing claim extracted yet. Paste the manuscript and name the central claim directly near the start.',
    contributionLadder,
    supportCorroboration,
    recursiveTriangulation,
    methodFit,
    institutionalStakes,
    authorityTravel,
    readerTraction,
    outline,
    quoteEntries,
    referenceEntries,
    inlineCitations,
    overclaimSignals,
    sectionDiagnostics,
    tests,
    controls,
    henryReviews,
    revisionPriorities,
    plainLanguagePlan,
    disclosure,
    boundedConclusion,
    exportMarkdown,
  };
}
