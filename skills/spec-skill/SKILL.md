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
