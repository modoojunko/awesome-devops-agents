---
name: remotion-skill
description: 纯执行层 — 接收 media-script.json，渲染视频 + TTS 语音 + ffmpeg 合流
---

# Remotion Skill

纯执行层，`article-to-video-skill` 完成文章分析和编排后，调用本 skill 完成渲染。

## 前提条件

- `edge-tts` 已安装（`pip install edge-tts`）
- `ffmpeg` 已安装
- Node.js 18+

## 输入

`remotion-project/src/media-script.json` — 由编排层（article-to-video-skill）生成。

## 工作流

### Step 1: 检查依赖

```bash
cd skills/remotion-skill/remotion-project
ls node_modules/.package-lock.json 2>/dev/null && echo "ready" || npm install
```

### Step 2: 渲染视频

```bash
cd skills/remotion-skill/remotion-project
mkdir -p out
npx remotion render src/Root.tsx Video out/video.mp4
```

### Step 3: 合成 TTS 音频

逐页读取 media-script.json 中的 `tts_text`，用 Edge-TTS 生成：

```bash
mkdir -p out/audio
edge-tts --text "第1页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-1.mp3
edge-tts --text "第2页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-2.mp3
# ... 每页一条
```

### Step 4: 合流

```bash
# 拼接音频
for f in out/audio/page-*.mp3; do echo "file '$PWD/$f'" >> out/audio-list.txt; done
ffmpeg -f concat -safe 0 -i out/audio-list.txt -c copy out/full-audio.mp3

# 混入视频
ffmpeg -i out/video.mp4 -i out/full-audio.mp3 -c:v copy -c:a aac -shortest out/final.mp4
```

### Step 5: 输出

将 `out/final.mp4` 路径返回给调用方。

## 错误处理

| 错误 | 处理 |
|------|------|
| npm install 失败 | 检查 Node.js 版本，提示手动安装 |
| Remotion 渲染失败 | 展示 remotion 错误日志，询问修复 |
| Edge-TTS 失败 | 跳过该页，继续渲染，最后提示缺失页 |
| ffmpeg 合流失败 | 保留 video.mp4 + 音频文件，提示手动合流 |

## Checklist

- [ ] npm install 完成
- [ ] 视频已渲染（out/video.mp4）
- [ ] 音频已逐页合成（out/audio/page-*.mp3）
- [ ] 音视频已合流（out/final.mp4）
- [ ] final.mp4 路径已返回
