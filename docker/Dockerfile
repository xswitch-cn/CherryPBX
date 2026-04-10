# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.5.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api-client/package.json ./packages/api-client/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder

ARG NEXT_PUBLIC_BACKEND_URL=/
ARG NEXT_PUBLIC_BACKEND_URL_TARGET=
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_BACKEND_URL_TARGET=${NEXT_PUBLIC_BACKEND_URL_TARGET}

COPY --from=deps /app/ ./
COPY . .

RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

ARG APP_VERSION=dev

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

LABEL org.opencontainers.image.version=${APP_VERSION}

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
