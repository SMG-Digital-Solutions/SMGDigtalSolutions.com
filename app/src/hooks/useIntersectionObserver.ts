import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  onIntersectionChange?: (isInView: boolean) => void;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): {
  ref: React.RefObject<HTMLElement>;
  isInView: boolean;
} {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const hasTriggeredRef = useRef(false);

  const {
    threshold = 0.15,
    rootMargin = '-50px',
    triggerOnce = false,
    onIntersectionChange,
  } = options;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          hasTriggeredRef.current = true;
          onIntersectionChange?.(true);

          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else {
          if (!triggerOnce) {
            setIsInView(false);
            onIntersectionChange?.(false);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [threshold, rootMargin, triggerOnce, onIntersectionChange]);

  return { ref, isInView };
}
