---
name: remotion-skill
description: 把一篇文章做成 1920×1080 技术教程视频，含 AI 语音，使用 taste-skill 设计视觉风格
---

# Remotion Skill

把一篇文章做成 B 站/YouTube 风格的横屏口播视频。

## 前提条件

- `taste-skill` 已安装（用于视觉风格设计）
- `edge-tts` 已安装（`pip install edge-tts`）
- `ffmpeg` 已安装
- Node.js 18+

## 工作流

### Step 1: 阅读文章，确定视觉风格

阅读用户提供的文章，调用 taste-skill 确定视觉参数：

```
taste-skill 输出:
  variance: low | medium | high
  density: spacious | comfortable | compact
  motion: subtle | balanced | expressive
  font: inter | playfair | mono
  palette: dark | light | brand
```

### Step 2: 分析文章，生成 media-script.json

分析文章结构，拆分为页，每页匹配 layout 类型，写入 `remotion-project/src/media-script.json`。

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

### Step 3: 检查 Remotion 项目

```bash
cd skills/remotion-skill/remotion-project
ls node_modules/.package-lock.json 2>/dev/null && echo "ready" || npm install
```

### Step 4: 渲染视频

```bash
cd skills/remotion-skill/remotion-project
npx remotion render src/Root.tsx Video out/video.mp4
```

### Step 5: 合成 TTS 音频

逐页读取 `tts_text`，用 Edge-TTS 生成：

```bash
mkdir -p out/audio
# 逐页生成
edge-tts --text "第1页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-1.mp3
edge-tts --text "第2页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-2.mp3
# ...
```

### Step 6: 合流

```bash
# 拼接音频
for f in out/audio/page-*.mp3; do echo "file '$PWD/$f'" >> out/audio-list.txt; done
ffmpeg -f concat -safe 0 -i out/audio-list.txt -c copy out/full-audio.mp3

# 混入视频
ffmpeg -i out/video.mp4 -i out/full-audio.mp3 -c:v copy -c:a aac -shortest out/final.mp4
```

### Step 7: 输出

将 `out/final.mp4` 路径告知用户。

## 错误处理

| 错误 | 处理 |
|------|------|
| npm install 失败 | 检查 Node.js 版本，提示手动安装 |
| Remotion 渲染失败 | 展示 remotion 错误日志，询问修复 |
| Edge-TTS 失败 | 跳过该页，继续渲染，最后提示缺失页 |
| ffmpeg 合流失败 | 保留 video.mp4 + 音频文件，提示手动合流 |

## Checklist

- [ ] 文章已阅读并理解
- [ ] taste-skill 已调用，视觉参数已确定
- [ ] media-script.json 已生成
- [ ] Remotion 项目依赖已安装
- [ ] 视频已渲染
- [ ] 音频已逐页合成
- [ ] 音视频已合流
- [ ] final.mp4 已输出给用户
