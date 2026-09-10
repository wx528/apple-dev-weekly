import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET() {
  const news = (await getCollection('news', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const tutorials = (await getCollection('tutorials', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(`> ${SITE.description}`);
  lines.push('');
  lines.push(`站点：${SITE.url}；RSS：${SITE.url}/rss.xml`);
  lines.push('');
  lines.push('## 资讯');
  for (const entry of news) {
    lines.push(`- [${entry.data.title}](${SITE.url}/news/${entry.id}/): ${entry.data.description}`);
  }
  lines.push('');
  lines.push('## 教程');
  for (const entry of tutorials) {
    lines.push(`- [${entry.data.title}](${SITE.url}/tutorials/${entry.id}/): ${entry.data.description}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
