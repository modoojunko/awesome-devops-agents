import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { BulletList } from '../elements/BulletList';
import { getTheme, TasteParams } from '../styles/theme';

interface BulletLayoutProps {
  page: Page;
  taste: TasteParams;
}

export const BulletLayout: React.FC<BulletLayoutProps> = ({ page, taste }) => {
  const theme = getTheme(taste);
  const title = page.elements.find(e => e.type === 'text');
  const bullets = page.elements.find(e => e.type === 'bullet_items');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px 120px',
      gap: 32, boxSizing: 'border-box',
      fontFamily: theme.fontFamily,
    }}>
      {title && <TextElement element={title} />}
      {bullets && <BulletList element={bullets} />}
    </div>
  );
};
