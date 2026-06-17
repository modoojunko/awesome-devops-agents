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
