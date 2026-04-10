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

在开发或运行应用之前，请先配置环境变量：

- `NEXT_PUBLIC_BACKEND_URL` 是前端请求前缀，通常保持为 `/` 即可。
- `NEXT_PUBLIC_BACKEND_URL_TARGET` 是实际的 XSwitch 后端根地址。默认值为 `https://demo.xswitch.cn`，这是一个公开演示站点。访问 https://docs.xswitch.cn/faq/#demo 查看登录用户名和密码。如果你在本地安装了 XSwitch，也可以改为你自己的地址，例如 `http://localhost:8081`。

浏览器端实际会优先请求同源的 `/api/...`，再由 Next.js 通过 rewrites 代理到 `NEXT_PUBLIC_BACKEND_URL_TARGET`，这样本地开发和 Docker 部署时都能避免 CORS 问题。

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

## Docker 构建

Docker 部署文件位于 [`docker/`](./docker) 目录。

构建镜像前，请先配置 [`docker/.env`](./docker/.env)，或者从示例文件复制：

```bash
cd docker
cp .env.example .env
```

Docker 环境变量建议这样配置：

```env
NEXT_PUBLIC_BACKEND_URL="/"
```

构建并启动生产容器：

```bash
cd docker
make build-production
make start-production
```

停止生产容器：

```bash
cd docker
make stop-production
```

说明：

- `NEXT_PUBLIC_BACKEND_URL` 通常保持为 `/`。
- Docker 镜像内部会使用 `next build --webpack` 构建，并以 standalone 模式在 `3000` 端口运行。
- [`docker/compose.yaml`](./docker/compose.yaml) 依赖一个名为 `webapp` 的外部 Docker 网络；如果不存在，请先执行 `docker network create webapp`。

## 代码检查

```bash
make check
```
