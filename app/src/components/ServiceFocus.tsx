import { motion, MotionConfig, type Variants } from 'framer-motion';
import {
  PaintBrush,
  DeviceMobile,
  RocketLaunch,
  ShieldCheck,
  ChartLineUp,
  Sparkle,
  Robot,
  type Icon,
} from '@phosphor-icons/react';
import MobileAccordionItem from './MobileAccordionItem';

interface Service {
  title: string;
  description: string;
  icon: Icon;
}

interface ServiceCategory {
  label: string;
  icon: Icon;
  services: Service[];
}

const serviceCategories: ServiceCategory[] = [
  {
    label: 'Design & Performance Engine',
    icon: PaintBrush,
    services: [
      {
        title: 'Modern Web Design',
        description:
          'Custom visual layouts engineered around your specific brand identity, built with a user-centric approach that ensures high visual appeal and conversions.',
        icon: PaintBrush,
      },
      {
        title: 'Mobile-First Performance',
        description:
          'Flawless user experience across smartphones, tablets, and desktops so you reach customers wherever they are on any screen.',
        icon: DeviceMobile,
      },
      {
        title: 'Conversion-First Architecture',
        description: 'High-speed landing pages and websites engineered specifically to turn site visitors into qualified leads.',
        icon: RocketLaunch,
      },
      {
        title: 'Optimized Performance & Architectural Integrity',
        description: 'Engineered for maximum uptime, sub-second load times, and 60 FPS fluidity across all modern browsers.',
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: 'Growth & Automation Engine',
    icon: ChartLineUp,
    services: [
      {
        title: 'In-Depth Growth Analytics',
        description: 'Powerful insights into visitor behavior and precision tracking to make data-driven decisions for your business.',
        icon: ChartLineUp,
      },
      {
        title: 'Strategic Growth Design',
        description:
          'SEO-optimized page structures and precision messaging designed to put your business in front of your ideal customers.',
        icon: Sparkle,
      },
      {
        title: 'Digital Systems & AI Workforce',
        description:
          'Gain access to digital employees, custom CRMs, and automated workflow systems that save time and automate client intake.',
        icon: Robot,
      },
    ],
  },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/**
 * Service Focus section: full always-visible grid per category on
 * tablet/desktop, collapsed-by-default accordions on mobile. Mirrors the
 * AddOnsSection pattern (see MobileAccordionItem for the shared disclosure
 * primitive) so the two heaviest sections on the page behave consistently.
 */
export default function ServiceFocus() {
  return (
    <MotionConfig reducedMotion="user">
      <div>
        {/* Tablet and up: full always-visible grid per category */}
        <div className="hidden md:block md:space-y-12">
          {serviceCategories.map((category) => (
            <div key={category.label}>
              <motion.h3
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-[#121212]/60 dark:text-[#F7F7F7]/60"
              >
                {category.label}
              </motion.h3>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={gridVariants}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                {category.services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <motion.article key={service.title} variants={itemVariants} className="p-1">
                      <div className="mb-4 inline-flex text-[#008C9E] dark:text-[#4CAF50]">
                        <Icon size={20} weight="bold" />
                      </div>
                      <h4 className="text-lg font-semibold text-[#121212] dark:text-[#F7F7F7]">{service.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-[#4b5563] dark:text-[#d5dde4]">
                        {service.description}
                      </p>
                    </motion.article>
                  );
                })}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Mobile: collapsed-by-default accordions, one tap reveals a category's pillars */}
        <div className="space-y-3 md:hidden">
          {serviceCategories.map((category) => (
            <MobileAccordionItem
              key={category.label}
              icon={category.icon}
              title={category.label}
              meta={`${category.services.length} capabilities`}
            >
              <div className="space-y-3">
                {category.services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.title}
                      className="rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} weight="bold" className="text-[#008C9E] dark:text-[#4CAF50]" />
                        <span className="text-sm font-bold text-[#121212] dark:text-[#F7F7F7]">{service.title}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[#4b5563] dark:text-[#d5dde4]">
                        {service.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </MobileAccordionItem>
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}
