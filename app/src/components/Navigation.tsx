import { List, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const links = [
  {
    href: '#top',
    label: 'Home',
    ariaLabel: 'Scroll to top of page',
  },
  {
    href: '#services',
    label: 'Services',
    ariaLabel: 'Explore service offerings',
  },
  {
    href: '#projects',
    label: 'Projects',
    ariaLabel: 'Explore project and case study gallery',
  },
  {
    href: '#packages',
    label: 'Pricing',
    ariaLabel: 'View pricing and packages',
  },
  {
    href: '#contact',
    label: 'Contact',
    ariaLabel: 'Scroll to contact form',
  },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative flex items-center gap-6">
      <div className="hidden items-center gap-4 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
            aria-label={link.ariaLabel}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white shadow-sm transition hover:bg-white/12 md:hidden"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
        </button>
      </div>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute -left-4 -right-4 top-full z-20 mt-3 w-[calc(100%+2rem)] max-w-none flex flex-col gap-3 rounded-[1.25rem] border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#1A2B3C]/95 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block w-full rounded-full px-5 py-3 text-center text-sm font-medium text-[#121212] transition hover:bg-black/5 dark:text-[#F7F7F7] dark:hover:bg-white/10"
              aria-label={link.ariaLabel}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
