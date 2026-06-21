# Agentic DevOps 全流程架构 — 设计讨论记录

> 日期：2026-06-07
> 参与：架构设计讨论

---

## 一、核心设计思想

用 AI Agent 多智能体协作，重构传统人工串联的 DevOps 全流程，实现：
**需求 → 研发 → 测试 → 发布 → 运维 → 复盘** 全链路智能化自治。

### 架构核心定位

**分布式 C/S 多 Agent 架构**

- **以人为中心的环节**（产品、研发）= 本地端完整 Agent
- **以环境/集群/7x24 值守为中心的环节**（测试、运维）= 本地轻交互 + 服务端常驻执行 Agent
- **服务端职责**：流程编排、状态流转、任务分发、数据持久、权限审计
- **底层传统 DevOps 工具**：不替换、不改造，通过抽象层 + 适配器统一收口

---

## 二、整体四层架构

```
┌──────────────────────────────────────────────────┐
│ 1. 客户端层（个人 PC 端 Agent）                      │
│   产品 Agent · 研发 Agent · 测试 Agent(轻) · 运维 Agent(控制台) │
├──────────────────────────────────────────────────┤
│ 2. 统一通信与上下文层                                  │
│   CLI 通信 · 全局 Skill 插件池 · 双轨记忆 · 统一校验审计      │
├──────────────────────────────────────────────────┤
│ 3. 服务端智能与协同层（系统大脑）                           │
│   Orchestrator · 测试 Agent 集群 · 运维 Agent 集群      │
├──────────────────────────────────────────────────┤
│ 4. 工具抽象适配层 + 传统 DevOps 工具集群                   │
│   CLI Adapter · GitLab · Jenkins · Harbor · K8s · Prometheus · ELK │
└──────────────────────────────────────────────────┘
```

### 客户端层（个人 PC 端 Agent）

只承载人机交互、个人工作流、本地工具操作、流程确认。不做 7x24 值守、不持有生产权限。

| Agent | 形态 | 职责 |
|-------|------|------|
| **产品 Agent** | 纯本地完整 Agent | 需求撰写、PRD生成、需求拆解、流程图生成、同步需求池 |
| **研发 Agent** | 纯本地完整 Agent | 需求领取、编码、调试、单元测试、Git 操作、MR/PR 发起、规范校验 |
| **测试 Agent** | 本地轻量交互 | 测试任务接收、用例管理、报告解读、Bug 提交、结果研判、流程推进 |
| **运维 Agent** | 本地控制台 | 故障查看、人工研判、应急确认、复盘编辑、指令下发（无直接执行权限） |

### 统一通信与上下文层

- **通信方式**：CLI 命令驱动（不走 MCP 协议）
- **上下文传递**：flow_id / 需求ID / 版本 / 环境 / 责任人 / 链路追踪 / 状态快照
- **通用底座**：全局 Skill 插件池、双轨记忆（短时会话 + 长期知识库）、统一校验审计

### 服务端智能与协同层（系统大脑）

**协同中枢（Orchestrator）**
- 全流程状态机编排、任务拆解、跨角色路由分发
- 全链路状态持久化、断点续跑、异常回滚、超时重试
- 权限管控、操作审计、流程规则、流转分支判断

**服务端常驻 Agent 集群**
- 测试服务端集群：自动化测试执行、接口/压测/回归、批量结果采集
- 运维服务端集群：7x24 监控巡检、告警收敛、日志分析、发布执行、故障自愈、自动复盘

**关键原则**：所有生产/环境变更、自动化执行、无人值守任务，全部由服务端 Agent 完成。

### 工具抽象适配层

AI Agent 永远不直连底层工具。每个 Skill 通过 CLI 命令调用。

- CLI Adapter 是一个**设计原则**，不是一个代码单体
- 每个 Skill 在实现层通过 CLI 命令调用底层工具
- 示例：`deploy-skill` → `kubectl` / `helm`，`code-review-skill` → `glab mr`，`ci-trigger-skill` → `jenkins-cli`

---

## 三、Agent 定义规范

Agent 采用 Claude Code 生态的 `AGENT.md` 定义格式：

```
~/.claude/agents/<agent-name>/
└── AGENT.md
```

| 部分 | 内容 |
|------|------|
| 角色定位 | 角色名、类型（team-leader / team-member）、核心职责 |
| 能力清单 | 能力名称、描述、触发方式 |
| 执行流程 | 步骤化流程、串/并行编排 |
| 技术架构 | 推理/调度/工具/记忆/状态模块 |
| 工具权限 | 允许/禁止的工具列表 + 入参出参 |
| 输入输出规范 | 结构化 JSON 定义 |
| 异常与重试 | 超时、失败、降级策略 |
| 状态持久化 | `.agent/pipeline-status.md` 断点续跑 |
| 安全合规 | 权限最小化、操作可追溯 |

### Agent 角色划分

```
Orchestrator Agent (team-leader)     ← 流程编排/状态机/任务路由
  ├── 产品 Agent (team-member)       ← 需求撰写/PRD/拆解
  ├── 研发 Agent (team-member)       ← 编码/调试/审查/MR
  ├── 测试 Agent (team-member)       ← 用例管理/结果研判
  └── 运维 Agent (team-member)       ← 监控/自愈/应急/发布
```

### Agent 执行框架无关

Agent 定义（AGENT.md）独立于执行框架：

- **本地 Agent** → 由 Claude Code 原生执行
- **服务端 Agent** → 可被 LangGraph / OpenClaw / Hermes 等框架加载实例化

执行框架可替换，定义层保持稳定。

---

## 四、Skill 定义规范

Skill = 原子能力，采用 `SKILL.md` 格式定义。

### 设计原则

- **按处理动作拆分**（而非按角色）：每个 Skill 一个原子能力
- **按角色归类**：一个 Agent 拥有多个 Skill，形成能力包
- **框架无关**：Skill 定义是声明式的，不绑定执行引擎
- **工具无关**：Skill 内部通过 CLI 调用工具，不直连 API

### 三层调用链

```
Agent (决策/编排)           ← Claude Code Agent / LangGraph / ...
   ↓ 调用 Skill 工具
Skill (原子能力)             ← SKILL.md 定义
   ↓ CLI 命令执行
CLI Adapter (设计原则)       ← kubectl / glab / jenkins-cli / helm / ...
   ↓
传统 DevOps 工具             ← GitLab / Jenkins / K8s / Prometheus / ...
```

### 角色与 Skill 映射示例

| Agent | 拥有的 Skills |
|-------|---------------|
| 运维 Agent | `monitor-skill`, `log-query-skill`, `deploy-skill`, `rollback-skill`, `alert-handler-skill` |
| 研发 Agent | `code-review-skill`, `ci-trigger-skill`, `unit-test-skill`, `git-ops-skill` |
| 测试 Agent | `test-exec-skill`, `perf-test-skill`, `report-analysis-skill` |

---

## 五、Agent 知识体系

每个 Agent 拥有独立记忆和知识库，支持私有/共享两级：

```
Agent
  ├── private memory        ← 当前会话上下文（运行时状态）
  ├── private knowledge     ← 私有领域知识（SOP / 规范 / 白名单）
  └── shared knowledge      ← 指向全局共享知识池
```

| 组件 | 内容 | 可见范围 |
|------|------|----------|
| private memory | 当前任务上下文、步骤状态、断点 | 仅本 Agent |
| private knowledge | 角色专属的 SOP、规范、规则 | 仅本 Agent（可配置为共享） |
| shared knowledge | 通用参考、CLI 文档、架构说明 | 所有 Agent（按需引用） |

共享知识库可配置为全局可见，各 Agent 决定是否引用。

---

## 六、运行时通信模型

### 通信方式总览

| 场景 | 方式 | 说明 |
|------|------|------|
| Orchestrator ↔ Agent | `Agent` tool + `SendMessage` | 任务派发与状态汇报 |
| Agent ↔ CLI 工具 | Bash 执行 CLI 命令 | 所有工具操作通过 CLI |
| Agent ↔ 持久存储 | 文件 / 数据库 | 结果写入共享存储供读取 |
| Agent ↔ 人工 | 本地端交互 | 等待人工确认/研判 |

### Orchestrator ↔ Agent 任务契约

```
Orchestrator                            Agent
   │                                       │
   │  ── TaskAssign({task_id, skill, params}) ─→  │
   │                                       │
   │  ←─ TaskAccept({task_id, status}) ────│
   │                                       │
   │  ←─ TaskProgress({task_id, step, log}) ─ │
   │                                       │
   │  ←─ TaskComplete / TaskFail ──────────│
   │                                       │
   │  ── TaskRollback({task_id, reason}) ──→ │
```

### 消息结构

```json
{
  "header": {
    "flow_id": "uuid",
    "trace_id": "uuid",
    "version": "git-sha",
    "env": "staging",
    "agent_id": "ops-agent-01",
    "timestamp": "2026-06-07T10:00:00Z"
  },
  "body": { "...": "..." }
}
```

---

## 七、Agent 部署形态

| 角色 | Agent 部署形态 | 核心原因 |
|------|---------------|----------|
| 产品 | 纯本地完整 Agent | 纯个人创作、无环境依赖 |
| 研发 | 纯本地完整 Agent | 强依赖本地 IDE、调试、个人代码权限 |
| 测试 | 本地轻交互 + 服务端集群执行 | 自动化压测/回归需服务端常驻 |
| 运维 | 服务端常驻 Agent + 本地仅控制台 | 生产环境禁止本地化权限，必须 7x24 值守 |
| 编排 | 服务端常驻 Orchestrator | 全流程状态管理、路由、审计 |

---

## 八、架构设计原则（硬性约束）

1. **AI 智能层与工程工具层彻底解耦**：Agent 只做决策、理解、编排、研判；所有工具调用走 CLI 命令。
2. **人机职责严格分离**：个人工作在本地；环境执行/值守/自动化在生产服务端。
3. **权限绝对安全隔离**：生产密钥不上个人 PC；高危操作统一审计、白名单、审批卡点。
4. **状态机驱动流程**：全流程可断点、可重试、可回滚、可追溯。
5. **渐进式落地、存量零替换**：在现有 DevOps 工具生态上叠加智能 Agent 能力。
6. **框架无关**：Agent/Skill 定义独立于执行框架（Claude Code / LangGraph / OpenClaw / Hermes），可移植。

---

## 九、待定议题（后续讨论）

- [ ] Orchestrator 状态机的具体状态定义与流转图
- [ ] Skill 接口标准化（输入/输出 schema）
- [ ] 服务端 Agent 与 Orchestrator 的通信协议细节
- [ ] 知识库的物理存储方案（向量 DB + 文件？）
- [ ] CI 失败 → 自动回流研发 Agent 的断点细节
- [ ] 首个实现的 Agent/Skill 优先级选择
