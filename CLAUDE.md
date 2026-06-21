# awesome-devops-agents — Agentic DevOps 多智能体体系

本项目通过 **7 个 AI Agent** 覆盖软件交付全生命周期：
**需求 → 研发 → 测试 → 发布 → 运维 → 复盘**

## 项目结构

```
awesome-devops-agents/
├── agents/                    # Agent 定义
│   ├── developer/             # 研发 Agent（当前主力）
│   ├── product-manager/       # 产品经理 Agent
│   ├── qa/                    # 测试 Agent
│   ├── ops/                   # 运维 Agent
│   ├── tech-lead/             # 技术 Leader Agent
│   ├── architect/             # 架构师 Agent
│   └── project-manager/       # 项目经理 Agent
├── skills/                    # 共享 Skill 池
├── mcp/                       # MCP 服务定义
├── cli/                       # CLI 适配器
├── shared/                    # 模板 + 知识库
├── docs/                      # 文档
├── scripts/                   # 基础设施脚本
└── tests/                     # 集成测试
```

## 调用链路

```
Agent（决策/编排）
  │ 调用 Skill
  ▼
Skill（原子能力）
  │ 通过 MCP / CLI 适配
  ▼
DevOps 平台（GitHub / Jira / Jenkins / 测试平台 / K8s...）
```

## Agent 路由

| 请求 | 目标 Agent |
|------|-----------|
| 写代码、提交 MR、本地构建部署 | `agents/developer/CLAUDE.md` |
| 写 PRD、拆需求 | `agents/product-manager/CLAUDE.md` |
| 写测试用例、跑测试 | `agents/qa/CLAUDE.md` |
| 看监控、处理告警 | `agents/ops/CLAUDE.md` |
| 代码审查、CI 门禁、效率指标 | `agents/tech-lead/CLAUDE.md` |
| 架构设计、技术选型、ADR | `agents/architect/CLAUDE.md` |
| 进度跟踪、风险报告 | `agents/project-manager/CLAUDE.md` |

## 当前聚焦

当前研发 Agent 已实装，其余 Agent 为骨架定义。
进入对应 Agent 目录阅读 `CLAUDE.md` 了解其工作流。
