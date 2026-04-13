# CherryPBX

## English

CherryPBX is an open-source management UI built on top of XSwitch.

Its goal is not to replace PBX backend capabilities. Instead, it provides a customizable frontend layer for common IP-PBX administration workflows and future domain-specific extensions such as call center tooling or voice application management.

### Related Products

- [XSwitch](https://xswitch.cn) is the backend VoIP platform.
- [Cherry Call](https://xswitch.cn/apps) is a related client application for calling, contacts, meetings, and settings.

### Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS v4
- `next-intl`
- Zustand
- local workspace package `@repo/api-client`

### Repository Layout

- Main application repository: `ippbx/`
- GitHub Wiki repository: `CherryPBX.wiki/`

### What Exists Today

The current codebase already includes:

- App Router pages under `app/[locale]/...`
- reusable UI components in `components/ui/`
- service helpers and auth state management
- a typed API client workspace package
- Docker build and runtime files
- English and Chinese message catalogs

## 中文

CherryPBX 是一个构建在 XSwitch 之上的开源管理界面。

它的目标不是替代 PBX 后端本身，而是在既有后端能力之上提供一个更容易定制、扩展和二次开发的前端管理层，用于承载常见的 IP-PBX 管理场景，以及未来更细分的业务场景，例如呼叫中心或语音应用管理。

### 相关产品

- [XSwitch](https://xswitch.cn) 是底层 VoIP 后端平台。
- [Cherry Call](https://xswitch.cn/apps) 是配套的电话、通讯录、会议和设置客户端。

### 技术栈

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS v4
- `next-intl`
- Zustand
- 本地工作区包 `@repo/api-client`

### 仓库关系

- 主应用仓库：`ippbx/`
- GitHub Wiki 仓库：`CherryPBX.wiki/`

### 当前代码里已经存在的部分

当前仓库已经包含：

- 位于 `app/[locale]/...` 的 App Router 页面
- 位于 `components/ui/` 的可复用 UI 组件
- 业务服务和认证状态管理
- 带类型定义的 API client 工作区包
- Docker 构建与运行文件
- 中英文消息字典
