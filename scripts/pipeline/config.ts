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
