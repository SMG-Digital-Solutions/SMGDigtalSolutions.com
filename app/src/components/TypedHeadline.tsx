import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface TypedHeadlineProps {
  staticText: string;
  typedText: string;
  className?: string;
}

const TYPE_DURATION = 3.5;
const BLINK_DURATION = 1.8;

export default function TypedHeadline({ staticText, typedText, className = '' }: TypedHeadlineProps) {
  const typedCharacters = typedText.split('');
  const delayPerChar = TYPE_DURATION / typedCharacters.length;
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasVisibleRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  // Reduced-motion visitors get the full headline immediately instead of a
  // character-by-character reveal (WCAG 2.3.3, and avoids a screen reader
  // re-announcing the text as it grows).
  const [visibleChars, setVisibleChars] = useState(prefersReducedMotion ? typedCharacters.length : 0);
  const [phase, setPhase] = useState<'typing' | 'blinking' | 'done'>(prefersReducedMotion ? 'done' : 'typing');

  // Track visibility and reset when scrolling back into view
  useEffect(() => {
    if (prefersReducedMotion) return;

    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // When scrolling back into view, reset animation
        if (entry.isIntersecting && !wasVisibleRef.current) {
          setVisibleChars(0);
          setPhase('typing');
        }
        wasVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Run the animation once while visible
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || phase === 'done') return;

    if (phase === 'typing') {
      if (visibleChars < typedCharacters.length) {
        timeoutRef.current = setTimeout(() => {
          setVisibleChars((c) => c + 1);
        }, delayPerChar * 1000);
      } else {
        timeoutRef.current = setTimeout(() => setPhase('blinking'), 0);
      }
    } else if (phase === 'blinking') {
      timeoutRef.current = setTimeout(() => setPhase('done'), BLINK_DURATION * 1000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prefersReducedMotion, isVisible, phase, visibleChars, typedCharacters.length, delayPerChar]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayPerChar,
        delayChildren: 0,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div ref={containerRef} className={className} style={{ display: 'inline' }}>
      <span>{staticText}</span>
      <br />
      <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
        <motion.span
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ display: 'inline' }}
        >
          {typedCharacters.slice(0, visibleChars).map((char, i) => (
            <motion.span key={i} variants={charVariants} style={{ display: 'inline' }}>
              {char}
            </motion.span>
          ))}
        </motion.span>
        <motion.span
          className="inline-block w-0.5 bg-[#008C9E] dark:bg-[#4CAF50]"
          style={{
            height: '1.5em',
            verticalAlign: 'text-bottom',
          }}
          animate={{
            opacity: phase === 'blinking' ? [1, 0, 1, 0, 1, 0] : 1,
          }}
          transition={{
            duration: phase === 'blinking' ? BLINK_DURATION : 0.1,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}
