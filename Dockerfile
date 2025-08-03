# 多阶段构建 Dockerfile

# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app/web

# 安装 pnpm
RUN npm install -g pnpm

# 复制前端 package.json 和 pnpm-lock.yaml
COPY web/package.json web/pnpm-lock.yaml ./

# 复制 packages 目录（前端依赖的内部包）
COPY web/packages ./packages

# 安装前端依赖
RUN pnpm install --frozen-lockfile

# 复制前端源代码
COPY web/ .

# 构建前端应用
RUN pnpm run build

# 阶段2: 构建后端
FROM node:20-alpine AS backend-builder

# 设置工作目录
WORKDIR /app/server

# 安装 pnpm
RUN npm install -g pnpm

# 复制后端 package.json 和 pnpm-lock.yaml
COPY server/package.json server/pnpm-lock.yaml ./

# 安装后端依赖
RUN pnpm install --frozen-lockfile

# 复制后端源代码
COPY server/ .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建后端应用
RUN pnpm run build

# 阶段3: 生产环境镜像
FROM node:20-alpine AS production

# 安装必要的系统依赖
RUN apk add --no-cache nginx

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制后端构建产物和依赖
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package.json ./server/
COPY --from=backend-builder /app/server/prisma ./server/prisma

# 复制前端构建产物
COPY --from=frontend-builder /app/web/dist ./web/dist

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建必要的目录
RUN mkdir -p /var/log/nginx /var/lib/nginx/body /var/lib/nginx/fastcgi \
    && mkdir -p /app/server/upload

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/server' >> /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /app/start.sh && \
    echo 'node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# 暴露端口
EXPOSE 80 6666

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["/app/start.sh"] 