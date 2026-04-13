# Docker Deployment

## English

### Overview

The current Docker setup splits image building and container orchestration:

- `docker/Makefile` builds the production image with `docker build`
- `docker/compose.yaml` starts and stops the already-built image

### Relevant Files

- `docker/Dockerfile`
- `docker/Makefile`
- `docker/compose.yaml`
- `docker/.env.example`

### Prepare Environment

```bash
cd docker
cp .env.example .env
```

Recommended values:

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

### Build Image

```bash
cd docker
make build-production
```

By default the image name is `ippbx` and the image tag comes from the root `package.json` version unless overridden.

### Create External Network

`compose.yaml` expects an external Docker network named `webapp`:

```bash
cd docker
make network
```

### Start and Stop

```bash
cd docker
make start-production
make stop-production
```

### Runtime Notes

- the container runs the standalone Next.js output
- the app listens on port `3000`
- the default published port is `3003:3000`
- `compose.yaml` does not build the image for you

## 中文

### 总览

当前 Docker 方案把镜像构建和容器编排分开处理：

- `docker/Makefile` 负责用 `docker build` 构建生产镜像
- `docker/compose.yaml` 只负责启动和停止已经构建好的镜像

### 相关文件

- `docker/Dockerfile`
- `docker/Makefile`
- `docker/compose.yaml`
- `docker/.env.example`

### 准备环境

```bash
cd docker
cp .env.example .env
```

推荐配置：

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

### 构建镜像

```bash
cd docker
make build-production
```

默认镜像名是 `ippbx`，镜像标签默认取自主项目 `package.json` 的版本号，除非手动覆盖。

### 创建外部网络

`compose.yaml` 依赖一个名为 `webapp` 的外部 Docker 网络：

```bash
cd docker
make network
```

### 启动与停止

```bash
cd docker
make start-production
make stop-production
```

### 运行说明

- 容器运行的是 Next.js standalone 产物
- 应用监听端口为 `3000`
- 默认发布端口为 `3003:3000`
- `compose.yaml` 本身不会帮你构建镜像
