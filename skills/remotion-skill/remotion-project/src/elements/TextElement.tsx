import React, { ComponentType } from 'react';
import { Element } from '../utils/parseScript';
import { FadeIn } from '../animations/FadeIn';
import { SlideUp } from '../animations/SlideUp';
import { ScaleIn } from '../animations/ScaleIn';
import { Pulse } from '../animations/Pulse';

interface AnimationComponentProps {
  children: React.ReactNode;
  duration: number;
  delay: number;
}

const animationComponents: Partial<Record<string, ComponentType<AnimationComponentProps>>> = {
  fadeIn: FadeIn,
  slideUp: SlideUp,
  scaleIn: ScaleIn,
  pulse: Pulse,
};

interface TextElementProps {
  element: Element;
}

export const TextElement: React.FC<TextElementProps> = ({ element }) => {
  const anim = element.animation;
  if (!anim) {
    return <div style={{ ...element.style as React.CSSProperties }}>{element.content}</div>;
  }

  const AnimComponent = animationComponents[anim.type] || FadeIn;
  const style: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    margin: 0,
    ...(element.style as React.CSSProperties),
  };

  return (
    <AnimComponent duration={anim.duration} delay={anim.delay}>
      <div style={style}>{element.content}</div>
    </AnimComponent>
  );
};
