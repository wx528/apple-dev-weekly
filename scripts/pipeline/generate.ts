import { join } from 'node:path';
import { PIPELINE_CONFIG } from './config.ts';
import { htmlToText } from './html.ts';
import { filterTags } from './tags.ts';
import { slugify } from './slug.ts';
import { renderDraftMarkdown } from './content.ts';
import { buildSystemPrompt, buildUserPrompt } from './prompts.ts';
import type { LLMResult } from './llm.ts';

export interface FeedItem {
  title: string;
  link: string;
  pubDate: Date;
  fallbackText: string;
}

export interface GenerateDeps {
  callLLM: (system: string, user: string) => Promise<LLMResult>;
  fetchPage: (link: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
}

export async function generateDraft(
  item: FeedItem,
  config: typeof PIPELINE_CONFIG,
  deps: GenerateDeps,
): Promise<string> {
  let text: string;
  try {
    text = htmlToText(await deps.fetchPage(item.link));
  } catch {
    text = htmlToText(item.fallbackText);
  }
  text = text.slice(0, config.llm.maxChars);

  const system = buildSystemPrompt([...config.tagWhitelist]);
  const user = buildUserPrompt({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate.toISOString().slice(0, 10),
    text,
  });
  const result = await deps.callLLM(system, user);

  const tags = filterTags(result.tags, [...config.tagWhitelist], config.defaultTag);
  const markdown = renderDraftMarkdown({
    title: result.title,
    description: result.description,
    pubDate: item.pubDate,
    tags,
    source: item.link,
    body: result.body,
  });
  const file = `${slugify(item.title, item.pubDate)}.md`;
  await deps.writeFile(join(config.newsDir, file).replace(/\\/g, '/'), markdown);
  return file;
}
