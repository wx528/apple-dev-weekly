---
title: "iPhone Duo 适配实战（一）：保留区域与 ArrangementView"
description: "基于 Xcode 27.1 beta 与官方 Tech Talks：reservedRegions API 查询铰链与摄像头区域，ArrangementView 构建自适应分栏，附完整代码与选型决策树。"
pubDate: 2026-09-22
tags: [iOS, SwiftUI]
source: https://developer.apple.com/videos/play/tech-talks/111463/
draft: false
---

iPhone Duo 上市倒计时 31 天，Xcode 27.1 beta 已就位。本系列基于官方 Tech Talks 与 SDK 实证，把适配拆成三步：**布局（本篇）→ 多显示与场景（下篇）→ 姿态交互（终篇）**。

## 先建立心智模型：Duo 不是「更大的 iPhone」

三个官方事实决定一切适配思路：

1. **Duo 是多块屏幕，各自有独立的 size class**——你已经在为 resizability 做的设计（iPad 那套）直接复用
2. **铰链和摄像头是「保留区域」（reserved regions）**——像 iPadOS 的窗口控件一样，是需要绕开布局的区域
3. **半折叠（书本姿态）会把内屏切成两个可用区域**——内容跨折痕显示会像书本跨页的图片一样断裂

## 第零步：先吃免费午餐

系统容器**自动适配折痕**，什么都不用写：

- 导航容器：`NavigationStack`、`NavigationSplitView`、`TabView`
- 内容容器：`List`、`ScrollView`

实测顺序应该是：先用 Xcode 27.1 的 Duo 模拟器（支持全部新姿态）跑一遍 App，统计哪些页面已经「免费」正常——通常比你预期的多。

## 第一步：用 reservedRegions 查询保留区域

折叠铰链是 **division 区域**（把大区域分割成小区域），FaceTime 摄像头是 **occlusion 区域**（遮挡）。SwiftUI 里通过 `GeometryProxy` 查询：

```swift
// SwiftUI：查询折痕 division 区域
GeometryReader { proxy in
  let regions = proxy.reservedRegions(kind: .division)
  let frames = regions.map(\.frame)
  // ...根据 frames 调整布局
}
```

```swift
// UIKit：UIView 上的同名方法
let regions = view.reservedRegions(kind: .division)
let frames = regions.map(\.frame)
```

两个关键细节：

**① 区域有 active/inactive 状态。** 折痕区域只在设备折叠时激活，展平时宽度为零、默认不返回。但可以用 `includeInactive` 查询未激活区域——经典用法是网格列数决策：

```swift
let regions = proxy.reservedRegions(
  kind: .division, options: .includeInactive)
// 只要有折痕（无论是否折叠），网格就偏好偶数列
```

**② occlusion 区域独立查询：**

```swift
let regions = proxy.reservedRegions(kind: .occlusion)
```

## 第二步：ArrangementView——官方替你写好的自适应分栏

iOS 27.1 新增的布局容器，介于导航容器和内容容器之间：**按规则排布两个视图，自动响应尺寸、比例与折痕**。官方播客 App 的例子：展开时「正在播放 + 文字稿」左右分栏，折叠时播放器留在左半区、控件保持可达。

```swift
// SwiftUI：primary + secondary
var body: some View {
  NavigationStack {
    ArrangementView {
      PlayerView()          // 主视图
    } secondary: {
      UpNextView()          // 次视图
    }
    .arrangementViewStyle(.split)   // 默认即 split
  }
}
```

```swift
// UIKit：UIArrangementViewController
let arrangementVC = UIArrangementViewController()
let nav = UINavigationController(rootViewController: arrangementVC)
arrangementVC.setViewController(PlayerViewController(), for: .primary)
arrangementVC.setViewController(UpNextViewController(), for: .secondary)
```

**split 的方向规则**：默认宽屏左右分、竖屏上下分；用 `axes` 锁定方向，且主轴无法分割时只显示单个视图：

```swift
.arrangementViewStyle(.split.axes(.horizontal))  // 只允许水平分割
```

**overlay 排布**：默认上下叠放，**折叠时反而变成并排**——给次视图腾出空间。用 `overlayArrangementZIndex` 环境值感知折叠前后：

```swift
struct UpNextView: View {
  @Environment(\.overlayArrangementZIndex) private var zIndex: Int

  var minimization: UpNextMinimization {
    zIndex > 0 ? .collapsed : .expanded
  }
  // 折叠时切换为紧凑版本，展开时完整版本
}
```

## 选型决策树（官方建议）

| 你的现状 | 选择 |
|---------|------|
| 已用 HStack/VStack 手写分栏 | → split arrangement |
| 已用 ZStack 叠放 | → overlay arrangement |
| 两视图是主从关系（都不该被遮挡，如播客+文字稿） | → split |
| 两视图是前景/背景关系（背景可部分遮挡，如阅读器控件） | → overlay |

**两条禁忌**：ArrangementView 不提供导航能力——不要把 `NavigationSplitView` 塞进去；也不要把 ArrangementView 放进 `List`/`ScrollView` 这类滚动容器。

## 本篇行动清单

1. Xcode 27.1 beta 装 Duo 模拟器，跑通全姿态（展开/书本半折/桌面支架/合盖外屏）
2. 盘点 App 里手写的居中布局与 HStack/ZStack 分栏——后者全部迁移到对应 arrangement
3. 只对**手动布局的最高优先级控件**接入 reservedRegions 自定义置换（displacement）

下篇讲多显示器与多场景架构（外屏/内屏切换、窗口生命周期）与折叠状态响应 API。

详见[官方 Tech Talks：Strike a pose with adaptive layouts on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111463/)（本文代码均出自官方示例）。
