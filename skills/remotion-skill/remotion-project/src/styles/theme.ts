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
