import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface SlideUpProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const SlideUp: React.FC<SlideUpProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const translateY = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + duration * 0.7) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `translateY(${translateY}px)`, willChange: 'opacity, transform' }}>{children}</div>;
};
