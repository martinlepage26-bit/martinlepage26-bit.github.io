import { resolveSiteUrl } from '../../site-config.js';

const configuredSiteUrl = resolveSiteUrl({
  PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL,
  SITE_URL: import.meta.env.SITE_URL,
});

export const siteMeta = {
  name: 'Martin Lepage',
  shortName: 'Martin Lepage',
  title: 'Martin Lepage',
  siteUrl: configuredSiteUrl,
  description:
    'AI governance strategy, publications, talks, and public writing by Martin Lepage.',
  locale: 'en-CA',
  email: 'martinlepage.ai@gmail.com',
  location: 'Montreal, Quebec, Canada',
  jobTitle: 'AI governance strategist, scholar, and writer',
  linkedIn: 'https://linkedin.com/in/martin-lepage-ai',
  github: 'https://github.com/martinlepage26-bit/',
  orcid: 'https://orcid.org/0009-0006-4320-6254',
  academia: 'https://independent.academia.edu/MartinLepage2',
  substack: 'https://substack.com/@hexadecimalproject',
  instagram: 'https://www.instagram.com/wheels_of_will/',
};

export const pageMeta = {
  home: {
    title: 'AI Governance, Publications, and Writing',
    description:
      'AI governance strategy, selected governance projects, publications, talks, and public writing by Martin Lepage.',
  },
  governance: {
    title: 'Governance Practice',
    description:
      'AI governance strategy, decision documentation, evidence packaging, and reviewable systems work by Martin Lepage.',
  },
  about: {
    title: 'About Martin Lepage',
    description:
      'Background, research trajectory, and working context for Martin Lepage across AI governance, research operations, and public writing.',
  },
  projects: {
    title: 'Projects and Manuscripts',
    description:
      'Deterministic recursive method work, in-progress manuscripts, apps in development, and research projects by Martin Lepage.',
  },
  publications: {
    title: 'Publications',
    description:
      'Published academic articles, reviews, and dissertation-related records by Martin Lepage, with Academia.edu as the larger archive.',
  },
  writings: {
    title: 'Writings and Books',
    description:
      'Public essays, notes, criticism, and published book pages by Martin Lepage, with RSS and HEXA links.',
  },
  talks: {
    title: 'Talks and Appearances',
    description:
      'Talks, conference presentations, panels, and public appearances by Martin Lepage across governance, scholarship, and media.',
  },
  resume: {
    title: 'Resume and CV',
    description:
      'On-page resume and downloadable CV for Martin Lepage covering governance work, research operations, publications, and professional experience.',
  },
  contact: {
    title: 'Contact Martin Lepage',
    description:
      'Contact Martin Lepage about governance work, writing, research collaborations, speaking, or media requests.',
  },
  rss: {
    title: 'Martin Lepage - Writings',
    description: 'Latest essays, notes, and public writing from Martin Lepage.',
  },
} as const;

export const navigation = [
  { href: '/', label: 'Home' },
  { href: '/governance/', label: 'Governance' },
  { href: '/papers/', label: 'Publications' },
  { href: '/writing/', label: 'Writings' },
  { href: '/talks/', label: 'Talks' },
  { href: '/projects/', label: 'Projects' },
  { href: '/about/', label: 'About' },
  { href: '/resume/', label: 'Resume' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const publicProjectOrder = [
  'scriptorium',
  'compassai-governance-engine',
  'aurorai',
  'from-ai-anxiety-to-recursive-governance-under-constraint',
  'the-scythe-already-in-motion',
  'legitimacy-machines-altars-of-control',
  'the-sealed-card-protocol',
  'master-annotated-thematic-bibliography',
  'astrology-as-social-grammar',
  'bonded-intelligence-under-constraint',
  'lotus',
] as const;

export const hiddenProjectArchiveSlugs = [
  'agency-social-positioning-tool',
  'astral',
  'governess-suite',
  'recurso',
  'socialcompass-agatha',
  'the-violet-gem',
  'the-witches-road',
] as const;

export const projectArchivePromotedPaperSlugs = [] as const;

export const heroFacts = [
  'AI governance strategy',
  'PhD, Religious Sciences',
  'Decision documentation and review systems',
  'English and French',
];

export const audienceRoutes = [
  {
    eyebrow: 'Governance and consulting',
    title: 'Governance strategy, documentation, and reviewable systems',
    description:
      'Start with governance documents, review structures, and tools for oversight, traceability, and institutional clarity.',
    href: '/governance/',
    cta: 'Explore governance work',
  },
  {
    eyebrow: 'Academic readers',
    title: 'Publications and research context',
    description:
      'Browse publications and talks, then follow the research line connecting ritual, media, legitimacy, and governance.',
    href: '/papers/',
    cta: 'Browse publications',
  },
  {
    eyebrow: 'Editors and media',
    title: 'Essays, books, and public-facing writing',
    description:
      'Go to essays, criticism, books, and other writing suited to editorial, interview, and media use.',
    href: '/writing/',
    cta: 'Read the writings',
  },
  {
    eyebrow: 'Speaking and events',
    title: 'Talks, panels, and public appearances',
    description:
      'Review talk topics, formats, and material suited to conferences, guest lectures, and panels.',
    href: '/talks/',
    cta: 'View talks',
  },
  {
    eyebrow: 'General readers',
    title: 'A selective archive with a clear way in',
    description:
      'Start with the biography or selected writing for the clearest introduction to the work.',
    href: '/about/',
    cta: 'Read the biography',
  },
] as const;

export const governanceProjectSlugs = [
  'govern-ai-practice',
  'ai-governance',
  'compassai-governance-engine',
  'aurorai',
] as const;

export const governanceWritingSlugs = [
  'against-frictionless-governance',
  'what-governance-needs-from-ritual',
] as const;

export const governancePracticeAreas = [
  {
    title: 'Governance framing and decision documentation',
    description:
      'Define scope, claims, decision points, and accountability so AI use can be explained and defended.',
  },
  {
    title: 'Reviewable evidence and traceability',
    description:
      'Package inputs, citations, approvals, and supporting records so review does not depend on memory or improvisation.',
  },
  {
    title: 'Policy translation for real teams',
    description:
      'Turn standards and governance principles into procedures, escalation paths, and working documents people can actually use.',
  },
  {
    title: 'Research, editorial, and public explanation',
    description:
      'Write briefs, essays, and explanatory material that connect governance decisions to culture, legitimacy, and public understanding.',
  },
] as const;

export const governanceFit = [
  'AI use documentation, review structures, and oversight logic',
  'Decision records, evidence packaging, and traceability',
  'Risk framing, escalation paths, and governance workflows',
  'Essays, talks, and editorial work on governance and legitimacy',
] as const;

export const biography = {
  intro:
    'Martin Lepage is based in Montreal and works across AI governance, research operations, and public writing.',
  paragraphs: [
    'His academic background spans ritual studies, queer theory, media analysis, digital culture, and contemporary spiritualities. He completed a PhD in Religious Sciences at Universite du Quebec a Montreal after earlier degrees in literary studies at Universite Laval.',
    'He has also worked in research operations, archives, AI-assisted quality review, and clinical trial coordination. That mix grounds the governance work in documentation, consequence, and institutional reality.',
    'Across governance, media, and authorship, the recurring concern is legitimacy: how authority is built, how it is explained, and what people are asked to live under.',
  ],
  currentWork:
    'Current work centers on AI governance documents and review systems, alongside research and book-length writing on ritual, media, legitimacy, and public life.',
};

export const researchInterests = [
  'AI governance and decision traceability',
  'Digital culture, platform ritual, and enchantment',
  'Queer theory, gender, and legitimacy',
  'Ritual studies and symbolic systems',
  'Media analysis, postfeminism, and television',
  'Experimental authorship and essay practice',
];

export const timeline = [
  {
    year: '2007',
    title: 'B.A. in Literary Studies',
    detail: 'Completed at Universite Laval.',
  },
  {
    year: '2009',
    title: 'M.A. in Literary Studies',
    detail: 'Graduate work at Universite Laval on symbolic and archetypal representations.',
  },
  {
    year: '2010-2017',
    title: 'Research and Teaching Assistant',
    detail: 'Contributed to teaching and research across sociology, sexology, and religious studies at UQAM.',
  },
  {
    year: '2017',
    title: 'PhD in Religious Sciences',
    detail: 'Completed at UQAM with doctoral research on queer ritual negotiations in Montreal neopagan communities.',
  },
  {
    year: '2019-2021',
    title: 'National Film Board of Canada',
    detail: 'Worked in materials and preservation, with an archival and systems-focused workflow.',
  },
  {
    year: '2022',
    title: 'Lead Quality Evaluator',
    detail: 'Assessed AI-assisted customer service environments, escalation logic, and output reliability.',
  },
  {
    year: '2023-2025',
    title: 'Clinical and Academic Research Coordination',
    detail: "Led research-support and documentation workflows at Clinique medicale L'Actuel in Montreal.",
  },
  {
    year: '2025-2026',
    title: 'Clinical Trial Coordination and Governance Practice',
    detail: 'Combined high-compliance trial operations with AI governance framing, risk mapping, and decision documentation.',
  },
] as const;

export const resumeData = {
  summary:
    'AI governance and research operations professional with experience in clinical trials, AI review, archives, and scholarly research. Strong at bringing order to fast-moving work through clear documentation, risk review, and practical decision support.',
  experience: [
    {
      title: 'Clinical Trial Coordinator',
      organization: 'Novartis Canada (via Calian Group)',
      location: 'Remote',
      dates: 'Oct 2025 - Jan 2026',
      bullets: [
        'Coordinated large-scale pharmaceutical trial activity in a high-compliance environment and kept documentation review-ready under tight timelines.',
        'Managed cross-functional communication across distributed stakeholders to keep operational and regulatory materials moving.',
        'Delivered structured, audit-ready materials for time-sensitive trial work.',
      ],
    },
    {
      title: 'Assistant Research Coordinator (Clinical and Academic)',
      organization: "Clinique medicale L'Actuel",
      location: 'Montreal',
      dates: 'Aug 2023 - Oct 2025',
      bullets: [
        'Directed research protocol coordination, stakeholder engagement, and documentation workflows across clinical and academic settings.',
        'Improved grant, reporting, and formal project materials through clearer documentation pipelines.',
        'Maintained project integrity across ethical, clinical, and academic standards.',
      ],
    },
    {
      title: 'Research and Laboratory Assistant',
      organization: "Clinique medicale L'Actuel",
      location: 'Montreal',
      dates: 'Jan 2023 - Aug 2023',
      bullets: [
        'Managed sample processing, database input, and research tracking for multi-phase work.',
        'Supported cleaner data reporting and stronger workflow consistency.',
      ],
    },
    {
      title: 'Lead Quality Evaluator (EN/FR)',
      organization: 'Concentrix (Toyota Connected)',
      location: 'Remote',
      dates: '2022',
      bullets: [
        'Evaluated decision quality in AI-assisted customer service environments in English and French.',
        'Identified risk signals in escalation logic, judgment consistency, and potential output bias.',
        'Turned review findings into practical recommendations to improve workflow reliability and trustworthiness.',
      ],
    },
    {
      title: 'Materials and Preservation Clerk',
      organization: 'National Film Board of Canada',
      location: 'Canada',
      dates: '2019 - 2021',
      bullets: [
        'Maintained digital and physical media preservation workflows for complex archival assets.',
        'Documented lifecycle controls and retrieval processes to improve traceability.',
      ],
    },
    {
      title: 'Research and Teaching Assistant',
      organization: 'UQAM',
      location: 'Montreal',
      dates: '2010 - 2017',
      bullets: [
        'Supported teaching and research in sociology, sexology, and religious studies.',
        'Led tutorials, assessed student work, and contributed to publication-oriented research.',
      ],
    },
  ],
  education: [
    {
      title: 'PhD, Religious Sciences',
      organization: 'Universite du Quebec a Montreal',
      dates: '2017',
      detail: 'Doctoral work focused on queer ritual negotiations, legitimacy, and performance in Montreal neopagan communities.',
    },
    {
      title: 'M.A., Literary Studies',
      organization: 'Universite Laval',
      dates: '2009',
      detail: 'Graduate research on symbolic and archetypal influences in narrative literature.',
    },
    {
      title: 'B.A., Literary Studies',
      organization: 'Universite Laval',
      dates: '2007',
      detail: 'Undergraduate training in literary analysis and critical interpretation.',
    },
  ],
  certifications: [
    'Responsible Generative AI Specialization - University of Michigan, Coursera (Completed Jan. 2026)',
    'Responsible and Ethical AI - Northeastern University, Coursera (Completed Jan. 2026)',
    'Strategic AI Governance - Executive-Level Risk, Ethics and Oversight (Coursera Professional Specialization, in progress)',
    'Building Trustworthy AI Specialization - Coursera (Completed Jan. 2026)',
    'ICH Good Clinical Practice (GCP) E6(R3) - The Global Health Network (Completed Oct. 25, 2025)',
  ],
  expertise: [
    {
      label: 'AI governance',
      items: [
        'AI use case inventory',
        'Governance risk mapping',
        'Decision traceability',
        'Escalation logic',
        'Minimum viable governance frameworks',
      ],
    },
    {
      label: 'Compliance and review',
      items: [
        'AIDA',
        'EU AI Act',
        'NIST AI RMF',
        'Audit-ready documentation',
        'Reviewable approval structures',
      ],
    },
    {
      label: 'Research operations',
      items: [
        'Protocol support',
        'Reporting pipelines',
        'Stakeholder communication',
        'Documentation under deadlines',
        'Quality control',
      ],
    },
    {
      label: 'Tools and languages',
      items: [
        'REDCap',
        'Microsoft Office Suite',
        'Canva',
        'WordPress',
        'Python (basic data navigation)',
        'English',
        'French',
      ],
    },
  ],
  contact: [
    'martinlepage.ai@gmail.com',
    'Montreal, Quebec, Canada',
    'LinkedIn: martin-lepage-ai',
    'GitHub: martinlepage26-bit',
  ],
};

export const contactAreas = [
  'Governance documents, review structures, and AI oversight work',
  'Editorial, interview, and media requests',
  'Talks, guest lectures, and panels',
  'Research collaborations and publication conversations',
];

export const contactPathways = [
  {
    title: 'Governance and consulting',
    description:
      'For governance strategy, review structures, decision records, and related advisory work.',
    cta: 'Email about governance',
  },
  {
    title: 'Speaking and events',
    description:
      'For conferences, panels, workshops, guest lectures, and event programming related to governance, legitimacy, media, or public scholarship.',
    cta: 'Email about speaking',
  },
  {
    title: 'Editorial and media',
    description:
      'For interviews, commissioned writing, editorial collaborations, book conversations, and media requests.',
    cta: 'Email about editorial work',
  },
  {
    title: 'Academic and research',
    description:
      'For publication conversations, research collaborations, scholarly outreach, and archive questions.',
    cta: 'Email about research',
  },
] as const;
