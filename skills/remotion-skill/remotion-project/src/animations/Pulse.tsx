import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface PulseProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const Pulse: React.FC<PulseProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [delay * 30, (delay + duration * 0.5) * 30, (delay + duration) * 30],
    [1, 1.05, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ transform: `scale(${scale})` }}>{children}</div>;
};
