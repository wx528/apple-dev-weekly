# AI 内容管线（Plan 2）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现「Apple 开发者周刊」的 AI 资讯管线：每日自动抓取 Apple 官方 RSS → DeepSeek 翻译/摘要生成中文草稿（draft: true）→ GitHub Actions 开 PR → 人工审核发布。

**Architecture:** Node/TypeScript 脚本位于 `scripts/pipeline/`，与 Astro 站点同仓。纯函数（slug/HTML 清洗/标签过滤/渲染）单测覆盖；LLM 与网络全部依赖注入可 mock。调度走 GitHub Actions cron + `gh pr create`，草稿永远带 `draft: true`，发布权在人。

**Tech Stack:** TypeScript + tsx、rss-parser、zod、DeepSeek Chat API（OpenAI 兼容端点）、Node 内置 test runner、GitHub Actions。

## Global Constraints

- 仓库：`C:\Users\Scott\Work\Market\apple-app-dev`，分支 `main`（已完成 M0 并推送）。Plan 2 在新分支 `feat/content-pipeline` 上开发
- LLM：DeepSeek `deepseek-chat`，API key 只从环境变量 `DEEPSEEK_API_KEY` 读取（本地 `.env` 不提交；CI 用 GitHub Secrets）。**任何代码/日志/提交中不得出现 key 明文**
- 生成的草稿必须满足站点 schema：`title`、`description`、`pubDate`（YYYY-MM-DD）、`tags`（白名单内、无空格）、`source`（RSS item link，必填）、`draft: true`
- 标签白名单固定（见 config.ts）；slug 仅 ASCII
- 去重依据：已存在内容（含草稿）的 `source` URL；管线幂等，重跑不重复生成
- 单次运行上限 `maxItems: 5`，时间窗 `maxAgeDays: 14`（防旧闻刷屏）
- 管线永不自动发布：草稿 `draft: true` 由人工改 `false` 后合并才上线
- 测试命令：`npm run test:pipeline`（Node 内置 test runner + tsx），纯逻辑全覆盖；网络/LLM 部分用注入的 fake 测试
- PowerShell 执行；`npm install` 网络失败时回退 `npm config set registry https://registry.npmmirror.com`

**与 spec 的偏差（已裁决）：** v1 信源仅 `developer.apple.com/news/rss/news.rss`（已验证 200/420KB）；Apple Newsroom RSS 连接失败、开发者更新页与 WWDC 列表是 HTML 抓取——三者均列入 v2，config 的 feeds 数组已为扩展预留。

---

### Task 1: 管线依赖 + 纯工具函数（slug / html / tags）+ TDD

**Files:**
- Modify: `package.json`（scripts + 依赖）
- Create: `scripts/pipeline/config.ts`
- Create: `scripts/pipeline/slug.ts` + `scripts/pipeline/slug.test.ts`
- Create: `scripts/pipeline/html.ts` + `scripts/pipeline/html.test.ts`
- Create: `scripts/pipeline/tags.ts` + `scripts/pipeline/tags.test.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `PIPELINE_CONFIG`（config.ts，后续任务消费）：`{ feeds: {name,url}[]; maxItems: 5; maxAgeDays: 14; llm: { apiBase: 'https://api.deepseek.com'; model: 'deepseek-chat'; apiKeyEnv: 'DEEPSEEK_API_KEY'; temperature: 0.3; maxChars: 12000 }; tagWhitelist: string[]; newsDir: 'src/content/news'; defaultTag: '生态' }`
  - `slugify(title: string, date: Date): string`
  - `htmlToText(html: string): string`
  - `filterTags(tags: string[], whitelist: string[], defaultTag: string): string[]`

- [ ] **Step 1: 安装依赖**

```powershell
npm install rss-parser zod
npm install -D tsx
```
Expected: 安装成功，`package.json` 与 `package-lock.json` 更新

- [ ] **Step 2: package.json 增加脚本**

在 `scripts` 中加入（保留既有项）：

```json
"pipeline:draft": "tsx scripts/pipeline/index.ts",
"test:pipeline": "node --import tsx --test scripts/pipeline/slug.test.ts scripts/pipeline/html.test.ts scripts/pipeline/tags.test.ts scripts/pipeline/content.test.ts scripts/pipeline/generate.test.ts"
```

- [ ] **Step 3: 创建 scripts/pipeline/config.ts**

```ts
export const PIPELINE_CONFIG = {
  feeds: [
    { name: 'apple-devnews', url: 'https://developer.apple.com/news/rss/news.rss' },
  ],
  maxItems: 5,
  maxAgeDays: 14,
  llm: {
    apiBase: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    temperature: 0.3,
    maxChars: 12000,
  },
  tagWhitelist: [
    '政策', '中国区', '欧盟', '审核', 'macOS', '工具链', 'Xcode', 'iOS',
    'visionOS', 'watchOS', 'Swift', 'SwiftUI', '发布会', 'WWDC', '变现', '生态',
  ],
  newsDir: 'src/content/news',
  defaultTag: '生态',
} as const;
```

- [ ] **Step 4: 写 slug 失败测试（scripts/pipeline/slug.test.ts）**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.ts';

test('slugify 生成日期前缀的 ASCII slug', () => {
  const d = new Date('2026-09-01T00:00:00Z');
  assert.equal(
    slugify('Upcoming changes to Rosetta support for Intel-based macOS apps', d),
    '2026-09-01-upcoming-changes-to-rosetta-support-for-intel-based-macos-apps',
  );
});

test('slugify 折叠多余连字符并截断到 60 字符', () => {
  const d = new Date('2026-09-01T00:00:00Z');
  const out = slugify('Tax  and   price updates!!! (for apps)', d);
  assert.equal(out, '2026-09-01-tax-and-price-updates-for-apps');
  assert.ok(out.length <= 71); // 11 字符日期 + 连字符 + ≤60
});

test('slugify 非英文标题回退 untitled', () => {
  const d = new Date('2026-09-01T00:00:00Z');
  assert.equal(slugify('全部是中文！！', d), '2026-09-01-untitled');
});
```

- [ ] **Step 5: 运行测试确认失败**

Run: `npm run test:pipeline`
Expected: FAIL（`Cannot find module './slug.ts'`）

- [ ] **Step 6: 实现 scripts/pipeline/slug.ts**

```ts
export function slugify(title: string, date: Date): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  const d = date.toISOString().slice(0, 10);
  return `${d}-${ascii || 'untitled'}`;
}
```

- [ ] **Step 7: 运行测试确认通过**

Run: `npm run test:pipeline`
Expected: 3 passing（html/tags/content/generate 的测试文件尚不存在会导致 runner 报找不到文件——先把 Step 2 的 test:pipeline 暂时只列 slug.test.ts，或在后续步骤创建其余空测试文件。**推荐做法**：本任务先创建全部 5 个测试文件的空壳（仅 `import { test } from 'node:test';`），每个任务填充自己的文件）

- [ ] **Step 8: 写 html 失败测试（html.test.ts）**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToText } from './html.ts';

test('htmlToText 去除 script/style 与标签、解码实体、保留段落', () => {
  const html = `<html><head><style>body{color:red}</style><script>var x=1;</script></head>
<body><h1>Title</h1><p>First &amp; paragraph.</p><p>Second&nbsp;line.</p><br/></body></html>`;
  const text = htmlToText(html);
  assert.ok(!text.includes('color:red'));
  assert.ok(!text.includes('var x=1'));
  assert.ok(!text.includes('<'));
  assert.ok(text.includes('First & paragraph.'));
  assert.ok(text.includes('Second line.'));
  assert.ok(text.indexOf('Title') < text.indexOf('First'));
});
```

- [ ] **Step 9: 实现 html.ts**

```ts
const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
};

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
```

- [ ] **Step 10: 写 tags 失败测试（tags.test.ts）**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTags } from './tags.ts';

test('filterTags 只保留白名单标签并去重', () => {
  const wl = ['政策', '欧盟', 'macOS'];
  assert.deepEqual(filterTags(['政策', '欧盟', '随便编的', '政策'], wl, '生态'), ['政策', '欧盟']);
});

test('filterTags 截断到 3 个，空则回退默认', () => {
  const wl = ['政策', '欧盟', '审核', 'macOS'];
  assert.deepEqual(filterTags(['政策', '欧盟', '审核', 'macOS'], wl, '生态'), ['政策', '欧盟', '审核']);
  assert.deepEqual(filterTags(['不存在'], wl, '生态'), ['生态']);
});
```

- [ ] **Step 11: 实现 tags.ts**

```ts
export function filterTags(tags: string[], whitelist: string[], defaultTag: string): string[] {
  const filtered = [...new Set(tags.map((t) => t.trim()).filter((t) => whitelist.includes(t)))];
  if (filtered.length === 0) return [defaultTag];
  return filtered.slice(0, 3);
}
```

- [ ] **Step 12: 全部通过**

Run: `npm run test:pipeline`
Expected: 全部 passing（空壳文件 0 tests 也算通过）

- [ ] **Step 13: Commit**

```powershell
git add package.json package-lock.json scripts/pipeline
git commit -m "feat(pipeline): add config and pure utils with tests"
```

---

### Task 2: 内容扫描与草稿渲染（content.ts）+ TDD

**Files:**
- Create: `scripts/pipeline/content.ts` + `scripts/pipeline/content.test.ts`（填充空壳）

**Interfaces:**
- Consumes: 无新依赖
- Produces:
  - `scanExistingSources(newsDir: string): Promise<Set<string>>` — 读取目录下所有 .md 的 frontmatter `source` 字段（目录不存在返回空 Set）
  - `DraftData { title: string; description: string; pubDate: Date; tags: string[]; source: string; body: string }`
  - `renderDraftMarkdown(data: DraftData): string` — Task 3/4 消费

- [ ] **Step 1: 写失败测试（content.test.ts）**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanExistingSources, renderDraftMarkdown } from './content.ts';

test('scanExistingSources 提取 frontmatter 的 source 并忽略正文干扰', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pipeline-'));
  await writeFile(join(dir, 'a.md'), `---
title: "A"
source: https://example.com/a
draft: true
---
正文里也有 source: https://fake.example.com 不应被提取
`);
  await writeFile(join(dir, 'b.md'), `---
title: "B"
source: "https://example.com/b"
---
`);
  await writeFile(join(dir, 'ignore.txt'), `source: https://example.com/c`);
  const sources = await scanExistingSources(dir);
  assert.deepEqual([...sources].sort(), ['https://example.com/a', 'https://example.com/b']);
  await rm(dir, { recursive: true, force: true });
});

test('scanExistingSources 目录不存在返回空集合', async () => {
  const sources = await scanExistingSources(join(tmpdir(), 'no-such-dir-xyz'));
  assert.equal(sources.size, 0);
});

test('renderDraftMarkdown 输出满足站点 schema 的 frontmatter', () => {
  const md = renderDraftMarkdown({
    title: '测试 "标题"',
    description: '一句话摘要',
    pubDate: new Date('2026-09-01T00:00:00Z'),
    tags: ['政策', '欧盟'],
    source: 'https://example.com/x',
    body: '正文段落。',
  });
  assert.ok(md.startsWith('---\n'));
  assert.ok(md.includes('title: "测试 \\"标题\\""'));
  assert.ok(md.includes('pubDate: 2026-09-01'));
  assert.ok(md.includes('tags: [政策, 欧盟]'));
  assert.ok(md.includes('source: https://example.com/x'));
  assert.ok(md.includes('draft: true'));
  assert.ok(md.endsWith('正文段落。\n'));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:pipeline`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 content.ts**

```ts
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
```

- [ ] **Step 4: 运行确认通过**

Run: `npm run test:pipeline`
Expected: 全部 passing（含 Task 1 的测试）

- [ ] **Step 5: 验证与真实站点内容兼容**

Run: `node --import tsx -e "import('./scripts/pipeline/content.ts').then(async (m) => { const s = await m.scanExistingSources('src/content/news'); console.log([...s]); })"`
Expected: 输出 4 个真实 source URL（dadukodv / tlur8uvi / gmws0jgp / w5ngl9k2）

- [ ] **Step 6: Commit**

```powershell
git add scripts/pipeline
git commit -m "feat(pipeline): add source scanning and draft markdown rendering"
```

---

### Task 3: LLM 调用 + Prompt + 单条生成编排（llm / prompts / generate）

**Files:**
- Create: `scripts/pipeline/prompts.ts`
- Create: `scripts/pipeline/llm.ts`
- Create: `scripts/pipeline/generate.ts` + `scripts/pipeline/generate.test.ts`（填充空壳）

**Interfaces:**
- Consumes: Task 1 的 `htmlToText`、`filterTags`、`slugify`、`PIPELINE_CONFIG`；Task 2 的 `renderDraftMarkdown`
- Produces:
  - `buildSystemPrompt(tagWhitelist: string[]): string`
  - `buildUserPrompt(input: { title: string; link: string; pubDate: string; text: string }): string`
  - `LLMResult { title: string; description: string; tags: string[]; body: string }`
  - `callDeepSeek(opts: { system: string; user: string; apiKey: string; apiBase: string; model: string; temperature: number }): Promise<LLMResult>`（zod 校验输出）
  - `FeedItem { title: string; link: string; pubDate: Date; fallbackText: string }`
  - `generateDraft(item: FeedItem, config: typeof PIPELINE_CONFIG, deps: GenerateDeps): Promise<string>`（返回文件名）
  - `GenerateDeps { callLLM(system, user) => Promise<LLMResult>; fetchPage(link) => Promise<string>; writeFile(path, content) => Promise<void> }`

- [ ] **Step 1: 实现 prompts.ts**

```ts
export function buildSystemPrompt(tagWhitelist: string[]): string {
  return `你是「Apple 开发者周刊」的中文编辑。给你一篇 Apple 官方英文资讯的原文内容，输出严格的 JSON 对象（不要 markdown 代码块包裹），字段：
- title: 简体中文标题（保留专有名词英文原名，如 macOS、Xcode、App Store；数字与日期必须与原文完全一致）
- description: 一句话中文摘要（不超过 80 字）
- tags: 1-3 个标签，只能从白名单选取：${tagWhitelist.join('/')}
- body: 简体中文 Markdown 正文，3-6 段：客观转述事实，禁止添加原文没有的信息；关键数字、日期、费率、百分比必须原样保留；可用少量二级标题（##）与无序列表；结尾单独一段输出：详见[原文](原文链接)
硬性规则：不编造、不推测、不加入观点；原文信息不足以支撑的细节宁可省略；JSON 必须合法。`;
}

export function buildUserPrompt(input: { title: string; link: string; pubDate: string; text: string }): string {
  return `# 原文标题\n${input.title}\n\n# 原文链接\n${input.link}\n\n# 发布日期\n${input.pubDate}\n\n# 原文内容\n${input.text}`;
}
```

- [ ] **Step 2: 实现 llm.ts**

```ts
import { z } from 'zod';

const LLMResultSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()),
  body: z.string().min(1),
});

export interface LLMResult {
  title: string;
  description: string;
  tags: string[];
  body: string;
}

export async function callDeepSeek(opts: {
  system: string;
  user: string;
  apiKey: string;
  apiBase: string;
  model: string;
  temperature: number;
}): Promise<LLMResult> {
  const res = await fetch(`${opts.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: opts.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0].message.content);
  return LLMResultSchema.parse(parsed) as LLMResult;
}
```

- [ ] **Step 3: 写 generate 失败测试（generate.test.ts）**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDraft } from './generate.ts';
import { PIPELINE_CONFIG } from './config.ts';

function makeDeps(overrides: Partial<Parameters<typeof generateDraft>[2]> = {}) {
  const written = new Map<string, string>();
  return {
    written,
    deps: {
      callLLM: async () => ({
        title: '测试标题',
        description: '测试摘要',
        tags: ['政策', '编造的标签'],
        body: '测试正文。\n\n详见[原文](https://example.com/x)',
      }),
      fetchPage: async () => '<p>Some English content.</p>',
      writeFile: async (path: string, content: string) => { written.set(path, content); },
      ...overrides,
    },
  };
}

const item = {
  title: 'Upcoming changes to Rosetta support',
  link: 'https://developer.apple.com/news/?id=w5ngl9k2',
  pubDate: new Date('2026-09-01T00:00:00Z'),
  fallbackText: '<p>Fallback content.</p>',
};

test('generateDraft 写入草稿文件并过滤白名单外标签', async () => {
  const { written, deps } = makeDeps();
  const file = await generateDraft(item, PIPELINE_CONFIG, deps);
  assert.equal(file, '2026-09-01-upcoming-changes-to-rosetta-support.md');
  const content = written.get('src/content/news/2026-09-01-upcoming-changes-to-rosetta-support.md');
  assert.ok(content);
  assert.ok(content.includes('draft: true'));
  assert.ok(content.includes('tags: [政策]'));
  assert.ok(content.includes('source: https://developer.apple.com/news/?id=w5ngl9k2'));
  assert.ok(content.includes('测试标题'));
});

test('generateDraft 页面抓取失败时回退 RSS 内容', async () => {
  const { written, deps } = makeDeps({ fetchPage: async () => { throw new Error('403'); } });
  await generateDraft(item, PIPELINE_CONFIG, deps);
  const content = [...written.values()][0];
  assert.ok(content);
});

test('generateDraft LLM 失败时抛错且不写文件', async () => {
  const { written, deps } = makeDeps({ callLLM: async () => { throw new Error('API down'); } });
  await assert.rejects(() => generateDraft(item, PIPELINE_CONFIG, deps));
  assert.equal(written.size, 0);
});
```

- [ ] **Step 4: 运行确认失败**

Run: `npm run test:pipeline`
Expected: FAIL（generate 模块不存在）

- [ ] **Step 5: 实现 generate.ts**

```ts
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

  const system = buildSystemPrompt(config.tagWhitelist);
  const user = buildUserPrompt({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate.toISOString().slice(0, 10),
    text,
  });
  const result = await deps.callLLM(system, user);

  const tags = filterTags(result.tags, config.tagWhitelist, config.defaultTag);
  const markdown = renderDraftMarkdown({
    title: result.title,
    description: result.description,
    pubDate: item.pubDate,
    tags,
    source: item.link,
    body: result.body,
  });
  const file = `${slugify(item.title, item.pubDate)}.md`;
  await deps.writeFile(join(config.newsDir, file), markdown);
  return file;
}
```

- [ ] **Step 6: 运行确认通过**

Run: `npm run test:pipeline`
Expected: 全部 passing

- [ ] **Step 7: Commit**

```powershell
git add scripts/pipeline
git commit -m "feat(pipeline): add deepseek client, prompts and draft generation"
```

---

### Task 4: RSS 抓取 + CLI 入口 + dry-run

**Files:**
- Create: `scripts/pipeline/rss.ts`
- Create: `scripts/pipeline/index.ts`
- Create: `scripts/pipeline/README.md`

**Interfaces:**
- Consumes: 前序全部模块
- Produces: `fetchFeed(url: string): Promise<FeedItem[]>`；CLI `npm run pipeline:draft [-- --dry-run]`

- [ ] **Step 1: 实现 rss.ts**

```ts
import Parser from 'rss-parser';
import type { FeedItem } from './generate.ts';

export async function fetchFeed(url: string): Promise<FeedItem[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  return feed.items.map((it) => ({
    title: it.title ?? '',
    link: it.link ?? '',
    pubDate: new Date(it.isoDate ?? it.pubDate ?? Date.now()),
    fallbackText: it.content ?? it.contentSnippet ?? '',
  }));
}
```

- [ ] **Step 2: 实现 index.ts**

```ts
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
```

- [ ] **Step 3: 创建 scripts/pipeline/README.md**

```markdown
# AI 内容管线

每日抓取 Apple 官方 RSS，用 DeepSeek 生成中文资讯草稿（`draft: true`），人工审核后发布。

## 本地使用

```
npm run pipeline:draft -- --dry-run   # 只看候选条目，不调 LLM
npm run pipeline:draft                 # 生成草稿（需要 DEEPSEEK_API_KEY 环境变量）
```

审核流程：打开 `src/content/news/` 中的新草稿 → 对照 frontmatter 的 `source` 原文核对数字/日期/费率 → 修改文字或删除 → 确认后将 `draft: true` 改为 `false` → 提交。

## CI（GitHub Actions）

`.github/workflows/pipeline.yml` 每日 01:00 UTC（09:00 北京）运行，生成草稿后自动开 PR。在 PR 中逐篇审核，将 `draft: true` 改 `false` 后合并即自动部署。密钥：仓库 Secrets 中的 `DEEPSEEK_API_KEY`。

## 配置

`config.ts`：信源列表、时间窗（maxAgeDays）、单次上限（maxItems）、标签白名单、LLM 参数。新增信源只需扩展 `feeds` 数组。
```

- [ ] **Step 4: 运行测试回归**

Run: `npm run test:pipeline`
Expected: 全部 passing

- [ ] **Step 5: dry-run 实测（真实 RSS、无 LLM、无密钥）**

Run: `npm run pipeline:draft -- --dry-run`
Expected: 列出候选条目（0~5 条，视当前 RSS 与既有 4 篇种子的重合而定；至少 `dry-run: skipping LLM stage` 出现、退出码 0）。注意：若 14 天窗口内除种子外无新条目，输出 candidates: 0 属正常。

- [ ] **Step 6: 站点构建回归**

Run: `npm run build`
Expected: `Complete!`（管线未改动站点代码，确认无副作用）

- [ ] **Step 7: Commit**

```powershell
git add scripts/pipeline
git commit -m "feat(pipeline): add RSS fetching, CLI entry and dry-run mode"
```

---

### Task 5: GitHub Actions workflow + 首次运行验证

**Files:**
- Create: `.github/workflows/pipeline.yml`

**Interfaces:**
- Consumes: Task 4 的 `npm run test:pipeline` 与 `npm run pipeline:draft`
- Produces: 每日 cron + 手动 dispatch 的草稿 PR 流水线

- [ ] **Step 1: 创建 .github/workflows/pipeline.yml**

```yaml
name: content-pipeline

on:
  schedule:
    - cron: '0 1 * * *'
  workflow_dispatch: {}

permissions:
  contents: write
  pull-requests: write

jobs:
  draft:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npm run test:pipeline
      - run: npm run pipeline:draft
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
      - name: Create draft PR
        env:
          GH_TOKEN: ${{ github.token }}
          BRANCH: content/drafts-${{ github.run_id }}
        run: |
          if [ -z "$(git status --porcelain src/content/news)" ]; then
            echo "no new drafts"; exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git checkout -b "$BRANCH"
          git add src/content/news
          git commit -m "content: pipeline drafts $(date +%F)"
          git push origin "$BRANCH"
          gh pr create --title "内容管线草稿 $(date +%F)" --body "自动生成的资讯草稿。审核清单：
          - 逐篇打开原文链接（frontmatter 的 source），核对数字/日期/费率
          - 修正或删除不合格条目
          - 保留的条目将 frontmatter 中 draft: true 改为 false
          - 合并后 Cloudflare Pages 自动部署"
```

- [ ] **Step 2: 本地静态校验 workflow 语法**

Run: `npx --yes action-validator .github/workflows/pipeline.yml`
Expected: 无输出错误（校验通过）。若 npx 拉取失败，跳过此步，改为人工核对 YAML 缩进后继续。

- [ ] **Step 3: 提交并推送**

```powershell
git add .github/workflows/pipeline.yml
git commit -m "ci: add daily content pipeline workflow"
git push origin feat/content-pipeline
```

**用户操作（子代理无法代做）：**

```powershell
gh secret set DEEPSEEK_API_KEY -R wx528/apple-dev-weekly
```
（粘贴 electric-economy 在用的 DeepSeek key）

然后手动触发：

```powershell
gh workflow run content-pipeline -R wx528/apple-dev-weekly --ref feat/content-pipeline
gh run watch -R wx528/apple-dev-weekly
```

- [ ] **Step 4: 验证流水线结果（控制器在用户操作后执行）**

```powershell
gh run list -R wx528/apple-dev-weekly --workflow=content-pipeline --limit 3
gh pr list -R wx528/apple-dev-weekly --limit 5
```
Expected: 最近一次 run 为 success（或 completed）；若窗口内有新条目则出现「内容管线草稿」PR，PR 内含 `draft: true` 的草稿文件

---

## 运维备忘

- 首次真实运行预计产生 0–3 篇草稿（14 天窗口内、种子未覆盖的条目，如 8/27 税务更新、8/24 Sign in with Apple 域名变更）
- 合并 `feat/content-pipeline` 到 main 后，cron 才会在 main 上生效（schedule 触发默认分支的 workflow 文件）
- v2 扩展点：Apple Newsroom RSS（当前连接失败）、开发者更新页 HTML 抓取、WWDC session 列表、草稿自动过期清理（超过 30 天的 draft 删除）
