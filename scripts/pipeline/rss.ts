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
