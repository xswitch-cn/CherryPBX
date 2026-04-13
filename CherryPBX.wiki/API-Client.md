# API Client

## English

### Overview

CherryPBX uses a local workspace package:

- `@repo/api-client`

This package centralizes backend communication, request paths, response types, auth helpers, and error handling.

### Code Location

- `packages/api-client/`

### What It Provides

- `createClient()` for the shared HTTP client
- grouped API factories such as auth, routes, gateways, users, extensions, CDR, DOD, media files, dashboard, and configs
- common TypeScript domain types
- token store interfaces and auth application helpers
- transport and API error utilities

### App Integration

The main app wires the package in `lib/api-client.ts`.

That file currently:

- creates the shared `ApiClient`
- uses a Zustand-backed token store
- enables credentialed requests
- clears auth state and redirects to `/login` on auth failure
- exports API singletons such as `routesApi`, `gatewaysApi`, `usersApi`, `authApi`, and others

### URL Convention

The current application uses `/api/...` as the frontend request prefix.

The browser calls same-origin `/api/...`, and Next.js rewrites proxy those requests to the real backend target.

## 中文

### 概览

CherryPBX 使用一个本地工作区包：

- `@repo/api-client`

这个包把后端通信、请求路径、响应类型、认证辅助逻辑和错误处理集中管理。

### 代码位置

- `packages/api-client/`

### 提供的能力

- 用于创建共享 HTTP 客户端的 `createClient()`
- 按业务分组的 API 工厂，例如 auth、routes、gateways、users、extensions、CDR、DOD、media files、dashboard、configs
- 公共 TypeScript 领域类型
- token store 接口和认证辅助逻辑
- transport 与 API 错误处理工具

### 在主应用中的接入方式

主应用在 `lib/api-client.ts` 中接入这个包。

该文件当前会：

- 创建共享 `ApiClient`
- 使用基于 Zustand 的 token store
- 启用带凭据的请求
- 在认证失败时清理登录状态并跳转到 `/login`
- 导出 `routesApi`、`gatewaysApi`、`usersApi`、`authApi` 等 API 单例

### URL 约定

当前应用统一以 `/api/...` 作为前端请求前缀。

浏览器先请求同源 `/api/...`，再由 Next.js rewrites 转发到真实后端。
