import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface SlideUpProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const SlideUp: React.FC<SlideUpProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.7) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `translateY(${translateY}px)` }}>{children}</div>;
};
