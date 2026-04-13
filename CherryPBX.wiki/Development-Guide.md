# Development Guide

## English

### Common Commands

```bash
make install
make dev
make build
make start
make check
```

### What They Do

- `make install`: installs project dependencies with `pnpm install`
- `make dev`: runs `pnpm dev`
- `make build`: runs `pnpm build`
- `make start`: runs `pnpm start`
- `make check`: runs formatting, linting, and type checking

### Workspace Build Flow

The application depends on a local workspace package:

- `packages/api-client`

The root scripts build that package before starting development or production, so API types and request factories stay aligned with the app.

### Build Behavior

- development script: `pnpm --filter @repo/api-client build && next dev`
- production build: `pnpm build:api-client && next build --webpack`
- production start: `pnpm build:api-client && next start`

The explicit webpack build path is part of the current repository configuration.

### Important Files

- `package.json`
- `Makefile`
- `next.config.ts`
- `lib/api-client.ts`
- `lib/api-base-url.ts`
- `docker/Makefile`

## 中文

### 常用命令

```bash
make install
make dev
make build
make start
make check
```

### 命令说明

- `make install`：执行 `pnpm install` 安装依赖
- `make dev`：执行 `pnpm dev`
- `make build`：执行 `pnpm build`
- `make start`：执行 `pnpm start`
- `make check`：执行格式化、lint 和类型检查

### 工作区构建链路

主应用依赖一个本地工作区包：

- `packages/api-client`

根目录脚本会在开发和生产启动前先构建这个包，从而保证 API 类型和请求工厂与主应用保持同步。

### 当前构建行为

- 开发脚本：`pnpm --filter @repo/api-client build && next dev`
- 生产构建：`pnpm build:api-client && next build --webpack`
- 生产启动：`pnpm build:api-client && next start`

显式使用 webpack 是当前仓库的既有配置。

### 重点文件

- `package.json`
- `Makefile`
- `next.config.ts`
- `lib/api-client.ts`
- `lib/api-base-url.ts`
- `docker/Makefile`
