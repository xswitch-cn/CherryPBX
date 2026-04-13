# Getting Started

## English

### Requirements

- Node.js 20 or newer
- pnpm
- access to an XSwitch backend

The repository README currently shows this example toolchain:

```bash
pnpm --version
node --version
```

### Initial Setup

```bash
git clone <your-repo-url>
cd ippbx
make env
make install
```

If `make` is not available, create `.env` from `.env.example` manually and run `pnpm install`.

### Configure Backend Access

Set the runtime variables in `.env`:

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://demo.xswitch.cn"
```

- `NEXT_PUBLIC_BACKEND_URL` should usually remain `/`.
- `NEXT_PUBLIC_BACKEND_URL_TARGET` must point to the real backend root URL.
- Do not include `/api` in `NEXT_PUBLIC_BACKEND_URL_TARGET`.

### Start Development

```bash
make dev
```

This runs `pnpm dev`, which builds the workspace API client first and then starts the Next.js development server.

### Build and Check

```bash
make build
make check
```

`make build` produces the production build. `make check` runs formatting, linting, and type checking.

## 中文

### 环境要求

- Node.js 20 或更高版本
- pnpm
- 一个可访问的 XSwitch 后端

当前仓库 README 给出的工具链示例如下：

```bash
pnpm --version
node --version
```

### 初始安装

```bash
git clone <your-repo-url>
cd ippbx
make env
make install
```

如果本机没有 `make`，就手动从 `.env.example` 创建 `.env`，然后执行 `pnpm install`。

### 配置后端访问

在 `.env` 中设置运行时变量：

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://demo.xswitch.cn"
```

- `NEXT_PUBLIC_BACKEND_URL` 通常保持为 `/`
- `NEXT_PUBLIC_BACKEND_URL_TARGET` 必须指向真实后端根地址
- `NEXT_PUBLIC_BACKEND_URL_TARGET` 不要带 `/api`

### 启动开发环境

```bash
make dev
```

这个命令会执行 `pnpm dev`，先构建工作区里的 API client，再启动 Next.js 开发服务器。

### 构建与检查

```bash
make build
make check
```

`make build` 负责生产构建，`make check` 会执行格式化、lint 和类型检查。
