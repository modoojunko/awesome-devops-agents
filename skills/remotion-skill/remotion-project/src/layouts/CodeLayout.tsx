import React from 'react';
import { Page } from '../utils/parseScript';
import { TextElement } from '../elements/TextElement';
import { CodeBlock } from '../elements/CodeBlock';
import { getTheme, TasteParams } from '../styles/theme';

interface CodeLayoutProps {
  page: Page;
  taste: TasteParams;
}

export const CodeLayout: React.FC<CodeLayoutProps> = ({ page, taste }) => {
  const theme = getTheme(taste);
  const title = page.elements.find(e => e.type === 'text');
  const code = page.elements.find(e => e.type === 'code_block');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 80px',
      gap: 24, boxSizing: 'border-box',
      fontFamily: theme.fontFamily,
    }}>
      {title && <TextElement element={title} />}
      {code && <CodeBlock element={code} />}
    </div>
  );
};
