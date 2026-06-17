import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface HighlightLineProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
  lineIndex: number;
  currentLine: number;
}

export const HighlightLine: React.FC<HighlightLineProps> = ({ children, duration, delay, lineIndex, currentLine }) => {
  const frame = useCurrentFrame();
  const isHighlighted = lineIndex === currentLine;
  const startFrame = delay * 30;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration * 30],
    isHighlighted ? [0.4, 1] : [1, 0.4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, backgroundColor: isHighlighted ? 'rgba(168,85,247,0.15)' : 'transparent' }}>
    {children}
  </div>;
};
