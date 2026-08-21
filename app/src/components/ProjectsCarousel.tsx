import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { ArrowSquareOut, CaretLeft, CaretRight, Wrench } from '@phosphor-icons/react';

interface Project {
  title: string;
  type: string;
  image: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
  stack: string[];
  liveUrl: string;
}

interface ProjectsCarouselProps {
  projects: Project[];
  intervalMs?: number;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

export default function ProjectsCarousel({ projects, intervalMs = 6000 }: ProjectsCarouselProps) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  // Reactive: updates immediately if the visitor changes their OS motion
  // preference while the page is open, unlike a one-time matchMedia check.
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      setSlide([(nextIndex + projects.length) % projects.length, dir]);
    },
    [projects.length]
  );

  // Auto-advance is a motion effect in its own right (WCAG 2.2.2 Pause, Stop,
  // Hide), so it stays off whenever the slide transition itself is disabled.
  useEffect(() => {
    if (isPaused || prefersReducedMotion || projects.length <= 1) return;
    const timer = setInterval(() => {
      setSlide(([current]) => [(current + 1) % projects.length, 1]);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, intervalMs, projects.length]);

  const project = projects[index];

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Project gallery"
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.article
              key={project.liveUrl}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${projects.length}`}
              className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#f9fbfc] shadow-sm dark:border-white/10 dark:bg-[#112638]"
            >
              <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
                <div className="relative min-h-[220px] bg-[#0f2233]">
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0b1b2a]/70 via-transparent to-transparent"
                  />
                </div>

                <div className="flex flex-col gap-5 p-6">
                  <div className="space-y-2">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#008C9E] dark:text-[#4CAF50]">
                      <Wrench size={14} weight="bold" aria-hidden="true" />
                      {project.type}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
                      {project.title}
                    </h3>
                    <p className="text-sm leading-7 text-[#4b5563] dark:text-[#d5dde4]">{project.summary}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f3347]/70 dark:text-white/60">
                      Highlights
                    </p>
                    <ul className="mt-3 grid gap-2 text-sm text-[#334155] dark:text-[#d5dde4]">
                      {project.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#008C9E] dark:bg-[#4CAF50]"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center rounded-full border border-[#008C9E]/25 bg-[#008C9E]/10 px-3 py-1 text-xs font-semibold text-[#0f3347] dark:border-[#4CAF50]/30 dark:bg-[#4CAF50]/15 dark:text-[#d8f3dc]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  <div>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00798A] dark:bg-[#4CAF50] dark:text-[#0b2410] dark:hover:bg-[#43a648]"
                    >
                      View Live Demo
                      <span className="sr-only"> for {project.title} (opens in a new tab)</span>
                      <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {projects.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => goTo(index - 1, -1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#0f3347] shadow-md backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-[#0f2233]/90 dark:text-white dark:hover:bg-[#0f2233]"
            >
              <CaretLeft size={18} weight="bold" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => goTo(index + 1, 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#0f3347] shadow-md backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-[#0f2233]/90 dark:text-white dark:hover:bg-[#0f2233]"
            >
              <CaretRight size={18} weight="bold" aria-hidden="true" />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2">
              {projects.map((p, i) => (
                <button
                  key={p.liveUrl}
                  type="button"
                  aria-label={`Go to project ${i + 1}: ${p.title}`}
                  aria-current={i === index}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? 'w-6 bg-[#008C9E] dark:bg-[#4CAF50]'
                      : 'w-2 bg-[#008C9E]/25 hover:bg-[#008C9E]/40 dark:bg-[#4CAF50]/25 dark:hover:bg-[#4CAF50]/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
