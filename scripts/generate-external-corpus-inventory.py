#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Iterable

try:
    from docx import Document  # type: ignore
except Exception:  # pragma: no cover
    Document = None

ROOTS = [
    Path('/mnt/c/Users/softinfo/Documents/MASTER PACK'),
    Path('/mnt/c/Users/softinfo/Desktop/SKILLS Claude'),
    Path('/mnt/c/Users/softinfo/Desktop/RECURSO/RECURSOTRUE_unpacked'),
    Path('/mnt/c/Users/softinfo/Downloads'),
]

DOWNLOADS_TARGETS = {
    'Pourquoi_rever_encore_revise.docx',
    'Pourquoi rêver encore-@nalyses.docx',
    'LEPAGE-Pourquoi rêver encore.docx',
    'The Sealed Card Protocol - TRUE.docx',
    'martin_lepage_governance_tree.html',
    'pharos-preview.html',
    'skill_ecosystem_tree.html',
    'index.html',
}

INCLUDE_EXT = {
    '.md',
    '.txt',
    '.html',
    '.json',
    '.docx',
    '.odt',
    '.pdf',
    '.py',
    '.cmd',
    '.litcoffee',
    '.zip',
}

OUTPUT_JSON = Path('docs/external-corpus-inventory.json')
OUTPUT_MD = Path('docs/external-corpus-inventory.md')


@dataclass
class Record:
    source_path: str
    root: str
    extension: str
    size_bytes: int
    modified_utc: str
    source_title: str
    alternate_titles: list[str]
    normalized_title: str
    slug: str
    document_type: str
    status: str
    thematic_domain: str
    likely_parent_group: str
    likely_chronology: str
    entry_level: str
    relationships: list[str]
    rationale: str


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    value = re.sub(r'-+', '-', value).strip('-')
    return value or 'untitled'


def normalize_title(stem: str) -> str:
    chunks = re.split(r'[_\-]+', stem)
    clean = ' '.join(c for c in chunks if c)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:1].upper() + clean[1:] if clean else stem


def read_docx_title(path: Path) -> tuple[str | None, list[str]]:
    if Document is None:
        return None, []
    try:
        doc = Document(str(path))
    except Exception:
        return None, []
    paras = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    if not paras:
        return None, []
    alt: list[str] = []
    for line in paras[:20]:
        if len(line) < 180:
            alt.append(line)
        if len(alt) >= 4:
            break
    return paras[0], alt


def read_text_title(path: Path) -> tuple[str | None, list[str]]:
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return None, []
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return None, []
    title = lines[0][:220]
    return title, lines[:4]


def infer_doc_type(path: Path) -> str:
    name = path.name.lower()
    ext = path.suffix.lower()

    if name.startswith('skill_') or name == 'skill.md':
        return 'methods / infrastructure artifact'
    if 'governance_runs' in str(path):
        return 'experiment run artifact'
    if ext in {'.py', '.cmd', '.litcoffee'}:
        return 'implementation artifact'
    if 'protocol' in name:
        return 'protocol / procedural document'
    if 'manuscript' in name or 'paper' in name:
        return 'paper / manuscript'
    if name.startswith('00_'):
        return 'archive governance note'
    if ext in {'.md', '.txt'}:
        return 'note / analysis text'
    if ext == '.html':
        return 'web artifact / storyboard'
    if ext == '.pdf':
        return 'pdf artifact'
    if ext == '.docx':
        return 'word manuscript'
    if ext == '.odt':
        return 'open document text'
    if ext == '.json':
        return 'structured run data'
    if ext == '.zip':
        return 'archive bundle'
    return 'supporting file'


def infer_status(path: Path) -> str:
    p = str(path).lower()
    n = path.name.lower()
    if 'governance_runs' in p:
        return 'run record'
    if any(k in n for k in ['draft', 'revise', 'revised', 'restart', 'round2', 'round']):
        return 'working / iterative'
    if any(k in n for k in ['final', 'true', 'ready', 'submission']):
        return 'candidate complete'
    if n.startswith('00_'):
        return 'governance control note'
    return 'working'


def infer_domain(path: Path) -> str:
    p = str(path).lower()
    n = path.name.lower()

    if 'martin_lepage_governance_tree.html' in n or 'skill_ecosystem_tree.html' in n:
        return 'site architecture and taxonomy maps'
    if 'pharos-preview.html' in n:
        return 'site architecture and taxonomy maps'
    if '/scripts/' in p:
        return 'implementation and execution layer'
    if 'metmetadata' in p:
        return 'archive governance and metmetadata'
    if 'raw recursive data' in p:
        return 'reference library'
    if 'skills claude' in p or n.startswith('skill_') or n == 'skill.md':
        return 'instructional governance'
    if 'governance_runs' in p:
        return 'deterministic run governance'
    if any(k in n for k in ['constitution', 'control register', 'reviewer appendix', 'title page', 'submission note']):
        return 'institutional governance and submission controls'
    if any(k in n for k in ['mobius', 'alambic', 'violet gem', 'sealedcard', 'sealed card']):
        return 'protocol design and recursive control'
    if any(k in n for k in ['anxiety', 'recursive governance', 'discursive', 'agatha', 'rdaig', 'recurso']):
        return 'recursive governance methods'
    if 'why' in n or 'pourquoi' in n:
        return 'post-experiment soft-control implementation'
    if 'library' in p:
        return 'reference library'
    return 'supporting research context'


def infer_parent_group(path: Path) -> str:
    p = str(path)
    if 'MASTER PACK' in p:
        if 'APEX METHOD FOUNDATION AI & Society' in p:
            return 'Apex method submission packet'
        if 'AI GOVERNANCE LIBRARY' in p:
            return 'AI governance reference library'
        return 'Master pack core artifacts'
    if 'SKILLS Claude' in p:
        return 'SKILL ecosystem'
    if 'RECURSOTRUE_unpacked' in p:
        if 'governance_runs' in p:
            return 'RECURSO governance run logs'
        if '/SCRIPTS/' in p:
            return 'RECURSO implementation scripts'
        if 'METAMETADATA' in p:
            return 'RECURSO metmetadata layer'
        return 'RECURSO archive root'
    return 'External downloads supplement'


def infer_entry_level(path: Path, doc_type: str, domain: str) -> str:
    n = path.name.lower()
    p = str(path).lower()
    if 'governance_runs' in p or doc_type in {'structured run data', 'experiment run artifact'}:
        return 'supporting run evidence'
    if 'martin_lepage_governance_tree.html' in n or 'skill_ecosystem_tree.html' in n:
        return 'major candidate'
    if n.startswith('skill_') or n == 'skill.md':
        return 'companion cluster member'
    if any(k in n for k in ['manuscript', 'constitution', 'mobius', 'alambic', 'sealedcard', 'violet gem', 'governance of generative ai']):
        return 'major candidate'
    if any(k in n for k in ['appendix', 'submission note', 'title page', 'coverletter', 'manifest']):
        return 'supporting submission artifact'
    if domain == 'post-experiment soft-control implementation':
        return 'major candidate'
    return 'supporting'


def infer_relationships(path: Path) -> list[str]:
    n = path.name.lower()
    p = str(path).lower()
    rel: list[str] = []
    if n.startswith('skill_') or n == 'skill.md':
        rel.append('skill-ecosystem')
        rel.append('hephaistos-skill-operating-system')
    if 'prompt engineering vs context engin' in n:
        rel.append('hephaistos-skill-operating-system')
    if 'governance_runs' in p:
        rel.append('recurso-governance-run-cluster')
    if 'from ai anxiety to recursive governance under constraint' in n:
        rel.append('recursive-governance-under-constraint')
    if any(k in n for k in ['mobius', 'alambic', 'sealedcard', 'violet gem']):
        rel.append('protocol-and-procedural-design')
    if 'pourquoi' in n:
        rel.append('soft-post-control-post-experiment-implementation')
    return rel


def selected_file(path: Path, root: Path) -> bool:
    if root.name == 'Downloads':
        return path.name in DOWNLOADS_TARGETS
    return True


def collect_files() -> Iterable[Path]:
    for root in ROOTS:
        if not root.exists() or not root.is_dir():
            continue
        for path in root.rglob('*'):
            if not path.is_file():
                continue
            if '__pycache__' in path.parts:
                continue
            if path.suffix.lower() not in INCLUDE_EXT:
                continue
            if not selected_file(path, root):
                continue
            yield path


def build_record(path: Path) -> Record:
    stat = path.stat()
    ext = path.suffix.lower()

    source_title = path.stem
    alt: list[str] = []
    if ext == '.docx':
        title, alt = read_docx_title(path)
        if title:
            source_title = title
    elif ext in {'.md', '.txt', '.html', '.json', '.py', '.cmd', '.litcoffee'}:
        title, alt = read_text_title(path)
        if title:
            source_title = title

    normalized = normalize_title(path.stem)
    doc_type = infer_doc_type(path)
    status = infer_status(path)
    domain = infer_domain(path)
    parent = infer_parent_group(path)
    entry_level = infer_entry_level(path, doc_type, domain)
    relationships = infer_relationships(path)

    rationale = (
        f"Classified as {doc_type} in {domain} based on filename/path cues "
        f"('{path.name}') and parent folder '{parent}'."
    )

    return Record(
        source_path=str(path),
        root=next((str(r) for r in ROOTS if str(path).startswith(str(r))), 'unknown'),
        extension=ext,
        size_bytes=stat.st_size,
        modified_utc=datetime.fromtimestamp(stat.st_mtime, UTC).isoformat(),
        source_title=source_title,
        alternate_titles=alt,
        normalized_title=normalized,
        slug=slugify(normalized),
        document_type=doc_type,
        status=status,
        thematic_domain=domain,
        likely_parent_group=parent,
        likely_chronology=datetime.fromtimestamp(stat.st_mtime, UTC).strftime('%Y-%m-%d'),
        entry_level=entry_level,
        relationships=relationships,
        rationale=rationale,
    )


def inferred_tree(records: list[Record]) -> list[dict]:
    buckets: dict[str, list[Record]] = defaultdict(list)
    for record in records:
        buckets[record.thematic_domain].append(record)

    def sorted_bucket_items() -> list[tuple[str, list[Record]]]:
        return sorted(buckets.items(), key=lambda item: (-len(item[1]), item[0]))

    tree = []
    for domain, items in sorted_bucket_items():
        parent_groups = Counter(item.likely_parent_group for item in items)
        tree.append(
            {
                'family': domain,
                'count': len(items),
                'dominant_parent_groups': [
                    {'group': group, 'count': count}
                    for group, count in parent_groups.most_common(3)
                ],
                'major_candidates': [
                    {
                        'normalized_title': item.normalized_title,
                        'source_path': item.source_path,
                        'entry_level': item.entry_level,
                    }
                    for item in items
                    if item.entry_level == 'major candidate'
                ][:6],
            }
        )
    return tree


def write_markdown(records: list[Record], tree: list[dict], scan_roots: list[str]) -> None:
    ext_counts = Counter(record.extension for record in records)
    level_counts = Counter(record.entry_level for record in records)

    majors = [record for record in records if record.entry_level == 'major candidate']
    majors_sorted = sorted(majors, key=lambda r: (r.thematic_domain, r.normalized_title.lower()))

    ambiguities = [
        record
        for record in records
        if 'final' in record.source_path.lower() and 'revise' in record.source_path.lower()
        or 'restart' in record.source_path.lower()
        or record.extension in {'.pdf', '.zip'}
    ]

    lines: list[str] = []
    lines.append('# External Corpus Inventory')
    lines.append('')
    lines.append(f'- Generated UTC: `{datetime.now(UTC).isoformat()}`')
    lines.append(f'- Total files classified: `{len(records)}`')
    lines.append('- Scan roots:')
    for root in scan_roots:
        lines.append(f'  - `{root}`')
    lines.append('')

    lines.append('## Summary')
    lines.append('')
    lines.append('### By extension')
    for ext, count in sorted(ext_counts.items(), key=lambda item: (-item[1], item[0])):
        lines.append(f'- `{ext}`: {count}')
    lines.append('')

    lines.append('### By entry level')
    for level, count in sorted(level_counts.items(), key=lambda item: (-item[1], item[0])):
        lines.append(f'- {level}: {count}')
    lines.append('')

    lines.append('## Inferred Tree (metadata-driven)')
    lines.append('')
    for node in tree:
        lines.append(f"### {node['family']} ({node['count']})")
        parent_bits = ', '.join(f"{p['group']} ({p['count']})" for p in node['dominant_parent_groups'])
        lines.append(f'- Dominant parent groups: {parent_bits}')
        if node['major_candidates']:
            lines.append('- Major candidates:')
            for major in node['major_candidates']:
                lines.append(f"  - {major['normalized_title']} (`{major['source_path']}`)")
        else:
            lines.append('- Major candidates: none inferred yet')
        lines.append('')

    lines.append('## Major Candidate Naming Map')
    lines.append('')
    lines.append('| Source title (in file) | Normalized professional title | Slug | Parent group | Source path |')
    lines.append('| --- | --- | --- | --- | --- |')
    for record in majors_sorted:
        lines.append(
            f"| {record.source_title[:80].replace('|', ' ')} | {record.normalized_title[:80].replace('|', ' ')} | `{record.slug}` | {record.likely_parent_group} | `{record.source_path}` |"
        )
    lines.append('')

    lines.append('## Ambiguities and Evidence Gaps')
    lines.append('')
    if ambiguities:
        for record in ambiguities[:30]:
            lines.append(f'- `{record.source_path}`: `{record.document_type}`; preserve as-is pending deeper content extraction.')
    else:
        lines.append('- No major ambiguities auto-detected in this pass.')

    OUTPUT_MD.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main() -> None:
    records: list[Record] = []
    for path in sorted(collect_files()):
        records.append(build_record(path))

    scan_roots = [str(root) for root in ROOTS if root.exists() and root.is_dir()]
    tree = inferred_tree(records)

    payload = {
        'generated_utc': datetime.now(UTC).isoformat(),
        'scan_roots': scan_roots,
        'count': len(records),
        'records': [asdict(record) for record in records],
        'inferred_tree': tree,
    }

    OUTPUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    write_markdown(records, tree, scan_roots)

    print(f'Wrote {OUTPUT_JSON}')
    print(f'Wrote {OUTPUT_MD}')
    print(f'Classified {len(records)} files')


if __name__ == '__main__':
    main()
