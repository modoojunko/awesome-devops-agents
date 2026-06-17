---
name: article-to-video-skill
description: 把一篇文章做成 1920×1080 技术教程视频 — 分析文章 → 设计风格 → 生成脚本 → 调用 hyperframes-skill 渲染
---

# Article-to-Video Skill

把一篇文章做成 B 站/YouTube 风格的横屏口播视频。**编排层** — 分析文章、设计视觉、生成数据，然后调用 `hyperframes-skill` 执行渲染。

## 前提条件

- `taste-skill` 已安装（用于视觉风格设计）
- `hyperframes-skill` 已安装（用于 HTML 合成 + 渲染 + TTS + 合流）

## 工作流

### Step 1: 阅读文章，调用 taste-skill 确定视觉风格

阅读用户提供的文章，调用 `taste-skill` 确定视觉参数：

```
taste-skill 输出:
  variance: low | medium | high
  density: spacious | comfortable | compact
  motion: subtle | balanced | expressive
  font: inter | playfair | mono
  palette: dark | light | brand
```

### Step 2: 分析文章，生成 media-script.json

分析文章结构，拆分为页，每页匹配 layout 类型，写入 `skills/hyperframes-skill/src/media-script.json`。

每页规则：

| layout | 适用场景 | 元素组合 | 动画节奏 |
|--------|---------|---------|----------|
| title | 封面/标题 | text + subtitle + decorator | fadeIn → slideUp → scaleX |
| body | 正文段落 | heading + paragraph + highlight | fadeIn → slideUp → scaleIn |
| code | 代码展示 | code_block + 逐行高亮 | fadeIn → highlightLine × 2 |
| bullet | 列表要点 | bullet_items 逐条 | 逐条 slideLeft |
| quote | 金句引用 | quote_text | scaleIn |
| summary | 总结 | text + bullet_items | fadeIn → 逐条出现 |

**每页 2-3 个动画**，每个元素带独立 animation 配置。

完整 JSON 格式参考 `docs/superpowers/specs/2026-06-17-remotion-skill-design.md`。

### Step 3: 审查脚本（可选）

将生成的 media-script.json 内容摘要（总页数、每页 layout 类型、每页口播文本）展示给用户，确认脚本结构无误。用户同意后进入下一步。

### Step 4: 调用 hyperframes-skill

调用 `hyperframes-skill` 完成 HTML 合成 → 预览审查 → 渲染 → TTS 合成 → 音视频合流。

### Step 5: 输出

将 `skills/hyperframes-skill/out/final.mp4` 路径告知用户。

## 与 hyperframes-skill 的分工

| | article-to-video-skill（编排层） | hyperframes-skill（执行层） |
|---|---|---|
| 职责 | 读文章 → taste-skill → 生成脚本 | HTML 合成 → 渲染 → TTS → 合流 |
| 产出 | media-script.json | final.mp4 |
| 依赖 | taste-skill, hyperframes-skill | HyperFrames, Edge-TTS, ffmpeg |
| 调用方 | AI 直接使用 | 被 article-to-video-skill 调用 |

## 错误处理

| 错误 | 处理 |
|------|------|
| taste-skill 调用失败 | 使用默认参数（medium/comfortable/balanced/inter/dark） |
| media-script.json 格式错误 | AI 自行检查修复后重试 |
| hyperframes-skill 失败 | 展示 hyperframes-skill 报错日志，询问是否重试 |

## Checklist

- [ ] 文章已阅读并理解
- [ ] taste-skill 已调用，视觉参数已确定
- [ ] media-script.json 已生成并写入 hyperframes 项目目录
- [ ] 脚本结构已给用户确认
- [ ] hyperframes-skill 调用完成（含预览 + 视频审查）
- [ ] final.mp4 已输出给用户
