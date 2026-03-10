# ── 前端 Next.js Dockerfile（多阶段构建） ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 构建时注入环境变量（由 docker-compose 的 build.args 或 --build-arg 传入）
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 复制源码并构建
COPY . .
RUN npm run build

# ── 生产运行阶段 ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 只复制必要文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
