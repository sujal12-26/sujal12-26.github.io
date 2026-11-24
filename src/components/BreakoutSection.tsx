import { useEffect, useRef, useState } from 'react';
import { Bot, Pause, Play, RotateCcw } from 'lucide-react';
import {
  BreakoutState,
  createInitialBreakoutState,
  launchBall,
  stepBreakout,
} from '../utils/breakoutEngine';

export function BreakoutSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<BreakoutState>(createInitialBreakoutState(960, 480));
  const inputRef = useRef({
    moveLeft: false,
    moveRight: false,
    pointerX: null as number | null,
    autoPilot: false,
  });

  const [hud, setHud] = useState({
    score: 0,
    bricksRemaining: stateRef.current.totalBricks,
    totalBricks: stateRef.current.totalBricks,
    lives: 3,
    status: stateRef.current.status,
  });
  const [autoPilot, setAutoPilot] = useState(false);

  const syncHud = () => {
    const s = stateRef.current;
    setHud((prev) => {
      if (
        prev.score === s.score &&
        prev.bricksRemaining === s.bricksRemaining &&
        prev.totalBricks === s.totalBricks &&
        prev.lives === s.lives &&
        prev.status === s.status
      ) {
        return prev;
      }
      return {
        score: s.score,
        bricksRemaining: s.bricksRemaining,
        totalBricks: s.totalBricks,
        lives: s.lives,
        status: s.status,
      };
    });
  };

  useEffect(() => {
    inputRef.current.autoPilot = autoPilot;
  }, [autoPilot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = w < 640 ? 380 : 480;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Preserve progress only if dimensions did not change dramatically
      if (Math.abs(stateRef.current.width - w) > 20 || stateRef.current.height !== h) {
        stateRef.current = createInitialBreakoutState(w, h);
        syncHud();
      }
    };

    resize();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.moveLeft = true;
        inputRef.current.pointerX = null;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.moveRight = true;
        inputRef.current.pointerX = null;
      } else if (e.key === ' ' && stateRef.current.status !== 'playing') {
        // Only intercept space when the game arena is reasonably in view
        const rect = container.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          e.preventDefault();
          stateRef.current = launchBall(stateRef.current);
          syncHud();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.moveLeft = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.moveRight = false;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const draw = (state: BreakoutState) => {
      const { width, height } = state;
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural dot grid inside arena
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      const spacing = 28;
      for (let gx = spacing; gx < width; gx += spacing) {
        for (let gy = spacing; gy < height; gy += spacing) {
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      // Draw pixel-matrix bricks spelling "AI THAT SHIPS"
      for (let i = 0; i < state.bricks.length; i++) {
        const b = state.bricks[i];
        if (!b.alive) continue;
        ctx.fillStyle = '#f4f4f6';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(b.x + 1, b.y + 1, b.width - 2, 1.5);
      }

      // Draw impact sparks
      for (let i = 0; i < state.sparks.length; i++) {
        const s = state.sparks[i];
        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.fillStyle = `rgba(240, 66, 43, ${alpha.toFixed(3)})`;
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }

      // Draw ball motion trail
      for (let i = 0; i < state.trail.length; i++) {
        const pt = state.trail[i];
        const ratio = (i + 1) / (state.trail.length + 1);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, state.ballRadius * (0.4 + ratio * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 66, 43, ${(ratio * 0.35).toFixed(3)})`;
        ctx.fill();
      }

      // Draw paddle (vermilion-red sleek bar matching video 00:32-00:37)
      ctx.save();
      ctx.shadowColor = 'rgba(240, 66, 43, 0.55)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f0422b';
      const r = state.paddleHeight * 0.5;
      ctx.beginPath();
      ctx.roundRect(
        state.paddleX,
        state.paddleY,
        state.paddleWidth,
        state.paddleHeight,
        r,
      );
      ctx.fill();
      ctx.restore();

      // Draw glowing vermilion ball
      ctx.save();
      ctx.shadowColor = 'rgba(240, 66, 43, 0.85)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff573d';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        state.ballX - 1.8,
        state.ballY - 1.8,
        state.ballRadius * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = '#ffe4de';
      ctx.fill();
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const prevScore = stateRef.current.score;
      const prevBricks = stateRef.current.bricksRemaining;
      const prevLives = stateRef.current.lives;
      const prevStatus = stateRef.current.status;

      stateRef.current = stepBreakout(stateRef.current, dt, inputRef.current);
      draw(stateRef.current);

      if (
        stateRef.current.score !== prevScore ||
        stateRef.current.bricksRemaining !== prevBricks ||
        stateRef.current.lives !== prevLives ||
        stateRef.current.status !== prevStatus
      ) {
        syncHud();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTogglePlay = () => {
    const s = stateRef.current;
    if (s.status === 'playing') {
      stateRef.current = { ...s, status: 'paused' };
    } else {
      stateRef.current = launchBall(s);
    }
    syncHud();
  };

  const handleReset = () => {
    stateRef.current = createInitialBreakoutState(
      stateRef.current.width,
      stateRef.current.height,
    );
    syncHud();
  };

  const handleToggleAutoPilot = () => {
    setAutoPilot((prev) => {
      const next = !prev;
      if (next && stateRef.current.status !== 'playing') {
        stateRef.current = launchBall(stateRef.current);
        syncHud();
      }
      return next;
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    inputRef.current.pointerX = e.clientX - rect.left;
  };

  const handleCanvasClick = () => {
    if (stateRef.current.status !== 'playing') {
      stateRef.current = launchBall(stateRef.current);
      syncHud();
    }
  };

  const brokenCount = hud.totalBricks - hud.bricksRemaining;

  return (
    <section
      id="play"
      className="relative scroll-mt-16 bg-[#050505] py-24 md:py-36 border-t border-[#1f1f23]/60"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        {/* Centered Header matching video 00:31 */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="w-5 h-[2px] bg-[#f0422b]" />
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-400">
              Interactive Brick Breaker
            </span>
            <span aria-hidden="true" className="w-5 h-[2px] bg-[#f0422b]" />
          </div>
          <h2 className="metallic-text text-[clamp(2.25rem,5.2vw,4rem)] font-extrabold uppercase tracking-[-0.03em] leading-[1.02] text-balance">
            BREAK IT IF YOU CAN
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Move your mouse or use arrow keys to shatter the pixel matrix at 60fps.
          </p>
        </div>

        {/* Framed Game Arena */}
        <div
          data-testid="breakout-arena"
          data-game-status={hud.status}
          className="rounded-xl bg-[#09090b] border border-[#1f1f23] overflow-hidden"
        >
          {/* Top HUD Strip */}
          <div className="px-5 sm:px-7 py-3.5 border-b border-[#1f1f23] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <span className="text-[#f0422b] tracking-[0.14em] uppercase font-semibold">
              Destructible Pixel Matrix
            </span>

            <div className="flex items-center gap-5 text-zinc-300 tabular-nums">
              <span>
                Score <strong className="text-white ml-1">{hud.score}</strong>
              </span>
              <span aria-hidden="true" className="text-zinc-700">
                ·
              </span>
              <span>
                Broken{' '}
                <strong className="text-white ml-1">
                  {brokenCount}/{hud.totalBricks}
                </strong>
              </span>
              <span aria-hidden="true" className="text-zinc-700">
                ·
              </span>
              <span>
                Lives <strong className="text-white ml-1">{hud.lives}</strong>
              </span>
            </div>
          </div>

          {/* Canvas Container */}
          <div ref={containerRef} className="relative w-full">
            <canvas
              ref={canvasRef}
              data-testid="breakout-canvas"
              aria-label="Playable pixel-matrix brick breaker spelling AI THAT SHIPS"
              onPointerMove={handlePointerMove}
              onClick={handleCanvasClick}
              className="block w-full cursor-crosshair touch-none"
            />

            {/* Contextual overlay prompt for Ready / Won / Lost states */}
            {hud.status !== 'playing' && (
              <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-4">
                <div className="bg-[#050505]/85 backdrop-blur-sm border border-[#27272c] rounded-md px-4 py-2 text-xs font-mono text-zinc-200 tracking-wide">
                  {hud.status === 'ready' && 'Click arena or press Play to launch'}
                  {hud.status === 'paused' && 'Game paused — press Resume to continue'}
                  {hud.status === 'won' &&
                    `Matrix cleared! Final score ${hud.score} — press Play Again`}
                  {hud.status === 'lost' &&
                    `Out of balls — score ${hud.score}. Press Play Again`}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="px-5 sm:px-7 py-4 border-t border-[#1f1f23] bg-[#0b0b0d] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-mono text-zinc-500">
              Pointer · Touch · ← / → Keys
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleAutoPilot}
                aria-pressed={autoPilot}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-[0.12em] uppercase rounded-md border transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#f0422b] ${
                  autoPilot
                    ? 'border-[#f0422b] bg-[#f0422b]/15 text-white'
                    : 'border-[#27272c] text-zinc-300 hover:text-white hover:border-zinc-500'
                }`}
              >
                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{autoPilot ? 'Auto pilot on' : 'Auto pilot'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-[0.12em] uppercase rounded-md border border-[#27272c] text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#f0422b]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset matrix</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase rounded-md bg-[#f0422b] text-white hover:bg-[#ff553e] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0422b]"
              >
                {hud.status === 'playing' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {hud.status === 'paused'
                        ? 'Resume'
                        : hud.status === 'won' || hud.status === 'lost'
                          ? 'Play again'
                          : 'Launch ball'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
