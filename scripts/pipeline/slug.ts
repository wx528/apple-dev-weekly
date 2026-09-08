export function slugify(title: string, date: Date): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  const d = date.toISOString().slice(0, 10);
  return `${d}-${ascii || 'untitled'}`;
}
