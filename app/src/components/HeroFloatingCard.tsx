import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

export default function HeroFloatingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.8 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }
      }}
      className="w-full max-w-sm rounded-2xl border border-black/10 bg-gradient-to-br from-white to-white p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:from-white/20 dark:to-white/15"
      style={{ position: 'relative', zIndex: 100 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4CAF50]/30 to-[#008C9E]/20">
          <Sparkle size={24} weight="bold" className="text-[#4CAF50]" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#121212] dark:text-white">
            AI-Powered Architecture
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#3f4b5a] dark:text-white/70">
            Intelligent design patterns that adapt to your visitors' behavior.
          </p>

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <div className="text-lg font-black text-[#4CAF50]">2.3x</div>
              <div className="text-xs text-[#3f4b5a] dark:text-white/60">Lead conversion</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-black text-[#008C9E]">94+</div>
              <div className="text-xs text-[#3f4b5a] dark:text-white/60">Performance</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}




