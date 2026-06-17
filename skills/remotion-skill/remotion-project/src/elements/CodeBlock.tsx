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
