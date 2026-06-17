import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { getTheme, TasteParams } from '../styles/theme';

interface QuoteLayoutProps {
  page: Page;
  taste: TasteParams;
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
