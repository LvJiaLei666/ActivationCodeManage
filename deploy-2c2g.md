# Vue3-Admin 2核2GB服务器部署指南

本指南专门针对**2核2GB内存**的小配置服务器进行优化，确保项目能够稳定运行。

## 📊 资源预算

### 内存分配计划
- **PostgreSQL**: 512MB (优化配置)
- **Node.js应用**: 768MB (包含前后端)
- **系统和Docker开销**: ~400MB
- **缓冲区**: ~340MB

**总计**: ~2GB (刚好合适)

### CPU分配
- **PostgreSQL**: 1.0核心
- **Node.js应用**: 1.5核心

## 🚀 快速部署

### 1. 服务器优化（重要！）

首先创建swap交换文件增加虚拟内存：

```bash
# 创建优化脚本
cat > optimize-server.sh << 'EOF'
#!/bin/bash
echo "🔧 优化2GB服务器配置..."

# 创建1GB swap文件
if [ ! -f /swapfile ]; then
    echo "创建1GB swap文件..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 优化内核参数
echo "优化内核参数..."
sudo tee /etc/sysctl.d/99-vue3-admin.conf << 'SYSCTL'
# 内存优化
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_background_ratio=5
vm.dirty_ratio=10

# 网络优化  
net.core.somaxconn=1024
net.core.netdev_max_backlog=5000
net.ipv4.tcp_max_syn_backlog=2048

# 文件系统优化
fs.file-max=65536
SYSCTL

sudo sysctl -p /etc/sysctl.d/99-vue3-admin.conf

# 清理系统缓存
echo "清理系统缓存..."
sudo apt-get autoremove -y
sudo apt-get autoclean
sudo docker system prune -f

echo "✅ 服务器优化完成！"
EOF

chmod +x optimize-server.sh
./optimize-server.sh
```

### 2. 部署应用

```bash
# 复制环境变量
cp env.example .env

# 编辑配置（可选）
nano .env

# 使用低内存配置部署
docker-compose -f docker-compose.low-memory.yml up -d

# 等待启动完成
sleep 60

# 检查服务状态
docker-compose -f docker-compose.low-memory.yml ps
```

## 📈 性能监控

### 实时监控脚本

创建监控脚本：

```bash
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "========== 系统资源监控 =========="
echo "时间: $(date)"
echo ""

echo "内存使用情况:"
free -h

echo ""
echo "CPU使用情况:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo ""
echo "Docker容器状态:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "磁盘使用情况:"
df -h | grep -E "(/$|/var)"

echo ""
echo "Swap使用情况:"
swapon --show

echo "====================================="
EOF

chmod +x monitor.sh

# 每30秒监控一次
watch -n 30 ./monitor.sh
```

### 自动监控和告警

```bash
# 创建资源监控脚本
cat > resource-check.sh << 'EOF'
#!/bin/bash
MEMORY_THRESHOLD=90
CPU_THRESHOLD=90

# 检查内存使用率
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt $MEMORY_THRESHOLD ]; then
    echo "⚠️  内存使用率过高: ${MEMORY_USAGE}%"
    echo "重启应用服务..."
    docker-compose -f docker-compose.low-memory.yml restart app
fi

# 检查CPU使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "⚠️  CPU使用率过高: ${CPU_USAGE}%"
fi

# 检查Docker容器状态
CONTAINER_STATUS=$(docker-compose -f docker-compose.low-memory.yml ps -q | wc -l)
if [ $CONTAINER_STATUS -lt 2 ]; then
    echo "⚠️  容器数量异常，尝试重启..."
    docker-compose -f docker-compose.low-memory.yml up -d
fi
EOF

chmod +x resource-check.sh

# 添加到定时任务（每5分钟检查一次）
(crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/resource-check.sh >> $(pwd)/monitor.log 2>&1") | crontab -
```

## ⚡ 性能优化技巧

### 1. 数据库优化

```sql
-- 连接数据库后执行这些优化查询
-- docker-compose -f docker-compose.low-memory.yml exec postgres psql -U postgres -d vue3_admin

-- 分析表统计信息
ANALYZE;

-- 重建索引
REINDEX DATABASE vue3_admin;

-- 清理无用数据
VACUUM FULL;
```

### 2. 应用优化

在 `server/src/main.ts` 中添加内存监控：

```typescript
// 内存监控（可选添加）
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log(`内存使用: RSS ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  
  // 如果内存使用超过400MB，建议重启
  if (memUsage.rss > 400 * 1024 * 1024) {
    console.warn('⚠️  内存使用过高，建议重启应用');
  }
}, 60000); // 每分钟检查一次
```

### 3. 日志管理

```bash
# 创建日志清理脚本
cat > cleanup-logs.sh << 'EOF'
#!/bin/bash
echo "清理Docker日志..."

# 清理超过7天的容器日志
docker system prune -f
docker volume prune -f

# 清理应用日志
find ./server/upload -name "*.log" -mtime +7 -delete
find /var/log -name "*.log.*" -mtime +7 -delete 2>/dev/null || true

echo "日志清理完成"
EOF

chmod +x cleanup-logs.sh

# 每天凌晨3点自动清理
(crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/cleanup-logs.sh") | crontab -
```

## 🆘 紧急处理

### 内存不足时的处理

```bash
# 1. 立即释放内存
echo 3 | sudo tee /proc/sys/vm/drop_caches

# 2. 重启应用（保持数据库运行）
docker-compose -f docker-compose.low-memory.yml restart app

# 3. 如果还是不够，重启所有服务
docker-compose -f docker-compose.low-memory.yml restart

# 4. 最后手段：清理Docker并重启
docker system prune -af
docker-compose -f docker-compose.low-memory.yml up -d
```

### 应用无响应时

```bash
# 检查进程
docker-compose -f docker-compose.low-memory.yml top

# 查看容器日志
docker-compose -f docker-compose.low-memory.yml logs app --tail=50

# 重启应用容器
docker-compose -f docker-compose.low-memory.yml restart app
```

## 📋 部署检查清单

- [ ] 服务器已创建swap文件
- [ ] 内核参数已优化
- [ ] Docker已安装并运行
- [ ] 环境变量已配置
- [ ] 使用低内存配置文件部署
- [ ] 监控脚本已设置
- [ ] 定时任务已添加
- [ ] 应用可正常访问
- [ ] 数据库连接正常

## 🔍 常见问题

**Q: 应用启动很慢？**
A: 这是正常的，2GB内存启动需要60-90秒，请耐心等待。

**Q: 偶尔出现502错误？**
A: 可能是内存不足导致的，检查监控日志，必要时重启应用。

**Q: 数据库连接失败？**
A: 检查PostgreSQL容器是否正常运行，可能需要更多启动时间。

**Q: 如何查看详细的资源使用？**
A: 运行 `./monitor.sh` 脚本查看实时资源使用情况。

---

通过以上优化配置，你的2核2GB服务器应该可以稳定运行Vue3-Admin项目。如有问题，请查看监控日志进行排查。 