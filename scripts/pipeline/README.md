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
