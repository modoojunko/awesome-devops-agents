# Remotion Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a superpower skill that takes an article and produces a 1920×1080 video with AI voiceover, using taste-skill for visual design and Remotion for rendering.

**Architecture:** Two layers — (1) SKILL.md defines the AI workflow: read article → taste-skill → media-script.json → Remotion render → Edge-TTS → ffmpeg merge. (2) A bundled Remotion TypeScript project provides layouts, elements, animations, and theme system that read media-script.json and render each page.

**Tech Stack:** Remotion (React/TypeScript), Edge-TTS, ffmpeg, taste-skill

---

## File Structure

```
skills/remotion-skill/
├── SKILL.md
└── remotion-project/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── Root.tsx
    │   ├── Video.tsx
    │   ├── layouts/
    │   │   ├── TitleLayout.tsx
    │   │   ├── BodyLayout.tsx
    │   │   ├── CodeLayout.tsx
    │   │   ├── BulletLayout.tsx
    │   │   ├── QuoteLayout.tsx
    │   │   └── SummaryLayout.tsx
    │   ├── elements/
    │   │   ├── TextElement.tsx
    │   │   ├── CodeBlock.tsx
    │   │   ├── BulletList.tsx
    │   │   └── Decorator.tsx
    │   ├── animations/
    │   │   ├── FadeIn.tsx
    │   │   ├── SlideUp.tsx
    │   │   ├── ScaleIn.tsx
    │   │   ├── HighlightLine.tsx
    │   │   └── Pulse.tsx
    │   ├── styles/
    │   │   ├── theme.ts
    │   │   └── fonts.ts
    │   └── utils/
    │       ├── parseScript.ts
    │       └── timing.ts
```

---

### Task 1: Create remotion-skill SKILL.md

**Files:**
- Create: `skills/remotion-skill/SKILL.md`

- [ ] **Step 1: Create the skill directory and write SKILL.md**

```markdown
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

完整 JSON 格式参考设计文档。

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
```

- [ ] **Step 2: Commit**

```bash
git add skills/remotion-skill/SKILL.md
git commit -m "feat: add remotion-skill SKILL.md — article-to-video workflow with taste-skill + Edge-TTS"
```

---

### Task 2: Scaffold Remotion project

**Files:**
- Create: `skills/remotion-skill/remotion-project/package.json`
- Create: `skills/remotion-skill/remotion-project/tsconfig.json`
- Create: `skills/remotion-skill/remotion-project/src/Root.tsx`
- Create: `skills/remotion-skill/remotion-project/src/Video.tsx`
- Create: `skills/remotion-skill/remotion-project/src/utils/parseScript.ts`
- Create: `skills/remotion-skill/remotion-project/src/utils/timing.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "remotion-video",
  "version": "1.0.0",
  "description": "Remotion video project for awesome-devops-agents",
  "scripts": {
    "build": "remotion render src/Root.tsx Video out/video.mp4",
    "preview": "remotion preview src/Root.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "remotion": "^4.0.0",
    "@remotion/cli": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create utils/parseScript.ts**

```typescript
import fs from 'fs';
import path from 'path';

export interface Animation {
  type: 'fadeIn' | 'slideUp' | 'scaleIn' | 'highlightLine' | 'pulse' | 'slideLeft' | 'scaleX';
  duration: number;
  delay: number;
  easing?: string;
  line?: number;
}

export interface Element {
  type: 'text' | 'subtitle' | 'paragraph' | 'code_block' | 'bullet_items' | 'quote_text' | 'highlight' | 'decorator' | 'image';
  content?: string;
  style?: Record<string, unknown>;
  animation?: Animation;
  animations?: Animation[];
}

export interface Page {
  id: number;
  layout: 'title' | 'body' | 'code' | 'bullet' | 'quote' | 'summary';
  elements: Element[];
  duration_sec: number;
  bg_color: string;
  bg_gradient?: string;
  tts_text?: string;
}

export interface MediaScript {
  meta: {
    title: string;
    total_pages: number;
    total_duration_sec: number;
    resolution: string;
    fps: number;
  };
  taste: {
    variance: 'low' | 'medium' | 'high';
    density: 'spacious' | 'comfortable' | 'compact';
    motion: 'subtle' | 'balanced' | 'expressive';
    font: 'inter' | 'playfair' | 'mono';
    palette: 'dark' | 'light' | 'brand';
  };
  pages: Page[];
}

export function parseScript(jsonPath: string): MediaScript {
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(raw) as MediaScript;
}
```

- [ ] **Step 4: Create utils/timing.ts**

```typescript
import { Page } from './parseScript';

export function getPageFrameRange(page: Page, previousPages: Page[], fps: number): [number, number] {
  const startFrame = previousPages.reduce((sum, p) => sum + p.duration_sec * fps, 0);
  const endFrame = startFrame + page.duration_sec * fps;
  return [startFrame, endFrame];
}

export function getElementStartFrame(delay: number, pageStartFrame: number, fps: number): number {
  return pageStartFrame + delay * fps;
}

export function getPageCenterY(pageIndex: number, totalPages: number): number {
  return 540; // center of 1080p
}
```

- [ ] **Step 5: Create Root.tsx**

```typescript
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={30 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

- [ ] **Step 6: Create Video.tsx**

```typescript
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { parseScript, MediaScript, Page } from './utils/parseScript';
import { getPageFrameRange } from './utils/timing';
import { TitleLayout } from './layouts/TitleLayout';
import { BodyLayout } from './layouts/BodyLayout';
import { CodeLayout } from './layouts/CodeLayout';
import { BulletLayout } from './layouts/BulletLayout';
import { QuoteLayout } from './layouts/QuoteLayout';
import { SummaryLayout } from './layouts/SummaryLayout';
import { TasteParams } from './styles/theme';

const script: MediaScript = parseScript('./src/media-script.json');

const layoutComponents: Record<string, React.FC<{ page: Page; frame: number; fps: number; taste: TasteParams }>> = {
  title: TitleLayout,
  body: BodyLayout,
  code: CodeLayout,
  bullet: BulletLayout,
  quote: QuoteLayout,
  summary: SummaryLayout,
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let accumulatedFrames = 0;
  for (const page of script.pages) {
    const pageFrames = page.duration_sec * fps;
    if (frame < accumulatedFrames + pageFrames) {
      const pageFrame = frame - accumulatedFrames;
      const Layout = layoutComponents[page.layout];
      if (!Layout) return null;
      return (
        <div style={{ width: 1920, height: 1080, backgroundColor: page.bg_color, overflow: 'hidden' }}>
          <Layout page={page} frame={pageFrame} fps={fps} taste={script.taste} />
        </div>
      );
    }
    accumulatedFrames += pageFrames;
  }
  return null;
};
```

- [ ] **Step 7: Install dependencies**

Run: `cd skills/remotion-skill/remotion-project && npm install`

- [ ] **Step 8: Commit**

```bash
git add skills/remotion-skill/remotion-project/
git commit -m "feat: scaffold Remotion project — Root, Video, utils, package.json, tsconfig"
```

---

### Task 3: Create theme system and animations

**Files:**
- Create: `skills/remotion-skill/remotion-project/src/styles/theme.ts`
- Create: `skills/remotion-skill/remotion-project/src/styles/fonts.ts`
- Create: `skills/remotion-skill/remotion-project/src/animations/FadeIn.tsx`
- Create: `skills/remotion-skill/remotion-project/src/animations/SlideUp.tsx`
- Create: `skills/remotion-skill/remotion-project/src/animations/ScaleIn.tsx`
- Create: `skills/remotion-skill/remotion-project/src/animations/HighlightLine.tsx`
- Create: `skills/remotion-skill/remotion-project/src/animations/Pulse.tsx`

- [ ] **Step 1: Create styles/theme.ts**

```typescript
export interface TasteParams {
  variance: 'low' | 'medium' | 'high';
  density: 'spacious' | 'comfortable' | 'compact';
  motion: 'subtle' | 'balanced' | 'expressive';
  font: 'inter' | 'playfair' | 'mono';
  palette: 'dark' | 'light' | 'brand';
}

const palettes = {
  dark: { bg: '#0f172a', text: '#ffffff', accent: '#a855f7', muted: '#64748b', code: '#1e293b' },
  light: { bg: '#ffffff', text: '#0f172a', accent: '#2563eb', muted: '#94a3b8', code: '#f8fafc' },
  brand: { bg: '#0f172a', text: '#ffffff', accent: '#22d3ee', muted: '#64748b', code: '#1e293b' },
};

const fontFamilies = {
  inter: 'Inter, sans-serif',
  playfair: '"Playfair Display", serif',
  mono: '"JetBrains Mono", monospace',
};

export function getTheme(taste: TasteParams) {
  const colors = palettes[taste.palette] || palettes.dark;
  const fontFamily = fontFamilies[taste.font] || fontFamilies.inter;
  const motionDuration = taste.motion === 'subtle' ? 0.6 : taste.motion === 'balanced' ? 1.0 : 1.5;

  return { colors, fontFamily, motionDuration };
}
```

- [ ] **Step 2: Create styles/fonts.ts**

```typescript
import { continueRender, delayRender } from 'remotion';

export const loadFonts = async (): Promise<void> => {
  const waitForFont = delayRender();
  try {
    const font = new FontFace(
      'Inter',
      'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)',
    );
    await font.load();
    document.fonts.add(font);
  } finally {
    continueRender(waitForFont);
  }
};
```

- [ ] **Step 3: Create animations/FadeIn.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface FadeInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity }}>{children}</div>;
};
```

- [ ] **Step 4: Create animations/SlideUp.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface SlideUpProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const SlideUp: React.FC<SlideUpProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.7) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `translateY(${translateY}px)` }}>{children}</div>;
};
```

- [ ] **Step 5: Create animations/ScaleIn.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ScaleInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.5) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `scale(${scale})` }}>{children}</div>;
};
```

- [ ] **Step 6: Create animations/HighlightLine.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface HighlightLineProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
  lineIndex: number;
  currentLine: number;
}

export const HighlightLine: React.FC<HighlightLineProps> = ({ children, duration, delay, lineIndex, currentLine }) => {
  const frame = useCurrentFrame();
  const isHighlighted = lineIndex === currentLine;
  const startFrame = delay * 30;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration * 30],
    isHighlighted ? [0.4, 1] : [1, 0.4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, backgroundColor: isHighlighted ? 'rgba(168,85,247,0.15)' : 'transparent' }}>
    {children}
  </div>;
};
```

- [ ] **Step 7: Create animations/Pulse.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface PulseProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const Pulse: React.FC<PulseProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.5) * 30, (delay + duration) * 30],
    [1, 1.05, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ transform: `scale(${scale})` }}>{children}</div>;
};
```

- [ ] **Step 8: Commit**

```bash
git add skills/remotion-skill/remotion-project/src/styles/ skills/remotion-skill/remotion-project/src/animations/
git commit -m "feat: add theme system and 5 animation components (fadeIn, slideUp, scaleIn, highlightLine, pulse)"
```

---

### Task 4: Create element components

**Files:**
- Create: `skills/remotion-skill/remotion-project/src/elements/TextElement.tsx`
- Create: `skills/remotion-skill/remotion-project/src/elements/CodeBlock.tsx`
- Create: `skills/remotion-skill/remotion-project/src/elements/BulletList.tsx`
- Create: `skills/remotion-skill/remotion-project/src/elements/Decorator.tsx`

- [ ] **Step 1: Create elements/TextElement.tsx**

```typescript
import React from 'react';
import { Element } from '../utils/parseScript';
import { FadeIn } from '../animations/FadeIn';
import { SlideUp } from '../animations/SlideUp';
import { ScaleIn } from '../animations/ScaleIn';
import { Pulse } from '../animations/Pulse';

const animationComponents = {
  fadeIn: FadeIn,
  slideUp: SlideUp,
  scaleIn: ScaleIn,
  pulse: Pulse,
};

interface TextElementProps {
  element: Element;
}

export const TextElement: React.FC<TextElementProps> = ({ element }) => {
  const anim = element.animation;
  if (!anim) {
    return <div style={{ ...element.style as React.CSSProperties }}>{element.content}</div>;
  }

  const AnimComponent = animationComponents[anim.type as keyof typeof animationComponents] || FadeIn;
  const style: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    margin: 0,
    ...(element.style as React.CSSProperties),
  };

  return (
    <AnimComponent duration={anim.duration} delay={anim.delay}>
      <div style={style}>{element.content}</div>
    </AnimComponent>
  );
};
```

- [ ] **Step 2: Create elements/CodeBlock.tsx**

```typescript
import React from 'react';
import { Element } from '../utils/parseScript';
import { FadeIn } from '../animations/FadeIn';
import { HighlightLine } from '../animations/HighlightLine';

interface CodeBlockProps {
  element: Element;
  frame: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ element, frame }) => {
  const lines = (element.content || '').split('\n');
  const highlightAnims = element.animations?.filter(a => a.type === 'highlightLine') || [];

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: 12,
      padding: '24px 32px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 20,
      lineHeight: 1.8,
      color: '#e2e8f0',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <FadeIn duration={0.5} delay={0}>
        <pre style={{ margin: 0 }}>
          {lines.map((line, i) => {
            const highlight = highlightAnims.find(a => a.line === i + 1);
            if (highlight) {
              return (
                <HighlightLine
                  key={i}
                  duration={highlight.duration}
                  delay={highlight.delay}
                  lineIndex={i}
                  currentLine={i}
                >
                  <code>{line || ' '}</code>
                </HighlightLine>
              );
            }
            return <div key={i} style={{ opacity: 0.6 }}><code>{line || ' '}</code></div>;
          })}
        </pre>
      </FadeIn>
    </div>
  );
};
```

- [ ] **Step 3: Create elements/BulletList.tsx**

```typescript
import React from 'react';
import { Element } from '../utils/parseScript';
import { SlideUp } from '../animations/SlideUp';

interface BulletListProps {
  element: Element;
  fps: number;
}

export const BulletList: React.FC<BulletListProps> = ({ element, fps }) => {
  const items = (element.content || '').split('\n').filter(Boolean);
  const baseDelay = element.animation?.delay || 0;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <SlideUp key={i} duration={0.5} delay={baseDelay + i * 0.3}>
          <li style={{
            fontSize: 28,
            color: '#e2e8f0',
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: '#a855f7', flexShrink: 0,
            }} />
            {item}
          </li>
        </SlideUp>
      ))}
    </ul>
  );
};
```

- [ ] **Step 4: Create elements/Decorator.tsx**

```typescript
import React from 'react';
import { Element } from '../utils/parseScript';
import { interpolate, useCurrentFrame } from 'remotion';

interface DecoratorProps {
  element: Element;
}

export const Decorator: React.FC<DecoratorProps> = ({ element }) => {
  const frame = useCurrentFrame();
  const anim = element.animation;
  if (!anim) return null;

  const scaleX = interpolate(
    frame,
    [anim.delay * 30, (anim.delay + anim.duration) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const style: React.CSSProperties = {
    ...(element.style as React.CSSProperties),
    transform: `scaleX(${scaleX})`,
    transformOrigin: 'left',
  };

  return <div style={style} />;
};
```

- [ ] **Step 5: Commit**

```bash
git add skills/remotion-skill/remotion-project/src/elements/
git commit -m "feat: add 4 element components — TextElement, CodeBlock, BulletList, Decorator"
```

---

### Task 5: Create layout components

**Files:**
- Create: `skills/remotion-skill/remotion-project/src/layouts/TitleLayout.tsx`
- Create: `skills/remotion-skill/remotion-project/src/layouts/BodyLayout.tsx`
- Create: `skills/remotion-skill/remotion-project/src/layouts/CodeLayout.tsx`
- Create: `skills/remotion-skill/remotion-project/src/layouts/BulletLayout.tsx`
- Create: `skills/remotion-skill/remotion-project/src/layouts/QuoteLayout.tsx`
- Create: `skills/remotion-skill/remotion-project/src/layouts/SummaryLayout.tsx`

- [ ] **Step 1: Create layouts/TitleLayout.tsx**

```typescript
import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { Decorator } from '../elements/Decorator';
import { getTheme } from '../styles/theme';

interface TitleLayoutProps {
  page: Page;
  taste: import('../styles/theme').TasteParams;
}

export const TitleLayout: React.FC<TitleLayoutProps> = ({ page, taste }) => {
  const theme = getTheme(taste);
  const textEl = page.elements.find(e => e.type === 'text');
  const subtitleEl = page.elements.find(e => e.type === 'subtitle');
  const decoratorEl = page.elements.find(e => e.type === 'decorator');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: 24, padding: 80, boxSizing: 'border-box',
      fontFamily: theme.fontFamily,
    }}>
      {textEl && <TextElement element={textEl} />}
      {subtitleEl && <TextElement element={subtitleEl} />}
      {decoratorEl && <Decorator element={decoratorEl} />}
    </div>
  );
};
```

- [ ] **Step 2: Create layouts/BodyLayout.tsx**

```typescript
import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { getTheme } from '../styles/theme';

interface BodyLayoutProps {
  page: Page;
  taste: import('../styles/theme').TasteParams;
}

export const BodyLayout: React.FC<BodyLayoutProps> = ({ page, taste }) => {
  const theme = getTheme(taste);
  const heading = page.elements.find(e => e.type === 'text');
  const paragraph = page.elements.find(e => e.type === 'paragraph');
  const highlight = page.elements.find(e => e.type === 'highlight');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px 120px',
      gap: 32, boxSizing: 'border-box',
      fontFamily: theme.fontFamily,
    }}>
      {heading && <TextElement element={heading} />}
      {paragraph && <TextElement element={paragraph} />}
      {highlight && <TextElement element={highlight} />}
    </div>
  );
};
```

- [ ] **Step 3: Create layouts/CodeLayout.tsx**

```typescript
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { CodeBlock } from '../elements/CodeBlock';

interface CodeLayoutProps {
  page: Page;
  frame: number;
  taste: import('../styles/theme').TasteParams;
}

export const CodeLayout: React.FC<CodeLayoutProps> = ({ page, frame }) => {
  const title = page.elements.find(e => e.type === 'text');
  const code = page.elements.find(e => e.type === 'code_block');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 80px',
      gap: 24, boxSizing: 'border-box',
    }}>
      {title && <TextElement element={title} />}
      {code && <CodeBlock element={code} frame={frame} />}
    </div>
  );
};
```

- [ ] **Step 4: Create layouts/BulletLayout.tsx**

```typescript
import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { BulletList } from '../elements/BulletList';

interface BulletLayoutProps {
  page: Page;
  fps: number;
  taste: import('../styles/theme').TasteParams;
}

export const BulletLayout: React.FC<BulletLayoutProps> = ({ page, fps }) => {
  const title = page.elements.find(e => e.type === 'text');
  const bullets = page.elements.find(e => e.type === 'bullet_items');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px 120px',
      gap: 32, boxSizing: 'border-box',
    }}>
      {title && <TextElement element={title} />}
      {bullets && <BulletList element={bullets} fps={fps} />}
    </div>
  );
};
```

- [ ] **Step 5: Create layouts/QuoteLayout.tsx**

```typescript
import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { getTheme } from '../styles/theme';

interface QuoteLayoutProps {
  page: Page;
  taste: import('../styles/theme').TasteParams;
}

export const QuoteLayout: React.FC<QuoteLayoutProps> = ({ page, taste }) => {
  const theme = getTheme(taste);
  const quote = page.elements.find(e => e.type === 'quote_text');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: 120, boxSizing: 'border-box',
      fontFamily: '"Playfair Display", serif',
    }}>
      <div style={{
        fontSize: 48, fontStyle: 'italic', color: theme.colors.accent,
        textAlign: 'center', lineHeight: 1.5, maxWidth: 1200,
        borderLeft: `4px solid ${theme.colors.accent}`,
        paddingLeft: 40,
      }}>
        {quote && <TextElement element={quote} />}
      </div>
    </div>
  );
};
```

- [ ] **Step 6: Create layouts/SummaryLayout.tsx**

```typescript
import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { BulletList } from '../elements/BulletList';

interface SummaryLayoutProps {
  page: Page;
  fps: number;
  taste: import('../styles/theme').TasteParams;
}

export const SummaryLayout: React.FC<SummaryLayoutProps> = ({ page, fps }) => {
  const title = page.elements.find(e => e.type === 'text');
  const bullets = page.elements.find(e => e.type === 'bullet_items');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '60px 120px', gap: 32, boxSizing: 'border-box',
    }}>
      {title && <TextElement element={title} />}
      {bullets && <BulletList element={bullets} fps={fps} />}
    </div>
  );
};
```

- [ ] **Step 7: Commit**

```bash
git add skills/remotion-skill/remotion-project/src/layouts/
git commit -m "feat: add 6 layout components — Title, Body, Code, Bullet, Quote, Summary"
```
