---
title: "“影响是最大的惊喜”：Swiggy 转向原生应用获得回报"
description: "Swiggy 从 2024 年起将 Instamart 和 Dineout 转为原生应用，性能与业务指标显著提升。"
pubDate: 2026-09-01
tags: [iOS, Swift, SwiftUI]
source: https://developer.apple.com/news/?id=o5spbekm
draft: false
---

Swiggy 起初只是一家食品配送服务，如今已成为印度领先的按需便利平台，通过 Instamart 提供杂货、通过 Dineout 提供餐厅预订等服务。自 2024 年起，其应用由原生工具驱动，为数百万用户打造无缝移动体验。

## 转向原生应用的历程

Swiggy 的 iOS 开发团队表示，Swiggy Food 一直采用原生开发，但 Instamart 和 Dineout 最初是混合应用。随着业务快速扩张，性能和稳定性出现明显局限，于是在 2024 年初决定使用 Swift 和 SwiftUI 将其转为原生应用。团队首先聚焦高影响力的用户旅程，而非全面重写，从 Instamart 和 Dineout 的主页和搜索体验开始，在数周内交付首批原生体验，并逐步完成整体迁移。

## 原生化的动因与早期收益

随着 Instamart 规模扩大，团队遇到页面加载时间长、应用在大型 SKU 列表上挂起、内存压力大和动画不一致等问题；Dineout 的富媒体内容（高清图片和视频）也受限于混合架构。此外，团队希望利用 Core Animation 等原生能力和 Apple Intelligence 等新平台特性，并统一 Swiggy Food、Instamart 和 Dineout 的设计系统。转向原生后，用户立即感受到更快的加载时间、更流畅的滚动和动画，尤其在旧设备上差异明显。同时，设计一致性增强，组件复用更易，还解锁了 OCR 菜单搜索、杂货列表扫描和基于 Apple Intelligence 的摘要与比较等新功能。

## 社区反馈与意外收获

用户反馈积极，参与度、完成率和应用评分均有提升，社交媒体上也出现自发好评。工程师 Shashwat KN 表示，最大的惊喜是性能改进对业务指标的直接影响，转化率上升、跳出率下降。此外，原生能力激发了设计团队的创造力，他们开始尝试更复杂、更具吸引力的体验。

## 挑战与应对

团队在迁移过程中面临平衡速度与长期架构决策的挑战，最初偏向理想实现导致执行缓慢，后调整为迭代交付。同时，需在迁移期间保持功能同步，并协调混合与原生系统。设计方面，团队最初复制现有 UI，后转向采用原生设计模式并做小幅调整，提高了复用性并加速开发。

详见[原文](https://developer.apple.com/news/?id=o5spbekm)
