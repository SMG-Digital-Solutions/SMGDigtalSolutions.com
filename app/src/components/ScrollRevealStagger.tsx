import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ScrollRevealStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}

export default function ScrollRevealStagger({
  children,
  className = '',
  staggerDelay = 80,
  threshold = 0.15,
}: ScrollRevealStaggerProps) {
  const { ref, isInView } = useIntersectionObserver({
    threshold,
    triggerOnce: true,
  });

  const staggerClass = staggerDelay === 80 ? 'animate-stagger' : 'animate-stagger-custom';

  return (
    <div
      ref={ref}
      className={`${isInView ? staggerClass : ''} ${className}`}
      style={
        isInView && staggerDelay !== 80
          ? {
              '--stagger-delay': `${staggerDelay}ms`,
            } as React.CSSProperties & { '--stagger-delay': string }
          : undefined
      }
    >
      {children}
    </div>
  );
}
