---
title: "macOS 27.3 beta 2 调整 Device Control and Data Access 与 Full Disk Access"
description: "macOS 27.3 beta 2 拆分权限设置、细化授权粒度，并新增透明度提示，开发者需适配有限权限场景。"
pubDate: 2026-11-16
tags: [macOS, 政策, 生态]
source: https://developer.apple.com/news/?id=oqng0zjk
draft: true
---

Apple 在 macOS 27.3 beta 2 中更新了 Device Control and Data Access 与 Full Disk Access 两项 API 的权限机制，目标是提升透明度并给用户更细粒度的选择。Apple 表示，在授予应用此类特殊访问权限前，用户应了解这会让 Mac 上的所有数据面临风险，这些改动旨在帮助用户做出知情决定。

## 主要变化

- 将 Device Control and Data Access 拆分为两个设置：System & App Protection Override 与 Accessibility
- 提供单一授权方式：用户从列表中选择发起请求的应用
- 引导用户仅授予工作流所需的特定应用（System & App Protection Override）或文件夹（Full Disk Access）
- 提高可见性，让用户了解授予完整权限后应用可访问或控制的数据范围
- 用户可将应用配置为每次需要访问时都询问
- 当请求应用通过 System & App Protection Override 控制另一应用时，显示透明度指示

## 开发者注意事项

开发者应准备调整用户引导流程，并确保应用在使用这些 API 时能妥善处理仅获得有限文件夹或应用访问权限的情况。用户将在批准新的应用权限请求时看到这些更新。此前已授予的所有应用权限将继续有效。

对于使用 Full Disk Access 进行磁盘备份，或使用新的 Accessibility 设置提供辅助技术的应用，开发者可以申请 entitlement，以便在 macOS 27.3 之后的新安装中提供与之前相同的体验。目前已知应用不受影响，无需 entitlement 即可保持相同体验。更多 entitlement 细节将很快公布。

详见[原文](https://developer.apple.com/news/?id=oqng0zjk)
