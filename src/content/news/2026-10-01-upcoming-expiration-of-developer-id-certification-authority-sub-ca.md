---
title: "Developer ID Certification Authority（Sub-CA）即将到期"
description: "原 Developer ID Certification Authority（Sub-CA）将于 2027 年 2 月 1 日到期，开发者需更换新证书并重新签名。"
pubDate: 2026-10-01
tags: [macOS, 工具链, 生态]
source: https://developer.apple.com/news/?id=w4atic4c
draft: false
---

## 到期时间

Apple 发布通知称，最初的 Developer ID Certification Authority（Sub-CA）将于 2027 年 2 月 1 日到期。由该机构签发的证书将在该日期停止工作。

## 需要采取的操作

- **检查是否受影响。** 在 Certificates, Identifiers & Profiles 中，查找到期日期为 2027 年 2 月 1 日或之前的证书。可参阅“Replacing Developer ID certificates issued from the previous Sub-CA”以帮助识别证书所属的签发机构。
- **创建新证书。** 从当前机构 Developer ID Certification Authority（G2）生成替代证书。注意：该证书颁发机构有效期至 2031 年，但由其签发的证书每年到期，必须每年续期。
- 如果你使用的是 Xcode 11.4 或更早版本，请在创建新证书前先更新。
- 当系统提示选择 Developer ID Certificate Intermediary 时，请选择 G2 Sub-CA。选择其他选项可能会签发同样在 2027 年到期的证书。

## 根据分发内容重新签名

- **安装包（.pkg）：** 从 2027 年 2 月 1 日起，使用受影响证书签名的 .pkg 文件将无法安装。请在此日期之前用新证书重新签名所有安装包。
- **Mac 应用：** 此前已签名并经过公证（带有安全时间戳）的 Mac 软件将继续正常工作，无需采取任何操作。对于未来的更新，请使用新证书签名，并包含用于公证的安全时间戳。

详见[原文](https://developer.apple.com/news/?id=w4atic4c)
