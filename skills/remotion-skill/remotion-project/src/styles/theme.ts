export interface PaletteColors {
  bg: string;
  text: string;
  accent: string;
  muted: string;
  code: string;
}

export interface TasteParams {
  variance: 'low' | 'medium' | 'high';
  density: 'spacious' | 'comfortable' | 'compact';
  motion: 'subtle' | 'balanced' | 'expressive';
  font: 'inter' | 'playfair' | 'mono';
  palette: 'dark' | 'light' | 'brand';
}

export interface Theme {
  colors: PaletteColors;
  fontFamily: string;
  motionDuration: number;
}

const palettes: Record<string, PaletteColors> = {
  dark: { bg: '#0f172a', text: '#ffffff', accent: '#a855f7', muted: '#64748b', code: '#1e293b' },
  light: { bg: '#ffffff', text: '#0f172a', accent: '#2563eb', muted: '#94a3b8', code: '#f8fafc' },
  brand: { bg: '#0f172a', text: '#ffffff', accent: '#22d3ee', muted: '#64748b', code: '#1e293b' },
};

const fontFamilies: Record<string, string> = {
  inter: 'Inter, sans-serif',
  playfair: '"Playfair Display", serif',
  mono: '"JetBrains Mono", monospace',
};

const motionDurations: Record<string, number> = {
  subtle: 0.6,
  balanced: 1.0,
  expressive: 1.5,
};

export function getTheme(taste: TasteParams): Theme {
  const colors = palettes[taste.palette] || palettes.dark;
  const fontFamily = fontFamilies[taste.font] || fontFamilies.inter;
  const motionDuration = motionDurations[taste.motion] || 1.0;

  return { colors, fontFamily, motionDuration };
}
