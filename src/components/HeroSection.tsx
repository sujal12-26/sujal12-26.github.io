import { useEffect, useRef, useState } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { PORTFOLIO_PROFILE } from '../data/portfolioData';
import {
  createFallbackSilhouetteTargets,
  createParticles,
  PortraitParticle,
  sampleLuminanceTargets,
  stepParticles,
} from '../utils/particleEngine';

interface HeroSectionProps {
  ready: boolean;
  instantSettle: boolean;
  onReplayIntro: () => void;
}

interface PortraitBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function HeroSection({
  ready,
  instantSettle,
  onReplayIntro,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<PortraitParticle[]>([]);
  const readyRef = useRef(ready);
  const readySinceRef = useRef<number | null>(ready ? performance.now() - 2500 : null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const scrollDisperseRef = useRef(0);
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  if (ready && !readyRef.current) {
    readySinceRef.current = performance.now();
  } else if (!ready) {
    readySinceRef.current = null;
  }
  readyRef.current = ready;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let loadedImage: HTMLImageElement | null = null;
    let portraitBounds: PortraitBounds = { x: 0, y: 0, w: 0, h: 0 };
    let rafId = 0;
    let lastTime = performance.now();

    const computePortraitBounds = (
      imgW: number,
      imgH: number,
      canvasW: number,
      canvasH: number,
      portraitScale: number,
      verticalOffsetRatio: number,
    ): PortraitBounds => {
      const maxBoxH = canvasH * portraitScale;
      const maxBoxW = Math.min(canvasW * 0.72, maxBoxH);
      const scale = Math.min(maxBoxW / imgW, maxBoxH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      return {
        x: (canvasW - drawW) * 0.5,
        y: (canvasH - drawH) * 0.5 + canvasH * verticalOffsetRatio,
        w: drawW,
        h: drawH,
      };
    };

    const rebuildParticles = (startAssembled: boolean) => {
      if (!width || !height) return;
      const isCompact = width < 768;
      const portraitScale = isCompact ? 0.72 : 0.86;
      const verticalOffsetRatio = isCompact ? -0.07 : -0.04;

      if (loadedImage && loadedImage.naturalWidth > 0) {
        const off = document.createElement('canvas');
        const sampleSize = isCompact ? 190 : 250;
        off.width = sampleSize;
        off.height = sampleSize;
        const offCtx = off.getContext('2d');

        portraitBounds = computePortraitBounds(
          sampleSize,
          sampleSize,
          width,
          height,
          portraitScale,
          verticalOffsetRatio,
        );

        if (offCtx) {
          offCtx.drawImage(loadedImage, 0, 0, sampleSize, sampleSize);
          const { data } = offCtx.getImageData(0, 0, sampleSize, sampleSize);
          const targets = sampleLuminanceTargets(
            data,
            sampleSize,
            sampleSize,
            width,
            height,
            {
              step: 2,
              threshold: 22,
              maxParticles: isCompact ? 2600 : 5200,
              portraitScale,
              verticalOffsetRatio,
              subjectIsolation: false,
            },
          );
          if (targets.length > 100) {
            particlesRef.current = createParticles(
              targets,
              width,
              height,
              startAssembled || prefersReducedMotion,
            );
            setPortraitLoaded(true);
            return;
          }
        }
      }

      const fallback = createFallbackSilhouetteTargets(
        width,
        height,
        isCompact ? 1200 : 2200,
      );
      particlesRef.current = createParticles(
        fallback,
        width,
        height,
        startAssembled || prefersReducedMotion,
      );
      setPortraitLoaded(true);
    };

    const resize = () => {
      const parent = sectionRef.current;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(540, Math.floor(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildParticles(instantSettle || readyRef.current);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = PORTFOLIO_PROFILE.heroPortrait;
    img.onload = () => {
      loadedImage = img;
      rebuildParticles(instantSettle);
    };
    img.onerror = () => {
      loadedImage = null;
      rebuildParticles(instantSettle);
    };

    resize();

    const handleScroll = () => {
      const parent = sectionRef.current;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.72)));
      scrollDisperseRef.current = progress;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active:
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    handleScroll();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric center glow behind portrait
      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.44,
        10,
        width * 0.5,
        height * 0.44,
        Math.min(width, height) * 0.48,
      );
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.055)');
      glow.addColorStop(0.55, 'rgba(255, 255, 255, 0.015)');
      glow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const disperse = readyRef.current ? scrollDisperseRef.current : 1;

      // Compute smooth portrait materialization once particles swarm into place (matching video 00:10 -> 00:12)
      let assembleFactor = 0;
      if (readyRef.current) {
        if (instantSettle || prefersReducedMotion) {
          assembleFactor = 1;
        } else if (readySinceRef.current !== null) {
          const elapsed = (now - readySinceRef.current) / 1000;
          // Particles converge first (0 - 0.65s), then crisp studio portrait crystallizes (0.55 - 1.55s)
          assembleFactor = Math.max(0, Math.min(1, (elapsed - 0.55) / 1.0));
          assembleFactor = assembleFactor * assembleFactor * (3 - 2 * assembleFactor);
        }
      }

      // Fade crisp portrait back into pure exploding stardust as user scrolls down (matching video 00:15)
      const scrollPhotoVisibility = Math.max(0, 1 - disperse * 2.4);
      const photoAlpha = assembleFactor * scrollPhotoVisibility * 0.94;

      // Draw pixel-aligned monochrome studio portrait blended cleanly onto pure obsidian
      if (loadedImage && photoAlpha > 0.01 && portraitBounds.w > 0) {
        ctx.save();
        ctx.globalAlpha = photoAlpha;
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(
          loadedImage,
          portraitBounds.x,
          portraitBounds.y,
          portraitBounds.w,
          portraitBounds.h,
        );
        ctx.restore();
      }

      // Draw live interactive particles (bright full stipple during assembly/scroll; subtle shimmering aura when settled)
      if (particles.length > 0) {
        stepParticles(particles, dt, {
          mouseX: mouseRef.current.x,
          mouseY: mouseRef.current.y,
          mouseActive: mouseRef.current.active && readyRef.current,
          mouseRadius: 115,
          scrollDisperse: disperse,
          time: now * 0.001,
          reducedMotion: prefersReducedMotion,
        });

        const particleIntensity =
          1 - photoAlpha * 0.62 + (mouseRef.current.active ? 0.16 : 0);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const alpha = Math.min(
            1,
            p.alpha * particleIntensity * (1 - disperse * 0.25),
          );
          if (alpha <= 0.025) continue;
          ctx.fillStyle = `rgba(248, 248, 252, ${alpha.toFixed(3)})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [instantSettle]);

  return (
    <section
      id="home"
      ref={sectionRef}
      data-testid="hero-section"
      data-portrait-ready={portraitLoaded ? 'true' : 'false'}
      className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end"
    >
      {/* Real-time interactive monochrome portrait + particle canvas */}
      <canvas
        ref={canvasRef}
        data-testid="portrait-canvas"
        aria-label="Interactive monochrome stipple particle portrait of Sujal"
        className="absolute inset-0 w-full h-full block"
      />

      {/* Bottom contrast scrim so PORTFOLIO headline sits crisply above the portrait base */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"
      />

      {/* Foreground Hero Typography & Controls */}
      <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 md:px-10 pb-10 md:pb-14 pt-28 flex flex-col items-center">
        <h1
          className={`metallic-text w-full text-center font-extrabold uppercase tracking-[-0.035em] leading-[0.88] text-[clamp(3.4rem,13.5vw,10.8rem)] select-none transition-all duration-700 ease-out ${
            ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {PORTFOLIO_PROFILE.heroWord}
        </h1>

        <div
          className={`w-full mt-5 md:mt-6 flex items-center justify-between gap-4 border-t border-[#1f1f23]/70 pt-4 transition-opacity duration-700 delay-200 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 text-sm md:text-base font-medium text-zinc-200 tracking-wide whitespace-nowrap">
            <span>{PORTFOLIO_PROFILE.role}</span>
            <span aria-hidden="true" className="hidden sm:inline text-zinc-600">
              ·
            </span>
            <span className="hidden sm:inline text-zinc-400 text-xs md:text-sm font-mono">
              Autonomous Agents &amp; Inference
            </span>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-[0.12em] uppercase text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Replay intro</span>
            </button>

            <a
              href="#about"
              aria-label="Scroll to About section"
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-[0.12em] uppercase text-zinc-300 hover:text-[#f0422b] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
            >
              <span className="hidden sm:inline">Scroll</span>
              <ArrowDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
