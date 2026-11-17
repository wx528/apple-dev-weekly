---
title: "macOS 27.3 beta 2 中设备控制与数据访问及完全磁盘访问权限的更新"
description: "Apple 在 macOS 27.3 beta 2 中为设备控制与数据访问、完全磁盘访问引入更细粒度权限选项与更高透明度。"
pubDate: 2026-11-16
tags: [macOS, 政策, 生态]
source: https://developer.apple.com/news/?id=oqng0zjk
draft: true
---

Apple 于 2026 年 11 月 16 日发布资讯，介绍 macOS 27.3 beta 2 中针对 Device Control and Data Access 与 Full Disk Access 两项 API 的权限机制更新。Apple 表示，这些改动旨在提升透明度并提供更细粒度的选项，帮助用户在授予应用此类高权限前理解其可能使 Mac 上的全部数据面临风险，从而对自身数据与隐私做出知情决定。

## 主要变化

- 将 Device Control and Data Access 拆分为两项设置：(1) System & App Protection Override，(2) Accessibility
- 提供单一授权方式：用户从列表中选择发起请求的应用
- 引导用户仅向工作流所需的特定应用（针对 System & App Protection Override）或文件夹（针对 Full Disk Access）授予访问权限
- 提升可见性，让用户了解若授予完整权限，应用将可访问或控制哪些范围的数据
- 用户可选择将应用配置为每次需要访问时都进行询问
- 当发起请求的应用通过 System & App Protection Override 控制另一应用时，显示透明度指示

## 对开发者的影响

Apple 提醒开发者应准备好调整用户引导流程，并确保应用在使用这些 API 时，能够妥善处理仅获得有限文件夹或应用访问权限的情况。用户在批准新的应用权限请求时将看到上述更新；此前已授予的所有应用权限将继续有效。

对于使用 Full Disk Access 进行磁盘备份，或使用新的 Accessibility 设置提供辅助技术的应用，开发者可以申请 entitlement，以便在 macOS 27.3 上的新安装中提供与之前相同的体验。Apple 表示，目前已知应用不受影响，无需 entitlement 即可保持相同体验，更多 entitlement 细节将很快公布。

详见[原文](https://developer.apple.com/news/?id=oqng0zjk)
