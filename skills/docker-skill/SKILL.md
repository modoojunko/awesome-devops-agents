---
name: docker-skill
description: Docker 容器化构建和本地 compose 运行
---

# Docker Skill

将应用容器化并通过 Docker Compose 本地运行验证。

## 能力

### 生成 Dockerfile

检测项目类型生成对应的 Dockerfile：

- Java/Maven → 多阶段构建 Dockerfile
- Node → 轻量级 Node 镜像 Dockerfile
- Vue → Nginx 静态文件 Dockerfile

### Docker Compose 运行

```bash
docker compose up -d          # 启动服务
docker compose ps             # 查看状态
docker compose logs -f        # 查看日志
docker compose down           # 停止
```

### 多服务编排

前后端 + 数据库：

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports: ["8080:80"]
  backend:
    build: ./backend
    ports: ["8081:8080"]
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: dev_only
```

## Checklist

- [ ] 检测项目类型并生成对应 Dockerfile
- [ ] 生成/更新 docker-compose.yml
- [ ] `docker compose up -d` 启动服务
- [ ] 验证服务健康状态
- [ ] `docker compose down` 清理（可选）
