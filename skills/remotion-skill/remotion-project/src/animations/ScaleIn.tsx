import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface ScaleInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + duration * 0.5) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `scale(${scale})`, willChange: 'opacity, transform' }}>{children}</div>;
};
