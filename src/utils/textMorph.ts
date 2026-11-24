const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Deterministic character-by-character morph from a source word to a target word.
 * Recreates the kinetic ADITHYA -> PORTHYA -> PORTFOLIO transition seen in the intro.
 */
export function morphWord(
  from: string,
  to: string,
  progress: number,
): string {
  const t = Math.max(0, Math.min(1, progress));
  if (t <= 0) return from;
  if (t >= 1) return to;

  // Interpolate visible character count smoothly from from.length to to.length
  const targetLen = Math.round(from.length + (to.length - from.length) * Math.min(1, t * 1.15));
  const resolvedCount = Math.floor(t * (to.length + 0.5));
  const out: string[] = [];

  for (let i = 0; i < targetLen; i++) {
    if (i < resolvedCount && i < to.length) {
      out.push(to[i]);
    } else if (i === resolvedCount && t > 0.08 && t < 0.96) {
      // Single frontier glyph flickers deterministically based on progress
      const glyphIndex = Math.floor((t * 47 + i * 13) % SCRAMBLE_GLYPHS.length);
      out.push(SCRAMBLE_GLYPHS[glyphIndex]);
    } else if (i < from.length) {
      out.push(from[i]);
    } else if (i < to.length) {
      const glyphIndex = Math.floor((t * 31 + i * 7) % SCRAMBLE_GLYPHS.length);
      out.push(SCRAMBLE_GLYPHS[glyphIndex]);
    }
  }

  return out.join('');
}

/**
 * Computes per-word illumination opacity for the scroll-linked bio reveal.
 * Words start muted (minOpacity) and smoothly illuminate to 1.0 as scrollProgress sweeps across them.
 */
export function computeWordOpacity(
  wordIndex: number,
  totalWords: number,
  scrollProgress: number,
  minOpacity = 0.22,
): number {
  if (totalWords <= 0) return 1;
  const clamped = Math.max(0, Math.min(1, scrollProgress));
  const windowSpan = 0.14;
  const wordStart = (wordIndex / totalWords) * (1 - windowSpan);
  const localT = (clamped - wordStart) / windowSpan;
  const eased = Math.max(0, Math.min(1, localT));
  return Number((minOpacity + (1 - minOpacity) * eased).toFixed(4));
}
