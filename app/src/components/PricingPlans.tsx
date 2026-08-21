import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import PricingToggle from './PricingToggle';
import { openBookingDrawer } from './BookingDrawer';

type BillingMode = 'monthly' | 'onetime';

interface Plan {
  tier: string;
  price: string;
  suffix: string;
  summary: string;
  features: string[];
  highlight?: boolean;
}

const monthlyPlans: Plan[] = [
  {
    tier: 'Starter Plan',
    price: '$249',
    suffix: '/month',
    summary: 'Low-upfront, fully managed website built to get your business online fast and looking sharp.',
    features: [
      'Custom responsive website build',
      'Speed & performance optimization',
      'Foundational SEO setup',
      'Basic analytics dashboard',
      'QR code digital business card',
    ],
  },
  {
    tier: 'Pro Plan',
    price: '$499',
    suffix: '/month',
    summary: 'Everything in Starter, fully managed end-to-end with ongoing content support.',
    features: [
      'Everything in Starter',
      'Domain registration',
      'Managed cloud hosting',
      'SSL & enterprise security',
      'Google Business Profile management',
      'Monthly content updates',
    ],
    highlight: true,
  },
];

const onetimePlans: Plan[] = [
  {
    tier: 'Launchpad Build',
    price: '$800',
    suffix: 'one-time',
    summary: 'A fast, high-converting 1-page landing page built to capture leads immediately.',
    features: ['1-page landing page', 'Speed-optimized build', 'Basic SEO setup'],
  },
  {
    tier: 'Core Suite Build',
    price: '$1,800+',
    suffix: 'one-time',
    summary: 'A full multi-page website with custom UI polish and complete technical SEO.',
    features: [
      'Full multi-page website (3–5 pages)',
      'Custom UI polish',
      'Lead magnet integration',
      'Interactive elements',
      'Complete technical SEO',
    ],
    highlight: true,
  },
  {
    tier: 'Site Refresh & Performance Overhaul',
    price: '$500–$1,200',
    suffix: 'one-time',
    summary: 'For existing slow sites — a redesign and repair engineered for speed.',
    features: ['UI/UX redesign', 'Speed optimization', 'Technical SEO repair'],
  },
];

export default function PricingPlans() {
  const [mode, setMode] = useState<BillingMode>('monthly');
  const plans = mode === 'monthly' ? monthlyPlans : onetimePlans;

  return (
    <div>
      <div className="flex justify-center">
        <PricingToggle
          value={mode}
          onChange={(value) => setMode(value as BillingMode)}
          options={[
            { label: 'Monthly Subscription', value: 'monthly' },
            { label: 'One-Time Build', value: 'onetime' },
          ]}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`mt-8 grid gap-6 ${mode === 'monthly' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
        >
          {plans.map((plan) => (
            <article
              key={plan.tier}
              className={`flex h-full flex-col rounded-[1.5rem] p-6 ${
                plan.highlight
                  ? 'bg-[#008C9E]/15 ring-1 ring-[#008C9E]/30 dark:bg-[#4CAF50]/15 dark:ring-[#4CAF50]/30'
                  : 'bg-white/65 dark:bg-[#122435]/75'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-black tracking-tight text-[#0f172a] dark:text-[#F7F7F7]">{plan.tier}</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#008C9E] dark:text-[#4CAF50] md:text-[1.85rem]">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-[#4b5563] dark:text-[#d5dde4]">{plan.suffix}</span>
                </div>
              </div>
              <p className="mb-6 text-sm leading-7 text-[#334155] dark:text-[#cbd5e1]">{plan.summary}</p>
              <p className="text-sm font-medium text-[#334155] dark:text-[#cbd5e1]">What&apos;s included</p>
              <ul className="mt-3 flex-1 space-y-2 text-sm leading-6 text-[#334155] dark:text-[#cbd5e1]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-[#008C9E] dark:text-[#4CAF50]"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  openBookingDrawer({
                    context: `${plan.tier} — ${plan.price} ${plan.suffix}`,
                    summaryLines: plan.features,
                  })
                }
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
              >
                Get started
              </button>
            </article>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
