---
name: env-skill
description: 检测本地开发环境工具链是否就绪
---

# Environment Skill

检测开发者机器的工具链，报告缺失项。

## 检测清单

| 工具 | 检测命令 | 最低版本 | 用途 |
|------|---------|---------|------|
| JDK | `java -version 2>&1` | 17 | Java 后端编译 |
| Node.js | `node --version` | 18 | 前端构建 |
| Docker | `docker info --format '{{.OSType}}'` | — | 容器化 |
| kubectl | `kubectl version --client -o json` | — | K8s 操作 |
| gh | `gh --version` | — | Jira/GitHub 交互 |
| Git | `git --version` | 2.0 | 版本控制 |

## 用法

```bash
# 调用各工具检测并汇总报告
java -version 2>&1
node --version
docker info --format '{{.OSType}}' 2>/dev/null || echo "missing"
kubectl version --client 2>/dev/null || echo "missing"
gh --version 2>/dev/null || echo "missing"
git --version
```

## 输出

Markdown 表格：

| 工具 | 状态 | 版本 | 说明 |
|------|------|------|------|
| JDK | ✅ | 17.0.9 | OK |
| Node.js | ✅ | 20.11.0 | OK |
| Docker | ❌ | — | 未安装，请访问 docker.com |
| kubectl | ⚠️ | 1.28 | 已安装但未连接集群 |

## Checklist

- [ ] 逐一检测所有工具
- [ ] 生成检测报告
- [ ] 标记缺失项并给出安装指引
- [ ] 所有工具就绪后进入开发阶段
