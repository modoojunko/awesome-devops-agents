import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface FadeInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity }}>{children}</div>;
};
