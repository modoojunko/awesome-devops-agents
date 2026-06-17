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
