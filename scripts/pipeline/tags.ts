export function filterTags(tags: string[], whitelist: string[], defaultTag: string): string[] {
  const filtered = [...new Set(tags.map((t) => t.trim()).filter((t) => whitelist.includes(t)))];
  if (filtered.length === 0) return [defaultTag];
  return filtered.slice(0, 3);
}
