# Vue3-Admin Docker 部署指南

本项目提供了完整的 Docker 化部署方案，包含前端（Vue3）、后端（NestJS）和数据库（PostgreSQL）服务。

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装：
- Docker (>= 20.0.0)
- Docker Compose (>= 2.0.0)

### 2. 环境配置

复制环境变量模板并配置：

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量（可选）
vi .env
```

主要配置项：
- `POSTGRES_PASSWORD`: PostgreSQL 数据库密码
- `DATABASE_URL`: 数据库连接字符串
- `JWT_SECRET`: JWT 加密密钥
- `SESSION_SECRET`: Session 会话密钥

### 3. 部署应用

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 访问应用

- **前端应用**: http://localhost
- **后端API**: http://localhost:6666
- **Swagger文档**: http://localhost/docs
- **数据库**: localhost:5432

## 📁 项目结构

```
vue3-admin/
├── Dockerfile              # 多阶段构建文件
├── docker-compose.yml      # 服务编排文件
├── nginx.conf              # Nginx 配置
├── .dockerignore           # Docker 忽略文件
├── env.example             # 环境变量模板
├── server/                 # 后端代码
└── web/                    # 前端代码
```

## 🛠️ 服务说明

### 应用服务 (app)
- **端口**: 80 (Nginx), 6666 (API)
- **功能**: 前端静态文件服务 + 后端API服务
- **健康检查**: http://localhost:6666/health

### 数据库服务 (postgres)
- **镜像**: postgres:15-alpine
- **端口**: 5432
- **数据卷**: postgres_data
- **初始化**: 自动执行 postgreSQL/ 目录下的 SQL 文件

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建
docker-compose build --no-cache

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]
```

### 数据库管理

```bash
# 进入数据库容器
docker-compose exec postgres psql -U postgres -d vue3_admin

# 数据库备份
docker-compose exec postgres pg_dump -U postgres vue3_admin > backup.sql

# 数据库恢复
docker-compose exec -T postgres psql -U postgres vue3_admin < backup.sql
```

### 应用管理

```bash
# 进入应用容器
docker-compose exec app sh

# 查看应用日志
docker-compose logs -f app

# 重启应用服务
docker-compose restart app
```

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "8080:80"    # 前端改为8080端口
     - "3000:6666"  # 后端改为3000端口
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   docker-compose logs postgres
   
   # 检查环境变量配置
   docker-compose config
   ```

3. **前端页面无法访问**
   ```bash
   # 检查Nginx配置
   docker-compose exec app nginx -t
   
   # 重启Nginx
   docker-compose exec app nginx -s reload
   ```

4. **构建失败**
   ```bash
   # 清理Docker缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

### 查看详细日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app
docker-compose logs postgres

# 实时跟踪日志
docker-compose logs -f --tail=100 app
```

## 📊 监控和维护

### 健康检查

所有服务都配置了健康检查：

```bash
# 检查服务健康状态
docker-compose ps

# 应用健康检查
curl http://localhost:6666/health

# 数据库健康检查
docker-compose exec postgres pg_isready -U postgres
```

### 数据持久化

项目使用 Docker 卷持久化数据：

- `postgres_data`: PostgreSQL 数据
- `app_logs`: 应用日志
- `./server/upload`: 上传文件

## 🔒 生产环境建议

1. **安全配置**
   - 修改默认密码
   - 使用强密码策略
   - 配置防火墙规则
   - 启用 HTTPS

2. **性能优化**
   - 调整数据库配置
   - 设置Nginx缓存策略
   - 优化Node.js内存使用
   - 监控资源使用情况

3. **备份策略**
   - 定期备份数据库
   - 备份上传文件
   - 配置日志轮转

4. **监控告警**
   - 配置应用监控
   - 设置资源告警
   - 日志监控

## 📝 更新日志

- v1.0.0: 初始版本，支持基础Docker部署
- 支持的服务：Vue3前端、NestJS后端、PostgreSQL
- 自动化部署和健康检查 