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
