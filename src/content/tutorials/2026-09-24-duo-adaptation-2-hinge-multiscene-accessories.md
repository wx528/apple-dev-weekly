---
title: "iPhone Duo 适配实战（二）：铰链交互、多窗口与场景配件"
description: "基于官方 Tech Talks 实证：onHingeChange 响应折叠角度驱动交互效果，多场景与外屏限制的处理，CameraCaptureAccessory 跨屏配件完整实战。"
pubDate: 2026-09-24
tags: [iOS, SwiftUI]
source: https://developer.apple.com/videos/play/tech-talks/111464/
draft: false
---

[系列第一篇](/tutorials/2026-09-22-duo-adaptation-1-reserved-regions-and-arrangementview/)解决了「布局怎么排」，本篇解决三个更进阶的问题：**铰链怎么玩、多窗口怎么开、内容怎么跨双屏**。距 Duo 上市 29 天。

## 一、铰链 API：把折叠角度变成交互语言

系统壁纸会随铰链角度缩放——你的 App 也可以。SwiftUI 提供 `onHingeChange` 修饰符，UIKit 对应 `UIHingeInteraction`，都能拿到：

- **离散状态**：`closed` / `partiallyOpen` / `fullyOpen`
- **连续角度**：实时更新的 `angle`

官方示例是一把「吉他」，用铰链模拟摇杆做弯音（pitch bend），代码演进四步：

```swift
struct InstrumentView: View {
    /// 归一化弯音值：0 无弯音，1 最深
    @State private var pitchBend: Double = 0

    var body: some View {
        GuitarView(pitchBend: pitchBend)
            .onHingeChange { _, context in
                // context.hinge 为 nil = 设备没有铰链（非 Duo）
                if let hinge = context.hinge,
                   hinge.status == .partiallyOpen {
                    pitchBend = calculatePitchBend(angle: hinge.angle)
                } else {
                    pitchBend = 0   // 别忘了重置
                }
            }
    }

    private func calculatePitchBend(angle: Angle) -> Double { /* ... */ }
}
```

三个实战要点：

1. **判空即兼容**：`context.hinge` 为 nil 直接走普通 iPhone 路径，同一份代码全设备运行
2. **只关心 `partiallyOpen`**：全开/合盖时业务上通常应复位（else 分支）
3. **职责边界（官方明确划线）**：铰链数据是**实时交互/特效**用的；**布局请用第一篇的 arrangement 与 reserved regions**，不要拿 hinge angle 算布局

## 二、多窗口：全 App 强制参赛 + 一个外屏大坑

Duo 的多任务规则：

- **所有 App 自动参与分屏**（两个 App 并排 + 视频/应用堆叠的新布局），处理方式与 iPad 一致：size class + scene geometry
- **Duo 是首个支持「App UI 多实例」的 iPhone**——iPad 上支持多窗口的 App 直接获得该能力

坑在这：**外屏不能创建新窗口，只有内屏可以**。这个可用性是动态的，所以：

- 请求新场景时**必须处理错误**
- UI 入口用 `UIWindowSceneActivationAction`——新窗口不可用时它**自动隐藏自己**，不用手动判断

```swift
// 系统在你无法建窗口的场合自动隐藏该按钮
let action = UIWindowSceneActivationAction { _ in
    // 请求新场景，处理可能的失败
}
```

## 三、场景配件：内容同时跨双屏

**Scene accessories** 让主 UI 之外的补充内容出现在另一块屏幕上（类似「iPhone 当外接显示器手柄」的机制，系统级支持）。特点：系统动态控制可用性、默认开启、用户可随时关——所以**必须监听可用性变化**。

Duo 上最典型的是**相机配件**：主拍摄 UI 留内屏，外屏显示给被拍的人看的内容。官方「提词器」完整示例：

```swift
struct CameraRootView: View {
    @State private var model = TeleprompterModel()

    var body: some View {
        CameraView(model: model)
            .sceneAccessory {
                CameraCaptureAccessory(isEnabled: $model.isEnabled) {
                    TeleprompterView(model: model)   // 外屏显示的内容
                }
                .onAvailabilityChange { newValue in
                    model.isAvailable = newValue     // 设备合上等场合会变不可用
                }
            }
            .toolbar {
                TeleprompterToggle(isEnabled: $model.isEnabled)
                    .disabled(!model.isAvailable)    // 不可用时禁用入口
            }
    }
}
```

注意 `sceneAccessory` 挂在与相机 UI **同一个视图**上——配件的生命周期自动跟随该视图。相机配件的可用条件：App 在内屏全屏 + 相机会话激活。

## API 选型速查

| 需求 | 用什么 |
|------|--------|
| 内容绕开铰链/摄像头排布 | reserved regions（第一篇） |
| 两栏内容自适应折叠 | ArrangementView（第一篇） |
| 折叠角度驱动特效/演奏类交互 | `onHingeChange` / `UIHingeInteraction` |
| 同一 App 开多个窗口 | 多场景 + `UIWindowSceneActivationAction`（记住外屏不能建） |
| 双屏同时显示不同内容 | `.sceneAccessory` + `CameraCaptureAccessory` |

## 行动清单

1. 找出 App 里「物理感」强的交互（播放器、画笔、游戏摇杆）——它们是 `onHingeChange` 的最佳候选
2. 如果 App 在 iPad 支持多窗口：在 Duo 模拟器验证外屏/内屏的新窗口入口行为
3. 相机类 App 优先做 `CameraCaptureAccessory`——这是 Duo 上最出效果的差异化功能

系列第三篇（姿态实战与上市冲刺清单）将在 10 月中旬、Duo 上市前发布。

详见[官方 Tech Talks：Leverage multiple displays and scenes on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111464/)（本文代码均出自官方示例）。
