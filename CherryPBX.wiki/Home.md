# CherryPBX Wiki

## English

CherryPBX is an open-source Web UI for IP-PBX systems powered by XSwitch.

This wiki is generated from the current `ippbx` repository structure and focuses on the parts that already exist in code today: application architecture, feature modules, local development, Docker deployment, API integration, and internationalization.

### Recommended Reading

- [Project Overview](CherryPBX)
- [Getting Started](Getting-Started)
- [Feature Modules](Feature-Modules)
- [Environment Variables](Environment-Variables)
- [Development Guide](Development-Guide)
- [Docker Deployment](Docker-Deployment)
- [Project Structure](Project-Structure)
- [API Client](API-Client)
- [Internationalization and Routing](Internationalization-and-Routing)

### Current Functional Coverage

The current repository already contains pages or modules for:

- Dashboard and diagnostics
- Login and authentication
- Users and extensions
- Routes, gateways, and trunks
- DID, DOD, IVR, conference, and feature codes
- CDR, logs, media, SIP, ACL, blacklist, IP blacklist, backup, license, number transform, and time rules

### Architecture Snapshot

- The browser calls same-origin `/api/...` endpoints.
- Next.js rewrites proxy those requests to the configured XSwitch backend.
- The UI uses a local workspace package, `@repo/api-client`, for typed API access.
- Public URLs do not expose locale prefixes even though the app is locale-aware internally.

## 中文

CherryPBX 是一个面向 XSwitch 的开源 IP-PBX Web 管理界面。

这套 wiki 基于当前 `ippbx` 仓库代码生成，重点覆盖当前代码中已经存在的内容，包括应用架构、功能模块、本地开发、Docker 部署、API 集成和国际化方案。

### 推荐阅读

- [项目概览](CherryPBX)
- [快速开始](Getting-Started)
- [功能模块](Feature-Modules)
- [环境变量](Environment-Variables)
- [开发指南](Development-Guide)
- [Docker 部署](Docker-Deployment)
- [项目结构](Project-Structure)
- [API Client](API-Client)
- [国际化与路由](Internationalization-and-Routing)

### 当前功能覆盖范围

当前仓库已经包含以下页面或模块：

- Dashboard 与 diagnostics
- 登录与认证
- 用户与分机
- 路由、网关与 trunks
- DID、DOD、IVR、会议与功能码
- CDR、日志、媒体、SIP、ACL、黑名单、IP 黑名单、备份、License、号码变换和时间规则

### 当前架构要点

- 浏览器优先请求同源 `/api/...`。
- Next.js 使用 rewrites 将请求转发到配置好的 XSwitch 后端。
- 前端通过本地工作区包 `@repo/api-client` 统一访问接口。
- 应用内部支持多语言，但公开 URL 不直接暴露语言前缀。
