# 研发桌面 Agent（dev-agent）设计文档

> 日期：2026-06-17
> 状态：初始稿

---

## 一、目标

构建一个面向企业/独立开发者的**研发桌面 Agent**，开发者安装 Claude Code 后进入项目即可获得：
- 需求拉取（Jira）→ 人机协作设计 → AI 开发的全流程能力
- 一套覆盖 Vue + Java 前后端微服务场景的 Skill 集合
- 开箱即用的环境检测与引导

## 二、核心设计原则

1. **CLI 优先**：所有外部工具调用走 CLI，不直连 API。Skill 封装 CLI 命令。
2. **安装极简**：bootstrap.sh 只做两件事——装 Claude Code、配 LLM。其余全部由 Claude Code 自身完成。
3. **Skill 即能力**：每个原子能力是一个 superpower skill，可复用、可组合。
4. **人机协作**：设计阶段 Agent 辅助而非决策，开发阶段开发者 review 后合并。

## 三、整体架构

```
bootstrap.sh (轻量安装)
  └── 安装 Claude Code + 配置 LLM
        └── claude 进入项目 (CLAUDE.md 引导)
              └── 研发桌面 Agent (AGENT.md)
                    ├── 需求阶段 Flow
                    │    └── jira-skill → gh CLI
                    ├── 设计阶段 Flow
                    │    └── spec-skill → 文件系统
                    ├── 开发阶段 Flow
                    │    ├── code-skill → 文件生成
                    │    ├── build-skill → mvn/npm CLI
                    │    ├── git-skill → git CLI
                    │    ├── docker-skill → docker CLI
                    │    └── k8s-skill → kubectl CLI
                    └── 基础能力
                         └── env-skill → 环境检测脚本
```

### 分层关系

```
AGENT.md (流程编排)
  ↓ 调用
Skill 插件池 (原子能力，每个是独立 SKILL.md)
  ↓ 封装
CLI 命令 (gh / git / docker / kubectl / mvn / npm)
  ↓
外部系统 (Jira / Git / Docker / K8s / ...)
```

MCP 不作为主力通讯方式，保留为可选适配层（IDE 集成场景）。

## 四、三阶段 Flow 设计

### 阶段 1：需求拉取

| 步骤 | 动作 | Skill | CLI |
|------|------|-------|-----|
| 1 | 开发者触发拉取需求 | jira-skill | `gh issue list --assignee @me` |
| 2 | 展示需求列表，开发者选择 | jira-skill | — |
| 3 | 拉取需求详情，确认进入设计 | jira-skill | `gh issue view <id>` |

输出：结构化的需求数据 + flow_id。

### 阶段 2：人机协作设计

| 步骤 | 动作 | Skill |
|------|------|-------|
| 1 | Agent 就需求向开发者提问澄清 | spec-skill |
| 2 | 开发者口述/补充技术方案 | spec-skill |
| 3 | Agent 整理为 spec 草案 | spec-skill |
| 4 | 写入 `docs/specs/<feature>-spec.md` | spec-skill |
| 5 | 开发者评审 → 修改 → 定稿 | spec-skill |

关键原则：
- Agent **不做设计决策**，只做追问、整理、起草
- Spec 包含：背景、技术方案、接口设计、数据模型、验收条件

### 阶段 3：AI 开发 + 人工确认

| 步骤 | 动作 | Skill | CLI |
|------|------|-------|-----|
| 1 | 环境检测 | env-skill | `java --version` / `node --version` / `docker info` |
| 2 | 按 spec 生成代码（接口层→业务层→数据层→测试） | code-skill | 文件系统 |
| 3 | 编译验证 | build-skill | `mvn compile` / `npm run build` |
| 4 | 运行测试 | build-skill | `mvn test` / `npm test` |
| 5 | 创建分支，分步 commit | git-skill | `git checkout -b` / `git commit` |
| 6 | 推送 MR/PR，通知开发者 review | git-skill | `gh pr create` |

每一步生成后开发者可介入修改。

## 五、Skill 清单

| Skill 名称 | 分类 | 封装的 CLI | 职责 |
|-----------|------|-----------|------|
| `jira-skill` | 需求 | `gh` / Jira CLI | 拉取任务、展示详情、更新状态 |
| `spec-skill` | 设计 | 文件系统 | 生成/编辑 spec 模板，版本化管理 |
| `env-skill` | 开发基础 | 检测脚本 | 检测 JDK/Node/Docker/kubectl/gh |
| `code-skill` | 开发 | 文件系统 | 按 spec 分层生成代码 |
| `build-skill` | 开发 | `mvn` / `npm` | 编译、lint、test |
| `git-skill` | 开发 | `git` / `gh` | 分支管理、commit、MR |
| `docker-skill` | 开发 | `docker` | Dockerfile 生成、compose 本地运行 |
| `k8s-skill` | 开发 | `kubectl` | dev 命名空间部署验证 |

## 六、Bootstrap 安装流程

bootstrap.sh（支持 Windows Git Bash / macOS / Linux）：

```
step 1: 检测 Claude Code 是否已安装
         ├── 已安装 → 跳过
         └── 未安装 → 自动下载安装

step 2: 交互式配置 LLM
         ├── 输入 API Key
         └── 选择 Endpoint / Model

step 3: 输出完成信息
         └── "运行 claude 进入项目完成后续初始化"
```

### 首次启动引导（CLAUDE.md 自动执行）

```
claude 进入项目 → CLAUDE.md 触发:
  ├── 检测本地工具链 (JDK/Node/Docker/kubectl/gh)
  ├── 报告缺失项并给出安装指引
  ├── 安装 skills/ 到相应位置
  ├── 生成 .claude/settings.json (skill 权限/工具权限)
  └── 输出 "环境就绪，你的需求在 Jira 上等你"
```

## 七、项目文件结构

```
awesome-devops-agents/
├── bootstrap.sh                 # 轻量安装脚本
├── CLAUDE.md                    # 项目级引导，首次启动触发自检
├── AGENT.md                     # 研发桌面 Agent 定义
├── skills/
│   ├── jira-skill/
│   │   └── SKILL.md
│   ├── spec-skill/
│   │   └── SKILL.md
│   ├── env-skill/
│   │   └── SKILL.md
│   ├── code-skill/
│   │   └── SKILL.md
│   ├── build-skill/
│   │   └── SKILL.md
│   ├── git-skill/
│   │   └── SKILL.md
│   ├── docker-skill/
│   │   └── SKILL.md
│   └── k8s-skill/
│       └── SKILL.md
├── docs/
│   ├── architecture/            # 原有架构文档
│   └── superpowers/specs/       # 本设计文档
└── .claude/
    └── settings.json            # 由首次启动引导生成
```

## 八、AGENT.md 结构草案

研发 Agent 定义包含：

- **角色定位**：研发桌面 Agent，覆盖需求→设计→开发全流程
- **类型**：team-member，隶属于 DevOps 多 Agent 体系
- **能力清单**：映射到 8 个 Skill
- **执行流程**：三阶段状态机流转
  - 状态：IDLE → FETCHING_REQ → DESIGNING → DEVELOPING → MR_READY
- **工具权限**：允许 git/docker/kubectl/mvn/npm/gh 等 CLI
- **状态持久化**：`.agent/pipeline-status.md`

---

## 九、待定议题

- [ ] 首个 Skill 的实现优先级 —— 哪些先做、哪些后做
- [ ] spec-skill 的 spec 模板格式（Markdown 结构定义）
- [ ] env-skill 的工具链版本要求基线
- [ ] code-skill 的代码生成策略（按项目模板？AI 逐文件生成？）
- [ ] 与 Orchestrator Agent 的集成接口（后续多 Agent 场景）
