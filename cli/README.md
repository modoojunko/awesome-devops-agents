# CLI 适配器

CLI 适配器是 Skill 与底层 DevOps 工具之间的薄封装层。

## 设计原则

- **每个脚本一个职责** — 只封装一个 CLI 工具的某一类操作
- **统一错误处理** — 失败时返回非零退出码 + 错误信息到 stderr
- **JSON 输出** — 结构化输出便于 Agent / Skill 解析
- **不添加业务逻辑** — 只做参数映射、执行、结果格式化

## 调用方式

```bash
# 技能中直接调用
cli/gh-pr.sh create --title "feat: xxx" --body "Closes PROJ-123"

# 或在 shell 中 source 使用函数
source cli/gh-pr.sh
gh_pr_create "feat: xxx" "Closes PROJ-123"
```

## 工具索引

| 脚本 | 封装工具 | 职责 |
|------|---------|------|
| `gh-pr.sh` | `gh` | PR 创建、列表、查看、合并 |
| `gh-issue.sh` | `gh` | Issue 查看、列表、评论、状态变更 |
