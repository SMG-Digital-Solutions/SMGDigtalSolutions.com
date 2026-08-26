import { motion, MotionConfig, type Variants } from 'framer-motion';
import MobileAccordionItem from './MobileAccordionItem';
import { ICON_MAP, DEFAULT_ICON } from '../lib/iconMap';
import type { ServiceCategoryContent } from '../lib/content';

interface ServiceFocusProps {
  categories: ServiceCategoryContent[];
}

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
export default function ServiceFocus({ categories }: ServiceFocusProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div>
        {/* Tablet and up: full always-visible grid per category */}
        <div className="hidden md:block md:space-y-12">
          {categories.map((category) => (
            <div key={category.id}>
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
                  const Icon = ICON_MAP[service.iconKey];
                  return (
                    <motion.article key={service.id} variants={itemVariants} className="p-1">
                      <div className="mb-4 inline-flex text-[#008C9E] dark:text-[#4CAF50]">
                        {Icon && <Icon size={20} weight="bold" />}
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
          {categories.map((category) => {
            const CategoryIcon = ICON_MAP[category.iconKey] ?? DEFAULT_ICON;
            return (
              <MobileAccordionItem
                key={category.id}
                icon={CategoryIcon}
                title={category.label}
                meta={`${category.services.length} capabilities`}
              >
                <div className="space-y-3">
                  {category.services.map((service) => {
                    const Icon = ICON_MAP[service.iconKey];
                    return (
                      <div
                        key={service.id}
                        className="rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon size={16} weight="bold" className="text-[#008C9E] dark:text-[#4CAF50]" />}
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
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
}
