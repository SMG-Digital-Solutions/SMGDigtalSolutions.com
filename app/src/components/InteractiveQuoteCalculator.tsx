import { useEffect, useId, useMemo, useState } from 'react';
import { motion, MotionConfig, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { CaretDown, Calculator, CheckCircle, Circle } from '@phosphor-icons/react';
import { openBookingDrawer } from './BookingDrawer';

type Unit = 'mo' | 'once';

interface BasePlanOption {
  id: string;
  label: string;
  price: number;
  unit: Unit;
}

interface AddonOption {
  id: string;
  label: string;
  price: number;
  unit: Unit;
}

const basePlanOptions: BasePlanOption[] = [
  { id: 'starter', label: 'Starter Plan', price: 249, unit: 'mo' },
  { id: 'pro', label: 'Pro Plan', price: 499, unit: 'mo' },
  { id: 'launchpad', label: 'Launchpad Build', price: 800, unit: 'once' },
  { id: 'core', label: 'Core Suite Build', price: 1800, unit: 'once' },
];

const addonOptions: AddonOption[] = [
  { id: 'essential', label: 'Essential Maintenance', price: 100, unit: 'mo' },
  { id: 'growth', label: 'Growth & Performance', price: 250, unit: 'mo' },
  { id: 'branding', label: 'AI Branding Package', price: 350, unit: 'once' },
  { id: 'gbp', label: 'GBP Optimization', price: 300, unit: 'once' },
  { id: 'aiagents', label: 'Custom AI Agents', price: 750, unit: 'once' },
];

const currency = (value: number) => `$${value.toLocaleString('en-US')}`;

/**
 * Renders `value` as currency, counting up/down with a spring instead of
 * jumping straight to the new figure. `useSpring`/`useMotionValue` drive the
 * number directly rather than through Framer's `animate` prop, so
 * `MotionConfig`'s reduced-motion handling doesn't reach it automatically —
 * this component checks `useReducedMotion` itself and skips straight to the
 * final value when the visitor has requested reduced motion.
 */
function AnimatedNumber({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 140, damping: 22 });
  const rounded = useTransform(spring, (v) => currency(Math.round(v)));
  const [text, setText] = useState(() => currency(value));

  useEffect(() => {
    if (prefersReducedMotion) {
      setText(currency(value));
      return;
    }
    motionValue.set(value);
  }, [value, motionValue, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    return rounded.on('change', setText);
  }, [rounded, prefersReducedMotion]);

  return <motion.span>{text}</motion.span>;
}

export default function InteractiveQuoteCalculator() {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [basePlanId, setBasePlanId] = useState<string>(basePlanOptions[0].id);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const basePlan = useMemo(
    () => basePlanOptions.find((plan) => plan.id === basePlanId) ?? basePlanOptions[0],
    [basePlanId],
  );

  const selectedAddons = useMemo(
    () => addonOptions.filter((addon) => selectedAddonIds.includes(addon.id)),
    [selectedAddonIds],
  );

  const monthlyTotal =
    (basePlan.unit === 'mo' ? basePlan.price : 0) +
    selectedAddons.filter((addon) => addon.unit === 'mo').reduce((sum, addon) => sum + addon.price, 0);

  const oneTimeTotal =
    (basePlan.unit === 'once' ? basePlan.price : 0) +
    selectedAddons.filter((addon) => addon.unit === 'once').reduce((sum, addon) => sum + addon.price, 0);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((current) =>
      current.includes(id) ? current.filter((addonId) => addonId !== id) : [...current, id],
    );
  };

  const handleRequestQuote = () => {
    const summaryLines = [
      `Base plan: ${basePlan.label} (${currency(basePlan.price)} ${basePlan.unit === 'mo' ? '/month' : 'one-time'})`,
      ...selectedAddons.map(
        (addon) => `+ ${addon.label} (${currency(addon.price)} ${addon.unit === 'mo' ? '/month' : 'one-time'})`,
      ),
    ];

    const totals: string[] = [];
    if (monthlyTotal > 0) totals.push(`Est. monthly: ${currency(monthlyTotal)}/mo`);
    if (oneTimeTotal > 0) totals.push(`Est. one-time: ${currency(oneTimeTotal)}`);

    openBookingDrawer({
      context: 'Custom quote from calculator',
      summaryLines: [...summaryLines, ...totals],
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1A2B3C]/70 sm:p-8">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center gap-2 text-left md:cursor-default"
        >
          <Calculator size={22} weight="bold" className="text-[#008C9E] dark:text-[#4CAF50]" />
          <h3 className="flex-1 text-xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
            Build your quote
          </h3>
          <CaretDown
            size={18}
            weight="bold"
            className={`shrink-0 text-[#121212]/50 transition-transform duration-300 dark:text-white/50 md:hidden ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out md:!grid-rows-[1fr] ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          {/*
            While collapsed on mobile this panel still contains real
            buttons (base plan, add-ons, submit). `invisible` removes it
            from the tab order so a keyboard user can't land on a control
            that's visually collapsed to zero height; `md:!visible` forces
            it back for the always-open desktop layout regardless of
            `isOpen`, matching the `md:!grid-rows-[1fr]` override above.
          */}
          <div className={`overflow-hidden md:!visible ${isOpen ? 'visible' : 'invisible'}`}>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-8">
                <div>
                  <p className="mb-3 text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                    1. Choose a base plan
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {basePlanOptions.map((plan) => {
                      const isActive = plan.id === basePlanId;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setBasePlanId(plan.id)}
                          aria-pressed={isActive}
                          className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            isActive
                              ? 'border-[#008C9E] bg-[#008C9E]/10 dark:border-[#4CAF50] dark:bg-[#4CAF50]/10'
                              : 'border-black/10 bg-white/60 hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                          }`}
                        >
                          <span className="flex items-center gap-2 font-semibold text-[#121212] dark:text-[#F7F7F7]">
                            {isActive ? (
                              <CheckCircle size={18} weight="fill" className="text-[#008C9E] dark:text-[#4CAF50]" />
                            ) : (
                              <Circle size={18} className="text-[#121212]/30 dark:text-white/30" />
                            )}
                            {plan.label}
                          </span>
                          <span className="whitespace-nowrap text-[#4b5563] dark:text-[#d5dde4]">
                            {currency(plan.price)}
                            {plan.unit === 'mo' ? '/mo' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                    2. Add optional add-ons
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {addonOptions.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleAddon(addon.id)}
                          className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            isChecked
                              ? 'border-[#008C9E] bg-[#008C9E]/10 dark:border-[#4CAF50] dark:bg-[#4CAF50]/10'
                              : 'border-black/10 bg-white/60 hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                          }`}
                        >
                          <span className="flex items-center gap-2 font-semibold text-[#121212] dark:text-[#F7F7F7]">
                            {isChecked ? (
                              <CheckCircle size={18} weight="fill" className="text-[#008C9E] dark:text-[#4CAF50]" />
                            ) : (
                              <Circle size={18} className="text-[#121212]/30 dark:text-white/30" />
                            )}
                            {addon.label}
                          </span>
                          <span className="whitespace-nowrap text-[#4b5563] dark:text-[#d5dde4]">
                            {currency(addon.price)}
                            {addon.unit === 'mo' ? '/mo' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[1.5rem] bg-[#00416A]/5 p-6 dark:bg-white/5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008C9E] dark:text-[#4CAF50]">
                    Estimated total
                  </p>
                  <div className="mt-4 space-y-3">
                    {monthlyTotal > 0 && (
                      <div className="flex items-baseline gap-1 text-3xl font-black text-[#121212] dark:text-[#F7F7F7]">
                        <AnimatedNumber value={monthlyTotal} />
                        <span className="text-base font-semibold text-[#4b5563] dark:text-[#d5dde4]">/mo</span>
                      </div>
                    )}
                    {oneTimeTotal > 0 && (
                      <div className="flex items-baseline gap-1 text-3xl font-black text-[#121212] dark:text-[#F7F7F7]">
                        <AnimatedNumber value={oneTimeTotal} />
                        <span className="text-base font-semibold text-[#4b5563] dark:text-[#d5dde4]">one-time</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                  data-cta="quote-calculator-get-quote"
                >
                  Get this quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
