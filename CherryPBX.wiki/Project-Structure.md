# Project Structure

## English

### Top-Level Directories

The current repository is organized around these main areas:

- `app/`: Next.js App Router pages and layouts
- `components/`: shared UI and business components
- `lib/`: runtime helpers such as API client initialization
- `services/`: higher-level service wrappers
- `stores/`: client-side state management
- `i18n/`: locale configuration and request helpers
- `messages/`: translation dictionaries
- `packages/api-client/`: local workspace package for typed backend access
- `docker/`: container build and runtime assets

### App Router Surface

The main pages live under `app/[locale]/...`.

Current route areas include:

- `dashboard`
- `diagnostics`
- `login`
- `users`
- `extensions`
- `gateways`
- `routes`
- `trunks`
- `ivr`
- `media`
- `cdr`
- `did`
- `dod`
- `conference`
- `logs`
- `sip`
- `acl`
- `blacklist`
- `ip-blacklist`
- `backup`
- `license`
- `feature-codes`
- `number-transform`
- `time-rules`

### Shared Runtime Modules

- `lib/api-base-url.ts`: resolves the frontend API base URL
- `lib/api-client.ts`: creates shared API singletons for the app
- `navigation.ts`: wraps locale-aware navigation helpers
- `i18n/config.ts`: defines supported locales and default locale

### Workspace Package Role

`packages/api-client` contains:

- client creation logic
- auth helpers
- grouped API factories
- shared request and response types
- transport and error handling utilities

It is part of the application workspace, not a separately maintained external SDK.

## 中文

### 顶层目录

当前仓库主要由以下部分组成：

- `app/`：Next.js App Router 页面和布局
- `components/`：共享 UI 组件和业务组件
- `lib/`：运行时辅助模块，例如 API client 初始化
- `services/`：更高层的业务服务封装
- `stores/`：客户端状态管理
- `i18n/`：语言配置和请求辅助逻辑
- `messages/`：翻译字典
- `packages/api-client/`：用于类型化后端访问的本地工作区包
- `docker/`：容器构建和运行资源

### App Router 页面范围

主要页面位于 `app/[locale]/...`。

当前路由区域包括：

- `dashboard`
- `diagnostics`
- `login`
- `users`
- `extensions`
- `gateways`
- `routes`
- `trunks`
- `ivr`
- `media`
- `cdr`
- `did`
- `dod`
- `conference`
- `logs`
- `sip`
- `acl`
- `blacklist`
- `ip-blacklist`
- `backup`
- `license`
- `feature-codes`
- `number-transform`
- `time-rules`

### 共享运行时模块

- `lib/api-base-url.ts`：解析前端 API 基础地址
- `lib/api-client.ts`：为应用创建共享 API 单例
- `navigation.ts`：封装带语言感知的导航辅助
- `i18n/config.ts`：定义支持语言和默认语言

### 工作区包职责

`packages/api-client` 当前承载：

- 请求客户端创建逻辑
- 认证辅助逻辑
- 按业务分组的 API 工厂
- 公共请求与响应类型
- transport 和错误处理工具

它属于应用工作区的一部分，不是独立维护的外部 SDK。
