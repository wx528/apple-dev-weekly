---
title: "macOS 27.3 beta 2 中设备控制与数据访问及完全磁盘访问权限的更新"
description: "macOS 27.3 beta 2 调整设备控制与数据访问、完全磁盘访问权限，提供更细粒度选项与更高透明度。"
pubDate: 2026-11-16
tags: [macOS, 政策, 生态]
source: https://developer.apple.com/news/?id=oqng0zjk
draft: true
---

Apple 在 macOS 27.3 beta 2 中更新了 Device Control and Data Access 与 Full Disk Access 两项 API 的权限机制，旨在提升透明度并提供更细粒度的选项。Apple 表示，在授予应用此类特殊访问权限之前，用户应了解这会让 Mac 上的所有数据面临风险，这些改动正是为了帮助用户做出知情的数据与隐私决策。

## 主要改动

- 将 Device Control and Data Access 拆分为两项设置：(1) System & App Protection Override，(2) Accessibility
- 提供单一授权方式：用户从列表中选择发起请求的应用
- 引导用户仅向工作流所需的特定应用（针对 System & App Protection Override）或文件夹（针对 Full Disk Access）授予访问权限
- 提升可见性，让用户了解若授予完整权限，应用将可访问或控制哪些范围的数据
- 用户可选择将应用配置为每次需要访问时都询问
- 当发起请求的应用通过 System & App Protection Override 控制另一应用时，显示透明度指示器

## 对开发者的影响

开发者应准备好调整用户引导流程，并确保应用在使用这些 API 时，能够妥善处理仅获得有限文件夹或应用访问权限的情况。用户批准新的应用权限请求时将看到这些更新。此前用户已授予的所有应用权限将继续有效。

对于使用 Full Disk Access 进行磁盘备份，或使用新的 Accessibility 设置为辅助技术提供支持的应用，其开发者可以申请 entitlement，以便在 macOS 27.3 上的新安装中提供与之前相同的体验。目前，已知应用不受影响，无需 entitlement 即可保持相同体验。更多 entitlement 细节将很快公布。

详见[原文](https://developer.apple.com/news/?id=oqng0zjk)
