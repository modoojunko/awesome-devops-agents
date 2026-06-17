import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface HighlightLineProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

export const HighlightLine: React.FC<HighlightLineProps> = ({ children, duration, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = delay * fps;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration * fps],
    [0.4, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, backgroundColor: 'rgba(168,85,247,0.15)', willChange: 'opacity' }}>
    {children}
  </div>;
};
