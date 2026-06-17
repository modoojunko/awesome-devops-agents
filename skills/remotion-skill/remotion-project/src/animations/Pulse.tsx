import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface PulseProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const Pulse: React.FC<PulseProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(
    frame,
    [delay * fps, (delay + duration * 0.5) * fps, (delay + duration) * fps],
    [1, 1.05, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ transform: `scale(${scale})`, willChange: 'transform' }}>{children}</div>;
};
