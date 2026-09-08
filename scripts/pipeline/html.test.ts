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
