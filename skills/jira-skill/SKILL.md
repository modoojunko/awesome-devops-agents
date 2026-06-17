---
name: jira-skill
description: 从 Jira 拉取归属开发者的任务列表，展示详情，更新状态
---

# Jira Skill

通过 GitHub CLI (`gh`) + GitHub Issues 或原生 `jira` CLI 管理开发任务。

> **说明：** `gh issue` 操作的是 GitHub Issues。如果你的团队将 Jira 与 GitHub 同步（常见集成方式），可以直接使用 gh CLI。否则请使用原生 `jira` CLI 命令。

## 前提条件

- **GitHub 同步方式：** `gh` CLI 已安装并认证
- **Jira 原生方式：** `jira` CLI (`go-jira`) 已安装并配置 `JIRA_TOKEN`

## 用法

### 拉取我的任务（GitHub Issues / Jira 同步）

```bash
gh issue list --assignee @me --json number,title,state,updatedAt
```

### 拉取我的任务（Jira 原生）

```bash
jira issue list --assignee currentUser()
```

### 查看任务详情

```bash
gh issue view <issue-number>
# 或
jira issue view <ISSUE-KEY>
```

### 更新任务状态

```bash
gh issue comment <issue-number> --body "Status update: 进入开发阶段"
# 或
jira issue transition <ISSUE-KEY> "In Progress"
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
