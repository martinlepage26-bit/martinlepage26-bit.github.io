import { useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, DragEvent } from 'react';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

type Mode = 'files' | 'text';

type LoadedFile = {
  name: string;
  text: string | null;
  error?: string;
  status?: string;
};

type DiffEntry = {
  type: 'added' | 'removed' | 'equal';
  line: string;
  oldNum?: number;
  newNum?: number;
  _paired?: boolean;
  pairedAdded?: DiffEntry;
};

type VisibleRow = DiffEntry | { type: 'separator' };

type TokenPart = {
  text: string;
  type: 'same' | 'diff';
};

type ThemeVars = CSSProperties & Record<string, string>;

const COLORS = {
  added: { bg: '#eaf3de', text: '#3b6d11', border: '#97c459' },
  removed: { bg: '#fcebeb', text: '#a32d2d', border: '#f09595' },
  changed: { bg: '#faeeda', text: '#854f0b', border: '#ef9f27' },
};

const ROOT_VARS: ThemeVars = {
  '--color-background-primary': '#fcfaf5',
  '--color-background-secondary': '#f1ebdf',
  '--color-background-tertiary': '#e5dccd',
  '--color-border-primary': '#5d503f',
  '--color-border-secondary': 'rgba(93, 80, 63, 0.34)',
  '--color-border-tertiary': 'rgba(93, 80, 63, 0.16)',
  '--color-text-primary': '#17130f',
  '--color-text-secondary': '#4d4134',
  '--color-text-tertiary': '#7f705f',
  '--border-radius-md': '4px',
  '--border-radius-lg': '10px',
  '--font-mono': '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
};

function normalizeText(raw: string) {
  return String(raw || '')
    .replace(/\u0000/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extensionFromFilename(filename: string) {
  const lowered = String(filename || '').trim().toLowerCase();
  const dotIndex = lowered.lastIndexOf('.');
  return dotIndex >= 0 ? lowered.slice(dotIndex + 1) : '';
}

function tokenize(text: string) {
  return text.split(/(\s+)/);
}

function lcs(a: string[], b: string[]) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const sequence: string[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      sequence.unshift(a[i - 1]);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  return sequence;
}

function diffLines(oldText: string, newText: string) {
  const oldLines = normalizeText(oldText).split('\n');
  const newLines = normalizeText(newText).split('\n');
  const result: DiffEntry[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      result.push({ type: 'added', line: newLines[newIndex], newNum: newIndex + 1 });
      newIndex += 1;
      continue;
    }

    if (newIndex >= newLines.length) {
      result.push({ type: 'removed', line: oldLines[oldIndex], oldNum: oldIndex + 1 });
      oldIndex += 1;
      continue;
    }

    if (oldLines[oldIndex] === newLines[newIndex]) {
      result.push({
        type: 'equal',
        line: oldLines[oldIndex],
        oldNum: oldIndex + 1,
        newNum: newIndex + 1,
      });
      oldIndex += 1;
      newIndex += 1;
      continue;
    }

    const lookahead = 6;
    let matched = false;

    for (let step = 1; step <= lookahead && !matched; step += 1) {
      if (newIndex + step < newLines.length && oldLines[oldIndex] === newLines[newIndex + step]) {
        for (let inner = 0; inner < step; inner += 1) {
          result.push({ type: 'added', line: newLines[newIndex + inner], newNum: newIndex + inner + 1 });
        }
        newIndex += step;
        matched = true;
      } else if (oldIndex + step < oldLines.length && newLines[newIndex] === oldLines[oldIndex + step]) {
        for (let inner = 0; inner < step; inner += 1) {
          result.push({ type: 'removed', line: oldLines[oldIndex + inner], oldNum: oldIndex + inner + 1 });
        }
        oldIndex += step;
        matched = true;
      }
    }

    if (!matched) {
      result.push({ type: 'removed', line: oldLines[oldIndex], oldNum: oldIndex + 1 });
      result.push({ type: 'added', line: newLines[newIndex], newNum: newIndex + 1 });
      oldIndex += 1;
      newIndex += 1;
    }
  }

  return result;
}

function inlineDiff(oldLine: string, newLine: string) {
  const oldTokens = tokenize(oldLine);
  const newTokens = tokenize(newLine);
  const commonTokens = lcs(oldTokens, newTokens);
  const oldOut: TokenPart[] = [];
  const newOut: TokenPart[] = [];

  let oldIndex = 0;
  let newIndex = 0;
  let commonIndex = 0;

  while (oldIndex < oldTokens.length || newIndex < newTokens.length) {
    if (
      commonIndex < commonTokens.length &&
      oldIndex < oldTokens.length &&
      newIndex < newTokens.length &&
      oldTokens[oldIndex] === commonTokens[commonIndex] &&
      newTokens[newIndex] === commonTokens[commonIndex]
    ) {
      oldOut.push({ text: oldTokens[oldIndex], type: 'same' });
      newOut.push({ text: newTokens[newIndex], type: 'same' });
      oldIndex += 1;
      newIndex += 1;
      commonIndex += 1;
      continue;
    }

    const removedTokens: string[] = [];
    while (
      oldIndex < oldTokens.length &&
      (commonIndex >= commonTokens.length || oldTokens[oldIndex] !== commonTokens[commonIndex])
    ) {
      removedTokens.push(oldTokens[oldIndex]);
      oldIndex += 1;
    }

    const addedTokens: string[] = [];
    while (
      newIndex < newTokens.length &&
      (commonIndex >= commonTokens.length || newTokens[newIndex] !== commonTokens[commonIndex])
    ) {
      addedTokens.push(newTokens[newIndex]);
      newIndex += 1;
    }

    if (removedTokens.length) {
      oldOut.push({ text: removedTokens.join(''), type: 'diff' });
    }

    if (addedTokens.length) {
      newOut.push({ text: addedTokens.join(''), type: 'diff' });
    }
  }

  return { oldOut, newOut };
}

async function extractDocxText(file: File) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeText(result.value);
}

async function extractPdfText(file: File, onStatus?: (status: string) => void) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  }

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const documentProxy = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
    const page = await documentProxy.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pages.push(pageText);
    }

    if (onStatus) {
      onStatus(`Extracting PDF text (${pageNumber}/${documentProxy.numPages})`);
    }
  }

  return normalizeText(pages.join('\n\n'));
}

async function extractFileText(file: File, onStatus?: (status: string) => void) {
  const extension = extensionFromFilename(file.name);

  if (extension === 'txt' || extension === 'md' || extension === 'markdown') {
    onStatus?.('Reading text file');
    return normalizeText(await file.text());
  }

  if (extension === 'docx') {
    onStatus?.('Extracting DOCX text');
    return extractDocxText(file);
  }

  if (extension === 'pdf') {
    onStatus?.('Preparing PDF extraction');
    return extractPdfText(file, onStatus);
  }

  throw new Error('Unsupported file type. Use .txt, .md, .docx, or .pdf.');
}

function FileDropZone({
  label,
  file,
  onFile,
}: {
  label: string;
  file: LoadedFile | null;
  onFile: (file: LoadedFile) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(nextFile?: File) {
    if (!nextFile) {
      return;
    }

    onFile({ name: nextFile.name, text: null, status: 'Loading file' });

    try {
      const text = await extractFileText(nextFile, (status) => {
        onFile({ name: nextFile.name, text: null, status });
      });
      onFile({ name: nextFile.name, text });
    } catch (error) {
      onFile({
        name: nextFile.name,
        text: null,
        error: error instanceof Error ? error.message : 'Failed to read file.',
      });
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      style={{
        border: `1px solid ${dragActive ? 'var(--color-border-primary)' : 'var(--color-border-secondary)'}`,
        borderRadius: 'var(--border-radius-md)',
        padding: '1.3rem',
        cursor: 'pointer',
        background: dragActive ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
        textAlign: 'center',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.markdown,.docx,.pdf"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-border-secondary)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          letterSpacing: '0.14em',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-mono)',
          background: 'rgba(255,255,255,0.62)',
        }}
      >
        FILE
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
      {file ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{file.name}</div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          Drop a file or click to choose one. Supports .txt, .md, .docx, .pdf.
        </div>
      )}
      {file?.status ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{file.status}</div>
      ) : null}
      {file?.error ? (
        <div style={{ fontSize: 12, color: COLORS.removed.text, marginTop: 4 }}>{file.error}</div>
      ) : null}
    </div>
  );
}

function InlineSpan({ token }: { token: TokenPart }) {
  if (token.type === 'same') {
    return <span>{token.text}</span>;
  }

  return (
    <span
      style={{
        background: COLORS.changed.bg,
        color: COLORS.changed.text,
        borderRadius: 3,
        padding: '0 1px',
      }}
    >
      {token.text}
    </span>
  );
}

function DiffRow({ row, pairedAdded }: { row: DiffEntry; pairedAdded?: DiffEntry }) {
  const isModified = row.type === 'removed' && pairedAdded;
  const { oldOut, newOut } = isModified ? inlineDiff(row.line, pairedAdded.line) : { oldOut: [], newOut: [] };

  const numberCellStyle: CSSProperties = {
    padding: '4px 6px',
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    textAlign: 'right',
    userSelect: 'none',
    fontFamily: 'var(--font-mono)',
    minWidth: 38,
    verticalAlign: 'top',
    background: 'var(--color-background-tertiary)',
  };

  const lineCell = (type: 'added' | 'removed' | 'equal'): CSSProperties => ({
    padding: '4px 10px 4px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    verticalAlign: 'top',
    background:
      type === 'added' ? COLORS.added.bg : type === 'removed' ? COLORS.removed.bg : 'rgba(255, 255, 255, 0.28)',
    color:
      type === 'added'
        ? COLORS.added.text
        : type === 'removed'
          ? COLORS.removed.text
          : 'var(--color-text-primary)',
    borderLeft:
      type === 'added'
        ? `3px solid ${COLORS.added.border}`
        : type === 'removed'
          ? `3px solid ${COLORS.removed.border}`
          : '3px solid transparent',
  });

  if (row.type === 'equal') {
    return (
      <tr>
        <td style={numberCellStyle}>{row.oldNum}</td>
        <td style={lineCell('equal')}>{row.line || ' '}</td>
        <td style={numberCellStyle}>{row.newNum}</td>
        <td style={lineCell('equal')}>{row.line || ' '}</td>
      </tr>
    );
  }

  if (row.type === 'removed') {
    return (
      <tr>
        <td style={numberCellStyle}>{row.oldNum}</td>
        <td style={lineCell('removed')}>
          {isModified ? oldOut.map((token, index) => <InlineSpan key={index} token={token} />) : row.line || ' '}
        </td>
        <td style={numberCellStyle}>{pairedAdded ? pairedAdded.newNum : ''}</td>
        <td style={lineCell(pairedAdded ? 'added' : 'equal')}>
          {isModified ? newOut.map((token, index) => <InlineSpan key={index} token={token} />) : pairedAdded?.line || ''}
        </td>
      </tr>
    );
  }

  if (row.type === 'added' && !row._paired) {
    return (
      <tr>
        <td style={numberCellStyle}></td>
        <td style={lineCell('equal')}></td>
        <td style={numberCellStyle}>{row.newNum}</td>
        <td style={lineCell('added')}>{row.line || ' '}</td>
      </tr>
    );
  }

  return null;
}

function Stats({ diff }: { diff: DiffEntry[] }) {
  const added = diff.filter((entry) => entry.type === 'added').length;
  const removed = diff.filter((entry) => entry.type === 'removed').length;
  const equal = diff.filter((entry) => entry.type === 'equal').length;
  const total = added + removed + equal;
  const changedPercent = total > 0 ? Math.round(((added + removed) / total) * 100) : 0;

  function pill(label: string, count: number, color: keyof typeof COLORS) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: COLORS[color].bg,
          color: COLORS[color].text,
          border: `0.5px solid ${COLORS[color].border}`,
          borderRadius: 'var(--border-radius-md)',
          padding: '4px 9px',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label} <strong>{count}</strong>
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
      {pill('+ added', added, 'added')}
      {pill('- removed', removed, 'removed')}
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
        {equal} unchanged · {changedPercent}% changed
      </span>
    </div>
  );
}

export default function PaperDiffApp() {
  const [fileA, setFileA] = useState<LoadedFile | null>(null);
  const [fileB, setFileB] = useState<LoadedFile | null>(null);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [mode, setMode] = useState<Mode>('files');
  const [diff, setDiff] = useState<DiffEntry[] | null>(null);
  const [context, setContext] = useState(3);

  function computeDiff() {
    const originalText = mode === 'files' ? fileA?.text || '' : textA;
    const revisedText = mode === 'files' ? fileB?.text || '' : textB;
    setDiff(diffLines(originalText, revisedText));
  }

  const processedDiff = diff
    ? (() => {
        const rows: DiffEntry[] = [];
        let index = 0;

        while (index < diff.length) {
          if (diff[index].type === 'removed' && index + 1 < diff.length && diff[index + 1].type === 'added') {
            rows.push({ ...diff[index], _paired: true, pairedAdded: diff[index + 1] });
            rows.push({ ...diff[index + 1], _paired: true });
            index += 2;
            continue;
          }

          rows.push(diff[index]);
          index += 1;
        }

        return rows;
      })()
    : [];

  const visibleRows: VisibleRow[] = (() => {
    if (!processedDiff.length) {
      return [];
    }

    const changedIndexes = new Set<number>();
    processedDiff.forEach((row, index) => {
      if (row.type !== 'equal') {
        changedIndexes.add(index);
      }
    });

    const visibleIndexes = new Set<number>();
    changedIndexes.forEach((changedIndex) => {
      for (
        let index = Math.max(0, changedIndex - context);
        index <= Math.min(processedDiff.length - 1, changedIndex + context);
        index += 1
      ) {
        visibleIndexes.add(index);
      }
    });

    const rows: VisibleRow[] = [];
    let previousIndex = -1;
    [...visibleIndexes]
      .sort((left, right) => left - right)
      .forEach((index) => {
        if (previousIndex !== -1 && index > previousIndex + 1) {
          rows.push({ type: 'separator' });
        }
        rows.push(processedDiff[index]);
        previousIndex = index;
      });

    return rows;
  })();

  const canCompare =
    mode === 'files'
      ? Boolean(fileA && fileB && fileA.text !== null && fileB.text !== null && !fileA.status && !fileB.status)
      : textA.length > 0 || textB.length > 0;

  return (
    <div
      style={{
        ...ROOT_VARS,
        padding: '1.35rem',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid rgba(79, 58, 36, 0.2)',
        background:
          'repeating-linear-gradient(180deg, rgba(93, 80, 63, 0.028) 0 1px, transparent 1px 34px), linear-gradient(180deg, rgba(252, 249, 243, 0.99), rgba(246, 239, 229, 0.98))',
        boxShadow: '0 18px 42px rgba(11, 10, 8, 0.09)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.85rem',
          marginBottom: '1rem',
          paddingBottom: '0.9rem',
          borderBottom: '1px solid var(--color-border-tertiary)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 6,
            }}
          >
            Draft desk
          </div>
          <div
            style={{
              margin: 0,
              fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
              lineHeight: 1.25,
              color: 'var(--color-text-primary)',
              fontFamily: '"Newsreader", Georgia, serif',
              fontWeight: 500,
            }}
          >
            Source and revision.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            Upload or paste two versions, then compare them in place.
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Local browser compare
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'inline-flex',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
          marginBottom: '1rem',
          background: 'rgba(255,255,255,0.35)',
        }}
      >
        {(['files', 'text'] as Mode[]).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => {
              setMode(nextMode);
              setDiff(null);
            }}
            style={{
              padding: '0.6rem 0.95rem',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: mode === nextMode ? 'var(--color-background-secondary)' : 'transparent',
              border: 'none',
              borderRight: nextMode === 'files' ? '1px solid var(--color-border-secondary)' : 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            {nextMode === 'files' ? 'Upload files' : 'Paste text'}
          </button>
        ))}
      </div>

      {mode === 'files' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <FileDropZone label="Document A (original)" file={fileA} onFile={setFileA} />
          <FileDropZone label="Document B (revised)" file={fileB} onFile={setFileB} />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {[
            ['A - original', textA, setTextA],
            ['B - revised', textB, setTextB],
          ].map(([label, value, setValue]) => (
            <div
              key={label}
              style={{
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)',
                background: 'rgba(255,255,255,0.42)',
                padding: '0.8rem',
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  display: 'block',
                  marginBottom: 8,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {label}
              </label>
              <textarea
                value={value as string}
                onChange={(event) => (setValue as (nextValue: string) => void)(event.target.value)}
                style={{
                  width: '100%',
                  minHeight: 220,
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical',
                  background: '#fffdfa',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: 12,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={computeDiff}
          disabled={!canCompare}
          style={{
            padding: '0.75rem 1rem',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: canCompare ? 'pointer' : 'not-allowed',
            opacity: canCompare ? 1 : 0.45,
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          Compare drafts
        </button>

        {diff ? (
          <label
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Context lines
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={context}
              onChange={(event) => setContext(Number(event.target.value))}
              style={{ width: 80 }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{context}</span>
          </label>
        ) : null}
      </div>

      {diff ? (
        <>
          <Stats diff={diff} />
          <div
            style={{
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.42)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto 1fr',
                background: 'var(--color-background-tertiary)',
                borderBottom: '1px solid var(--color-border-tertiary)',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  gridColumn: '1 / 3',
                }}
              >
                {mode === 'files' && fileA ? fileA.name : 'Document A'}
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  gridColumn: '3 / 5',
                  borderLeft: '1px solid var(--color-border-tertiary)',
                }}
              >
                {mode === 'files' && fileB ? fileB.name : 'Document B'}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: '50%' }} />
                  <col style={{ width: 40 }} />
                  <col style={{ width: '50%' }} />
                </colgroup>
                <tbody>
                  {visibleRows.map((row, index) => {
                    if (row.type === 'separator') {
                      return (
                        <tr key={`separator-${index}`}>
                          <td
                            colSpan={4}
                            style={{
                              background: 'var(--color-background-secondary)',
                              color: 'var(--color-text-tertiary)',
                              fontSize: 11,
                              padding: '4px 8px',
                              fontFamily: 'var(--font-mono)',
                              borderTop: '1px solid var(--color-border-tertiary)',
                              borderBottom: '1px solid var(--color-border-tertiary)',
                            }}
                          >
                            ...
                          </td>
                        </tr>
                      );
                    }

                    if (row._paired && row.type === 'added') {
                      return null;
                    }

                    return <DiffRow key={index} row={row} pairedAdded={row.pairedAdded} />;
                  })}

                  {visibleRows.length === 0 && diff.length > 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: '2rem',
                          textAlign: 'center',
                          fontSize: 13,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        No differences found. The documents are identical.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
