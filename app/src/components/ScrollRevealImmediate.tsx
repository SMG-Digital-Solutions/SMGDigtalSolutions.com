import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ScrollRevealImmediateProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export default function ScrollRevealImmediate({
  children,
  className = '',
  threshold = 0.15,
}: ScrollRevealImmediateProps) {
  const { ref, isInView } = useIntersectionObserver({
    threshold,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`${isInView ? 'animate-fade-slide-up' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}
