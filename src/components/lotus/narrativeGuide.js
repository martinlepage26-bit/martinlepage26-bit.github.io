const clamp = (value, min = 0, max = 10) => Math.min(max, Math.max(min, value));

const RAW_NARRATIVE_GUIDE = [
  {
    key: 'origins',
    title: '1. Origins and Youth',
    subtitle: 'Formative memory, early belonging, and unfinished residue',
    questions: [
      {
        id: 'youth_turning_points',
        title: 'Impactful moments of your youth',
        prompt:
          'What moments from childhood or adolescence still shape how you read safety, belonging, danger, power, or worth? Tell the story, not just the category: what happened, how old you were, who was there, what you decided about yourself at the time, and what still feels unfinished now.',
        probes: [
          'What part of that moment still feels live in your body or choices?',
          'What did you start doing to survive it?',
        ],
        hint: 'Often informs shadow remainder, relational pressure, stigma, coherence, and social legibility.',
      },
      {
        id: 'youth_good',
        title: 'What felt good, life-giving, or protective',
        prompt:
          'What in your early life gave you joy, steadiness, beauty, recognition, or relief? Name people, places, practices, rituals, obsessions, art, communities, or routines that made you feel more real, more held, or more capable.',
        probes: [
          'Where did you feel most understood or most yourself?',
          'What did those good moments teach you about what restores you?',
        ],
        hint: 'Often reveals relational, cultural, spiritual, and interpretive scaffolds.',
      },
      {
        id: 'youth_bad',
        title: 'What felt bad, dangerous, shaming, or destabilizing',
        prompt:
          'What in your youth felt frightening, humiliating, isolating, violating, or chronically unsafe? Be specific about the atmosphere, not just the event: what was happening around you, what was repeated, and what became normal even though it should not have been.',
        probes: [
          'What did you learn to hide, overperform, or avoid?',
          'What still gets reactivated when something similar happens now?',
        ],
        hint: 'Often reveals shadow load, stigma, isolation, relational harm, and regulatory strain.',
      },
    ],
  },
  {
    key: 'identity',
    title: '2. Identity and Recognition',
    subtitle: 'Chosen names, imposed roles, and social legibility',
    questions: [
      {
        id: 'identity_names',
        title: 'Names, roles, and versions of you',
        prompt:
          'What names, roles, identities, or versions of yourself feel chosen, and which feel imposed, inherited, strategic, or protective? If different people know different versions of you, describe that split and why it exists.',
        probes: [
          'When do you feel most correctly named?',
          'When do you feel translated badly or flattened into something false?',
        ],
        hint: 'Often informs coherence, social legibility, cultural scaffolding, and shadow remainder.',
      },
      {
        id: 'recognition_misrecognition',
        title: 'Being recognized correctly or misread',
        prompt:
          'Describe times when people, institutions, or communities really understood you, and times when they misread, dismissed, pathologized, stigmatized, or rerouted you. What made the difference?',
        probes: [
          'Who tends to understand you fastest, and who tends to distort you?',
          'What does being misread cost you materially or psychologically?',
        ],
        hint: 'Often informs social legibility, access, stigma, institutional pressure, and relational scaffolding.',
      },
    ],
  },
  {
    key: 'body',
    title: '3. Body, Regulation, and Compulsion',
    subtitle: 'What the body is carrying and how pressure moves through it',
    questions: [
      {
        id: 'body_load',
        title: 'What your body is carrying now',
        prompt:
          'What is your body carrying right now through illness, pain, disability, exhaustion, sensory overload, medication, hormonal shifts, sleep disruption, hunger, sexual dynamics, or addiction? Describe what a hard day actually feels like.',
        probes: [
          'What becomes harder first when your body is under strain?',
          'What do other people usually fail to understand about that load?',
        ],
        hint: 'Often informs body constraint, regulatory bandwidth, urgency, and clinical scaffolding.',
      },
      {
        id: 'regulation_patterns',
        title: 'How you lose and regain your steering',
        prompt:
          'When you are under pressure, what happens first: panic, shutdown, overwork, compulsion, numbness, rage, collapse, spiraling thought, or something else? Then tell me what actually helps you come back online.',
        probes: [
          'What makes things worse even if it looks productive from outside?',
          'What practices, people, or environments help you regulate without disappearing?',
        ],
        hint: 'Often informs regulatory bandwidth, shadow remainder, isolation risk, and clinical or relational scaffolds.',
      },
    ],
  },
  {
    key: 'institutions',
    title: '4. Work, Money, and Institutions',
    subtitle: 'Access, disposability, and structural traction',
    questions: [
      {
        id: 'institutional_story',
        title: 'Doors that opened and doors that closed',
        prompt:
          'Describe a time an institution, employer, school, clinic, bureaucracy, or authority structure opened a real path for you, and a time it made you disposable, blocked, delayed, or punishable. What did those experiences teach you about access and legitimacy?',
        probes: [
          'What kind of language did the institution use?',
          'Did you experience the problem as misunderstanding, extraction, betrayal, or something else?',
        ],
        hint: 'Often informs access, social legibility, institutional constraint, and organizational scaffolding.',
      },
      {
        id: 'material_reality',
        title: 'Current material and economic reality',
        prompt:
          'What is your actual money, work, housing, transport, paperwork, and survival situation right now? Write it plainly. What is stable, what is precarious, and what decisions are being forced by material pressure?',
        probes: [
          'What would become urgent if one support disappeared?',
          'What practical resource would widen room to move the fastest?',
        ],
        hint: 'Often informs economic, time, and urgency constraints, plus material scaffolds.',
      },
    ],
  },
  {
    key: 'relationships',
    title: '5. Relationships, Isolation, and Corrective Contact',
    subtitle: 'Where connection steadies you and where solitude distorts',
    questions: [
      {
        id: 'anchors_and_destabilizers',
        title: 'Who steadies you and who destabilizes you',
        prompt:
          'Who in your life helps you think more clearly, stay safer, or return to yourself, and who intensifies confusion, shame, extraction, or compulsion? Be concrete about what they do, not just whether they are “good” or “bad.”',
        probes: [
          'Who can interrupt your certainty without humiliating you?',
          'Who benefits when you over-function, disappear, or doubt yourself?',
        ],
        hint: 'Often informs relational scaffolds, relational constraints, social legibility, and shadow remainder.',
      },
      {
        id: 'isolation_profile',
        title: 'What happens when you isolate',
        prompt:
          'Describe the difference between solitude that restores you and isolation that distorts you. What does your thinking become like when you have gone too long without live corrective contact?',
        probes: [
          'What are the early warning signs that isolation is no longer protective?',
          'What kinds of decisions become dangerous when you are alone too long?',
        ],
        hint: 'Often informs isolation and urgency constraints, coherence, regulatory bandwidth, and relational scaffolding.',
      },
    ],
  },
  {
    key: 'meaning',
    title: '6. Meaning, Spirituality, and Interpretation',
    subtitle: 'Why life feels meaningful, sacred, or interpretable at all',
    questions: [
      {
        id: 'spirituality',
        title: 'Are you spiritual, and if so, why and how?',
        prompt:
          'Are you spiritual, religious, ritualized, metaphysical, skeptical, or something else entirely? If yes, explain why, how, and through what practices, communities, symbols, or experiences. If no, tell me what gives your life meaning, orientation, awe, or ethical direction instead.',
        probes: [
          'What does this layer help you metabolize that ordinary language cannot?',
          'When has spirituality or meaning-making been clarifying, and when has it risked becoming escape or over-interpretation?',
        ],
        hint: 'Often informs spiritual and interpretive scaffolds, coherence, perceptual latitude, and shadow management.',
      },
      {
        id: 'frameworks',
        title: 'Concepts, languages, and maps that help you think',
        prompt:
          'What concepts, theories, stories, diagnoses, rituals, art forms, lineages, or analytic frameworks help you make sense of your life? Which ones are still useful, and which ones have become too small, too grand, or too rigid?',
        probes: [
          'What language helps you revise your story instead of locking it?',
          'Where do you reach for interpretation too quickly because the pain is hard to sit with?',
        ],
        hint: 'Often informs interpretive scaffolds, coherence, perceptual latitude, and shadow remainder.',
      },
    ],
  },
  {
    key: 'present',
    title: '7. Present Field and Immediate Leverage',
    subtitle: 'What is active now and what could restore agency fastest',
    questions: [
      {
        id: 'active_pressures',
        title: 'What is pressing hardest right now',
        prompt:
          'What pressures are most active in your life right now? Name what feels urgent, what feels chronic, what feels humiliating, and what is consuming the most energy even when nothing visible is happening.',
        probes: [
          'What is making the planning horizon collapse?',
          'What part of the situation keeps returning even when you try to work around it?',
        ],
        hint: 'Often informs urgency, time, body, institutional, economic, and relational constraints.',
      },
      {
        id: 'fastest_restoration',
        title: 'What would widen room to move fastest',
        prompt:
          'If one thing changed in the next days or weeks, what would restore the most agency the fastest? Think concretely: a person, a room, sleep, money, treatment, distance from someone, a decision, a document, a ritual, a community, a schedule, a pause.',
        probes: [
          'What support is already partly there but underused?',
          'What do you need that you keep minimizing because it feels too simple, too expensive, or too vulnerable to ask for?',
        ],
        hint: 'Often reveals the highest-value scaffolds and the most actionable access constraints.',
      },
    ],
  },
];

const SIGNAL_LIBRARY = [
  {
    key: 'clarity',
    label: 'Pattern awareness',
    tone: 'resource',
    terms: ['notice', 'observe', 'aware', 'reflect', 'pattern', 'nuance', 'witness', 'perspective', 'revise'],
  },
  {
    key: 'fog',
    label: 'Perceptual narrowing',
    tone: 'pressure',
    terms: ['numb', 'panic', 'fog', 'tunnel', 'shutdown', 'shut down', 'dissoci', 'spiral', 'overwhelm', 'collapse'],
  },
  {
    key: 'regulation_support',
    label: 'Regulation support',
    tone: 'resource',
    terms: ['rest', 'sleep', 'routine', 'breathe', 'calm', 'steady', 'stabil', 'recover', 'ground', 'regulat'],
  },
  {
    key: 'regulation_strain',
    label: 'Regulation strain',
    tone: 'pressure',
    terms: ['addiction', 'compulsion', 'crash', 'relapse', 'flood', 'overload', 'insomnia', 'agitat', 'urge', 'burnout'],
  },
  {
    key: 'access_support',
    label: 'Usable pathways',
    tone: 'resource',
    terms: ['resource', 'pathway', 'reachable', 'option', 'support', 'tool', 'benefit', 'transport', 'housing', 'income'],
  },
  {
    key: 'access_barrier',
    label: 'Blocked access',
    tone: 'pressure',
    terms: ['blocked', 'barrier', 'denied', 'stuck', 'closed', 'waiting', 'unemployed', 'laid off', 'precarious', 'debt'],
  },
  {
    key: 'recognition_support',
    label: 'Correct recognition',
    tone: 'resource',
    terms: ['recognized', 'understood', 'believed', 'welcomed', 'included', 'respected', 'affirmed', 'seen'],
  },
  {
    key: 'misrecognition',
    label: 'Misrecognition',
    tone: 'pressure',
    terms: ['misread', 'dismiss', 'ignored', 'erased', 'rejected', 'patholog', 'not a good fit', 'invisible', 'disposable'],
  },
  {
    key: 'coherence_support',
    label: 'Meaning-making support',
    tone: 'resource',
    terms: ['coherent', 'integrat', 'meaning', 'make sense', 'understand', 'context', 'language', 'framework', 'name'],
  },
  {
    key: 'fragmentation',
    label: 'Fragmentation',
    tone: 'pressure',
    terms: ['fragment', 'split', 'chaos', 'confus', 'disorient', 'contradict', 'unravel', 'loop', 'obsess'],
  },
  {
    key: 'shadow_load',
    label: 'Unresolved residue',
    tone: 'pressure',
    terms: ['trauma', 'grief', 'shame', 'betray', 'abandon', 'wound', 'haunt', 'humiliat', 'violence', 'unfinished'],
  },
  {
    key: 'body_load',
    label: 'Body load',
    tone: 'pressure',
    terms: ['pain', 'illness', 'hiv', 'disabled', 'disability', 'fatigue', 'exhaust', 'sleep', 'somatic', 'sensory'],
  },
  {
    key: 'time_load',
    label: 'Time compression',
    tone: 'pressure',
    terms: ['deadline', 'rush', 'no time', 'time pressure', 'compressed', 'schedule', 'too late'],
  },
  {
    key: 'economic_load',
    label: 'Economic pressure',
    tone: 'pressure',
    terms: ['money', 'rent', 'debt', 'precar', 'income', 'job', 'work', 'welfare', 'benefit', 'housing'],
  },
  {
    key: 'relational_load',
    label: 'Relational harm',
    tone: 'pressure',
    terms: ['conflict', 'abandon', 'coerc', 'loss', 'betray', 'fight', 'breakup', 'withdraw', 'rejection', 'extraction'],
  },
  {
    key: 'institutional_load',
    label: 'Institutional pressure',
    tone: 'pressure',
    terms: ['institution', 'bureaucr', 'policy', 'contract', 'manager', 'hr', 'hospital', 'government', 'school', 'admin'],
  },
  {
    key: 'stigma_load',
    label: 'Stigma pressure',
    tone: 'pressure',
    terms: ['stigma', 'judg', 'label', 'queerphob', 'racis', 'ableis', 'blame', 'dirty', 'shame'],
  },
  {
    key: 'isolation_load',
    label: 'Isolation',
    tone: 'pressure',
    terms: ['alone', 'isolat', 'cut off', 'nobody', 'no one', 'solitude', 'withdraw', 'disappear'],
  },
  {
    key: 'urgency_load',
    label: 'Urgency',
    tone: 'pressure',
    terms: ['urgent', 'emergency', 'crisis', 'survival', 'immediate', 'now or never', 'right now'],
  },
  {
    key: 'relational_support',
    label: 'Relational support',
    tone: 'support',
    terms: ['friend', 'sister', 'brother', 'partner', 'mentor', 'community', 'anchor', 'peer', 'godmother', 'family'],
  },
  {
    key: 'material_support',
    label: 'Material support',
    tone: 'support',
    terms: ['housing', 'income', 'food', 'transport', 'device', 'room', 'shelter', 'money help'],
  },
  {
    key: 'clinical_support',
    label: 'Clinical support',
    tone: 'support',
    terms: ['doctor', 'clinic', 'therapy', 'psychiat', 'medication', 'care team', 'counsel', 'treatment'],
  },
  {
    key: 'cultural_support',
    label: 'Cultural support',
    tone: 'support',
    terms: ['culture', 'language', 'ritual', 'ancestry', 'queer', 'tradition', 'lineage', 'belonging'],
  },
  {
    key: 'spiritual_support',
    label: 'Spiritual support',
    tone: 'support',
    terms: ['spiritual', 'prayer', 'ritual', 'god', 'tarot', 'astrology', 'meditat', 'faith', 'sacred', 'metaphys'],
  },
  {
    key: 'organizational_support',
    label: 'Organizational support',
    tone: 'support',
    terms: ['union', 'advocate', 'legal aid', 'service', 'case worker', 'organization', 'collective', 'program'],
  },
  {
    key: 'interpretive_support',
    label: 'Interpretive support',
    tone: 'support',
    terms: ['framework', 'analysis', 'theory', 'concept', 'map', 'protocol', 'journal', 'writing', 'method'],
  },
  {
    key: 'joy_signal',
    label: 'Life-giving experience',
    tone: 'resource',
    terms: ['joy', 'love', 'play', 'beauty', 'music', 'art', 'wonder', 'pleasure', 'alive'],
  },
];

const QUESTION_GUIDANCE = {
  youth_turning_points: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['scene', 'person', 'cost', 'meaning', 'repeat'],
    rca: true,
  },
  youth_good: {
    targetWords: { min: 70, max: 140 },
    artifacts: ['scene', 'person', 'support', 'repeat'],
  },
  youth_bad: {
    targetWords: { min: 90, max: 170 },
    artifacts: ['scene', 'person', 'cost', 'repeat', 'meaning'],
    rca: true,
  },
  identity_names: {
    targetWords: { min: 70, max: 140 },
    artifacts: ['person', 'meaning', 'repeat'],
  },
  recognition_misrecognition: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['person', 'institution', 'cost', 'repeat'],
  },
  body_load: {
    targetWords: { min: 80, max: 150 },
    artifacts: ['scene', 'cost', 'support', 'repeat'],
    rca: true,
  },
  regulation_patterns: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['trigger', 'cost', 'support', 'repeat'],
    rca: true,
  },
  institutional_story: {
    targetWords: { min: 100, max: 170 },
    artifacts: ['institution', 'person', 'cost', 'meaning', 'repeat'],
    rca: true,
  },
  material_reality: {
    targetWords: { min: 70, max: 140 },
    artifacts: ['institution', 'cost', 'support', 'repeat'],
  },
  anchors_and_destabilizers: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['person', 'cost', 'support', 'repeat'],
  },
  isolation_profile: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['trigger', 'cost', 'support', 'repeat'],
    rca: true,
  },
  spirituality: {
    targetWords: { min: 80, max: 150 },
    artifacts: ['scene', 'meaning', 'support', 'repeat'],
  },
  frameworks: {
    targetWords: { min: 80, max: 150 },
    artifacts: ['meaning', 'support', 'repeat'],
  },
  active_pressures: {
    targetWords: { min: 90, max: 160 },
    artifacts: ['institution', 'cost', 'trigger', 'repeat'],
    rca: true,
  },
  fastest_restoration: {
    targetWords: { min: 70, max: 130 },
    artifacts: ['support', 'cost', 'repeat'],
  },
};

const ARTIFACT_LIBRARY = {
  scene: {
    label: 'Concrete scene or event',
    terms: ['when', 'after', 'before', 'during', 'once', 'that day', 'that night', 'growing up', 'at school', 'at work'],
  },
  person: {
    label: 'A person or relationship',
    terms: ['mother', 'father', 'sister', 'brother', 'friend', 'teacher', 'manager', 'doctor', 'therapist', 'partner', 'family', 'boss', 'peer', 'mentor', 'anchor'],
  },
  institution: {
    label: 'An institution or setting',
    terms: ['school', 'hospital', 'clinic', 'company', 'work', 'job', 'university', 'government', 'church', 'police', 'bureaucr', 'institution', 'office', 'employer'],
  },
  cost: {
    label: 'What it cost',
    terms: ['cost', 'loss', 'lost', 'risk', 'harm', 'hurt', 'pain', 'shame', 'fear', 'exhaust', 'precar', 'collapse', 'stigma'],
  },
  support: {
    label: 'What helped or could help',
    terms: ['help', 'support', 'anchor', 'care', 'rest', 'therapy', 'friend', 'ritual', 'sleep', 'money', 'protect', 'ground', 'steady'],
  },
  repeat: {
    label: 'What still repeats now',
    terms: ['still', 'again', 'keep', 'repeats', 'return', 'returns', 'now', 'continues', 'pattern'],
  },
  meaning: {
    label: 'What you made it mean',
    match: (text) => matchesMeaningArtifact(text),
  },
  trigger: {
    label: 'What triggered it',
    terms: ['trigger', 'because', 'after', 'following', 'once', 'as soon as', 'whenever'],
  },
};

const RCA_TEMPLATE_LINES = [
  'What happened?',
  'What triggered it?',
  'What did you tell yourself it meant?',
  'What did you do next?',
  'What did it cost?',
  'What support was missing?',
  'What still repeats now?',
];

export const NARRATIVE_GUIDE = RAW_NARRATIVE_GUIDE.map((section) => ({
  ...section,
  questions: section.questions.map((question) => ({
    ...question,
    ...QUESTION_GUIDANCE[question.id],
  })),
}));

const flattenQuestions = () => NARRATIVE_GUIDE.flatMap((section) => section.questions);

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const countTermHits = (text, terms) =>
  terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);

const MEANING_EXPLICIT_PHRASES = [
  'i learned',
  'i decided',
  'i realized',
  'i understood',
  'i came to believe',
  'i took it to mean',
  'i got the message',
  'it taught me that',
  'it showed me that',
  'it made me believe',
  'i came to see',
  'i read it as',
  'i interpreted it as',
  'that meant',
  'what it meant',
];

const MEANING_EXPLICIT_PATTERNS = [
  /\b(?:that|this|it|the experience|the moment|that year|this year)\s+(?:taught|showed)\s+me(?: that)?\b/,
  /\b(?:it|this|that)\s+made\s+me\s+believe(?: that)?\b/,
];

const MEANING_REFLECTIVE_PHRASES = [
  'told myself',
  'telling myself',
  'meaning',
  'meant',
  'belief',
  'believe',
  'story',
  'worth',
  'proof',
  'framework',
  'lesson',
];

const MEANING_CONSEQUENCE_PHRASES = ['because', 'so i', 'so that', 'which meant', 'that meant', 'as a result', 'therefore', 'which made me'];

function matchesMeaningArtifact(text) {
  if (!text) {
    return false;
  }

  const explicit =
    MEANING_EXPLICIT_PHRASES.some((phrase) => text.includes(phrase)) ||
    MEANING_EXPLICIT_PATTERNS.some((pattern) => pattern.test(text));
  if (explicit) {
    return true;
  }

  const reflective = MEANING_REFLECTIVE_PHRASES.some((phrase) => text.includes(phrase));
  const consequential = MEANING_CONSEQUENCE_PHRASES.some((phrase) => text.includes(phrase));

  return reflective && consequential;
}

const blendScore = (neutral, derived, factor) => neutral + (derived - neutral) * factor;

const sortSignals = (signals, tone) =>
  signals
    .filter((signal) => signal.tone === tone && signal.hits > 0)
    .sort((left, right) => right.hits - left.hits)
    .slice(0, 4);

export const createNarrativeSeed = () =>
  Object.fromEntries(flattenQuestions().map((question) => [question.id, '']));

export function getRcaTemplate(question) {
  return `${question.title}\n${RCA_TEMPLATE_LINES.map((line) => `- ${line}`).join('\n')}`;
}

export function evaluateNarrativeDraft(question, value) {
  const text = normalizeText(value ?? '');
  const words = text ? text.split(' ').filter(Boolean).length : 0;
  const target = question.targetWords ?? { min: 80, max: 150 };
  const artifacts = (question.artifacts ?? []).map((artifactKey) => {
    const artifact = ARTIFACT_LIBRARY[artifactKey];
    const met = artifact.match ? artifact.match(text) : countTermHits(text, artifact.terms) > 0;

    return {
      key: artifactKey,
      label: artifact.label,
      met,
    };
  });

  const metCount = artifacts.filter((artifact) => artifact.met).length;
  const artifactRatio = artifacts.length ? metCount / artifacts.length : words > 0 ? 1 : 0;

  let lengthScore = 0;

  let lengthTone = 'neutral';
  let lengthLabel = `Aim for about ${target.min}-${target.max} words.`;

  if (words > 0 && words < Math.max(30, Math.round(target.min * 0.6))) {
    lengthTone = 'warning';
    lengthLabel = `Very short so far. Try to reach at least ${target.min} words with one concrete scene and one effect on you now.`;
    lengthScore = 0.35;
  } else if (words > 0 && words < target.min) {
    lengthTone = 'partial';
    lengthLabel = `Usable start. Add a little more detail to approach the ${target.min}-${target.max} word target.`;
    lengthScore = 0.65;
  } else if (words >= target.min && words <= target.max) {
    lengthTone = 'good';
    lengthLabel = `Good range. You are within the ${target.min}-${target.max} word target.`;
    lengthScore = 1;
  } else if (words > target.max) {
    lengthTone = 'partial';
    lengthLabel = `Longer than target, but still usable. Keep the scene, the cost, and what still repeats now.`;
    lengthScore = words <= Math.round(target.max * 1.8) ? 0.9 : 0.8;
  }

  let specificityTone = 'neutral';
  let specificityLabel = 'Be specific: name at least one event, one cost, and what still repeats now.';

  if (words > 0 && metCount >= Math.min(4, artifacts.length)) {
    specificityTone = 'good';
    specificityLabel = 'Good specificity. The draft contains enough concrete artifacts for scoring.';
  } else if (words > 0 && metCount >= 2) {
    specificityTone = 'partial';
    const missing = artifacts
      .filter((artifact) => !artifact.met)
      .slice(0, 2)
      .map((artifact) => artifact.label.toLowerCase());
    specificityLabel = missing.length
      ? `Good start, but add ${missing.join(' and ')} to make the draft more scoreable.`
      : 'Good start. Add one more concrete artifact to deepen the draft.';
  } else if (words > 0) {
    specificityTone = 'warning';
    specificityLabel = 'Needs a concrete example. Add a person, setting, cost, or repeating pattern.';
  }

  const qualityScore =
    words > 0
      ? clamp(lengthScore * 0.35 + artifactRatio * 0.65, 0, 1)
      : 0;

  const confidenceTier =
    qualityScore >= 0.8 ? 'strong' : qualityScore >= 0.55 ? 'usable' : words > 0 ? 'thin' : 'empty';

  return {
    words,
    target,
    artifacts,
    metCount,
    artifactRatio,
    lengthScore,
    qualityScore,
    confidenceTier,
    lengthTone,
    lengthLabel,
    specificityTone,
    specificityLabel,
  };
}

export function deriveNarrativeVectors(answers) {
  const answeredQuestions = flattenQuestions()
    .map((question) => {
      const raw = answers[question.id] ?? '';
      const text = normalizeText(raw);
      const draft = evaluateNarrativeDraft(question, raw);
      const trustWeight = draft.words > 0 ? 0.15 + draft.qualityScore * 0.85 : 0;
      const signalHits = Object.fromEntries(
        SIGNAL_LIBRARY.map((signal) => [signal.key, countTermHits(text, signal.terms)]),
      );

      return {
        id: question.id,
        title: question.title,
        raw,
        text,
        words: draft.words,
        artifactRatio: draft.artifactRatio,
        qualityScore: draft.qualityScore,
        confidenceTier: draft.confidenceTier,
        trustWeight,
        signalHits,
      };
    })
    .filter((question) => question.text.length > 0);

  const hitMap = Object.fromEntries(
    SIGNAL_LIBRARY.map((signal) => [
      signal.key,
      answeredQuestions.reduce(
        (sum, question) => sum + question.signalHits[signal.key] * question.trustWeight,
        0,
      ),
    ]),
  );

  const signalDetails = SIGNAL_LIBRARY.map((signal) => ({
    ...signal,
    hits: Number(hitMap[signal.key].toFixed(2)),
    questions: answeredQuestions
      .filter((question) => question.signalHits[signal.key] > 0)
      .sort(
        (left, right) =>
          right.signalHits[signal.key] * right.trustWeight -
          left.signalHits[signal.key] * left.trustWeight,
      )
      .slice(0, 2)
      .map((question) => question.title),
  }));

  const answeredCount = answeredQuestions.length;
  const totalQuestions = flattenQuestions().length;
  const completionPercent = Math.round((answeredCount / totalQuestions) * 100);
  const wordCount = answeredQuestions.reduce((sum, question) => sum + question.words, 0);
  const completionRatio = answeredCount / totalQuestions;
  const averageDraftQuality = answeredCount
    ? answeredQuestions.reduce((sum, question) => sum + question.qualityScore, 0) / answeredCount
    : 0;
  const averageArtifactCoverage = answeredCount
    ? answeredQuestions.reduce((sum, question) => sum + question.artifactRatio, 0) / answeredCount
    : 0;
  const strongAnswerCount = answeredQuestions.filter((question) => question.confidenceTier === 'strong').length;
  const coverageFactor = clamp(0.15 + completionRatio * 0.45 + averageDraftQuality * 0.4, 0.15, 1);

  const h = hitMap;

  const lotus = {
    P: clamp(
      blendScore(
        5,
        5 +
          h.clarity * 0.45 +
          h.interpretive_support * 0.2 +
          h.joy_signal * 0.15 -
          h.fog * 0.6 -
          h.isolation_load * 0.15 -
          h.urgency_load * 0.2,
        coverageFactor,
      ),
    ),
    R: clamp(
      blendScore(
        5,
        5 +
          h.regulation_support * 0.45 +
          h.clinical_support * 0.2 +
          h.relational_support * 0.1 -
          h.regulation_strain * 0.65 -
          h.body_load * 0.25 -
          h.urgency_load * 0.2,
        coverageFactor,
      ),
    ),
    A: clamp(
      blendScore(
        5,
        5 +
          h.access_support * 0.45 +
          h.material_support * 0.25 +
          h.organizational_support * 0.25 -
          h.access_barrier * 0.65 -
          h.economic_load * 0.3 -
          h.institutional_load * 0.2,
        coverageFactor,
      ),
    ),
    S: clamp(
      blendScore(
        5,
        5 +
          h.recognition_support * 0.45 +
          h.relational_support * 0.15 +
          h.cultural_support * 0.15 -
          h.misrecognition * 0.65 -
          h.stigma_load * 0.35 -
          h.institutional_load * 0.1,
        coverageFactor,
      ),
    ),
    C: clamp(
      blendScore(
        5,
        5 +
          h.coherence_support * 0.45 +
          h.interpretive_support * 0.3 +
          h.spiritual_support * 0.15 -
          h.fragmentation * 0.65 -
          h.shadow_load * 0.25 -
          h.urgency_load * 0.1,
        coverageFactor,
      ),
    ),
    Sh: clamp(
      blendScore(
        5,
        5 +
          h.shadow_load * 0.65 +
          h.regulation_strain * 0.3 +
          h.fragmentation * 0.25 +
          h.relational_load * 0.2 -
          h.relational_support * 0.1 -
          h.spiritual_support * 0.1,
        coverageFactor,
      ),
    ),
  };

  const constraints = {
    body: clamp(blendScore(5, 5 + h.body_load * 0.85 + h.regulation_strain * 0.2 - h.regulation_support * 0.15, coverageFactor)),
    time: clamp(blendScore(5, 5 + h.time_load * 0.85 + h.urgency_load * 0.2 - h.regulation_support * 0.1, coverageFactor)),
    economic: clamp(blendScore(5, 5 + h.economic_load * 0.9 + h.access_barrier * 0.2 - h.material_support * 0.2, coverageFactor)),
    relational: clamp(blendScore(5, 5 + h.relational_load * 0.9 + h.shadow_load * 0.1 - h.relational_support * 0.2, coverageFactor)),
    institutional: clamp(blendScore(5, 5 + h.institutional_load * 0.95 + h.misrecognition * 0.15 - h.organizational_support * 0.2, coverageFactor)),
    stigma: clamp(blendScore(5, 5 + h.stigma_load * 0.95 + h.misrecognition * 0.15 - h.recognition_support * 0.2, coverageFactor)),
    isolation: clamp(blendScore(5, 5 + h.isolation_load * 0.95 + h.fragmentation * 0.15 - h.relational_support * 0.2, coverageFactor)),
    urgency: clamp(blendScore(5, 5 + h.urgency_load * 0.95 + h.time_load * 0.2 - h.regulation_support * 0.1, coverageFactor)),
  };

  const scaffolds = {
    relational: clamp(blendScore(5, 5 + h.relational_support * 0.9 + h.recognition_support * 0.15 - h.isolation_load * 0.15, coverageFactor)),
    material: clamp(blendScore(5, 5 + h.material_support * 0.95 + h.access_support * 0.15 - h.economic_load * 0.15, coverageFactor)),
    clinical: clamp(blendScore(5, 5 + h.clinical_support * 0.95 + h.regulation_support * 0.15 - h.body_load * 0.1, coverageFactor)),
    cultural: clamp(blendScore(5, 5 + h.cultural_support * 0.95 + h.joy_signal * 0.15 - h.stigma_load * 0.1, coverageFactor)),
    spiritual: clamp(blendScore(5, 5 + h.spiritual_support * 0.95 + h.coherence_support * 0.1, coverageFactor)),
    organizational: clamp(blendScore(5, 5 + h.organizational_support * 0.95 + h.access_support * 0.15 - h.institutional_load * 0.1, coverageFactor)),
    interpretive: clamp(blendScore(5, 5 + h.interpretive_support * 0.95 + h.coherence_support * 0.2 - h.fragmentation * 0.1, coverageFactor)),
  };

  return {
    lotus,
    constraints,
    scaffolds,
    answeredCount,
    totalQuestions,
    completionPercent,
    wordCount,
    coverageFactor,
    completionRatio,
    averageDraftQuality,
    averageArtifactCoverage,
    strongAnswerCount,
    topPressureSignals: sortSignals(signalDetails, 'pressure'),
    topSupportSignals: sortSignals(signalDetails, 'support'),
    topResourceSignals: sortSignals(signalDetails, 'resource'),
    signalDetails,
  };
}
