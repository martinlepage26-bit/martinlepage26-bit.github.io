import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';

const repoRoot = process.cwd();

const collectionDirs = [
  { key: 'projects', dir: 'src/content/projects' },
  { key: 'papers', dir: 'src/content/papers' },
  { key: 'writings', dir: 'src/content/writings' },
  { key: 'talks', dir: 'src/content/talks' },
  { key: 'research', dir: 'src/content/research' },
];

const infrastructureArtifacts = [
  {
    sourcePath: '.github/workflows/verify.yml',
    sourceTitle: 'Verify workflow',
    normalizedTitle: 'Verify CI Gate',
    documentType: 'implementation artifact',
    status: 'active',
    thematicDomain: 'merge governance',
    likelyParentGrouping: 'Methods and Infrastructure',
    relation: 'Runs check+smoke on PR and main push.',
  },
  {
    sourcePath: '.github/CODEOWNERS',
    sourceTitle: 'CODEOWNERS',
    normalizedTitle: 'Ownership Map',
    documentType: 'governance artifact',
    status: 'active',
    thematicDomain: 'review accountability',
    likelyParentGrouping: 'Methods and Infrastructure',
    relation: 'Defines repository-level ownership labels.',
  },
  {
    sourcePath: '.github/pull_request_template.md',
    sourceTitle: 'Pull Request Template',
    normalizedTitle: 'Pull Request Accountability Template',
    documentType: 'governance artifact',
    status: 'active',
    thematicDomain: 'review discipline',
    likelyParentGrouping: 'Methods and Infrastructure',
    relation: 'Forces local verification and external settings checks.',
  },
  {
    sourcePath: 'scripts/smoke.mjs',
    sourceTitle: 'Smoke script',
    normalizedTitle: 'Build-and-Route Smoke Harness',
    documentType: 'implementation artifact',
    status: 'active',
    thematicDomain: 'deployment confidence',
    likelyParentGrouping: 'Methods and Infrastructure',
    relation: 'Builds, previews, and probes key public routes.',
  },
  {
    sourcePath: 'README.md',
    sourceTitle: 'Repository README',
    normalizedTitle: 'Maintainer Governance Runbook',
    documentType: 'supporting text',
    status: 'active',
    thematicDomain: 'deployment governance',
    likelyParentGrouping: 'Methods and Infrastructure',
    relation: 'Documents manual branch/deploy controls not stored in repo.',
  },
];

const pendingExternalSources = [
  {
    sourceTitle: 'To Codex for Website cards.zip',
    sourcePathHint: 'C:\\Users\\softinfo\\Documents\\MASTER PACK\\To Codex for Website cards.zip',
    status: 'not present in workspace',
    thematicDomain: 'external corpus pending import',
  },
  {
    sourceTitle: 'For Her Alone to Wield The Infras.txt',
    sourcePathHint: 'C:\\Users\\softinfo\\Documents\\MASTER PACK\\For Her Alone to Wield The Infras.txt',
    status: 'not present in workspace',
    thematicDomain: 'external corpus pending import',
  },
  {
    sourceTitle: 'SKILL.md',
    sourcePathHint: 'Expected in supplied corpus if methodologically central',
    status: 'not found in repo corpus',
    thematicDomain: 'methods infrastructure gap',
  },
  {
    sourceTitle: 'HEPHAISTOS AGENT',
    sourcePathHint: 'Expected in supplied corpus if methodologically central',
    status: 'not found in repo corpus',
    thematicDomain: 'methods infrastructure gap',
  },
];

const normalizedTitleOverrides = {
  'govern-ai-practice': {
    normalizedTitle: 'Govern-AI Practice Environment',
    navLabel: 'Govern-AI Practice',
  },
  'the-broken-frequency-of-the-word': {
    normalizedTitle: 'The Broken Frequency of the Word',
    navLabel: 'Broken Frequency',
  },
  'agency-social-positioning-tool': {
    normalizedTitle: 'Agency Repository (Lotus and Scriptorium Umbrella)',
    navLabel: 'Agency Repository',
  },
  'religiologiques-32-review-leads': {
    normalizedTitle: 'Religiologiques 32 Review Leads',
    navLabel: 'Religiologiques Review Leads',
  },
};

function toSlug(filePath) {
  return basename(filePath, extname(filePath));
}

function cleanQuoted(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const lines = match[1].split('\n');
  const data = {};
  let activeArrayKey = null;

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    if (activeArrayKey && /^\s*-\s+/.test(line)) {
      data[activeArrayKey].push(cleanQuoted(line.replace(/^\s*-\s+/, '')));
      continue;
    }

    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!field) {
      activeArrayKey = null;
      continue;
    }

    const [, key, rawValue] = field;

    if (rawValue === '') {
      data[key] = [];
      activeArrayKey = key;
      continue;
    }

    activeArrayKey = null;

    if (rawValue === 'true' || rawValue === 'false') {
      data[key] = rawValue === 'true';
      continue;
    }

    if (/^-?\d+$/.test(rawValue)) {
      data[key] = Number(rawValue);
      continue;
    }

    data[key] = cleanQuoted(rawValue);
  }

  return data;
}

function inferDocumentType(collectionKey, data) {
  if (collectionKey === 'papers') {
    return data.type || 'paper';
  }

  if (collectionKey === 'writings') {
    return 'essay or note';
  }

  if (collectionKey === 'talks') {
    return data.format || 'talk';
  }

  if (collectionKey === 'projects') {
    const status = String(data.status || '').toLowerCase();

    if (status.includes('book')) {
      return 'book project';
    }

    if (status.includes('app')) {
      return 'methods and infrastructure artifact';
    }

    if (status.includes('framework') || status.includes('protocol')) {
      return 'governance framework';
    }

    if (status.includes('manuscript') || status.includes('paper')) {
      return 'manuscript';
    }

    return 'project record';
  }

  if (collectionKey === 'research') {
    return data.type || 'governance methods entry';
  }

  return 'supporting file';
}

function inferLikelyParentGrouping(collectionKey, data, slug) {
  const status = String(data.status || '').toLowerCase();
  const title = String(data.title || '').toLowerCase();
  const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag).toLowerCase()) : [];

  if (collectionKey === 'papers') {
    if (status.includes('published')) {
      return 'Research Publications';
    }

    if (status.includes('bibliographic')) {
      return 'Companion and Supporting Works';
    }

    return 'Research in Development';
  }

  if (collectionKey === 'writings') {
    return 'Public Writings and Concept Notes';
  }

  if (collectionKey === 'talks') {
    return 'Talks and Public Method Translation';
  }

  if (collectionKey === 'research') {
    return data.family || 'Governance Methods Atlas';
  }

  if (collectionKey === 'projects') {
    if (status.includes('app') || status.includes('repository') || status.includes('method') || title.includes('protocol')) {
      return 'Methods and Infrastructure';
    }

    if (status.includes('manuscript') || status.includes('paper') || status.includes('book prospectus')) {
      return 'Experimental Phases and Manuscripts';
    }

    if (status.includes('book')) {
      return 'Published and Book-Length Works';
    }

    if (tags.some((tag) => tag.includes('governance') || tag.includes('traceability') || tag.includes('protocol'))) {
      return 'Protocols and Governance Frames';
    }

    if (slug.includes('protocol')) {
      return 'Protocols and Governance Frames';
    }

    return 'Project Archive';
  }

  return 'Unclassified';
}

function inferStatus(collectionKey, data) {
  if (collectionKey === 'writings') {
    return data.draft ? 'draft' : 'published';
  }

  return data.status || 'working';
}

function inferRole(collectionKey, data) {
  const status = String(data.status || '').toLowerCase();

  if (collectionKey === 'research') {
    return data.entryRole || 'major';
  }

  if (collectionKey === 'papers') {
    if (status.includes('published')) {
      return data.featured ? 'major entry' : 'secondary entry';
    }

    if (status.includes('bibliographic')) {
      return 'supporting file';
    }

    return 'companion entry';
  }

  if (collectionKey === 'projects') {
    if (status.includes('app') || status.includes('framework') || status.includes('protocol')) {
      return 'major entry';
    }

    if (status.includes('book') || status.includes('manuscript')) {
      return 'secondary entry';
    }

    return 'companion entry';
  }

  if (collectionKey === 'writings' || collectionKey === 'talks') {
    return data.featured ? 'secondary entry' : 'supporting file';
  }

  return 'supporting file';
}

function inferThematicDomain(data, collectionKey) {
  const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [];
  if (tags.length > 0) {
    return tags.slice(0, 3).join(' · ');
  }

  if (collectionKey === 'talks') {
    return 'public explanation';
  }

  if (collectionKey === 'writings') {
    return 'public interpretation';
  }

  if (collectionKey === 'papers') {
    return 'research publication';
  }

  if (collectionKey === 'projects') {
    return 'project development';
  }

  return 'governance methods';
}

function extractRelations(raw, slug) {
  const relations = [];
  const localLinks = [...raw.matchAll(/\]\((\/[^)]+)\)/g)].map((match) => match[1]);

  for (const link of localLinks) {
    relations.push(link);
  }

  if (raw.includes('Scriptorium') && slug !== 'scriptorium') {
    relations.push('/projects/scriptorium/');
  }

  if (raw.includes('CompassAI') && slug !== 'compassai-governance-engine') {
    relations.push('/projects/compassai-governance-engine/');
  }

  return [...new Set(relations)].slice(0, 8);
}

function normalizeTitle(slug, title) {
  const override = normalizedTitleOverrides[slug];
  if (override?.normalizedTitle) {
    return override.normalizedTitle;
  }

  if (typeof title !== 'string' || title.length === 0) {
    return slug.replace(/-/g, ' ');
  }

  if (title.toUpperCase() === title) {
    return title
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ');
  }

  return title;
}

async function loadCollectionFiles(collection) {
  const fullDir = join(repoRoot, collection.dir);
  const entries = await readdir(fullDir, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(fullDir, entry.name));

  return files;
}

async function buildInventory() {
  const inventory = [];

  for (const collection of collectionDirs) {
    const files = await loadCollectionFiles(collection);

    for (const absolutePath of files) {
      const raw = await readFile(absolutePath, 'utf8');
      const data = parseFrontmatter(raw);
      const slug = toSlug(absolutePath);
      const relPath = relative(repoRoot, absolutePath).replaceAll('\\', '/');
      const cleanedFilename = `${slug}.md`;
      const sourceTitle = String(data.title || slug.replace(/-/g, ' '));

      inventory.push({
        sourcePath: relPath,
        sourceCollection: collection.key,
        sourceTitle,
        normalizedTitle: normalizeTitle(slug, sourceTitle),
        navLabel: normalizedTitleOverrides[slug]?.navLabel || normalizeTitle(slug, sourceTitle),
        cleanFilename: cleanedFilename,
        cleanSlug: slug,
        documentType: inferDocumentType(collection.key, data),
        status: inferStatus(collection.key, data),
        thematicDomain: inferThematicDomain(data, collection.key),
        likelyParentGrouping: inferLikelyParentGrouping(collection.key, data, slug),
        likelyChronology: data.year || data.date || null,
        roleInTree: inferRole(collection.key, data),
        originalTitlePreserved: sourceTitle,
        relationships: extractRelations(raw, slug),
      });
    }
  }

  for (const artifact of infrastructureArtifacts) {
    inventory.push({
      sourcePath: artifact.sourcePath,
      sourceCollection: 'infrastructure',
      sourceTitle: artifact.sourceTitle,
      normalizedTitle: artifact.normalizedTitle,
      navLabel: artifact.normalizedTitle,
      cleanFilename: basename(artifact.sourcePath),
      cleanSlug: basename(artifact.sourcePath).replace(/\.[^.]+$/, ''),
      documentType: artifact.documentType,
      status: artifact.status,
      thematicDomain: artifact.thematicDomain,
      likelyParentGrouping: artifact.likelyParentGrouping,
      likelyChronology: null,
      roleInTree: 'supporting file',
      originalTitlePreserved: artifact.sourceTitle,
      relationships: [artifact.relation],
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    corpusBoundary: {
      scope: 'In-repo corpus only',
      note: 'External files referenced by Windows paths were not available in this workspace at generation time.',
    },
    counts: {
      projects: inventory.filter((item) => item.sourceCollection === 'projects').length,
      papers: inventory.filter((item) => item.sourceCollection === 'papers').length,
      writings: inventory.filter((item) => item.sourceCollection === 'writings').length,
      talks: inventory.filter((item) => item.sourceCollection === 'talks').length,
      research: inventory.filter((item) => item.sourceCollection === 'research').length,
      infrastructure: inventory.filter((item) => item.sourceCollection === 'infrastructure').length,
      total: inventory.length,
    },
    pendingExternalSources,
    inventory,
  };
}

async function main() {
  const payload = await buildInventory();

  const docsDir = join(repoRoot, 'docs');
  await mkdir(docsDir, { recursive: true });

  const inventoryJsonPath = join(docsDir, 'corpus-inventory.json');
  const inventoryMdPath = join(docsDir, 'corpus-inventory.md');

  await writeFile(inventoryJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Corpus Inventory');
  lines.push('');
  lines.push(`Generated: ${payload.generatedAt}`);
  lines.push('');
  lines.push('## Corpus Boundary');
  lines.push('');
  lines.push(`- Scope: ${payload.corpusBoundary.scope}`);
  lines.push(`- Note: ${payload.corpusBoundary.note}`);
  lines.push('');
  lines.push('## Counts');
  lines.push('');
  lines.push(`- Projects: ${payload.counts.projects}`);
  lines.push(`- Papers: ${payload.counts.papers}`);
  lines.push(`- Writings: ${payload.counts.writings}`);
  lines.push(`- Talks: ${payload.counts.talks}`);
  lines.push(`- Research methods entries: ${payload.counts.research}`);
  lines.push(`- Infrastructure artifacts: ${payload.counts.infrastructure}`);
  lines.push(`- Total inventory rows: ${payload.counts.total}`);
  lines.push('');
  lines.push('## Pending External Sources');
  lines.push('');
  for (const source of payload.pendingExternalSources) {
    lines.push(`- ${source.sourceTitle} (${source.status})`);
    lines.push(`  - Path hint: ${source.sourcePathHint}`);
  }
  lines.push('');
  lines.push('## Output');
  lines.push('');
  lines.push('- Full machine-readable inventory: `docs/corpus-inventory.json`');

  await writeFile(inventoryMdPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${relative(repoRoot, inventoryJsonPath)}`);
  console.log(`Wrote ${relative(repoRoot, inventoryMdPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
