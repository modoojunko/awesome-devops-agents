import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ScaleInProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [delay * 30, (delay + duration) * 30],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.5) * 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, transform: `scale(${scale})` }}>{children}</div>;
};
