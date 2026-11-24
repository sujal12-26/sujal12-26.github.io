import { useEffect, useState } from 'react';
import { PORTFOLIO_PROFILE } from '../data/portfolioData';
import { morphWord } from '../utils/textMorph';

interface IntroSequenceProps {
  onComplete: () => void;
}

type IntroPhase = 'dot' | 'stem' | 'swing' | 'name' | 'morph' | 'handoff';

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [phase, setPhase] = useState<IntroPhase>('dot');
  const [displayWord, setDisplayWord] = useState<string>(PORTFOLIO_PROFILE.introWord);

  useEffect(() => {
    const timers: number[] = [];
    let rafId = 0;

    timers.push(window.setTimeout(() => setPhase('stem'), 480));
    timers.push(window.setTimeout(() => setPhase('swing'), 960));
    timers.push(window.setTimeout(() => setPhase('name'), 1540));

    timers.push(
      window.setTimeout(() => {
        setPhase('morph');
        const start = performance.now();
        const duration = 950;
        const animateMorph = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          setDisplayWord(
            morphWord(
              PORTFOLIO_PROFILE.introWord,
              PORTFOLIO_PROFILE.heroWord,
              progress,
            ),
          );
          if (progress < 1) {
            rafId = window.requestAnimationFrame(animateMorph);
          }
        };
        rafId = window.requestAnimationFrame(animateMorph);
      }, 2180),
    );

    timers.push(window.setTimeout(() => setPhase('handoff'), 3300));
    timers.push(window.setTimeout(() => onComplete(), 3850));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  const showWordLockup = phase === 'name' || phase === 'morph' || phase === 'handoff';

  return (
    <div
      data-testid="intro-overlay"
      data-phase={phase}
      className={`fixed inset-0 z-50 bg-[#050505] flex items-center justify-center overflow-hidden select-none transition-opacity duration-500 ease-out ${
        phase === 'handoff' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Centered soft radial silver-gray spotlight matching video 00:00-00:08 */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute w-[460px] h-[460px] md:w-[640px] md:h-[640px] rounded-full transition-all duration-700 ease-out ${
          phase === 'handoff'
            ? 'opacity-0 scale-110'
            : phase === 'name' || phase === 'morph'
              ? 'opacity-95 scale-125'
              : 'opacity-80 scale-100'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.035) 42%, rgba(5,5,5,0) 72%)',
        }}
      />

      {/* Kinetic Dot -> Exclamation Stem -> Swing into ADITHYA -> Morph into PORTFOLIO */}
      <div className="relative z-10 flex items-center justify-center px-6">
        {!showWordLockup ? (
          <div className="relative flex items-center justify-center h-28 md:h-36">
            {/* Left half "SU" slides in during swing phase */}
            <span
              className={`metallic-text text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-[-0.03em] leading-none transition-all duration-500 ease-out ${
                phase === 'swing'
                  ? 'opacity-100 -translate-x-2'
                  : 'opacity-0 -translate-x-9'
              }`}
            >
              SU
            </span>

            {/* The iconic exclamation mark / dot-and-stem that swings into "J" */}
            <div className="relative flex flex-col items-center justify-end w-7 sm:w-9 md:w-11 h-20 sm:h-24 md:h-28">
              <div
                style={{ transformOrigin: 'bottom center' }}
                className={`w-3 sm:w-3.5 md:w-4 h-12 sm:h-16 md:h-20 rounded-[2px] bg-gradient-to-b from-white via-zinc-200 to-zinc-400 mb-2.5 shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out ${
                  phase === 'dot'
                    ? 'opacity-0 scale-y-0'
                    : phase === 'swing'
                      ? 'opacity-100 animate-stem-swing'
                      : 'opacity-100 scale-y-100'
                }`}
              />

              <div
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.55)] transition-all duration-300 ease-out ${
                  phase === 'swing' ? 'opacity-75 scale-75' : 'opacity-100 scale-100'
                }`}
              />
            </div>

            {/* Right half "AL" slides in smoothly */}
            <span
              className={`metallic-text text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-[-0.03em] leading-none transition-all duration-500 delay-75 ease-out ${
                phase === 'swing'
                  ? 'opacity-100 translate-x-2'
                  : 'opacity-0 translate-x-9'
              }`}
            >
              AL
            </span>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center transition-all duration-500 ease-out ${
              phase === 'handoff'
                ? 'translate-y-28 scale-105 opacity-70'
                : 'translate-y-0 scale-100 opacity-100'
            }`}
          >
            <span className="metallic-text text-[clamp(3rem,11vw,8.5rem)] font-extrabold tracking-[-0.035em] leading-none uppercase">
              {displayWord}
            </span>
          </div>
        )}
      </div>

      {/* Discreet skip button */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-xs font-mono tracking-[0.16em] uppercase text-zinc-500 hover:text-zinc-200 transition-colors px-3 py-2 rounded focus-visible:outline-2 focus-visible:outline-[#f0422b]"
      >
        Skip intro
      </button>
    </div>
  );
}
