/**
 * site.ts — Content-editable arrays and site configuration
 *
 * This file holds two types of data:
 *
 * CONFIGURATION (requires code awareness to change):
 *   - siteMeta: site-wide identity, social URLs, job title, locale
 *   - pageMeta: per-page SEO titles and meta descriptions
 *   - navigation: header nav links and order
 *   - publicProjectOrder: display order for projects on the main archive page
 *   - hiddenProjectArchiveSlugs: projects excluded from the public archive listing
 *   - governanceProjectSlugs: project slugs shown on the governance page
 *   - governanceWritingSlugs: writing slugs shown on the governance page
 *
 * CONTENT-EDITABLE ARRAYS (text changes are safe without deeper code changes):
 *   - heroFacts: short credential tags shown in the homepage hero (bullet list)
 *   - audienceRoutes: the 5 routing cards on the homepage — eyebrow, title, description, href, cta
 *   - governancePracticeAreas: 4 practice area descriptions on the governance page
 *   - governanceFit: bullet list of "Best fit" areas on the governance page sidebar
 *   - biography: intro sentence, 3 body paragraphs, and currentWork shown on the About page
 *   - researchInterests: list of research areas shown on the About page sidebar
 *   - timeline: career timeline entries (year, title, detail) shown on the About page
 *   - resumeData: full resume content — summary, experience, education, certifications, expertise, contact
 *   - contactAreas: bullet list of inquiry types in the contact block
 *   - contactPathways: 4 inquiry pathway cards in the contact block
 */

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
    'AI governance, institutional analysis, and public writing by Martin Lepage.',
  locale: 'en-CA',
  email: 'martinlepage.ai@gmail.com',
  location: 'Montreal, Quebec, Canada',
  jobTitle: 'AI governance strategist, researcher, and writer',
  linkedIn: 'https://linkedin.com/in/martin-lepage-ai',
  github: 'https://github.com/martinlepage26-bit/',
  orcid: 'https://orcid.org/0009-0006-4320-6254',
  academia: 'https://independent.academia.edu/MartinLepage2',
  substack: 'https://substack.com/@hexadecimalproject',
  instagram: 'https://www.instagram.com/wheels_of_will/',
};

export const pageMeta = {
  home: {
    title: 'AI Governance, Research, and Strategic Writing',
    description:
      'AI governance design, institutional analysis, publications, and public writing by Martin Lepage.',
  },
  governance: {
    title: 'Governance Practice',
    description:
      'Governance design by Martin Lepage: decision rights, evidence discipline, traceability, and review structures built for real institutional pressure.',
  },
  about: {
    title: 'About Martin Lepage',
    description:
      'Background, research trajectory, and working method across AI governance, institutional analysis, and public writing.',
  },
  projects: {
    title: 'Projects and Working Manuscripts',
    description:
      'Method tools, working manuscripts, and experimental builds across governance, culture, legitimacy, and recursive analysis.',
  },
  publications: {
    title: 'Publications',
    description:
      'Published academic articles, reviews, and dissertation-related records by Martin Lepage, with Academia.edu as the wider archive.',
  },
  writings: {
    title: 'Writings and Books',
    description:
      'Essays, criticism, notes, and books by Martin Lepage on governance, culture, power, and meaning-making.',
  },
  talks: {
    title: 'Talks and Appearances',
    description:
      'Talks, conference presentations, and public appearances by Martin Lepage across governance, scholarship, and cultural analysis.',
  },
  resume: {
    title: 'Resume and CV',
    description:
      'Professional record for Martin Lepage across governance practice, research operations, publications, and institutional work.',
  },
  contact: {
    title: 'Contact Martin Lepage',
    description:
      'Contact Martin Lepage for governance engagements, writing commissions, research collaborations, speaking, or media requests.',
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
  'echo',
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
  'AI governance architecture and decision traceability',
  'PhD, Religious Sciences (UQAM)',
  'Institutional analysis across language, culture, and power',
  'English and French',
];

export const audienceRoutes = [
  {
    eyebrow: 'Governance engagements',
    title: 'Decision systems, accountability design, and review-ready documentation',
    description:
      'Start with governance structures that clarify authority, evidence, and consequence under institutional constraints.',
    href: '/governance/',
    cta: 'Review governance work',
  },
  {
    eyebrow: 'Academic and research readers',
    title: 'Publications and research trajectory',
    description:
      'Browse published work and follow the through-line from ritual studies to governance, legitimacy, and institutional analysis.',
    href: '/papers/',
    cta: 'Read publications',
  },
  {
    eyebrow: 'Editors and media',
    title: 'Essays, books, and public argument',
    description:
      'Move into essays and books that translate complex structures into clear public language without flattening stakes.',
    href: '/writing/',
    cta: 'Open the writing archive',
  },
  {
    eyebrow: 'Speaking and programming',
    title: 'Talks, panels, and invited sessions',
    description:
      'Review conference and public-facing talks on governance, cultural legitimacy, and methods of interpretation.',
    href: '/talks/',
    cta: 'See talks',
  },
  {
    eyebrow: 'First-time orientation',
    title: 'Biography, method, and working context',
    description:
      'Use About for the most direct orientation to background, method, and the relation between scholarship and strategy.',
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
    title: 'Governance architecture and decision rights',
    description:
      'Map who decides what, on what grounds, and under which escalation rules so authority remains explicit rather than assumed.',
  },
  {
    title: 'Evidence design and traceability',
    description:
      'Structure records, approvals, and source chains so consequential claims can be inspected, challenged, and defended.',
  },
  {
    title: 'Policy translation into operations',
    description:
      'Turn standards and principles into concrete procedures teams can execute under deadline without losing accountability.',
  },
  {
    title: 'Strategic interpretation and public clarity',
    description:
      'Produce briefs, essays, and explanatory texts that connect governance choices to institutional legitimacy and social consequence.',
  },
] as const;

export const governanceFit = [
  'Decision architecture, accountability models, and authority mapping',
  'Evidence packaging, traceability chains, and review protocols',
  'Risk framing, escalation logic, and operational governance workflows',
  'Strategic writing on governance, legitimacy, and institutional narrative',
] as const;

export const biography = {
  intro:
    'Martin Lepage is a Montreal-based governance strategist, researcher, and writer working where institutional design, public meaning, and operational accountability meet.',
  paragraphs: [
    'His academic formation spans ritual studies, queer theory, media analysis, digital culture, and contemporary spiritualities. He completed a PhD in Religious Sciences at Universite du Quebec a Montreal after earlier degrees in literary studies at Universite Laval. That trajectory trained close reading, conceptual discipline, and sensitivity to how categories shape what institutions can see.',
    'He has also worked in research operations, archives, AI-assisted quality evaluation, and clinical trial coordination. These roles demanded audit-ready documentation, multi-stakeholder judgment under pressure, and defensible decision pathways. The governance practice is grounded in that operational reality, not in abstract policy language alone.',
    'The through-line is legitimacy: how authority becomes credible, how systems distribute consequence, and how language can either clarify or conceal responsibility. The work treats governance as a lived relation between decision, evidence, institution, and affected people.',
  ],
  currentWork:
    'Current work focuses on AI governance systems, decision traceability, and strategic writing that links institutional design to cultural and political consequence.',
};

export const researchInterests = [
  'AI governance, accountability design, and decision traceability',
  'Legitimacy, authority, and institutional narrative',
  'Digital culture, platform ritual, and symbolic systems',
  'Queer theory, gender, and category critique',
  'Media interpretation, rhetoric, and public persuasion',
  'Method design for recursive and cross-domain analysis',
];

export const timeline = [
  {
    year: '2007',
    title: 'B.A. in Literary Studies',
    detail: 'Completed at Universite Laval with training in textual analysis and interpretive method.',
  },
  {
    year: '2009',
    title: 'M.A. in Literary Studies',
    detail: 'Graduate work at Universite Laval focused on symbolic and archetypal representation in narrative forms.',
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
    detail: 'Worked in preservation workflows where archival control, classification, and retrieval discipline were central.',
  },
  {
    year: '2022',
    title: 'Lead Quality Evaluator',
    detail: 'Evaluated AI-assisted customer service systems for escalation quality, judgment consistency, and output reliability.',
  },
  {
    year: '2023-2025',
    title: 'Clinical and Academic Research Coordination',
    detail: "Led research-support and documentation workflows at Clinique medicale L'Actuel in Montreal.",
  },
  {
    year: '2025-2026',
    title: 'Clinical Trial Coordination and Governance Practice',
    detail: 'Integrated high-compliance trial operations with governance design, risk framing, and decision documentation.',
  },
] as const;

export const resumeData = {
  summary:
    'Governance and research-operations professional working across clinical trials, AI quality review, archives, and scholarship. Builds documentation and review structures that make consequential decisions legible, contestable, and defensible.',
  experience: [
    {
      title: 'Clinical Trial Coordinator',
      organization: 'Novartis Canada (via Calian Group)',
      location: 'Remote',
      dates: 'Oct 2025 - Jan 2026',
      bullets: [
        'Coordinated large-scale pharmaceutical trial activity in a high-compliance environment and maintained review-ready documentation under strict timelines.',
        'Managed cross-functional communication across distributed stakeholders to keep regulatory and operational materials aligned.',
        'Delivered audit-ready records for time-sensitive trial workflows with clear handoff and escalation logic.',
      ],
    },
    {
      title: 'Assistant Research Coordinator (Clinical and Academic)',
      organization: "Clinique medicale L'Actuel",
      location: 'Montreal',
      dates: 'Aug 2023 - Oct 2025',
      bullets: [
        'Directed protocol coordination, stakeholder communication, and documentation workflows across clinical and academic contexts.',
        'Strengthened grant, reporting, and formal project materials through clearer evidence pathways and structured review.',
        'Maintained project integrity across ethical, clinical, and academic standards in mixed-institution settings.',
      ],
    },
    {
      title: 'Research and Laboratory Assistant',
      organization: "Clinique medicale L'Actuel",
      location: 'Montreal',
      dates: 'Jan 2023 - Aug 2023',
      bullets: [
        'Managed sample processing, database entry, and research tracking for multi-phase clinical workflows.',
        'Improved reporting consistency through tighter documentation and quality-control routines.',
      ],
    },
    {
      title: 'Lead Quality Evaluator (EN/FR)',
      organization: 'Concentrix (Toyota Connected)',
      location: 'Remote',
      dates: '2022',
      bullets: [
        'Evaluated decision quality in AI-assisted customer service environments in English and French.',
        'Detected risk signals in escalation logic, judgment consistency, and potential output bias.',
        'Translated review findings into practical changes that improved reliability and trustworthiness.',
      ],
    },
    {
      title: 'Materials and Preservation Clerk',
      organization: 'National Film Board of Canada',
      location: 'Canada',
      dates: '2019 - 2021',
      bullets: [
        'Maintained digital and physical preservation workflows for complex archival media assets.',
        'Documented lifecycle controls and retrieval processes to improve institutional traceability.',
      ],
    },
    {
      title: 'Research and Teaching Assistant',
      organization: 'UQAM',
      location: 'Montreal',
      dates: '2010 - 2017',
      bullets: [
        'Supported teaching and research in sociology, sexology, and religious studies.',
        'Led tutorials, assessed student work, and contributed to publication-oriented academic research.',
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
  'Governance architecture, decision traceability, and review protocols',
  'Editorial commissions, interviews, and media requests',
  'Talks, guest lectures, and panel programming',
  'Research collaborations and publication discussions',
];

export const contactPathways = [
  {
    title: 'Governance engagements',
    description:
      'For governance architecture, evidence design, escalation pathways, and institutional accountability work.',
    cta: 'Email about governance work',
  },
  {
    title: 'Speaking and events',
    description:
      'For conferences, panels, workshops, and guest lectures on governance, legitimacy, culture, and institutional analysis.',
    cta: 'Email about speaking',
  },
  {
    title: 'Editorial and media',
    description:
      'For commissioned essays, interviews, book conversations, editorial collaboration, and media requests.',
    cta: 'Email about editorial work',
  },
  {
    title: 'Academic and research',
    description:
      'For publication dialogue, collaborative research, scholarly outreach, and archive-related inquiries.',
    cta: 'Email about research',
  },
] as const;
