# 研发桌面 Agent（dev-agent）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dev desktop agent with bootstrap.sh + CLAUDE.md + AGENT.md + 8 skills for a complete 需求→设计→开发 workflow.

**Architecture:** Lightweight bootstrap installs Claude Code + LLM config. Claude Code enters project, CLAUDE.md triggers self-bootstrap (env check, skill setup, settings generation). AGENT.md defines the three-phase flow. Each atomic capability is a standalone superpower-format SKILL.md under `skills/`.

**Tech Stack:** Bash (bootstrap.sh), Markdown (all definitions), superpowers SKILL.md format

---

## File Structure

```
awesome-devops-agents/
├── bootstrap.sh                        # NEW: lightweight installer
├── CLAUDE.md                           # NEW: project guide, first-launch bootstrap
├── AGENT.md                            # NEW: dev agent definition
├── skills/
│   ├── jira-skill/
│   │   └── SKILL.md                    # NEW: Jira task management
│   ├── spec-skill/
│   │   └── SKILL.md                    # NEW: spec authoring workflow
│   ├── env-skill/
│   │   └── SKILL.md                    # NEW: environment detection
│   ├── code-skill/
│   │   └── SKILL.md                    # NEW: code generation from spec
│   ├── build-skill/
│   │   └── SKILL.md                    # NEW: build/test/lint
│   ├── git-skill/
│   │   └── SKILL.md                    # NEW: git operations
│   ├── docker-skill/
│   │   └── SKILL.md                    # NEW: containerization
│   └── k8s-skill/
│       └── SKILL.md                    # NEW: k8s deployment
```

---

### Task 1: Create bootstrap.sh — lightweight installer

**Files:**
- Create: `awesome-devops-agents/bootstrap.sh`

- [ ] **Step 1: Write bootstrap.sh**

Create the installer script that does only two things: detect/install Claude Code, then configure LLM.

```bash
#!/usr/bin/env bash
set -euo pipefail

# awesome-devops-agents bootstrap.sh
# Usage: bash bootstrap.sh
#
# Does two things:
#   1. Detect/install Claude Code
#   2. Configure LLM provider

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; }

# ─── Step 1: Detect / Install Claude Code ──────────────────────────

info "Checking Claude Code..."

if command -v claude &>/dev/null; then
    CL_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    ok "Claude Code found (v${CL_VERSION})"
else
    warn "Claude Code not found. Installing..."
    if command -v npm &>/dev/null; then
        npm install -g @anthropic-ai/claude-code
        ok "Claude Code installed via npm"
    else
        err "npm not found. Please install Node.js first: https://nodejs.org"
        exit 1
    fi
fi

# ─── Step 2: Configure LLM ─────────────────────────────────────────

info "Configuring LLM provider..."

configure_anthropic() {
    echo ""
    read -rsp "Enter your Anthropic API Key: " ANTHROPIC_API_KEY
    echo ""
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        err "API Key cannot be empty"
        exit 1
    fi
    export ANTHROPIC_API_KEY
    # Persist to shell profile if not present
    local profile_files=("$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile")
    for pf in "${profile_files[@]}"; do
        if [ -f "$pf" ] && ! grep -q "ANTHROPIC_API_KEY" "$pf" 2>/dev/null; then
            echo "export ANTHROPIC_API_KEY=\"$ANTHROPIC_API_KEY\"" >> "$pf"
            ok "Saved to $pf"
            break
        fi
    done
    ok "Anthropic API Key configured"
}

configure_custom() {
    echo ""
    read -rsp "Enter your API Key: " CUSTOM_API_KEY
    echo ""
    read -rp "Enter your API Endpoint URL (e.g. https://api.openai.com/v1): " CUSTOM_ENDPOINT
    read -rp "Enter model name (e.g. gpt-4o, claude-sonnet-4-6): " CUSTOM_MODEL
    if [ -z "$CUSTOM_API_KEY" ] || [ -z "$CUSTOM_ENDPOINT" ]; then
        err "API Key and Endpoint are required"
        exit 1
    fi
    # Write Claude Code config file
    mkdir -p "$HOME/.claude"
    cat > "$HOME/.claude/settings.json" << __EOF__
{
  "model": "${CUSTOM_MODEL:-claude-sonnet-4-6}",
  "apiKey": "${CUSTOM_API_KEY}",
  "endpoint": "${CUSTOM_ENDPOINT}"
}
__EOF__
    ok "Custom LLM provider configured"
}

echo ""
echo "Select LLM provider:"
echo "  1) Anthropic (Claude) — recommended"
echo "  2) Custom (OpenAI-compatible API)"
echo ""
read -rp "Choice [1/2]: " llm_choice

case "$llm_choice" in
    2) configure_custom ;;
    *) configure_anthropic ;;
esac

# ─── Done ──────────────────────────────────────────────────────────

echo ""
echo "┌────────────────────────────────────────────────────────┐"
echo "│  awesome-devops-agents  —  Installation Complete!      │"
echo "│                                                        │"
echo "│  Next step:                                            │"
echo "│    cd <your-project-dir>                               │"
echo "│    claude                                               │"
echo "│                                                        │"
echo "│  Claude Code will guide you through the rest.          │"
echo "└────────────────────────────────────────────────────────┘"
```

- [ ] **Step 2: Make bootstrap.sh executable**

Run: `chmod +x bootstrap.sh`

- [ ] **Step 3: Commit**

```bash
git add bootstrap.sh
git commit -m "feat: add bootstrap.sh — lightweight Claude Code installer + LLM config"
```

---

### Task 2: Create CLAUDE.md — project guide and self-bootstrap

**Files:**
- Create: `awesome-devops-agents/CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

```markdown
# awesome-devops-agents — 研发桌面 Agent

你是一个研发桌面 Agent。你的职责是帮助开发者在本地完成 需求→设计→开发 的全流程工作。

## 首次启动自检

当开发者第一次在这个项目里运行 `claude` 时，自动执行：

1. **检测本地工具链**
   - `java --version` (JDK 17+)
   - `node --version` (Node.js 18+)
   - `docker info` (Docker)
   - `kubectl version --client` (kubectl)
   - `gh --version` (GitHub CLI)
   - 报告缺失项并给出安装指引

2. **安装 Skills**
   - 将 `skills/` 目录下的所有 SKILL.md 注册到当前项目
   - 确保每个 skill 可以被 Skill tool 调用

3. **生成 .claude/settings.json**
   - 配置工具权限（git/docker/kubectl/mvn/npm）
   - 关联 AGENT.md

4. **输出欢迎信息**
   - "环境就绪，你的需求在 Jira 上等你"

## 核心工作流

### 需求阶段
- 使用 `jira-skill` 拉取归属开发者的 Jira 任务
- 展示任务列表，等待开发者选择
- 进入设计阶段

### 设计阶段
- 使用 `spec-skill` 引导开发者将需求转化为技术 spec
- Agent 角色：追问澄清、整理结构、起草 draft
- 开发者做设计决策，Agent 辅助
- 产出：`docs/specs/<feature-name>-spec.md`
- 定稿后进入开发阶段

### 开发阶段
- 使用 `env-skill` 检测环境就绪
- 使用 `code-skill` 按 spec 分层生成代码（接口→业务→数据→测试）
- 使用 `build-skill` 编译验证 + 运行测试
- 使用 `git-skill` 创建分支、分步 commit、推送 MR
- 使用 `docker-skill` / `k8s-skill` 容器化与部署验证
- 每一步开发者可介入修改

## Skills 索引

| Skill | 职责 |
|-------|------|
| `jira-skill` | 拉取 Jira 任务、展示详情、更新状态 |
| `spec-skill` | 生成/编辑 technial spec 模板 |
| `env-skill` | 检测本地工具链就绪情况 |
| `code-skill` | 按 spec 分层生成代码 |
| `build-skill` | 编译、lint、test |
| `git-skill` | 分支管理、commit、MR |
| `docker-skill` | Dockerfile 生成、compose 运行 |
| `k8s-skill` | 部署到 dev 命名空间验证 |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add CLAUDE.md — project guide and first-launch self-bootstrap"
```

---

### Task 3: Create AGENT.md — dev agent definition

**Files:**
- Create: `awesome-devops-agents/AGENT.md`

- [ ] **Step 1: Write AGENT.md**

```markdown
# 研发桌面 Agent

**角色定位：** 研发桌面 Agent — 覆盖 需求→设计→开发 全流程的开发者日常助手

**类型：** team-member（隶属于 DevOps 多 Agent 体系）

---

## 能力清单

| 能力 | Skill | 触发方式 | 描述 |
|------|-------|---------|------|
| 拉取需求 | `jira-skill` | 开发者指令 | 从 Jira 拉取归属任务 |
| 设计 spec | `spec-skill` | 需求确认后 | 人机协作生成技术设计 |
| 环境检测 | `env-skill` | 开发前 | 验证工具链就绪 |
| 代码生成 | `code-skill` | spec 锁定后 | 按 spec 分层生成代码 |
| 构建验证 | `build-skill` | 代码生成后 | 编译、lint、测试 |
| Git 操作 | `git-skill` | 开发完成 | 分支、commit、MR |
| 容器化 | `docker-skill` | 构建通过 | Docker 本地运行验证 |
| K8s 部署 | `k8s-skill` | 容器化后 | dev 命名空间部署 |

## 执行流程（状态机）

```
IDLE → FETCHING_REQ → DESIGNING → DEVELOPING → MR_READY → IDLE
```

| 状态 | 说明 | 入口 | 出口 |
|------|------|------|------|
| IDLE | 空闲，等待开发者指令 | — | FETCHING_REQ |
| FETCHING_REQ | 拉取 Jira 任务列表 | jira-skill | DESIGNING |
| DESIGNING | 人机协作设计 spec | spec-skill | DEVELOPING |
| DEVELOPING | 代码生成 + 构建 + 测试 | code/build/git-skill | MR_READY |
| MR_READY | MR 已提交，等待 review | git-skill | IDLE |

## 工具权限

| 工具 | 允许 | 用途 |
|------|------|------|
| `git` | 读写 | 分支、commit、push |
| `gh` | 读写 | MR、issue 查看 |
| `docker` | 执行 | compose up/build |
| `kubectl` | 只读 + dev 命名空间 | 部署验证 |
| `mvn`/`npm` | 执行 | 构建测试 |
| `java`/`node` | 只读 | 版本检测 |

## 状态持久化

当前 pipeline 状态写入 `<project-root>/.agent/pipeline-status.md`，格式：

```json
{
  "flow_id": "uuid",
  "status": "DESIGNING",
  "jira_issue": "PROJ-123",
  "spec_path": "docs/specs/my-feature-spec.md",
  "branch": "feat/my-feature"
}
```
```

- [ ] **Step 2: Commit**

```bash
git add AGENT.md
git commit -m "feat: add AGENT.md — dev agent definition with state machine and skill mapping"
```

---

### Task 4: Create 需求阶段 skills — jira-skill + spec-skill

**Files:**
- Create: `awesome-devops-agents/skills/jira-skill/SKILL.md`
- Create: `awesome-devops-agents/skills/spec-skill/SKILL.md`

- [ ] **Step 1: Write jira-skill/SKILL.md**

```markdown
---
name: jira-skill
description: 从 Jira 拉取归属开发者的任务列表，展示详情，更新状态
---

# Jira Skill

通过 GitHub CLI (`gh`) 或 Jira CLI 与 Jira 交互。

## 前提条件

- `gh` CLI 已安装并认证
- 或 `jira` CLI 已安装并配置

## 用法

### 拉取我的任务

```bash
gh issue list --assignee @me --json number,title,state,updatedAt
```

### 查看任务详情

```bash
gh issue view <issue-number>
```

### 更新任务状态

```bash
gh issue comment <issue-number> --body "Status update: 进入开发阶段"
```

## 输出格式

任务列表以 Markdown 表格展示：

| ID | 标题 | 状态 | 更新时间 |
|----|------|------|----------|
| PROJ-123 | 用户登录模块 | In Progress | 2026-06-17 |

## Checklist

- [ ] 确认 `gh` 或 `jira` CLI 已安装
- [ ] 拉取任务列表展示给开发者
- [ ] 等待开发者选择任务
- [ ] 展示任务详情
- [ ] 更新 Jira 状态（可选）
```

- [ ] **Step 2: Write spec-skill/SKILL.md**

```markdown
---
name: spec-skill
description: 人机协作生成技术设计文档（spec）
---

# Spec Skill

引导开发者将 Jira 需求转化为结构化的技术设计文档。

## 流程

1. Agent 阅读 Jira 需求，向开发者提出澄清问题
2. 开发者口述/补充技术方案
3. Agent 整理为 spec 草案
4. 写入 `docs/specs/<feature-name>-spec.md`
5. 开发者评审 → 修改 → 定稿

## Spec 模板

```markdown
# <Feature Name> — 技术设计

## 背景
<!-- 要解决什么问题 -->

## 技术方案
<!-- 架构图、选型理由 -->

## 接口设计
<!-- API / RPC / 消息定义 -->

## 数据模型
<!-- 表结构 / 字段变更 -->

## 验收条件
<!-- 可测试的验收标准 -->
```

## Checklist

- [ ] 阅读需求并列出需要确认的问题
- [ ] 逐条向开发者提问（一次一个）
- [ ] 整理开发者回答为 spec draft
- [ ] 写入 `docs/specs/`
- [ ] 等待开发者评审定稿
```

- [ ] **Step 3: Commit**

```bash
git add skills/jira-skill/SKILL.md skills/spec-skill/SKILL.md
git commit -m "feat: add jira-skill and spec-skill — requirement and design phase skills"
```

---

### Task 5: Create 开发核心 skills — env-skill + code-skill + build-skill

**Files:**
- Create: `awesome-devops-agents/skills/env-skill/SKILL.md`
- Create: `awesome-devops-agents/skills/code-skill/SKILL.md`
- Create: `awesome-devops-agents/skills/build-skill/SKILL.md`

- [ ] **Step 1: Write env-skill/SKILL.md**

```markdown
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
```

- [ ] **Step 2: Write code-skill/SKILL.md**

```markdown
---
name: code-skill
description: 按 spec 分层生成代码（接口层 → 业务层 → 数据层 → 测试）
---

# Code Skill

根据已定稿的 spec 分步生成代码。顺序固定：接口层 → 业务层 → 数据层 → 测试。

## 生成顺序

```
┌──────────┐
│ 接口层    │  Controller / API 定义
└────┬─────┘
     ↓
┌──────────┐
│ 业务层    │  Service / 核心逻辑
└────┬─────┘
     ↓
┌──────────┐
│ 数据层    │  Repository / DAO / Model
└────┬─────┘
     ↓
┌──────────┐
│ 测试      │  Unit / Integration
└──────────┘
```

## 规则

- 每层生成完停顿，等待开发者确认/修改
- 遵循项目现有代码风格
- 不生成无关代码（YAGNI）
- 每层文件写入后自动触发对应 lint

## Checklist

- [ ] 读取 spec 理解完整需求
- [ ] 生成接口层代码
- [ ] 等待开发者确认
- [ ] 生成业务层代码
- [ ] 等待开发者确认
- [ ] 生成数据层代码
- [ ] 等待开发者确认
- [ ] 生成测试代码
- [ ] 等待开发者确认
```

- [ ] **Step 3: Write build-skill/SKILL.md**

```markdown
---
name: build-skill
description: 编译验证、代码检查、运行测试
---

# Build Skill

自动检测项目类型并执行对应的构建验证。

## 检测逻辑

```
检测项目根目录:
  pom.xml  → Maven 项目
  build.gradle → Gradle 项目
  package.json → Node 项目
  其他 → 提示手动配置
```

## 命令

### Java (Maven)

```bash
mvn compile          # 编译
mvn test             # 运行测试
mvn checkstyle:check # 代码风格检查
```

### Node

```bash
npm run build        # 构建
npm test             # 测试
npm run lint         # 代码检查
```

## Checklist

- [ ] 检测项目类型
- [ ] 执行编译验证
- [ ] 执行代码检查
- [ ] 运行测试
- [ ] 报告结果：通过/失败详情
- [ ] 失败时给出修复建议
```

- [ ] **Step 4: Commit**

```bash
git add skills/env-skill/SKILL.md skills/code-skill/SKILL.md skills/build-skill/SKILL.md
git commit -m "feat: add env-skill, code-skill, build-skill — core development phase skills"
```

---

### Task 6: Create 交付阶段 skills — git-skill + docker-skill + k8s-skill

**Files:**
- Create: `awesome-devops-agents/skills/git-skill/SKILL.md`
- Create: `awesome-devops-agents/skills/docker-skill/SKILL.md`
- Create: `awesome-devops-agents/skills/k8s-skill/SKILL.md`

- [ ] **Step 1: Write git-skill/SKILL.md**

```markdown
---
name: git-skill
description: Git 分支管理、分步 commit、推送 MR
---

# Git Skill

管理代码版本控制流程：从创建分支到提交 MR。

## 流程

### 1. 创建功能分支

```bash
git checkout -b feat/PROJ-123-user-login
```

### 2. 分步 commit

每个独立文件或功能点一个 commit：

```bash
git add src/main/java/.../UserController.java
git commit -m "feat: add UserController login endpoint"
```

### 3. 推送并创建 MR

```bash
git push -u origin feat/PROJ-123-user-login
gh pr create --title "feat: 用户登录模块" --body "Closes PROJ-123"
```

## Commit 规范

```
<type>: <简短描述>

type: feat / fix / refactor / test / docs
```

## Checklist

- [ ] 创建功能分支（分支名：feat/PROJ-<number>-<desc>）
- [ ] 分步 commit（每层一个 commit）
- [ ] 推送远程
- [ ] 创建 MR，关联 Jira issue
- [ ] 通知开发者 review
```

- [ ] **Step 2: Write docker-skill/SKILL.md**

```markdown
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
```

- [ ] **Step 3: Write k8s-skill/SKILL.md**

```markdown
---
name: k8s-skill
description: 部署应用到 K8s dev 命名空间验证
---

# Kubernetes Skill

将容器化应用部署到开发 K8s 命名空间进行验证。

## 前提

- `kubectl` 已连接目标集群
- 已切换或创建 dev 命名空间

## 能力

### 生成 K8s 资源清单

```bash
# Deployment
kubectl create deployment <name> --image=<image> --dry-run=client -o yaml

# Service
kubectl expose deployment <name> --port=8080 --dry-run=client -o yaml
```

### 部署到 dev 命名空间

```bash
kubectl apply -f k8s/dev/ -n dev
kubectl rollout status deployment/<name> -n dev
kubectl get pods -n dev
```

### 日志与调试

```bash
kubectl logs -f deployment/<name> -n dev
kubectl describe pod <pod-name> -n dev
kubectl port-forward svc/<name> 8080:8080 -n dev
```

## Checklist

- [ ] 确认 kubectl 已连接集群
- [ ] 创建/确认 dev 命名空间
- [ ] 生成 Deployment + Service 清单
- [ ] 部署到 dev 命名空间
- [ ] 验证 rollout 状态
- [ ] 提供访问入口（port-forward / ingress）
- [ ] 告知开发者验证地址
```

- [ ] **Step 4: Commit**

```bash
git add skills/git-skill/SKILL.md skills/docker-skill/SKILL.md skills/k8s-skill/SKILL.md
git commit -m "feat: add git-skill, docker-skill, k8s-skill — delivery phase skills"
```
