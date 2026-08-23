import { motion, MotionConfig } from 'framer-motion';
import { openBookingDrawer } from './BookingDrawer';

/**
 * Primary demo-request CTA. Opens the in-app booking drawer with
 * `isDemoRequest: true`, so submissions land in the admin app's "Pending
 * Demos" queue (and trigger its notification email) instead of the
 * external Tally.so form this used to redirect to.
 */
export default function DemoButton() {
  const handleClick = () => {
    openBookingDrawer({
      context: 'Request your demo today',
      isDemoRequest: true,
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: '0 30px 70px rgba(0, 200, 220, 0.45), 0 0 50px rgba(0, 200, 220, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        style={{ willChange: 'transform, box-shadow' }}
        className="inline-flex min-w-[252px] items-center justify-center gap-2 rounded-full bg-[#4CAF50] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(76,175,80,0.24)] transition hover:bg-[#3f9743] dark:bg-[#4CAF50]"
        aria-label="Request a custom demo"
        data-cta="demo-button"
      >
        Request your demo today
      </motion.button>
    </MotionConfig>
  );
}
