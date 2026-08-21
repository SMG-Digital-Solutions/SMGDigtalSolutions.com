import { useId, useState, type ReactNode } from 'react';
import { CaretDown, type Icon } from '@phosphor-icons/react';

interface MobileAccordionItemProps {
  icon: Icon;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Single disclosure panel used to build mobile accordions (see
 * AddOnsSection and ServiceFocus). Follows the ARIA disclosure pattern:
 * the trigger button carries `aria-expanded`/`aria-controls`, and the panel
 * is marked `inert` while collapsed so its content — even if a future caller
 * puts focusable elements in it — can't be tabbed into while visually
 * hidden. The height animation itself is a plain CSS `grid-template-rows`
 * transition (0fr ↔ 1fr), which respects the reduced-motion catch-all in
 * global.css without any extra logic here.
 */
export default function MobileAccordionItem({
  icon: IconComponent,
  title,
  meta,
  defaultOpen = false,
  children,
}: MobileAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-[#122435]/70">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#008C9E]/10 text-[#008C9E] dark:bg-[#4CAF50]/10 dark:text-[#4CAF50]">
          <IconComponent size={18} weight="bold" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
            {title}
          </span>
          {meta && <span className="block text-xs text-[#4b5563] dark:text-[#d5dde4]">{meta}</span>}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          aria-hidden="true"
          className={`shrink-0 text-[#121212]/50 transition-transform duration-300 dark:text-white/50 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden" inert={!isOpen}>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
