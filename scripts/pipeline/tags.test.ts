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
