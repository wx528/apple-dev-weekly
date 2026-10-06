---
title: "macOS 中完全磁盘访问权限的更新"
description: "Apple 宣布将在 macOS 中引入额外控制，要求用户通过非常明确的操作为 App 授予完全磁盘访问权限。"
pubDate: 2026-10-02
tags: [macOS, 政策]
source: https://developer.apple.com/news/?id=p6zjojqw
draft: true
---

## 背景

Apple 表示，其向开发者提供强大的 API，让 App 能为 Apple 产品构建出色的功能，同时以一系列控制机制保护用户的私人数据。完全磁盘访问（Full Disk Access）在很大程度上绕过了这些控制机制，以便备份类 App 能在 Mac 上正常运行。

## 现存问题

Apple 指出，一些开发者正在以可能使用户面临风险的方式使用完全磁盘访问，在用户未充分知情和理解的情况下，暴露其系统上的所有内容——包括文件、邮件、信息，甚至浏览历史记录。对于通信类 App，这还可能危及与用户通信的其他人的隐私。

## 后续措施

Apple 表示，今后将引入额外的控制机制，确保真正希望授予 App 这一特殊级别访问权限的用户，只能通过非常明确的用户操作来完成授权。

Apple 认为解决这一问题至关重要。随着 AI 智能体（AI agents）的能力和自主性不断增强，这一级别访问权限所带来的风险将大幅上升。Apple 承诺确保用户在授予此类访问权限之前清楚地了解这些风险，从而能够就自己的数据和隐私做出知情决定。

详见[原文](https://developer.apple.com/news/?id=p6zjojqw)
