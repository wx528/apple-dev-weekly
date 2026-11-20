---
title: "macOS 27.3 beta 2 中设备控制与数据访问及完全磁盘访问权限的更新"
description: "macOS 27.3 beta 2 调整设备控制与数据访问及完全磁盘访问权限，提供更细粒度选项与更高透明度。"
pubDate: 2026-11-16
tags: [macOS, 政策, 审核]
source: https://developer.apple.com/news/?id=oqng0zjk
draft: true
---

Apple 在 macOS 27.3 beta 2 中对两项 API 的权限机制进行了更新：Device Control and Data Access，以及 Full Disk Access。Apple 表示，在授予 App 这类特殊访问权限之前，用户应当了解这会使其 Mac 上的所有数据面临风险；这些变更旨在帮助用户理解这一点，并让用户能够就自己的数据与隐私做出知情决定。

## 主要变更

- 将 Device Control and Data Access 拆分为两项设置：(1) System & App Protection Override，(2) Accessibility
- 提供单一授权方式：用户从列表中选择发起请求的 App
- 引导用户仅向工作流所需的特定 App（针对 System & App Protection Override）或文件夹（针对 Full Disk Access）授予访问权限
- 提高可见性，让用户了解在授予完整权限后，App 将可访问或控制哪些范围广泛的数据
- 用户可选择将 App 配置为每次需要访问时都进行询问
- 当发起请求的 App 通过 System & App Protection Override 控制另一个 App 时，显示透明度指示器

## 对开发者的影响

开发者应准备好调整用户引导流程，并确保 App 在使用这些 API 时，能够妥善处理仅能访问有限文件夹或 App 的情况。用户批准新的 App 权限请求时将看到这些更新。此前用户已授予的所有 App 权限将继续有效。

对于使用 Full Disk Access 进行磁盘备份，或使用新的 Accessibility 设置提供辅助技术的 App，其开发者可以申请 entitlement，以便在 macOS 27.3 之后的新安装中提供与之前相同的体验。目前，已知 App 不受影响，无需 entitlement 即可保持相同体验。更多 entitlement 细节将很快公布。

详见[原文](https://developer.apple.com/news/?id=oqng0zjk)
