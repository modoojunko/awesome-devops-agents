# Remotion Skill — 技术教程视频生成 Skill 设计

> 日期：2026-06-17
> 状态：初始稿

---

## 一、目标

构建一个 superpower skill，输入一篇技术教程/口播文章，自动生成 1920×1080 横屏视频（含 AI 语音），适用于 B 站、YouTube 等平台。

## 二、核心流程

```
用户: "把这篇文章做成视频"
    ↓
AI 调用 remotion-skill
    │
    ├── 1. AI 读取文章，调用 taste-skill 确定视觉风格
    │      (variance / density / motion / font / palette)
    │
    ├── 2. AI 分析文章并输出 media-script.json
    │      (页数 / 每页内容 / 布局 / 动画 / TTS 文本)
    │
    ├── 3. AI 运行 Remotion 渲染 → video.mp4
    │
    ├── 4. AI 运行 Edge-TTS 逐页合成 → audio/*.mp3
    │
    └── 5. AI 用 ffmpeg 合流 → final.mp4
```

**步骤 3-5 全部由 remotion-skill 驱动执行。**

## 三、核心数据契约：media-script.json

AI 编排层的唯一产出，Remotion 渲染层的唯一输入：

```json
{
  "meta": {
    "title": "如何用 Docker 部署 Vue 项目",
    "total_pages": 8,
    "total_duration_sec": 64,
    "resolution": "1920x1080",
    "fps": 30
  },
  "taste": {
    "variance": "medium",
    "density": "comfortable",
    "motion": "balanced",
    "font": "inter",
    "palette": "dark"
  },
  "pages": [
    {
      "id": 1,
      "layout": "title",
      "elements": [
        {
          "type": "text",
          "content": "如何用 Docker 部署 Vue 项目",
          "style": {
            "font_size": 64,
            "font_weight": "bold",
            "color": "#ffffff",
            "align": "center"
          },
          "animation": {
            "type": "fadeIn",
            "duration": 1.5,
            "delay": 0,
            "easing": "ease-out"
          }
        },
        {
          "type": "subtitle",
          "content": "从零开始的容器化部署指南",
          "style": { "font_size": 28, "color": "#a855f7", "align": "center" },
          "animation": {
            "type": "slideUp",
            "duration": 1.0,
            "delay": 0.5,
            "easing": "ease-out"
          }
        }
      ],
      "duration_sec": 8,
      "bg_color": "#0f172a",
      "bg_gradient": "linear-gradient(135deg, #0f172a, #1e293b)",
      "tts_text": "如何用 Docker 部署 Vue 项目，从零开始的容器化部署指南。"
    }
  ]
}
```

### Layout 类型

| layout | 用途 | 典型 elements |
|--------|------|--------------|
| title | 封面/标题页 | text + subtitle + decorator |
| body | 正文段落 | heading + paragraph + highlight |
| code | 代码展示 | code_block（支持逐行高亮动画） |
| bullet | 列表要点 | bullet_items |
| quote | 引用/金句 | quote_text |
| summary | 总结页 | text + bullet_items |

### Element 类型

| type | 说明 | 支持的动画 |
|------|------|-----------|
| text | 大标题/正文 | fadeIn, slideUp, scaleIn |
| subtitle | 副标题 | fadeIn, slideUp |
| paragraph | 段落文本 | fadeIn, slideUp |
| code_block | 代码块 | fadeIn, highlightLine |
| bullet_items | 列表项 | fadeIn, slideLeft (逐条) |
| quote_text | 引用文字 | scaleIn, fadeIn |
| highlight | 高亮强调 | scaleIn, pulse |
| decorator | 装饰元素（线条/形状） | scaleX, fadeIn |
| image | 图片占位 | fadeIn, zoomIn |

### 每页 2-3 个动画规则

- 标题/封面页：text fadeIn → subtitle slideUp → decorator scaleX
- 正文页：heading fadeIn → paragraph slideUp → highlight scaleIn
- 代码页：code_block fadeIn → highlightLine × 2（逐行强调）
- 列表页：bullet_items 逐条 slideLeft
- 总结页：text fadeIn → bullets 逐条出现

### taste 参数

```
variance: low | medium | high     布局变化程度
density:  spacious | comfortable | compact  信息密度
motion:   subtle | balanced | expressive   动感强度
font:     inter | playfair | mono    字体风格
palette:  dark | light | brand      配色倾向
```

AI 调用 taste-skill 确定这些参数，写入 meta.taste。

## 四、Remotion 渲染项目结构

```
remotion-project/
├── package.json
├── tsconfig.json
├── src/
│   ├── Root.tsx                  # 入口，注册所有 Composition
│   ├── Video.tsx                 # 主组件，遍历 pages 渲染
│   ├── media-script.json         # AI 生成的编排数据
│   ├── layouts/
│   │   ├── TitleLayout.tsx       # 封面布局
│   │   ├── BodyLayout.tsx        # 正文布局
│   │   ├── CodeLayout.tsx        # 代码布局
│   │   ├── BulletLayout.tsx      # 列表布局
│   │   ├── QuoteLayout.tsx       # 引用布局
│   │   └── SummaryLayout.tsx     # 总结布局
│   ├── elements/
│   │   ├── TextElement.tsx       # 文本渲染
│   │   ├── CodeBlock.tsx         # 代码高亮渲染
│   │   ├── BulletList.tsx        # 列表渲染
│   │   └── Decorator.tsx         # 装饰元素
│   ├── animations/
│   │   ├── fadeIn.tsx            # 淡入
│   │   ├── slideUp.tsx           # 上滑
│   │   ├── scaleIn.tsx           # 缩放进入
│   │   ├── highlightLine.tsx     # 代码行高亮
│   │   └── pulse.tsx             # 脉冲
│   ├── styles/
│   │   ├── theme.ts              # taste → 颜色/字体映射
│   │   └── fonts.ts              # 字体加载
│   └── utils/
│       ├── parseScript.ts        # 读取 media-script.json
│       └── timing.ts             # 时间轴计算
```

## 五、SKILL.md 工作流

```markdown
1. 用户给一篇文章
2. AI 阅读文章，调用 taste-skill 确定设计语言
3. AI 分析文章结构，拆分为 N 页，写入 media-script.json
4. AI 检查 Remotion 项目是否存在，不存在则创建
5. AI 将 media-script.json 写入 remotion-project/src/
6. AI 运行 `cd remotion-project && npm run build`
7. AI 用 Edge-TTS 逐页合成音频：
   - 读取每页 tts_text
   - edge-tts --text "..." --voice zh-CN-XiaoxiaoNeural --write-media audio/page-N.mp3
8. AI 用 ffmpeg 合流：
   - 将逐页音频按时间轴拼接
   - 混入视频轨 → final.mp4
9. 输出 final.mp4 给用户
```

## 六、Edge-TTS 音频合成方案

每页独立合成，按时间轴拼接：

```bash
# 逐页生成
edge-tts --text "第1页口播内容" --voice zh-CN-XiaoxiaoNeural --write-media audio/page-1.mp3
edge-tts --text "第2页口播内容" --voice zh-CN-XiaoxiaoNeural --write-media audio/page-2.mp3

# 拼接
ffmpeg -f concat -safe 0 -i audio-list.txt -c copy full-audio.mp3

# 合流到视频
ffmpeg -i video.mp4 -i full-audio.mp3 -c:v copy -c:a aac -shortest final.mp4
```

可选语音：zh-CN-XiaoxiaoNeural（推荐），zh-CN-YunxiNeural（男声）。

## 七、Remotion 项目初建

`remotion-skill` 自带一个 Remotion 脚手架项目，包含所有 layouts/elements/animations。AI 首次运行时：

```bash
cd remotion-project
npm install
```

之后每次只需更新 `media-script.json` 即可渲染新视频。

## 八、错误处理

| 场景 | 处理 |
|------|------|
| Remotion 渲染失败 | 展示错误日志，询问是否重试或手动修复 |
| Edge-TTS 网络错误 | 跳过该页音频，继续渲染，最后提示 |
| ffmpeg 合流失败 | 保留视频轨和音频轨文件，手动合流 |
| media-script.json 格式错误 | AI 自行检查修复后重试 |

## 九、项目归属

此 skill 作为 `awesome-devops-agents` 项目的独立 skill，存放于：

```
skills/remotion-skill/
├── SKILL.md                    # skill 定义
└── remotion-project/           # Remotion 脚手架
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── Root.tsx
        ├── Video.tsx
        ├── layouts/*
        ├── elements/*
        ├── animations/*
        └── styles/*
```

整个 remotion-project 目录是 skill 的一部分，随 skill 一起分发。
