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
