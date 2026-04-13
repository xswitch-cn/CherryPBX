# Environment Variables

## English

### Application `.env`

The main application uses variables from `.env`:

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://demo.xswitch.cn"
```

### `NEXT_PUBLIC_BACKEND_URL`

This is the frontend API base used by the browser-side application.

In the current architecture it should normally stay:

```env
NEXT_PUBLIC_BACKEND_URL="/"
```

That keeps browser requests same-origin.

### `NEXT_PUBLIC_BACKEND_URL_TARGET`

This is the real backend root URL used by Next.js rewrites:

```env
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

Do not append `/api` to this value.

### Request Flow

The current request chain is:

1. The browser calls `/api/...`.
2. Next.js receives the same-origin request.
3. `rewrites()` forwards it to `NEXT_PUBLIC_BACKEND_URL_TARGET/api/...`.

This avoids direct browser CORS calls in local development and Docker deployment.

### Docker `.env`

Docker uses a separate file in `docker/.env`, but the variable names are the same:

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

## 中文

### 应用 `.env`

主应用通过 `.env` 使用以下变量：

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://demo.xswitch.cn"
```

### `NEXT_PUBLIC_BACKEND_URL`

这是浏览器侧前端使用的 API 基础路径。

在当前架构下，通常应该保持：

```env
NEXT_PUBLIC_BACKEND_URL="/"
```

这样浏览器请求就会保持同源。

### `NEXT_PUBLIC_BACKEND_URL_TARGET`

这是 Next.js rewrites 实际转发到的后端根地址：

```env
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

这个值不要追加 `/api`。

### 请求链路

当前请求流程如下：

1. 浏览器访问 `/api/...`
2. Next.js 接收这个同源请求
3. `rewrites()` 将它转发到 `NEXT_PUBLIC_BACKEND_URL_TARGET/api/...`

这样本地开发和 Docker 部署时都可以避免浏览器直接跨域请求后端。

### Docker `.env`

Docker 使用单独的 `docker/.env` 文件，但变量名保持一致：

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```
