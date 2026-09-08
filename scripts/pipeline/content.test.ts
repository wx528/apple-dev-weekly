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
