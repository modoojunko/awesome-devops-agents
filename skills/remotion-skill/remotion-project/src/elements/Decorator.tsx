import React from 'react';
import { Element } from '../utils/parseScript';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface DecoratorProps {
  element: Element;
}

export const Decorator: React.FC<DecoratorProps> = ({ element }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = element.animation;
  if (!anim) return null;

  const scaleX = interpolate(
    frame,
    [anim.delay * fps, (anim.delay + anim.duration) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const style: React.CSSProperties = {
    ...(element.style as React.CSSProperties),
    transform: `scaleX(${scaleX})`,
    transformOrigin: 'left',
  };

  return <div style={style} />;
};
