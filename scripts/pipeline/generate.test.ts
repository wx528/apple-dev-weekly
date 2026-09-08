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
