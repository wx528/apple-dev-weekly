import { mkdir, writeFile } from 'node:fs/promises';
import { PIPELINE_CONFIG } from './config.ts';
import { scanExistingSources } from './content.ts';
import { fetchFeed } from './rss.ts';
import { generateDraft } from './generate.ts';
import { callDeepSeek } from './llm.ts';
import type { GenerateDeps } from './generate.ts';

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`[pipeline] feeds: ${PIPELINE_CONFIG.feeds.map((f) => f.name).join(', ')}`);

  const existing = await scanExistingSources(PIPELINE_CONFIG.newsDir);
  console.log(`[pipeline] existing sources: ${existing.size}`);

  const cutoff = Date.now() - PIPELINE_CONFIG.maxAgeDays * 24 * 60 * 60 * 1000;
  const items = (await Promise.all(PIPELINE_CONFIG.feeds.map((f) => fetchFeed(f.url))))
    .flat()
    .filter((it) => it.link && !existing.has(it.link) && it.pubDate.getTime() >= cutoff)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, PIPELINE_CONFIG.maxItems);

  console.log(`[pipeline] candidates (${PIPELINE_CONFIG.maxAgeDays}d window): ${items.length}`);
  for (const it of items) {
    console.log(`  - [${it.pubDate.toISOString().slice(0, 10)}] ${it.title}`);
  }
  if (dryRun) {
    console.log('[pipeline] dry-run: skipping LLM stage');
    return;
  }

  const apiKey = process.env[PIPELINE_CONFIG.llm.apiKeyEnv];
  if (!apiKey) {
    console.error(`[pipeline] missing ${PIPELINE_CONFIG.llm.apiKeyEnv}; aborting`);
    process.exit(1);
  }

  await mkdir(PIPELINE_CONFIG.newsDir, { recursive: true });
  const deps: GenerateDeps = {
    callLLM: (system, user) =>
      callDeepSeek({
        system,
        user,
        apiKey,
        apiBase: PIPELINE_CONFIG.llm.apiBase,
        model: PIPELINE_CONFIG.llm.model,
        temperature: PIPELINE_CONFIG.llm.temperature,
      }),
    fetchPage: async (link) => {
      const res = await fetch(link, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; apple-dev-weekly-pipeline/1.0)' },
      });
      if (!res.ok) throw new Error(`fetch page ${res.status}`);
      return res.text();
    },
    writeFile: (path, content) => writeFile(path, content, 'utf8'),
  };

  const ok: string[] = [];
  const failed: string[] = [];
  for (const item of items) {
    try {
      const file = await generateDraft(item, PIPELINE_CONFIG, deps);
      ok.push(file);
      console.log(`[pipeline] draft written: ${file}`);
    } catch (err) {
      failed.push(item.title);
      console.error(`[pipeline] FAILED: ${item.title} — ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`[pipeline] done: ${ok.length} drafted, ${failed.length} failed`);
  if (items.length > 0 && ok.length === 0) process.exit(1);
}

main().catch((err) => {
  console.error(`[pipeline] fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
