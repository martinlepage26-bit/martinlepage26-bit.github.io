export function wordAndCharCount(text: string) {
  const t = (text || '').trim();
  const words = t ? t.split(/\s+/).length : 0;
  const chars = (text || '').length;
  const mins = Math.max(1, Math.round(words / 200));
  return { words, chars, mins };
}

export function formatClock(ms: number) {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const d = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${d}`;
}

export function truncateMiddle(s: string, max = 34) {
  if (!s || s.length <= max) return s;
  const half = Math.floor((max - 1) / 2);
  return `${s.slice(0, half)}…${s.slice(-half)}`;
}
