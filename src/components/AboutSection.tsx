import { useEffect, useMemo, useRef, useState } from 'react';
import { PORTFOLIO_PROFILE, TECH_STACK_ROWS } from '../data/portfolioData';
import { computeWordOpacity } from '../utils/textMorph';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0.55);

  const words = useMemo(
    () => PORTFOLIO_PROFILE.introBio.split(' '),
    [],
  );

  useEffect(() => {
    const updateProgress = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Start illuminating as soon as section enters lower viewport; reach 1.0 near center
      const raw = (vh * 0.88 - rect.top) / (vh * 0.72);
      setScrollProgress(Math.max(0.15, Math.min(1, raw)));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative scroll-mt-16 bg-[#050505] py-24 md:py-36 border-t border-[#1f1f23]/60"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        {/* Intro Split: Left giant metallic heading, Right scroll-illuminated obsidian manifesto card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-3">
              About Me
            </p>
            <h2 className="metallic-text text-[clamp(3.2rem,8vw,6.4rem)] font-extrabold tracking-[-0.04em] leading-[0.95] text-balance">
              Intro
            </h2>
            <p className="mt-6 text-sm text-zinc-400 max-w-sm leading-relaxed">
              I’m a VLSI student learning digital design and how integrated circuits are designed and built.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#0c0c0e] border border-[#1f1f23] p-7 sm:p-10 md:p-12">
              <p className="text-xl sm:text-2xl md:text-[26px] font-medium leading-[1.52] tracking-[-0.015em]">
                {words.map((word, idx) => {
                  const opacity = computeWordOpacity(
                    idx,
                    words.length,
                    scrollProgress,
                    0.24,
                  );
                  return (
                    <span
                      key={`${word}-${idx}`}
                      style={{ opacity }}
                      className="inline-block mr-[0.28em] text-zinc-50 transition-opacity duration-150"
                    >
                      {word}
                    </span>
                  );
                })}
              </p>

            </div>
          </div>
        </div>

        {/* VLSI study areas — 3-row alternating kinetic ticker */}
        <div className="mt-20 md:mt-28">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500">
              Learning Focus
            </p>
            <p className="text-xs font-mono text-zinc-500">
              First-year Foundations · Hover to pause
            </p>
          </div>

          <div className="marquee-track relative overflow-hidden border-y border-[#1f1f23] py-6 space-y-4">
            {/* Soft left & right edge fade masks */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 z-10 bg-gradient-to-r from-[#050505] to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 z-10 bg-gradient-to-l from-[#050505] to-transparent"
            />

            {TECH_STACK_ROWS.map((row, rowIndex) => {
              const duplicated = [...row, ...row];
              const animClass =
                rowIndex % 2 === 0
                  ? 'animate-marquee-left'
                  : 'animate-marquee-right';
              return (
                <div key={rowIndex} className="overflow-hidden">
                  <div className={`flex w-max items-center gap-8 md:gap-12 ${animClass}`}>
                    {duplicated.map((tech, idx) => (
                      <div
                        key={`${tech}-${idx}`}
                        className="flex items-center gap-8 md:gap-12 whitespace-nowrap shrink-0"
                      >
                        <span className="text-sm md:text-[15px] font-medium text-zinc-300 hover:text-white transition-colors tracking-wide">
                          {tech}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-zinc-700 text-xs select-none"
                        >
                          /
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
