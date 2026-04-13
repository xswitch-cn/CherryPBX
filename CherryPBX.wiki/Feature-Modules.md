# Feature Modules

## English

The current codebase already exposes a broad administration surface through App Router pages under `app/[locale]/...`.

### Core Access

- `login`: authentication entry page
- `dashboard`: overview page and sidebar-driven shell
- `diagnostics`: runtime and system diagnostics

### User and Extension Management

- `users`: user records
- `extensions`: extension management
- `feature-codes`: feature code configuration

### Call Routing and Connectivity

- `routes`: route management
- `gateways`: gateway list and gateway detail pages
- `trunks`: trunk management
- `sip`: SIP-related page
- `acl`: ACL page
- `blacklist`: blacklist management
- `ip-blacklist`: IP blacklist management

### Numbering and Voice Flows

- `did`: inbound number management
- `dod`: outbound number management
- `number-transform`: number translation rules
- `time-rules`: time-based rules
- `ivr`: IVR flows
- `conference`: conference management

### Operations and Assets

- `cdr`: call detail records
- `logs`: logs page
- `media`: media file management
- `backup`: backup page
- `license`: license page

## 中文

当前代码库已经通过 `app/[locale]/...` 下的 App Router 页面提供了比较完整的管理界面范围。

### 核心入口

- `login`：登录入口页
- `dashboard`：总览页和侧边栏主框架
- `diagnostics`：运行状态和系统诊断

### 用户与分机管理

- `users`：用户记录
- `extensions`：分机管理
- `feature-codes`：功能码配置

### 呼叫路由与连接能力

- `routes`：路由管理
- `gateways`：网关列表和详情页
- `trunks`：Trunk 管理
- `sip`：SIP 相关页面
- `acl`：ACL 页面
- `blacklist`：黑名单管理
- `ip-blacklist`：IP 黑名单管理

### 号码与语音流程

- `did`：来电号码管理
- `dod`：去电号码管理
- `number-transform`：号码变换规则
- `time-rules`：时间规则
- `ivr`：IVR 流程
- `conference`：会议管理

### 运维与资源

- `cdr`：通话详单
- `logs`：日志页面
- `media`：媒体文件管理
- `backup`：备份页面
- `license`：License 页面
