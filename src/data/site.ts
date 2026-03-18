const configuredSiteUrl = (process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? '').trim();

export const siteMeta = {
  name: 'Martin Lepage',
  shortName: 'Martin Lepage',
  title: 'Martin Lepage',
  siteUrl: configuredSiteUrl,
  description:
    'Montreal-based scholar, writer, and AI governance strategist focused on governance, culture, and public writing.',
  locale: 'en-CA',
  email: 'martinlepage.ai@gmail.com',
  location: 'Montreal, Quebec, Canada',
  jobTitle: 'Scholar, writer, AI governance strategist',
  linkedIn: 'https://linkedin.com/in/martin-lepage-ai',
  github: 'https://github.com/martinlepage26-bit/',
  orcid: 'https://orcid.org/0009-0006-4320-6254',
  academia: 'https://independent.academia.edu/MartinLepage2',
  substack: 'https://substack.com/@hexadecimalproject',
  instagram: 'https://www.instagram.com/wheels_of_will/',
};

export const navigation = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/papers/', label: 'Papers' },
  { href: '/projects/', label: 'Projects' },
  { href: '/writing/', label: 'Writing' },
  { href: '/talks/', label: 'Talks' },
  { href: '/resume/', label: 'Resume' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const heroFacts = [
  'PhD, Religious Sciences',
  'AI governance strategy',
  'Public scholarship',
  'English and French',
];

export const homeHighlights = [
  {
    eyebrow: 'For governance teams',
    title: 'Governance work and documentation',
    description:
      'Start with the practice side: advisory projects, documentation work, and reviewable systems.',
    href: '/projects/',
    cta: 'Open governance work',
  },
  {
    eyebrow: 'For academic readers',
    title: 'Papers and research context',
    description:
      'Browse publications, talks, and the research questions that connect ritual, media, and legitimacy.',
    href: '/papers/',
    cta: 'Browse papers',
  },
  {
    eyebrow: 'For editors and media',
    title: 'Essays and public writing',
    description:
      'Go to essays, criticism, and profile material for interviews, editorial work, or general readers.',
    href: '/writing/',
    cta: 'Read the writing',
  },
] as const;

export const biography = {
  intro:
    'Martin Lepage is a Montreal-based scholar, writer, and AI governance strategist. His work brings together AI governance, research, and public writing.',
  paragraphs: [
    'His academic background includes ritual studies, queer theory, media analysis, digital culture, and contemporary spiritualities. He completed a PhD in Religious Sciences at Universite du Quebec a Montreal after earlier degrees in literary studies at Universite Laval.',
    'He has also worked in research operations, archives, AI-assisted quality review, and clinical trial coordination. That mix helps him understand complex institutions while still making documentation useful and practical.',
    'Today his work connects governance, media, and authorship through a shared concern: how legitimacy is built, how authority is explained, and how people live with those systems once they are in place.',
  ],
  currentWork:
    'Current work includes AI governance, research on ritual and media, and books in progress.',
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
  'AI governance and documentation work',
  'Editorial, interview, and media requests',
  'Talks, guest lectures, and panels',
  'Research collaborations and publication conversations',
];
