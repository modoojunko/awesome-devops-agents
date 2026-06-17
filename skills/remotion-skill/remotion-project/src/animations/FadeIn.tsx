import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface FadeInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, willChange: 'opacity' }}>{children}</div>;
};
