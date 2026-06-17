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
