import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { Decorator } from '../elements/Decorator';
import { getTheme, TasteParams } from '../styles/theme';

interface TitleLayoutProps {
  page: Page;
  taste: TasteParams;
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
