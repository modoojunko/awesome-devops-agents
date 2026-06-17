---
name: hyperframes-skill
description: 纯执行层 — 接收 media-script.json，用 HyperFrames 渲染视频 + TTS 语音 + ffmpeg 合流
---

# HyperFrames Skill

纯执行层，`article-to-video-skill` 完成文章分析和编排后，调用本 skill 完成 HTML 视频合成。

## 前提条件

- `hyperframes` CLI 已安装（`npx hyperframes` 可用）
- `edge-tts` 已安装（`pip install edge-tts`）
- `ffmpeg` 已安装
- Node.js 22+

## 输入

`skills/hyperframes-skill/src/media-script.json` — 由编排层（article-to-video-skill）生成的页面结构数据。

## 工作流

### Step 1: 写 HTML 分镜

读取 `media-script.json`，逐页生成 HTML 场景：

- 每页作为一个 scene（`data-composition-id` + `data-start` + `data-duration`）
- 使用 GSAP timeline 做入场动画（`gsap.from()`）
- 设计系统：使用 taste 参数确定配色和字体
- 每页 2-3 个动画（与 media-script.json 中的 animation 配置对应）

输出到 `skills/hyperframes-skill/src/index.html`。

### Step 2: 检查

```bash
cd skills/hyperframes-skill
npx hyperframes lint
npx hyperframes validate
```

如果检查失败，修复 HTML 后重试。

### Step 3: 预览审查

```bash
cd skills/hyperframes-skill
npx hyperframes preview
```

将预览 URL 告知用户，让用户在浏览器中审查。等待用户确认。

如果提出修改意见：
- 调整 `index.html` 中的内容/动画
- 重新预览
- 再次等待确认

### Step 4: 渲染视频

```bash
cd skills/hyperframes-skill
mkdir -p out
npx hyperframes render src/index.html out/video-preview.mp4
```

### Step 5: 合成 TTS 音频

逐页读取 media-script.json 中的 `tts_text`，用 Edge-TTS 生成：

```bash
mkdir -p out/audio
edge-tts --text "第1页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-1.mp3
edge-tts --text "第2页口播" --voice zh-CN-XiaoxiaoNeural --write-media out/audio/page-2.mp3
# ... 每页一条
```

### Step 6: 合流

```bash
# 拼接音频
for f in out/audio/page-*.mp3; do echo "file '$PWD/$f'" >> out/audio-list.txt; done
ffmpeg -f concat -safe 0 -i out/audio-list.txt -c copy out/full-audio.mp3

# 混入视频
ffmpeg -i out/video-preview.mp4 -i out/full-audio.mp3 -c:v copy -c:a aac -shortest out/final.mp4
```

### Step 7: 最终审查

将 `out/final.mp4` 路径告知用户，让用户播放审查（含音频）。等待用户确认。

如果提出修改意见：
- 画面问题 → 返回 Step 1 调整 HTML
- 音频问题 → 调整 tts_text 后从 Step 5 重新合成

### Step 8: 输出

用户确认后，将 `out/final.mp4` 路径返回给调用方。

## 分镜指南（media-script.json → HTML）

| layout | HTML 结构 | GSAP 动画 |
|--------|-----------|----------|
| title | 大标题 + 副标题 + 装饰线 | fadeIn → slideUp → scaleX |
| body | 标题 + 段落 + 高亮 | fadeIn → slideUp → scaleIn |
| code | 标题 + 代码块 | fadeIn → 逐行高亮 |
| bullet | 标题 + 列表 | 逐条 slideLeft |
| quote | 引用文本 | scaleIn |
| summary | 标题 + 总结点 | fadeIn → 逐条出现 |

## 错误处理

| 错误 | 处理 |
|------|------|
| hyperframes lint/validate 失败 | 阅读报错修复 HTML，重试 |
| hyperframes 渲染失败 | 展示错误日志，询问修复 |
| Edge-TTS 失败 | 跳过该页，继续渲染，最后提示缺失页 |
| ffmpeg 合流失败 | 保留 video.mp4 + 音频文件，提示手动合流 |

## Checklist

- [ ] index.html 已根据 media-script.json 生成
- [ ] hyperframes lint + validate 通过
- [ ] 浏览器预览已确认
- [ ] 视频已渲染（out/video-preview.mp4）
- [ ] 音频已逐页合成（out/audio/page-*.mp3）
- [ ] 音视频已合流（out/final.mp4）
- [ ] 最终合流已确认
- [ ] final.mp4 路径已返回
