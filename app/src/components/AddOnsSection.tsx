import { motion, type Variants } from 'framer-motion';
import {
  Wrench,
  MapPin,
  Brain,
  ShieldCheck,
  ChartLineUp,
  PaintBrush,
  Compass,
  Star,
  Robot,
  GearSix,
  Database,
  type Icon,
} from '@phosphor-icons/react';
import MobileAccordionItem from './MobileAccordionItem';

type PriceUnit = 'mo' | 'one-time' | 'quote';

interface AddonItem {
  name: string;
  price: string;
  unit: PriceUnit;
  description: string;
  icon: Icon;
}

interface AddonCategory {
  title: string;
  icon: Icon;
  items: AddonItem[];
}

const addonCategories: AddonCategory[] = [
  {
    title: 'Ongoing Care & Maintenance',
    icon: Wrench,
    items: [
      {
        name: 'Essential Maintenance',
        price: '$100',
        unit: 'mo',
        description:
          'Reliable Cloud Hosting, SSL Security, Domain Management, and Proactive Uptime Monitoring with Rapid Incident Response.',
        icon: ShieldCheck,
      },
      {
        name: 'Growth & Performance',
        price: '$250',
        unit: 'mo',
        description:
          'Everything in Essential, plus Google Business Profile management, monthly SEO & performance reporting, and up to 2 hours of continuous UI/content enhancements.',
        icon: ChartLineUp,
      },
    ],
  },
  {
    title: 'Branding & Local Visibility',
    icon: MapPin,
    items: [
      {
        name: 'AI Branding Package',
        price: '$350 – $900',
        unit: 'one-time',
        description:
          'Complete visual identity polish: Logo refinements, custom color & typography system, brand voice guide, and high-converting website copywriting.',
        icon: PaintBrush,
      },
      {
        name: 'GBP Optimization',
        price: '$300 – $500',
        unit: 'one-time',
        description:
          'Complete Google Maps setup, local keyword optimization, review-automation workflow, and profile verification designed to capture nearby search traffic.',
        icon: Compass,
      },
      {
        name: 'Automated Review Funnel',
        price: '$250 – $400',
        unit: 'one-time',
        description:
          'Automated post-service SMS/email review capture system designed to collect customer feedback and drive 5-star ratings directly to Google.',
        icon: Star,
      },
    ],
  },
  {
    title: 'Advanced AI & Custom Systems',
    icon: Brain,
    items: [
      {
        name: 'Custom AI Agents',
        price: '$750 – $2,500+',
        unit: 'one-time',
        description:
          'Intelligent 24/7 AI agents tailored to your business workflows for instant lead qualification, automated booking, and customer support.',
        icon: Robot,
      },
      {
        name: 'Custom Business Systems & Automations',
        price: 'Custom Quote',
        unit: 'quote',
        description: 'Tailored workflow automations, instant lead notifications, and tool integrations.',
        icon: GearSix,
      },
      {
        name: 'Custom CRM / Admin Dashboard Combo',
        price: 'Custom Quote',
        unit: 'quote',
        description:
          'Full-stack admin portals with dynamic CRUD database capabilities to manage client records, pipeline status, and internal metrics.',
        icon: Database,
      },
    ],
  },
];

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function AddonCard({ item }: { item: AddonItem }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="addon-card relative isolate h-full rounded-2xl p-[1.5px]"
    >
      <span className="addon-ring" aria-hidden="true" />
      <article className="relative z-[1] flex h-full flex-col rounded-[calc(1rem-1.5px)] border border-black/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-[0_20px_45px_rgba(0,140,158,0.18)] dark:border-white/10 dark:bg-[#122435] dark:hover:shadow-[0_20px_45px_rgba(76,175,80,0.16)]">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#008C9E]/10 text-[#008C9E] dark:bg-[#4CAF50]/10 dark:text-[#4CAF50]">
          <Icon size={22} weight="bold" />
        </div>

        <h4 className="text-lg font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">{item.name}</h4>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#008C9E] dark:text-[#4CAF50]">{item.price}</span>
          {item.unit === 'mo' && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#4b5563] dark:bg-white/10 dark:text-[#d5dde4]">
              /mo
            </span>
          )}
          {item.unit === 'one-time' && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#4b5563] dark:bg-white/10 dark:text-[#d5dde4]">
              One-Time
            </span>
          )}
        </div>

        <p className="mt-3 flex-1 text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">{item.description}</p>
      </article>
    </motion.div>
  );
}

export default function AddOnsSection() {
  return (
    <div>
      <h2 className="text-center text-2xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
        Add-Ons
      </h2>
      <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
        Prices vary based on integration complexity and business-specific automation requirements. Custom quotes are
        provided after a brief discovery call to ensure the solution perfectly matches your operational needs.
      </p>

      {/* Tablet and up: full always-visible grid per category */}
      <div className="mt-10 hidden md:block md:space-y-12">
        {addonCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.title}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-4 flex items-center gap-2"
              >
                <CategoryIcon size={20} weight="bold" className="text-[#008C9E] dark:text-[#4CAF50]" />
                <h3 className="text-lg font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
                  {category.title}
                </h3>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={gridVariants}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {category.items.map((item) => (
                  <AddonCard key={item.name} item={item} />
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Mobile: collapsed-by-default accordions, one tap reveals a category's options */}
      <div className="mt-8 space-y-3 md:hidden">
        {addonCategories.map((category) => (
          <MobileAccordionItem
            key={category.title}
            icon={category.icon}
            title={category.title}
            meta={`${category.items.length} option${category.items.length > 1 ? 's' : ''}`}
          >
            <div className="space-y-3">
              {category.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <ItemIcon size={16} weight="bold" className="text-[#008C9E] dark:text-[#4CAF50]" />
                      <span className="text-sm font-bold text-[#121212] dark:text-[#F7F7F7]">{item.name}</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-[#008C9E] dark:text-[#4CAF50]">{item.price}</span>
                      {item.unit !== 'quote' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#4b5563] dark:text-[#d5dde4]">
                          {item.unit === 'mo' ? '/mo' : 'one-time'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#4b5563] dark:text-[#d5dde4]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </MobileAccordionItem>
        ))}
      </div>
    </div>
  );
}
