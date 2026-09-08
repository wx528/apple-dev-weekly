# Astro 站点 M0（Apple 开发者周刊）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建并上线「Apple 开发者周刊」静态站点（首页/资讯/教程/政策/标签/关于/RSS/SEO），部署到 Cloudflare Pages，包含 5 篇真实种子内容。

**Architecture:** Astro 5 SSG + Content Collections（Markdown 文件即内容），纯 Astro 组件（无 UI 框架），手写 CSS（含深色模式），giscus 评论与 Cloudflare Web Analytics。AI 内容管线为独立后续计划（Plan 2），不在本计划内。

**Tech Stack:** Astro 5.x、@astrojs/rss、@astrojs/sitemap、TypeScript（strict）、Node ≥ 18.17（本机 v24.12.0）。

## Global Constraints

- 站名：`Apple 开发者周刊`；域名：`https://apple-dev-weekly.pages.dev`（若子域名被占用，同步修改 `astro.config.mjs` 的 `site`、`public/robots.txt` 的 Sitemap 行、`src/config.ts` 的 `SITE.url` 三处）
- 仓库：`C:\Users\Scott\Work\Market\apple-app-dev`（git 已初始化，分支 `main`，已有 docs/ 提交）
- GitHub 账号：`wx528`（gh CLI 已登录，git 协议为 SSH）
- 无数据库、无 CMS、无用户系统、无 UI 框架（React/Vue 等一律不用）
- 所有页面 `<html lang="zh-CN">`；每篇资讯必须含 `source`（原文链接）
- 深色模式仅用 `prefers-color-scheme` 媒体查询，不做手动切换
- 内容集合名固定为 `news` 与 `tutorials`；标签使用中文且不含空格（如 `政策`、`中国区`），因标签同时用作 URL 路径参数
- 命令均在仓库根目录以 PowerShell 执行；`npm install` 如遇网络失败，先执行 `npm config set registry https://registry.npmmirror.com` 再重试，完成后可 `npm config delete registry` 还原
- 每个任务以 `npm run build` 成功 + 指定断言通过为验收标准（静态站的"测试周期"）

---

### Task 1: 手动脚手架 + 依赖安装 + 构建冒烟

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `public/favicon.svg`
- Create: `src/pages/index.astro`（临时占位首页，Task 3 重写）

**Interfaces:**
- Consumes: 无
- Produces: 可构建的 Astro 项目；`astro.config.mjs` 导出 `site: 'https://apple-dev-weekly.pages.dev'` 与 sitemap 集成（Task 8 依赖）；依赖包 `astro`、`@astrojs/rss`、`@astrojs/sitemap`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "apple-dev-weekly",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0"
  }
}
```

- [ ] **Step 2: 创建 astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://apple-dev-weekly.pages.dev',
  integrations: [sitemap()],
});
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 创建 .gitignore**

```
node_modules/
dist/
.astro/
.DS_Store
Thumbs.db
npm-debug.log*
```

- [ ] **Step 5: 创建 public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1d1d1f"/>
  <text x="32" y="43" font-family="-apple-system, sans-serif" font-size="34" font-weight="600" fill="#f5f5f7" text-anchor="middle">A</text>
</svg>
```

- [ ] **Step 6: 创建临时首页 src/pages/index.astro**

```astro
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Apple 开发者周刊</title>
  </head>
  <body>
    <h1>Apple 开发者周刊</h1>
  </body>
</html>
```

- [ ] **Step 7: 安装依赖**

Run: `npm install`
Expected: 无 error 退出（warnings 可忽略）；生成 `package-lock.json`。如网络失败见 Global Constraints 的镜像回退。

- [ ] **Step 8: 构建冒烟测试**

Run: `npm run build`
Expected: 输出含 `complete`，`dist/` 生成。断言：

```powershell
Test-Path dist\index.html
```
Expected: `True`

- [ ] **Step 9: Commit**

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore public src
git commit -m "chore: scaffold Astro site"
```

---

### Task 2: 内容集合定义 + 4 篇种子资讯

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/news/2026-03-12-china-commission.md`
- Create: `src/content/news/2026-07-09-age-questionnaire.md`
- Create: `src/content/news/2026-08-18-eu-new-terms.md`
- Create: `src/content/news/2026-09-01-rosetta-deprecation.md`

**Interfaces:**
- Consumes: Task 1 的项目骨架
- Produces: 集合 `news`，schema 字段 `title: string`、`description: string`、`pubDate: Date`、`tags: string[]`（默认 `[]`）、`source?: string(url)`、`draft: boolean`（默认 `false`）；glob loader 以文件名（去 `.md`）为 `entry.id`。集合 `tutorials` 同字段外加 `updated?: Date`（Task 6 使用）。所有后续任务通过 `getCollection('news')` 消费。

- [ ] **Step 1: 创建 src/content.config.ts**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, tutorials };
```

- [ ] **Step 2: 创建 src/content/news/2026-03-12-china-commission.md**

````markdown
---
title: 中国区 App Store 佣金下调：标准 30%→25%，小型开发者 15%→12%
description: Apple 宣布调整中国大陆 App Store 佣金结构，2026 年 3 月 15 日生效，这是中国区近年最大力度的一次让利。
pubDate: 2026-03-12
tags: [政策, 中国区]
source: https://developer.apple.com/news/?id=dadukodv
draft: false
---

Apple 于 3 月 12 日宣布，经与中国监管机构沟通后，调整中国大陆 App Store（iOS/iPadOS）的佣金率，**2026 年 3 月 15 日**起生效。

## 调整内容

| 项目 | 原费率 | 新费率 |
|------|--------|--------|
| 标准 IAP / 付费应用交易 | 30% | **25%** |
| 小型企业计划 / Mini Apps 合作计划 | 15% | **12%** |
| 订阅次年自动续订 | 15% | **12%** |

## 要点

- 无需在 3 月 15 日前签署新协议即可享受新费率。
- Apple 表示将保持中国区费率不高于全球其他市场的整体水平。
- 新的《Apple Developer Program 许可协议》已同步更新，需登录账号接受。

## 对开发者的影响

对年收入 100 万美元以下的小型开发者，实际到手比例从 85% 提高到 88%；订阅制应用次年起成本优势更明显。建议在定价策略测算中更新佣金假设。

详见[官方公告](https://developer.apple.com/news/?id=dadukodv)。
````

- [ ] **Step 3: 创建 src/content/news/2026-07-09-age-questionnaire.md**

````markdown
---
title: 9 月起 App 提交强制填写社交媒体能力问卷
description: 配合 iOS 27 新的 Time Allowances 家长管控，App Store Connect 年龄分级问卷新增社交媒体能力问题，2026 年 9 月赔回答成为强制要求。
pubDate: 2026-07-09
tags: [政策, 审核]
source: https://developer.apple.com/news/?id=tlur8uvi
draft: false
---

配合 iOS 27 / iPadOS 27 / macOS 27 引入的 **Time Allowances**（家长可按「娱乐/游戏/社交媒体」类别管理孩子使用时长），App Store Connect 的年龄分级问卷新增了社交媒体能力问题。

## 关键规则

- 「社交媒体能力」定义：通过社交信息流或类似发现机制，转发、放大或与用户生成内容互动的能力——**与 App 类目无关**，按实际功能判定。
- 含此能力的应用会在产品页显示新的「社交媒体」内容描述符。
- 若该能力对 13 岁以下用户已禁用，则不会计入 13 岁以下用户的「社交媒体」时间额度类别。

## 时间线

- **2026 年 9 月起**：提交新 App 或更新、以及替代分发的公证提交，问卷回答为**必填**。

建议提前检查自家 App 是否命中定义，避免提审时被退回。详见[官方公告](https://developer.apple.com/news/?id=tlur8uvi)。
````

- [ ] **Step 4: 创建 src/content/news/2026-08-18-eu-new-terms.md**

````markdown
---
title: 欧盟 App Store 新规 10 月 1 日生效：CTF 取消，改为 5% Core Technology Commission
description: Apple 与欧盟委员会达成新方案：统一商业条款，取消 Core Technology Fee 与 Store Services Fee，App Store 外数字交易收 5% 佣金。
pubDate: 2026-08-18
tags: [政策, 欧盟]
source: https://developer.apple.com/news/?id=gmws0jgp
draft: false
---

Apple 于 8 月 18 日宣布，在与欧盟委员会密切协作后，欧盟区开发者将**统一适用一套商业条款**，新条款 **2026 年 10 月 1 日**生效。

## 核心变化

- **Core Technology Fee（按安装次数收费）取消**，替换为对 App Store 之外分发的数字交易收取 **5% 的 Core Technology Commission**。
- **Initial Acquisition Fee 与 Store Services Fee 取消**。
- App 内可**并列提供第三方支付与 Apple 内购**。
- 放宽运营替代应用市场与 Web 分发的资格条件。
- 替代支付场景增加儿童安全保护要求。

## 对开发者的影响

在欧盟区分发且考虑外部渠道的开发者，成本模型从「每安装付费」变为「交易抽成」，中小开发者受益明显。注意：更新后的《Apple Developer Program 许可协议》Attachment 14 需在 App Store Connect 中签署接受。

详见[官方公告](https://developer.apple.com/news/?id=gmws0jgp)与[欧盟政策专页](https://developer.apple.com/support/apps-in-the-eu/)。
````

- [ ] **Step 5: 创建 src/content/news/2026-09-01-rosetta-deprecation.md**

````markdown
---
title: Rosetta 进入倒计时：macOS 27 将是最后支持 Intel 转译的版本
description: Apple 正式宣布 Rosetta 过渡期收尾：macOS 26.4 起提示用户，macOS 27 后 Intel-only 应用无法在 Apple Silicon Mac 上运行。
pubDate: 2026-09-01
tags: [macOS, 工具链]
source: https://developer.apple.com/news/?id=w5ngl9k2
draft: false
---

Apple 于 9 月 1 日公布了 Rosetta 支持的收官时间表。Rosetta 自 2020 年 Apple Silicon 过渡期推出，现进入最终阶段。

## 时间线

- **macOS 26.4 起**：依赖 Rosetta 的应用启动时，用户可能收到系统通知，提醒升级到 Apple Silicon 原生版本。
- **macOS 27**：**最后一个支持 Rosetta 的版本**——此后 Intel-only 应用无法在 Apple Silicon Mac 上运行。

## 例外

依赖 Intel 框架的 older、unmaintained 游戏作品的 Rosetta 功能将继续支持。

## 开发者应对

- 立即将 macOS 应用构建为**通用二进制**（同时支持 Apple Silicon 与 Intel）。
- 已有原生版本的应用，主动引导用户升级，避免 macOS 27 发布后中断。

参考：[为 Apple Silicon 优化应用](https://developer.apple.com/documentation/apple-silicon)、[移植指南](https://developer.apple.com/documentation/apple-silicon/porting-your-macos-apps-to-apple-silicon)。
````

- [ ] **Step 6: 构建验证（schema 校验）**

Run: `npm run build`
Expected: `complete`。frontmatter 字段类型错误（如 `pubDate` 非日期、`tags` 非数组）会导致构建失败——这是内容 schema 的自动化校验。

- [ ] **Step 7: Commit**

```powershell
git add src
git commit -m "feat: add content collections and seed news articles"
```

---

### Task 3: 站点配置 + 全局样式 + 布局与通用组件

**Files:**
- Create: `src/config.ts`
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/SEO.astro`
- Modify: `src/pages/index.astro`（重写为使用 Base 布局）

**Interfaces:**
- Consumes: 无（纯新增）
- Produces:
  - `src/config.ts` 导出 `SITE`（含 `name`、`description`、`url`、`nav: {label, href}[]`）、`GISCUS`（`repo`、`repoId`、`category`、`categoryId`，后两项 Task 9 填入）、`ANALYTICS.cloudflareToken`（Task 9 填入）、`GOOGLE.siteVerification`（Task 10 填入）
  - `Base.astro` Props：`{ title: string; description: string; path: string }`（后续所有页面消费）
  - `SEO.astro` Props：`{ title: string; description: string; path: string }`（仅 Base 内部使用）

- [ ] **Step 1: 创建 src/config.ts**

```ts
export const SITE = {
  name: 'Apple 开发者周刊',
  description: '面向中国 Apple 开发者的资讯与教程站：官方政策情报、SDK 与工具链动态、实战教程。',
  url: 'https://apple-dev-weekly.pages.dev',
  nav: [
    { label: '首页', href: '/' },
    { label: '资讯', href: '/news/' },
    { label: '教程', href: '/tutorials/' },
    { label: '政策', href: '/policy/' },
    { label: '关于', href: '/about/' },
  ],
};

export const GISCUS = {
  repo: 'wx528/apple-dev-weekly',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
};

export const ANALYTICS = {
  cloudflareToken: '',
};

export const GOOGLE = {
  siteVerification: '',
};
```

- [ ] **Step 2: 创建 src/styles/global.css**

```css
:root {
  --bg: #ffffff;
  --bg-soft: #f5f5f7;
  --text: #1d1d1f;
  --text-soft: #6e6e73;
  --accent: #0066cc;
  --border: #d2d2d7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1c1c1e;
    --bg-soft: #2c2c2e;
    --text: #f5f5f7;
    --text-soft: #98989d;
    --accent: #4da3ff;
    --border: #3a3a3c;
  }
}

* { box-sizing: border-box; }

html {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  font-size: 16px;
}

.container { max-width: 720px; margin: 0 auto; padding: 0 20px; }

main { min-height: 70vh; padding: 32px 0 64px; }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.site-header { border-bottom: 1px solid var(--border); background: var(--bg); }
.site-header .container {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px; padding-top: 16px; padding-bottom: 16px;
}
.brand { font-weight: 700; font-size: 18px; color: var(--text); }
.site-header nav { display: flex; gap: 16px; flex-wrap: wrap; }
.site-header nav a { color: var(--text-soft); font-size: 15px; }
.site-header nav a.active { color: var(--accent); }

.site-footer { border-top: 1px solid var(--border); padding: 24px 0; color: var(--text-soft); font-size: 13px; }
.site-footer p { margin: 6px 0; }

.hero { padding: 32px 0 8px; }
.hero h1 { margin: 0 0 8px; }
.hero p { color: var(--text-soft); margin: 0 0 24px; }

section h2 { font-size: 20px; margin: 32px 0 12px; }

.post-list { display: flex; flex-direction: column; }
.post-card { padding: 14px 0; border-bottom: 1px solid var(--border); }
.post-card-title { margin: 0 0 6px; font-size: 17px; }
.post-card-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  font-size: 13px; color: var(--text-soft); margin-bottom: 6px;
}
.post-card-desc { margin: 0; color: var(--text-soft); font-size: 14px; }

.tag {
  background: var(--bg-soft); color: var(--text-soft);
  padding: 1px 8px; border-radius: 999px; font-size: 12px;
}
.tag:hover { color: var(--accent); text-decoration: none; }

.prose h1 { font-size: 28px; line-height: 1.3; margin: 0 0 12px; }
.prose h2 { font-size: 22px; margin: 28px 0 10px; }
.prose h3 { font-size: 18px; margin: 24px 0 8px; }
.prose p { margin: 12px 0; }
.prose ul, .prose ol { padding-left: 24px; }
.prose li { margin: 4px 0; }
.prose code { background: var(--bg-soft); padding: 2px 6px; border-radius: 4px; font-size: 14px; }
.prose pre { background: var(--bg-soft); padding: 16px; border-radius: 8px; overflow-x: auto; }
.prose pre code { background: none; padding: 0; }
.prose blockquote { margin: 12px 0; padding: 4px 16px; border-left: 3px solid var(--accent); color: var(--text-soft); }
.prose table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }
.prose th, .prose td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
.prose img { max-width: 100%; }
.prose .meta { margin: 4px 0 24px; }

.comments { margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px; }
```

- [ ] **Step 3: 创建 src/components/SEO.astro**

```astro
---
import { SITE } from '../config';

interface Props {
  title: string;
  description: string;
  path: string;
}

const { title, description, path } = Astro.props;
const canonical = new URL(path, Astro.site ?? SITE.url).href;
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />
<meta property="og:locale" content="zh_CN" />
```

- [ ] **Step 4: 创建 src/components/Header.astro**

```astro
---
import { SITE } from '../config';

const { pathname } = Astro.url;
---
<header class="site-header">
  <div class="container">
    <a class="brand" href="/">{SITE.name}</a>
    <nav>
      {SITE.nav.map((item) => (
        <a
          href={item.href}
          class={item.href === '/' ? (pathname === '/' ? 'active' : '') : pathname.startsWith(item.href) ? 'active' : ''}
        >
          {item.label}
        </a>
      ))}
    </nav>
  </div>
</header>
```

- [ ] **Step 5: 创建 src/components/Footer.astro**

```astro
---
import { SITE, GISCUS } from '../config';

const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container">
    <p>© {year} {SITE.name} · <a href="/rss.xml">RSS 订阅</a> · <a href={`https://github.com/${GISCUS.repo}`}>GitHub</a></p>
    <p>本站为独立第三方站点，与 Apple Inc. 无关；Apple 及相关商标归 Apple Inc. 所有。</p>
  </div>
</footer>
```

- [ ] **Step 6: 创建 src/layouts/Base.astro**

```astro
---
import { SITE, GOOGLE } from '../config';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  path: string;
}

const { title, description, path } = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/rss.xml" />
    {GOOGLE.siteVerification && <meta name="google-site-verification" content={GOOGLE.siteVerification} />}
    <SEO title={title} description={description} path={path} />
  </head>
  <body>
    <Header />
    <main>
      <div class="container">
        <slot />
      </div>
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 7: 重写 src/pages/index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import { SITE } from '../config';
---
<Base title={`${SITE.name} — Apple 生态情报与教程`} description={SITE.description} path="/">
  <section class="hero">
    <h1>{SITE.name}</h1>
    <p>Apple 官方政策、SDK 与工具链动态、实战教程，中文第一时间。</p>
  </section>
</Base>
```

- [ ] **Step 8: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
(Select-String -Path dist\index.html -Quiet -Pattern '<html lang="zh-CN">'); (Select-String -Path dist\index.html -Quiet -Pattern '资讯'); (Select-String -Path dist\index.html -Quiet -Pattern 'rel="canonical"')
```
Expected: 三个结果均为 `True`

- [ ] **Step 9: Commit**

```powershell
git add src
git commit -m "feat: add base layout, header/footer, SEO component and global styles"
```

---

### Task 4: 日期工具 + PostCard 组件 + 首页（含草稿过滤测试）

**Files:**
- Create: `src/utils/date.ts`
- Create: `src/components/PostCard.astro`
- Modify: `src/pages/index.astro`（加入资讯/教程列表）
- Create（临时，测试后删除）: `src/content/news/9999-01-01-draft-filter-check.md`

**Interfaces:**
- Consumes: Task 2 的 `getCollection('news' | 'tutorials')`、Task 3 的 `Base.astro`
- Produces:
  - `formatDate(date: Date): string`（`src/utils/date.ts`，后续详情页消费）
  - `PostCard.astro` Props：`{ entry: CollectionEntry<'news'> | CollectionEntry<'tutorials'> }`（Task 5/6/7 消费）

- [ ] **Step 1: 创建 src/utils/date.ts**

```ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

- [ ] **Step 2: 创建 src/components/PostCard.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../utils/date';

interface Props {
  entry: CollectionEntry<'news'> | CollectionEntry<'tutorials'>;
}

const { entry } = Astro.props;
const href = `/${entry.collection}/${entry.id}/`;
---
<article class="post-card">
  <h3 class="post-card-title"><a href={href}>{entry.data.title}</a></h3>
  <div class="post-card-meta">
    <time datetime={entry.data.pubDate.toISOString()}>{formatDate(entry.data.pubDate)}</time>
    {entry.data.tags.map((tag) => (
      <a class="tag" href={`/tags/${tag}/`}>{tag}</a>
    ))}
  </div>
  <p class="post-card-desc">{entry.data.description}</p>
</article>
```

- [ ] **Step 3: 重写 src/pages/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import PostCard from '../components/PostCard.astro';
import { SITE } from '../config';

const news = (await getCollection('news', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const tutorials = (await getCollection('tutorials', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title={`${SITE.name} — Apple 生态情报与教程`} description={SITE.description} path="/">
  <section class="hero">
    <h1>{SITE.name}</h1>
    <p>Apple 官方政策、SDK 与工具链动态、实战教程，中文第一时间。</p>
  </section>

  <section>
    <h2>最新资讯</h2>
    <div class="post-list">
      {news.slice(0, 5).map((entry) => <PostCard entry={entry} />)}
    </div>
    <p><a href="/news/">查看全部资讯 →</a></p>
  </section>

  <section>
    <h2>最新教程</h2>
    <div class="post-list">
      {tutorials.map((entry) => <PostCard entry={entry} />)}
    </div>
  </section>
</Base>
```

注意：此时 `tutorials` 集合为空（Task 6 填充内容），首页「最新教程」区块暂为空列表——构建不会失败。

- [ ] **Step 4: 草稿过滤测试 — 先写"失败"用例**

创建 `src/content/news/9999-01-01-draft-filter-check.md`：

```markdown
---
title: 草稿过滤测试文章ZZZTEST
description: 这篇是 draft，不应出现在任何构建输出中。
pubDate: 2026-09-08
tags: [测试]
draft: true
---
草稿正文。
```

Run: `npm run build`

断言（验证草稿**没有**泄漏到任何构建产物）：

```powershell
$hits = Get-ChildItem dist -Recurse -Filter *.html | Select-String -Pattern 'ZZZTEST'; if ($hits) { 'FAIL: draft leaked' } else { 'PASS: draft filtered' }
```
Expected: `PASS: draft filtered`

- [ ] **Step 5: 删除测试草稿文件**

```powershell
Remove-Item src\content\news\9999-01-01-draft-filter-check.md
```

Run: `npm run build`
Expected: `complete`

断言（首页显示真实文章）：

```powershell
(Select-String -Path dist\index.html -Quiet -Pattern 'Rosetta'); (Select-String -Path dist\index.html -Quiet -Pattern '佣金')
```
Expected: 均为 `True`

- [ ] **Step 6: Commit**

```powershell
git add src
git commit -m "feat: add PostCard component, date util and homepage with draft filtering"
```

---

### Task 5: 资讯列表页 + 详情页

**Files:**
- Create: `src/pages/news/index.astro`
- Create: `src/pages/news/[id].astro`

**Interfaces:**
- Consumes: Task 4 的 `PostCard`、`formatDate`；Task 3 的 `Base`
- Produces: 路由 `/news/`（列表）与 `/news/{entry.id}/`（详情）；详情页内 `.prose` 文章容器与「阅读原文」链接。Task 9 在详情页末尾插入 `<Comments />`。

- [ ] **Step 1: 创建 src/pages/news/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { SITE } from '../../config';

const news = (await getCollection('news', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title={`资讯 — ${SITE.name}`} description="Apple 官方动态的中文资讯：政策、工具链、平台更新。" path="/news/">
  <section class="hero">
    <h1>资讯</h1>
    <p>Apple 官方动态，中文解读。</p>
  </section>
  <div class="post-list">
    {news.map((entry) => <PostCard entry={entry} />)}
  </div>
</Base>
```

- [ ] **Step 2: 创建 src/pages/news/[id].astro**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { formatDate } from '../../utils/date';
import { SITE } from '../../config';

export async function getStaticPaths() {
  const news = await getCollection('news', ({ data }) => !data.draft);
  return news.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<Base title={`${entry.data.title} — ${SITE.name}`} description={entry.data.description} path={`/news/${entry.id}/`}>
  <article class="prose">
    <header>
      <h1>{entry.data.title}</h1>
      <div class="post-card-meta meta">
        <time datetime={entry.data.pubDate.toISOString()}>{formatDate(entry.data.pubDate)}</time>
        {entry.data.tags.map((tag) => (
          <a class="tag" href={`/tags/${tag}/`}>{tag}</a>
        ))}
        {entry.data.source && (
          <a href={entry.data.source} rel="noopener noreferrer">阅读原文 ↗</a>
        )}
      </div>
    </header>
    <Content />
    <p><a href="/news/">← 返回资讯列表</a></p>
  </article>
</Base>
```

- [ ] **Step 3: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
Test-Path dist\news\2026-08-18-eu-new-terms\index.html
```
Expected: `True`

```powershell
(Select-String -Path dist\news\2026-08-18-eu-new-terms\index.html -Quiet -Pattern 'Core Technology Commission'); (Select-String -Path dist\news\2026-03-12-china-commission\index.html -Quiet -Pattern '阅读原文')
```
Expected: 均为 `True`

```powershell
Test-Path dist\news\9999-01-01-draft-filter-check\index.html
```
Expected: `False`

- [ ] **Step 4: Commit**

```powershell
git add src
git commit -m "feat: add news listing and detail pages"
```

---

### Task 6: 教程内容 + 列表页 + 详情页

**Files:**
- Create: `src/content/tutorials/2026-04-28-ios26-sdk-checklist.md`
- Create: `src/pages/tutorials/index.astro`
- Create: `src/pages/tutorials/[id].astro`

**Interfaces:**
- Consumes: Task 2 的 `tutorials` schema（含 `updated?`）、Task 3 的 `Base`、Task 4 的 `PostCard`、`formatDate`
- Produces: 路由 `/tutorials/` 与 `/tutorials/{entry.id}/`。Task 9 在详情页末尾插入 `<Comments />`。

- [ ] **Step 1: 创建 src/content/tutorials/2026-04-28-ios26-sdk-checklist.md**

````markdown
---
title: iOS 26 SDK 最低要求适配清单：Xcode 升级与提交前检查
description: 2026 年 4 月 28 日起 App Store Connect 只接受 iOS 26 SDK 构建的应用。一份可直接执行的升级与自查清单。
pubDate: 2026-04-28
updated: 2026-09-08
tags: [Xcode, iOS]
draft: false
---

自 **2026 年 4 月 28 日** 起，上传到 App Store Connect 的 iOS/iPadOS 应用必须使用 **iOS 26 SDK 或更新版本**构建（tvOS、visionOS、watchOS 同理需 26+ SDK）。本清单帮你把升级做成一次性可核对的任务。

## 升级步骤

1. **安装 Xcode 26 或更高版本**（Mac App Store 或 [developer.apple.com/download](https://developer.apple.com/download/)）。
2. **打开项目并构建**：首次用新 Xcode 打开会自动升级项目格式，提交前确认 `.xcodeproj` 变更（团队协作时注意合并冲突）。
3. **清理弃用 API 警告**：构建时逐条处理 deprecation warning。特别注意：`ImageCreator` 类在 iOS 27 SDK 中已移除，图像生成请迁移到 Image Playground 框架。
4. **在 iOS 26.x 模拟器与真机上回归测试**：重点是 Liquid Glass 外观下的导航栏/工具栏层次、深色模式、以及键盘与手势交互。
5. **更新 CI**：构建机器的 Xcode 版本与 `xcode-select` 路径；Fastlane/Xcode Cloud 的镜像选择同步升级。
6. **试提交一次**：先上传一个 TestFlight 构建验证 App Store Connect 不再报 SDK 版本错误。

## 常见踩坑

| 症状 | 原因与处理 |
|------|-----------|
| ITMS-90725：「SDK Version Issue」 | 仍在用旧 Xcode 构建；检查 CI 用的工具链路径 |
| 导航栏透明/错位 | Liquid Glass 材质下系统控件行为变化，检查 `barAppearance` 自定义 |
| 弃用 API 编译错误 | 打开项目的 deprecated warnings（Editor → Issues），按目标 SDK 迁移 |

## 前瞻：iOS 27

WWDC26 已发布 iOS 27 SDK（Xcode 27 beta）。新提交建议直接瞄准 iOS 26 SDK 的同时，在 Xcode 27 beta 上跑一遍编译，提前暴露弃用问题。

---

*参考资料：[Upcoming SDK minimum requirements](https://developer.apple.com/news/?id=ueeok6yw) · [Submitting to the App Store](https://developer.apple.com/app-store/submitting/)*
````

- [ ] **Step 2: 创建 src/pages/tutorials/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { SITE } from '../../config';

const tutorials = (await getCollection('tutorials', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title={`教程 — ${SITE.name}`} description="Swift、SwiftUI、Xcode 与 App Store 实战教程。" path="/tutorials/">
  <section class="hero">
    <h1>教程</h1>
    <p>实战为先，即学即用。</p>
  </section>
  <div class="post-list">
    {tutorials.map((entry) => <PostCard entry={entry} />)}
  </div>
</Base>
```

- [ ] **Step 3: 创建 src/pages/tutorials/[id].astro**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { formatDate } from '../../utils/date';
import { SITE } from '../../config';

export async function getStaticPaths() {
  const tutorials = await getCollection('tutorials', ({ data }) => !data.draft);
  return tutorials.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<Base title={`${entry.data.title} — ${SITE.name}`} description={entry.data.description} path={`/tutorials/${entry.id}/`}>
  <article class="prose">
    <header>
      <h1>{entry.data.title}</h1>
      <div class="post-card-meta meta">
        <time datetime={entry.data.pubDate.toISOString()}>发布：{formatDate(entry.data.pubDate)}</time>
        {entry.data.updated && (
          <time datetime={entry.data.updated.toISOString()}>更新：{formatDate(entry.data.updated)}</time>
        )}
        {entry.data.tags.map((tag) => (
          <a class="tag" href={`/tags/${tag}/`}>{tag}</a>
        ))}
      </div>
    </header>
    <Content />
    <p><a href="/tutorials/">← 返回教程列表</a></p>
  </article>
</Base>
```

- [ ] **Step 4: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
(Select-String -Path dist\index.html -Quiet -Pattern 'iOS 26 SDK'); (Select-String -Path dist\tutorials\2026-04-28-ios26-sdk-checklist\index.html -Quiet -Pattern 'ITMS-90725'); (Select-String -Path dist\tutorials\2026-04-28-ios26-sdk-checklist\index.html -Quiet -Pattern '更新：')
```
Expected: 均为 `True`（第一条验证首页教程区已渲染；第三条验证 `updated` 字段生效）

- [ ] **Step 5: Commit**

```powershell
git add src
git commit -m "feat: add tutorials collection, listing and detail pages"
```

---

### Task 7: 标签聚合页 + 政策专题页

**Files:**
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/policy/index.astro`

**Interfaces:**
- Consumes: Task 4 的 `PostCard`、Task 2 的两个集合
- Produces: 路由 `/tags/{tag}/`（URL 中中文会自动百分号编码，属预期行为）与 `/policy/`。政策页过滤逻辑固定为 `tags.includes('政策')`。

- [ ] **Step 1: 创建 src/pages/tags/[tag].astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { SITE } from '../../config';

export async function getStaticPaths() {
  const [news, tutorials] = await Promise.all([
    getCollection('news', ({ data }) => !data.draft),
    getCollection('tutorials', ({ data }) => !data.draft),
  ]);
  const entries = [...news, ...tutorials];
  const tags = [...new Set(entries.flatMap((entry) => entry.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: { tag, entries: entries.filter((entry) => entry.data.tags.includes(tag)) },
  }));
}

const { tag, entries } = Astro.props;
const sorted = entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title={`标签「${tag}」— ${SITE.name}`} description={`标签「${tag}」下的全部文章。`} path={`/tags/${tag}/`}>
  <section class="hero">
    <h1>标签：{tag}</h1>
    <p>共 {sorted.length} 篇。</p>
  </section>
  <div class="post-list">
    {sorted.map((entry) => <PostCard entry={entry} />)}
  </div>
</Base>
```

- [ ] **Step 2: 创建 src/pages/policy/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { SITE } from '../../config';

const policyNews = (await getCollection('news', ({ data }) => !data.draft && data.tags.includes('政策')))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title={`政策 — ${SITE.name}`} description="App Store 商业条款、审核规则与各地区监管动态的中文聚合。" path="/policy/">
  <section class="hero">
    <h1>政策专题</h1>
    <p>App Store 商业条款、审核规则与各地区监管动态，持续跟踪。</p>
  </section>
  <div class="post-list">
    {policyNews.map((entry) => <PostCard entry={entry} />)}
  </div>
  <p style="margin-top:24px">说明：本专题聚合标签为「政策」的资讯；区域性政策可再按「中国区 / 欧盟」标签筛选。</p>
</Base>
```

- [ ] **Step 3: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
Test-Path dist\policy\index.html
```
Expected: `True`

```powershell
(Select-String -Path dist\policy\index.html -Quiet -Pattern '佣金'); (Select-String -Path dist\policy\index.html -Quiet -Pattern 'Rosetta')
```
Expected: 第一个 `True`（佣金文章在政策页），第二个 `False`（Rosetta 未打「政策」标签，不应出现）

```powershell
Test-Path dist\tags\政策\index.html
```
Expected: `True`

```powershell
(Select-String -Path dist\tags\政策\index.html -Quiet -Pattern 'Core Technology Commission')
```
Expected: `True`

- [ ] **Step 4: Commit**

```powershell
git add src
git commit -m "feat: add tag pages and policy hub page"
```

---

### Task 8: RSS + robots.txt + 关于页 + sitemap 验证

**Files:**
- Create: `src/pages/rss.xml.js`
- Create: `public/robots.txt`
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: Task 1 的 sitemap 集成（`astro.config.mjs` 已含 `site`）、Task 2 的两个集合
- Produces: `/rss.xml`（news + tutorials 合并、按日期倒序、过滤草稿）；`/robots.txt`；`/about/`；`dist/sitemap-index.xml`（集成自动生成）

- [ ] **Step 1: 创建 src/pages/rss.xml.js**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context) {
  const news = await getCollection('news', ({ data }) => !data.draft);
  const tutorials = await getCollection('tutorials', ({ data }) => !data.draft);
  const items = [...news, ...tutorials]
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/${entry.collection}/${entry.id}/`,
    }));

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items,
  });
}
```

- [ ] **Step 2: 创建 public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://apple-dev-weekly.pages.dev/sitemap-index.xml
```

- [ ] **Step 3: 创建 src/pages/about.astro**

```astro
---
import Base from '../layouts/Base.astro';
import { SITE, GISCUS } from '../config';
---
<Base title={`关于 — ${SITE.name}`} description={`关于${SITE.name}：定位、内容来源与联系渠道。`} path="/about/">
  <article class="prose">
    <h1>关于本站</h1>
    <p>{SITE.name} 是一个面向中国 Apple 开发者的独立内容站点，专注三件事：</p>
    <ul>
      <li><strong>政策情报</strong>：佣金、审核规则、各地区监管动态，第一时间中文解读；</li>
      <li><strong>工具链动态</strong>：SDK、Xcode、Swift/SwiftUI 的版本变化与迁移指南；</li>
      <li><strong>实战教程</strong>：适配、调试、上线的可执行清单。</li>
    </ul>
    <h2>内容来源与准确性</h2>
    <p>资讯类内容基于 Apple 官方公告（developer.apple.com/news 等）整理翻译，每篇均附原文链接；关键数字与日期以原文为准。教程为原创或注明出处。</p>
    <h2>订阅与联系</h2>
    <p>欢迎通过 <a href="/rss.xml">RSS</a> 订阅，或在 <a href={`https://github.com/${GISCUS.repo}`}>GitHub 仓库</a> 提 Issue 交流。</p>
    <h2>免责声明</h2>
    <p>本站为独立第三方站点，与 Apple Inc. 无从属关系；Apple 及相关商标归 Apple Inc. 所有。</p>
  </article>
</Base>
```

- [ ] **Step 4: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
Test-Path dist\rss.xml; Test-Path dist\robots.txt; Test-Path dist\sitemap-index.xml; Test-Path dist\about\index.html
```
Expected: 均为 `True`

```powershell
(Select-String -Path dist\rss.xml -Pattern '<item>').Count
```
Expected: `5`（4 篇资讯 + 1 篇教程）

```powershell
(Select-String -Path dist\about\index.html -Quiet -Pattern '免责声明')
```
Expected: `True`

- [ ] **Step 5: Commit**

```powershell
git add src public
git commit -m "feat: add RSS feed, robots.txt, about page"
```

---

### Task 9: giscus 评论 + Cloudflare Web Analytics

**Files:**
- Create: `src/components/Comments.astro`
- Create: `src/components/Analytics.astro`
- Modify: `src/config.ts`（填入 `GISCUS.repoId`、`GISCUS.categoryId`、`ANALYTICS.cloudflareToken`）
- Modify: `src/pages/news/[id].astro`（末尾插入 `<Comments />`）
- Modify: `src/pages/tutorials/[id].astro`（末尾插入 `<Comments />`）
- Modify: `src/layouts/Base.astro`（`</body>` 前插入 `<Analytics />`）

**Interfaces:**
- Consumes: Task 3 的 `GISCUS`、`ANALYTICS` 配置对象
- Produces: `Comments.astro` 与 `Analytics.astro`（无 Props，读全局配置；空配置时不渲染任何内容）

**前置说明：** 本任务需要外部账号操作（GitHub 仓库公开化、giscus App 安装、Cloudflare 账号）。空值状态下组件不渲染、站点可正常构建，因此即使外部步骤暂时无法完成，也应先提交代码部分，后续补配置值。

- [ ] **Step 1: 创建 GitHub 仓库并开启 Discussions**

```powershell
gh repo create apple-dev-weekly --public --description "Apple 开发者周刊 — 面向中国 Apple 开发者的资讯与教程站"
gh api repos/wx528/apple-dev-weekly -X PATCH -f has_discussions=true
```
Expected: 第一条输出仓库 URL；第二条返回 JSON 含 `"has_discussions": true`

- [ ] **Step 2: 安装 giscus App 并获取配置值**

1. 浏览器打开 <https://github.com/apps/giscus>，点击 Install，选择 `apple-dev-weekly` 仓库。
2. 打开 <https://giscus.app/zh-CN>，在「仓库」填 `wx528/apple-dev-weekly`，选择 Discussion 分类 `Announcements`。
3. 从页面底部生成的 `<script>` 代码中复制三个值：`data-repo-id`（形如 `R_kgDO...`）、`data-category-id`（形如 `DIC_kwDO...`）。`data-repo` 与 `data-category` 已知（`wx528/apple-dev-weekly` / `Announcements`）。

- [ ] **Step 3: 创建 src/components/Comments.astro**

```astro
---
import { GISCUS } from '../config';
---
{GISCUS.repoId && GISCUS.categoryId ? (
  <section class="comments">
    <script
      src="https://giscus.app/client.js"
      data-repo={GISCUS.repo}
      data-repo-id={GISCUS.repoId}
      data-category={GISCUS.category}
      data-category-id={GISCUS.categoryId}
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-theme="preferred_color_scheme"
      data-lang="zh-CN"
      data-loading="lazy"
      crossorigin="anonymous"
      async
    ></script>
  </section>
) : null}
```

- [ ] **Step 4: 创建 src/components/Analytics.astro**

```astro
---
import { ANALYTICS } from '../config';
---
{ANALYTICS.cloudflareToken ? (
  <script
    defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${ANALYTICS.cloudflareToken}"}`}
  ></script>
) : null}
```

- [ ] **Step 5: 修改 src/pages/news/[id].astro**

在 import 区加入：

```astro
import Comments from '../../components/Comments.astro';
```

将结尾的返回链接段落替换为：

```astro
    <p><a href="/news/">← 返回资讯列表</a></p>
    <Comments />
```

- [ ] **Step 6: 修改 src/pages/tutorials/[id].astro**

在 import 区加入：

```astro
import Comments from '../../components/Comments.astro';
```

将结尾的返回链接段落替换为：

```astro
    <p><a href="/tutorials/">← 返回教程列表</a></p>
    <Comments />
```

- [ ] **Step 7: 修改 src/layouts/Base.astro**

在 import 区加入：

```astro
import Analytics from '../components/Analytics.astro';
```

将 `</body>` 前一行改为：

```astro
    <Footer />
    <Analytics />
  </body>
```

（即 `</body>` 之前插入 `<Analytics />`。）

- [ ] **Step 8: 获取 Cloudflare Web Analytics token 并填入配置**

1. 注册/登录 <https://dash.cloudflare.com>（免费计划即可）。
2. 左侧菜单 → Analytics & Logs → Web Analytics → Add a site，填入 `https://apple-dev-weekly.pages.dev`（此时站点尚未部署也可先添加；若提示需验证，可等 Task 10 部署完成后回来补）。
3. 复制得到的 JS beacon token（32 位十六进制字符串）。

将三个值填入 `src/config.ts`（用 Step 2 / Step 8 获得的真实值替换空字符串）：

```ts
export const GISCUS = {
  repo: 'wx528/apple-dev-weekly',
  repoId: '<Step 2 获得的 data-repo-id>',
  category: 'Announcements',
  categoryId: '<Step 2 获得的 data-category-id>',
};

export const ANALYTICS = {
  cloudflareToken: '<Step 8 获得的 token>',
};
```

- [ ] **Step 9: 构建并断言**

Run: `npm run build`
Expected: `complete`。断言：

```powershell
(Select-String -Path dist\news\2026-08-18-eu-new-terms\index.html -Quiet -Pattern 'giscus.app/client.js'); (Select-String -Path dist\news\2026-08-18-eu-new-terms\index.html -Quiet -Pattern 'cloudflareinsights.com/beacon.min.js')
```
Expected: 均为 `True`（若 `config.ts` 尚未填入值则为 `False`——此时空实现不渲染，属预期）

- [ ] **Step 10: Commit**

```powershell
git add src
git commit -m "feat: add giscus comments and Cloudflare Web Analytics"
```

---

### Task 10: GitHub 推送 + Cloudflare Pages 部署 + Google Search Console

**Files:**
- Modify: `src/config.ts`（填入 `GOOGLE.siteVerification`，若选用 HTML 标记验证）
- Modify: `src/layouts/Base.astro`（无改动——`GOOGLE.siteVerification` 渲染逻辑已在 Task 3 实现）

**Interfaces:**
- Consumes: 全部前序任务的构建产物
- Produces: 生产站点 `https://apple-dev-weekly.pages.dev`（git push 自动部署）、GSC 收录入口

- [ ] **Step 1: 本地预览验收**

Run: `npm run preview`
Expected: 服务启动于 `http://localhost:4321/`。人工核对清单：导航五项可点、首页 4 条资讯 + 1 条教程、政策页 3 篇、标签页可跳转、`/rss.xml` 显示 5 条。核对后 Ctrl+C 停止。

- [ ] **Step 2: 推送到 GitHub**

```powershell
git remote add origin git@github.com:wx528/apple-dev-weekly.git
git push -u origin main
```
Expected: 推送成功（gh 已配置 SSH 协议）。若 SSH 失败，改用 `https://github.com/wx528/apple-dev-weekly.git` 并用 gh 认证。

- [ ] **Step 3: Cloudflare Pages 部署**

1. 登录 <https://dash.cloudflare.com> → Workers & Pages → Create → Pages 标签 → Connect to Git。
2. 授权并选择 `wx528/apple-dev-weekly` 仓库 → Begin setup。
3. Project name 填 `apple-dev-weekly`（决定子域名；若被占用换名，并按 Global Constraints 更新三处配置后重新构建推送）。
4. Production branch: `main`；Framework preset: `Astro`；Build command: `npm run build`；Build output directory: `dist`。Environment variables 无需添加。
5. Save and Deploy。
Expected: 数分钟后部署完成，`https://apple-dev-weekly.pages.dev` 可访问，构建日志无报错。

备选（不接 Git 的快速部署）：`npx wrangler login` 后执行 `npx wrangler pages deploy dist --project-name=apple-dev-weekly`。推荐主方案（获得 push 即部署的 CI）。

- [ ] **Step 4: 线上验证**

```powershell
Invoke-WebRequest -Uri "https://apple-dev-weekly.pages.dev" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
```
Expected: `200`

```powershell
(Invoke-WebRequest -Uri "https://apple-dev-weekly.pages.dev/rss.xml" -UseBasicParsing).Content.Contains('<item')
```
Expected: `True`

- [ ] **Step 5: Google Search Console 提交**

1. 打开 <https://search.google.com/search-console> → 添加资源 → URL 前缀 → 填 `https://apple-dev-weekly.pages.dev`。
2. 验证方式选「HTML 标记」，复制 `content="..."` 中的值。
3. 填入 `src/config.ts`：

```ts
export const GOOGLE = {
  siteVerification: '<GSC 提供的 content 值>',
};
```

4. 提交并推送：

```powershell
git add src/config.ts
git commit -m "chore: add GSC site verification"
git push
```

5. 等 Cloudflare Pages 自动重新部署完成后，回 GSC 点击「验证」。
6. GSC → 站点地图 → 提交 `sitemap-index.xml`。

- [ ] **Step 6: Commit（如有配置变更）**

```powershell
git status
```
Expected: `nothing to commit, working tree clean`（Step 5 已提交；若有遗漏文件，补充提交）。

---

## 运维备忘（计划外，上线后第一批内容操作）

- **9 月 9 日发布会快讯**：在 `src/content/news/` 新建 `2026-09-09-apple-event.md`（frontmatter 参照 Task 2 范式，`tags: [发布会]`，`source` 填 Apple Newsroom 链接），`git push` 后自动上线——这就是后续 AI 管线（Plan 2）要自动化的人工流程。
- 公众号、掘金等分发渠道开通按 spec 路线图执行，不涉及代码。
