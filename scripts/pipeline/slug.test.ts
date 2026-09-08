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
