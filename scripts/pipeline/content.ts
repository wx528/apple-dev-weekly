import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function scanExistingSources(newsDir: string): Promise<Set<string>> {
  const sources = new Set<string>();
  let files: string[] = [];
  try {
    files = await readdir(newsDir);
  } catch {
    return sources;
  }
  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const raw = await readFile(join(newsDir, file), 'utf8');
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    const match = frontmatter.match(/^source:\s*(.+)$/m);
    if (match) sources.add(match[1].trim().replace(/^['"]|['"]$/g, ''));
  }
  return sources;
}

export interface DraftData {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  source: string;
  body: string;
}

export function renderDraftMarkdown(data: DraftData): string {
  const date = data.pubDate.toISOString().slice(0, 10);
  return `---
title: ${JSON.stringify(data.title)}
description: ${JSON.stringify(data.description)}
pubDate: ${date}
tags: [${data.tags.join(', ')}]
source: ${data.source}
draft: true
---

${data.body.trim()}
`;
}
