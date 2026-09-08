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
