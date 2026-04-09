# CherryPBX

一个轻量级的 IP-PBX 系统 Web UI，后端使用 XSwitch。

目前仍处于早期开发阶段，但我们选择公开构建，这样每个人都可以了解我们的进展。

## 关于 XSwitch

[XSwitch](https://xswitch.cn) 是一个基于 FreeSWITCH 的 VoIP 系统。它可以作为 IP-PBX、视频会议系统、呼叫中心服务器，或者作为连接电信运营商、其他 SIP 服务、WebRTC 和 LLM 服务的网关。

XSwitch 有一个很棒的 Web UI（XUI），但它不是开源的。人们经常提出各种功能需求，这些功能虽然合理且有用，但远远超出了 XUI 的设计范围，XUI 主要专注于 FreeSWITCH 管理。

这就是我们创建 CherryPBX 的原因——构建一个开源的 IP-PBX Web UI，让每个人都能使用并根据自己的特定需求进行定制。XSwitch 提供了强大而全面的 API，因此你可以构建各种类型的系统——呼叫中心、语音代理等。

## 关于 小樱桃电话

[小樱桃电话](https://xswitch.cn/apps) 是一个集电话、通讯录、会议、设置功能于一身的简洁版 App，支持音视频高清通话和会议功能。可以和 CherryPBX 配合使用。

## 技术栈

- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS v4 + shadcn/ui

例如：

```
$ pnpm --version && node --version
9.5.0
v22.12.0
```

## 环境配置

创建 `.env`

```sh
make env
```

如果你的电脑没有 `make` 命令，请查看 Makefile 了解如何手动创建。

在开发或运行应用之前，请将 `BACKEND_URL` 修改为你的 XSwitch 服务器地址。默认值为 `https://demo.xswitch.cn`，这是一个公开演示站点。访问 https://docs.xswitch.cn/faq/#demo 查看登录用户名和密码。如果你在本地安装了 XSwitch，你也可以指向你本地的地址，如：`http://localhost:8081`。

## 安装依赖项

开发和生产之前都要执行以下命令：

```bash
make install
```

## 开发

```bash
make dev
```

## 构建

```bash
make build
```

## 代码检查

```bash
make check
```
