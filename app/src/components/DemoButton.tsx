import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useState } from 'react';

const DEMO_REQUEST_URL = 'https://tally.so/r/rjk8vp';
const REDIRECT_DELAY_MS = 900;

/**
 * Primary demo-request CTA. Shows a brief loading state before redirecting
 * to the external booking form, so the click always gets visible feedback.
 */
export default function DemoButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (isLoading) return;

    setIsLoading(true);
    window.setTimeout(() => {
      window.location.assign(DEMO_REQUEST_URL);
    }, REDIRECT_DELAY_MS);
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: '0 30px 70px rgba(0, 200, 220, 0.45), 0 0 50px rgba(0, 200, 220, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        style={{ willChange: 'transform, box-shadow' }}
        className="inline-flex min-w-[252px] items-center justify-center gap-2 rounded-full bg-[#4CAF50] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(76,175,80,0.24)] transition hover:bg-[#3f9743] disabled:cursor-not-allowed disabled:opacity-80 dark:bg-[#4CAF50]"
        aria-label="Request a custom demo"
        data-cta="demo-button"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="inline-flex items-center gap-2"
              aria-live="polite"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
              Opening your secure demo request...
            </motion.span>
          ) : (
            <motion.span
              key="ready"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="inline-flex items-center gap-2"
            >
              Request your demo today
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </MotionConfig>
  );
}
