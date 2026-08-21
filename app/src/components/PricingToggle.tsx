import { motion } from 'framer-motion';

export interface PricingToggleOption {
  label: string;
  value: string;
}

interface PricingToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: PricingToggleOption[];
}

export default function PricingToggle({ value, onChange, options }: PricingToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Pricing type"
      className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur dark:border-white/10 dark:bg-[#122435]/70"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? 'text-white' : 'text-[#121212]/70 hover:text-[#121212] dark:text-white/70 dark:hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="pricing-toggle-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-[#008C9E] dark:bg-[#4CAF50]"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
