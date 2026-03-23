export function estimateReadingMinutes(input: string) {
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(input: Date | string) {
  const value = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

export function sortByYear<T extends { data: { year?: number } }>(items: T[]) {
  return [...items].sort((a, b) => (b.data.year ?? -1) - (a.data.year ?? -1));
}

export function isPublishedStatus(status: string) {
  return /\bpublished\b/i.test(status);
}

export function isPublishedPaper<T extends { data: { status: string } }>(item: T) {
  return isPublishedStatus(item.data.status);
}

export function sortByDate<T extends { data: { date: Date } }>(items: T[]) {
  return [...items].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function collectTags<T extends { data: { tags: string[] } }>(items: T[]) {
  return [...new Set(items.flatMap((item) => item.data.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function clampText(text: string, maxLength = 220) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function joinDistinctText(parts: Array<string | number | undefined | null>) {
  return parts
    .map((part) => (typeof part === 'number' ? String(part) : part?.trim()))
    .filter((part): part is string => Boolean(part))
    .filter((part, index, values) => values.indexOf(part) === index)
    .join(' · ');
}

export function orderEntriesBySlug<T extends { id: string }>(items: T[], order: readonly string[]) {
  const bySlug = new Map(items.map((item) => [contentSlug(item.id), item]));
  return order
    .map((slug) => bySlug.get(slug))
    .filter((item): item is T => Boolean(item));
}

export function prioritizeEntriesBySlug<T extends { id: string }>(items: T[], order: readonly string[]) {
  const ordered = orderEntriesBySlug(items, order);
  const orderedSlugs = new Set(order.map((slug) => slug.toLowerCase()));
  const remainder = items.filter((item) => !orderedSlugs.has(contentSlug(item.id).toLowerCase()));
  return [...ordered, ...remainder];
}

export function sortByTitle<T extends { data: { title: string } }>(items: T[]) {
  return [...items].sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export function contentSlug(id: string) {
  return id.replace(/\.(md|mdx)$/i, '');
}

const titleOverrides: Record<string, string> = {
  'govern-ai': 'Govern-AI Practice Environment',
};

export function normalizeTitle(sourceTitle: string) {
  if (titleOverrides[sourceTitle]) {
    return titleOverrides[sourceTitle];
  }

  if (sourceTitle.toUpperCase() === sourceTitle) {
    return sourceTitle
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  return sourceTitle;
}
