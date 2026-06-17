import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { getTheme, TasteParams } from '../styles/theme';

interface BodyLayoutProps {
  page: Page;
  taste: TasteParams;
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
