export interface LotusSignalGroup {
  slug: string;
  label: string;
  weight: number;
  description: string;
  terms: readonly string[];
}

export interface LotusSampleNote {
  slug: string;
  label: string;
  title: string;
  text: string;
}

export interface LotusBloomQuestion {
  id: string;
  prompt: string;
  note: string;
}

const UNTITLED_NOTE = 'Untitled Lotus note';
const EMPTY_NOTE_TITLE = 'Paste or load a Lotus note';

export const lotusSignalGroups: readonly LotusSignalGroup[] = [
  {
    slug: 'strategic',
    label: 'Strategic',
    weight: 8,
    description: 'How direction, options, and longer-range planning are present or absent in a situation.',
    terms: [
      'strategy',
      'strategic',
      'roadmap',
      'program',
      'mission',
      'direction',
      'initiative',
      'priority',
      'capability',
      'institution',
      'systems thinking',
    ],
  },
  {
    slug: 'governance',
    label: 'Governance',
    weight: 9,
    description: 'How accountability, oversight, and institutional structures shape what a person can access or expect.',
    terms: [
      'governance',
      'policy',
      'procurement',
      'oversight',
      'compliance',
      'accountability',
      'framework',
      'standard',
      'control',
      'risk',
      'public interest',
    ],
  },
  {
    slug: 'operational',
    label: 'Operational',
    weight: 7,
    description: 'How practical capacity, coordination, and daily execution hold up or break down under load.',
    terms: [
      'operations',
      'workflow',
      'execution',
      'delivery',
      'implementation',
      'process',
      'team',
      'capacity',
      'coordination',
      'scheduling',
      'monitoring',
    ],
  },
  {
    slug: 'agency',
    label: 'Agency',
    weight: 10,
    description: 'How much real choice, influence, and capacity to act remain when pressure is high.',
    terms: [
      'agency',
      'autonomy',
      'influence',
      'choice',
      'self determination',
      'power',
      'capacity to act',
      'institutional leverage',
      'decision',
      'responsibility',
    ],
  },
  {
    slug: 'creative',
    label: 'Creative',
    weight: 8,
    description: 'How imagination, story, and aesthetic expression are present — or suppressed — in a situation.',
    terms: [
      'creative',
      'imagination',
      'aesthetic',
      'story',
      'narrative',
      'poetic',
      'art',
      'music',
      'film',
      'image',
      'design',
    ],
  },
  {
    slug: 'meaning',
    label: 'Meaning',
    weight: 8,
    description: 'How identity, culture, memory, and ethical orientation hold or fragment under pressure.',
    terms: [
      'meaning',
      'interpretation',
      'symbolic',
      'ethics',
      'memory',
      'identity',
      'culture',
      'development',
      'brain plasticity',
      'young age',
      'youth',
    ],
  },
] as const;

export const lotusSurfaces = [
  {
    eyebrow: 'Primary route',
    title: 'Open the Lotus agency scorer.',
    description:
      'The main Lotus route now holds the quick reading and the deeper model together: note scoring, signal groups, and the full agency-oriented interface on one surface.',
    href: '/lotus/#lotus-workbench',
    cta: 'Open the workbench',
  },
  {
    eyebrow: 'For researchers',
    title: 'Analyze constrained agency across scales.',
    description:
      'LOTUS offers a structured, non-reductionist way to trace how regulatory load, perceptual narrowing, blocked access, and social legibility interact under stress, precarity, trauma, or institutional mismatch.',
    href: '/lotus/#lotus-vector',
    cta: 'Run the vector model',
  },
  {
    eyebrow: 'Framework paper',
    title: 'Read the theoretical foundation.',
    description:
      'The full framework paper on coherence, instability, regulation, and bonded intelligence under constraint. Situates LOTUS within a broader theory of agency and social positioning.',
    href: '/projects/bonded-intelligence-under-constraint/',
    cta: 'Open the framework paper',
  },
  {
    eyebrow: 'Limits',
    title: 'Understand what LOTUS does not do.',
    description:
      'LOTUS does not diagnose, predict fixed futures, or replace therapy, crisis care, or medical treatment. Any high-stakes use should remain accountable to human judgment and appropriate ethical safeguards.',
    href: '/lotus/#lotus-boundary',
    cta: 'Read the limits',
  },
] as const;

export const lotusBoundaryCards = [
  {
    title: 'LOTUS does not diagnose.',
    body:
      'LOTUS is not a medical or diagnostic device. It can surface patterns and language around pressure, but it does not produce clinical conclusions or replace professional assessment.',
  },
  {
    title: 'A score is not a self.',
    body:
      'Any score is a reading of conditions, constraints, and supports at a moment in time. It is not character, worth, destiny, or fixed identity. Interpretation must remain revisable.',
  },
  {
    title: 'Boundaries protect dignity.',
    body:
      'LOTUS should not be used to sort, exploit, or manipulate vulnerable people. It is designed to support understanding, dignity, and better pathways to care or action, not high-stakes decisions without human judgment.',
  },
] as const;

export const lotusSampleNotes: readonly LotusSampleNote[] = [
  {
    slug: 'bonded-intelligence',
    label: 'Bonded intelligence note',
    title: 'Bonded intelligence under constraint',
    text:
      'This note outlines a strategic framework for emotional-intelligence tools operating under instability, high load, and relational complexity. The governance problem is not just insight but the regulatory and relational conditions that keep interpretation revisable under compression. The design priority is to widen agency, preserve accountability, and maintain transparency, contestability, and anti-coercive oversight inside institutions that need practical control rather than decorative policy.',
  },
  {
    slug: 'ritual-object',
    label: 'Ritual object note',
    title: 'Charging objects and artistic practice',
    text:
      'The project studies how ritual objects gather symbolic force through arrangement, duration, and constrained repetition. It treats the artwork as a narrative and aesthetic device, but also as a question of meaning, ethics, memory, and culture. The note asks how design, image, and poetic residue can hold authority without reverting to a simple human-centered story about intention.',
  },
  {
    slug: 'operations-handoff',
    label: 'Operations handoff note',
    title: 'Workflow handoff and monitoring memo',
    text:
      'The team needs a clearer implementation process before the next delivery cycle. Current workflow and coordination patterns leave too much ambiguity at the scheduling and monitoring stage, which weakens execution capacity and creates governance risk. The recommendation is a small operational control set: name the owner, document the process, preserve accountability, and keep the review path legible across the whole project team.',
  },
] as const;

export const lotusBloomQuestions: readonly LotusBloomQuestion[] = [
  {
    id: 'weight',
    prompt: 'What feels heaviest right now?',
    note: 'Name the pressure plainly. You do not need to explain everything at once.',
  },
  {
    id: 'narrowing',
    prompt: 'Where have your options narrowed?',
    note: 'Describe where movement, choice, or flexibility has become harder to reach.',
  },
  {
    id: 'hidden-load',
    prompt: 'What are you carrying that other people may not see?',
    note: 'Let the invisible part become visible here, even if only in fragments.',
  },
  {
    id: 'support',
    prompt: 'What kind of support would change the shape of this moment?',
    note: 'Think in concrete terms: a person, a condition, a pause, a resource, a boundary.',
  },
  {
    id: 'agency',
    prompt: 'Where do you still feel some agency, even if it is small?',
    note: 'Look for the smallest real place where choice, refusal, care, or direction still exists.',
  },
  {
    id: 'next-step',
    prompt: 'What would a kinder next step look like?',
    note: 'Name the next move that feels survivable, not the perfect move.',
  },
  {
    id: 'carry-forward',
    prompt: 'What do you want to carry upward with you?',
    note: 'Let this final bloom hold what should remain present as you continue.',
  },
] as const;

export const lotusDefaultState = {
  title: lotusSampleNotes[0].title,
  text: lotusSampleNotes[0].text,
} as const;

function joinHumanList(values: string[]) {
  if (values.length <= 1) {
    return values[0] ?? '';
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;
}

function cleanCandidateText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[|_\-.\s]+|[|_\-.\s]+$/g, '')
    .replace(/^\d{1,4}\s+(?=[A-Za-z])/u, '')
    .replace(/^[ .;:\-|]+|[ .;:\-|]+$/g, '');
}

function normalizeForMatch(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompact(text: string) {
  const tokens = normalizeForMatch(text).match(/[a-z0-9]+/g) ?? [];
  return tokens.join(' ');
}

function containsCompactPhrase(compactText: string, pattern: string) {
  const compactPattern = normalizeCompact(pattern);
  if (!compactPattern) {
    return false;
  }

  return ` ${compactText} `.includes(` ${compactPattern} `);
}

function normalizeMarkdownText(text: string) {
  const cleanedLines = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#+\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/\|/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return cleanedLines.join('\n');
}

function extractMarkdownParts(text: string) {
  const lines = text.split(/\r?\n/);
  let metaTitle = '';
  let body = text;

  if (lines[0]?.trim() === '---') {
    const frontMatter: string[] = [];
    for (let index = 1; index < Math.min(lines.length, 40); index += 1) {
      const line = lines[index];
      if (line.trim() === '---') {
        body = lines.slice(index + 1).join('\n');
        break;
      }
      frontMatter.push(line);
    }

    for (const line of frontMatter) {
      const match = line.match(/^([^:]+):(.*)$/);
      if (!match) {
        continue;
      }

      const key = normalizeForMatch(match[1]);
      const value = cleanCandidateText(match[2].trim().replace(/^["']|["']$/g, ''));
      if (key === 'title' && value) {
        metaTitle = value;
        break;
      }
    }
  }

  if (!metaTitle) {
    for (const line of body.split(/\r?\n/)) {
      const stripped = line.trim();
      if (stripped.startsWith('#')) {
        metaTitle = cleanCandidateText(stripped.replace(/^#+\s*/, ''));
        break;
      }
    }
  }

  return {
    metaTitle,
    body,
    cleanedText: normalizeMarkdownText(body),
  };
}

function inferLotusTitle(title: string | undefined, text: string) {
  const manualTitle = cleanCandidateText(title ?? '');
  if (manualTitle) {
    return manualTitle;
  }

  const extracted = extractMarkdownParts(text);
  if (extracted.metaTitle) {
    return extracted.metaTitle;
  }

  for (const line of extracted.cleanedText.split('\n')) {
    const cleaned = cleanCandidateText(line);
    if (cleaned && cleaned.length >= 6) {
      return cleaned;
    }
  }

  return UNTITLED_NOTE;
}

function scoreGroup(text: string, terms: readonly string[], weight: number) {
  const compactText = normalizeCompact(text);
  const matchedTerms = terms.filter((term) => containsCompactPhrase(compactText, term));
  return {
    score: Math.min(matchedTerms.length * weight, 100),
    matchedTerms,
  };
}

export function buildLotusAssessment({
  title,
  text,
}: {
  title?: string;
  text: string;
}) {
  const rawText = text ?? '';
  const extracted = extractMarkdownParts(rawText);
  const cleanedText = extracted.cleanedText;
  const hasMeaningfulText = cleanedText.trim().length > 0;
  const resolvedTitle = hasMeaningfulText || cleanCandidateText(title ?? '')
    ? inferLotusTitle(title, rawText)
    : EMPTY_NOTE_TITLE;
  const fullText = [resolvedTitle, cleanedText.slice(0, 24000)].join('\n');

  const groups = lotusSignalGroups.map((group) => {
    const result = scoreGroup(fullText, group.terms, group.weight);
    return {
      ...group,
      score: result.score,
      matchedTerms: result.matchedTerms,
    };
  });

  const bySlug = Object.fromEntries(groups.map((group) => [group.slug, group]));
  const agencyScore = Math.min(
    100,
    Math.round(
      bySlug.agency.score * 0.28 +
        bySlug.strategic.score * 0.22 +
        bySlug.governance.score * 0.22 +
        bySlug.operational.score * 0.18 +
        bySlug.meaning.score * 0.1,
    ),
  );
  const creativeScore = Math.min(100, Math.round(bySlug.creative.score * 0.6 + bySlug.meaning.score * 0.4));

  const activeSignals = groups.filter((group) => group.matchedTerms.length > 0).map((group) => group.label);
  const dominantGroups = [...groups].sort((left, right) => right.score - left.score).filter((group) => group.score > 0).slice(0, 3);
  const totalMatchedTerms = groups.reduce((sum, group) => sum + group.matchedTerms.length, 0);
  const summary = !hasMeaningfulText
    ? 'Paste a note or load a public sample to see which Lotus signals rise to the surface.'
    : dominantGroups.length
      ? `This note currently reads strongest through ${joinHumanList(dominantGroups.map((group) => group.label))} signals.`
      : 'This note does not yet strongly activate the Lotus signal library. Add more concrete governance, agency, operational, creative, or meaning-rich language to shift the score.';
  const boundary =
    'The website workbench scores only the text pasted into the browser. The canonical desktop and local repo line still owns file imports, local workspaces, and deeper note review.';

  const exportMarkdown = [
    `# Lotus note score: ${resolvedTitle}`,
    '',
    `- agency score: ${agencyScore}/100`,
    `- creative score: ${creativeScore}/100`,
    `- active signals: ${activeSignals.length ? activeSignals.join(', ') : 'none yet'}`,
    `- matched terms: ${totalMatchedTerms}`,
    '',
    '## Signal groups',
    ...groups.flatMap((group) => [
      `### ${group.label}`,
      `- score: ${group.score}/100`,
      `- matched terms: ${group.matchedTerms.length ? group.matchedTerms.join(', ') : 'none yet'}`,
      '',
    ]),
    '## Summary',
    summary,
    '',
    '## Boundary',
    boundary,
  ].join('\n');

  return {
    title: resolvedTitle,
    cleanedText,
    excerpt: cleanedText.slice(0, 720),
    agencyScore,
    creativeScore,
    activeSignals,
    totalMatchedTerms,
    groups,
    summary,
    boundary,
    exportMarkdown,
  };
}
