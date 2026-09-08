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
