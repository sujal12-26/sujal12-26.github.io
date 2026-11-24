export interface ParticleTarget {
  tx: number;
  ty: number;
  size: number;
  alpha: number;
}

export interface PortraitParticle extends ParticleTarget {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scatterX: number;
  scatterY: number;
  phase: number;
}

export interface SampleOptions {
  step: number;
  threshold: number;
  maxParticles: number;
  portraitScale?: number;
  verticalOffsetRatio?: number;
  subjectIsolation?: boolean;
}

export interface ParticleInteraction {
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  mouseRadius: number;
  scrollDisperse: number; // 0 = assembled portrait, 1 = fully dispersed stardust
  time: number;
  reducedMotion?: boolean;
}

/**
 * Mulberry32 deterministic PRNG so particle dispersion & initial placement are reproducible.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getLumaAt(
  rgba: Uint8ClampedArray | number[],
  imgW: number,
  imgH: number,
  x: number,
  y: number,
): number {
  const cx = Math.max(0, Math.min(imgW - 1, x));
  const cy = Math.max(0, Math.min(imgH - 1, y));
  const idx = (cy * imgW + cx) * 4;
  return (
    0.299 * (rgba[idx] ?? 0) +
    0.587 * (rgba[idx + 1] ?? 0) +
    0.114 * (rgba[idx + 2] ?? 0)
  );
}

/**
 * Converts a portrait's RGBA pixel buffer into crisp stipple/halftone targets
 * centered in the viewport above the PORTFOLIO headline.
 * Supports both dark-studio portraits and natural-background portraits (subjectIsolation: true).
 */
export function sampleLuminanceTargets(
  rgba: Uint8ClampedArray | number[],
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number,
  options: SampleOptions,
): ParticleTarget[] {
  const {
    step,
    threshold,
    maxParticles,
    portraitScale = 0.78,
    verticalOffsetRatio = -0.02,
    subjectIsolation = false,
  } = options;

  if (imgW <= 0 || imgH <= 0 || canvasW <= 0 || canvasH <= 0 || step <= 0) {
    return [];
  }

  const rand = mulberry32(4219);
  const candidates: (ParticleTarget & { luma: number })[] = [];

  // Fit portrait cleanly in the hero upper-center area
  const maxBoxH = canvasH * portraitScale;
  const maxBoxW = Math.min(canvasW * 0.72, maxBoxH);
  const scale = Math.min(maxBoxW / imgW, maxBoxH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = (canvasW - drawW) * 0.5;
  const offsetY = (canvasH - drawH) * 0.5 + canvasH * verticalOffsetRatio;

  // Estimate dominant background color from upper left/right corners when isolating a real-world portrait
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  if (subjectIsolation) {
    let count = 0;
    const cornerW = Math.max(2, Math.floor(imgW * 0.16));
    const cornerH = Math.max(2, Math.floor(imgH * 0.24));
    for (let y = 0; y < cornerH; y += 2) {
      for (let x = 0; x < cornerW; x += 2) {
        const idxL = (y * imgW + x) * 4;
        const idxR = (y * imgW + (imgW - 1 - x)) * 4;
        bgR += (rgba[idxL] ?? 0) + (rgba[idxR] ?? 0);
        bgG += (rgba[idxL + 1] ?? 0) + (rgba[idxR + 1] ?? 0);
        bgB += (rgba[idxL + 2] ?? 0) + (rgba[idxR + 2] ?? 0);
        count += 2;
      }
    }
    if (count > 0) {
      bgR /= count;
      bgG /= count;
      bgB /= count;
    }
  }

  for (let y = 0; y < imgH; y += step) {
    for (let x = 0; x < imgW; x += step) {
      const idx = (y * imgW + x) * 4;
      const r = rgba[idx] ?? 0;
      const g = rgba[idx + 1] ?? 0;
      const b = rgba[idx + 2] ?? 0;
      const a = rgba[idx + 3] ?? 255;
      if (a < 32) continue;

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const u = x / imgW;
      const v = y / imgH;

      let intensity = 0;
      let edgeFade = 1;

      if (subjectIsolation) {
        // Head-and-shoulders anatomical silhouette envelope
        const headDx = (u - 0.48) / 0.25;
        const headDy = (v - 0.36) / 0.28;
        const headDist = Math.sqrt(headDx * headDx + headDy * headDy);

        const bodyDx = (u - 0.52) / 0.44;
        const bodyDy = (v - 0.90) / 0.36;
        const bodyDist = Math.sqrt(bodyDx * bodyDx + bodyDy * bodyDy);

        const subjectDist = Math.min(headDist, bodyDist);
        if (subjectDist > 1.08) continue;

        // Compute distance to estimated background wall color
        const bgDist = Math.hypot(r - bgR, g - bgG, b - bgB);
        // Detect bright upper-window / lantern glare outside core face
        const isTopGlare = v < 0.42 && luma > 218 && headDist > 0.78;
        if (isTopGlare) continue;

        // Compute Sobel-like local gradient for crisp eyes, hair strands, nose & smile
        const gx =
          getLumaAt(rgba, imgW, imgH, x + step, y) -
          getLumaAt(rgba, imgW, imgH, x - step, y);
        const gy =
          getLumaAt(rgba, imgW, imgH, x, y + step) -
          getLumaAt(rgba, imgW, imgH, x, y - step);
        const grad = Math.min(255, Math.hypot(gx, gy) * 1.4);

        // Suppress flat tan background wall pixels outside inner face/torso core
        const isWallLike = bgDist < 54 && Math.abs(r - g) < 42 && r > b + 12;
        if (isWallLike && subjectDist > 0.72) continue;
        if (bgDist < 34 && grad < 18 && headDist > 0.68 && bodyDist > 0.76) continue;

        // Preserve crisp portrait likeness:
        // - Dark eyes/brows/mouth remain dark negative space inside bright skin
        // - Dark hair gets subtle rim & strand highlights
        // - Bright skin & white stole form luminous stipple planes
        const isHairRegion = headDist < 1.0 && v < 0.32 && luma < 72;
        const isDarkKurta = bodyDist < 0.95 && v > 0.56 && luma < 85 && g >= r;

        if (isHairRegion) {
          intensity = Math.min(1, 0.22 + (grad / 160) * 0.65);
        } else if (isDarkKurta) {
          intensity = Math.min(1, 0.16 + (grad / 180) * 0.55 + (luma / 255) * 0.35);
        } else {
          // Face, skin highlights, and white stole
          if (luma < 44 && grad < 20) continue; // Keep deep pupils/eyebrows/shadows crisp dark!
          const lumaNorm = Math.max(0, Math.min(1, (luma - 38) / 205));
          intensity = Math.min(1, Math.pow(lumaNorm, 0.88) * 0.86 + (grad / 255) * 0.28);
        }

        // Smooth fade at silhouette edge and bottom edge into PORTFOLIO headline
        if (subjectDist > 0.86) {
          edgeFade *= Math.max(0, 1 - (subjectDist - 0.86) / 0.22);
        }
        if (v > 0.78) {
          edgeFade *= Math.max(0, 1 - (v - 0.78) / 0.22);
        }
      } else {
        if (luma < threshold) continue;
        const nx = u * 2 - 1;
        const ny = v * 2 - 1;
        const radialDist = Math.sqrt(nx * nx + ny * ny);
        if (radialDist > 1.06) continue;

        const rawNorm = Math.max(0, Math.min(1, (luma - threshold) / (255 - threshold)));
        intensity = Math.pow(rawNorm, 0.72);
        edgeFade = radialDist > 0.85 ? Math.max(0, 1 - (radialDist - 0.85) / 0.21) : 1;
      }

      if (intensity * edgeFade < 0.08) continue;

      const keepProb = subjectIsolation
        ? 0.22 + intensity * 0.78
        : 0.28 + intensity * 0.72;
      if (rand() > keepProb) continue;

      const jitterX = (rand() - 0.5) * step * scale * 0.54;
      const jitterY = (rand() - 0.5) * step * scale * 0.54;

      candidates.push({
        tx: offsetX + x * scale + jitterX,
        ty: offsetY + y * scale + jitterY,
        size: Number((1.05 + intensity * 1.35).toFixed(2)),
        alpha: Number((Math.min(1, (0.34 + intensity * 0.66) * edgeFade)).toFixed(3)),
        luma,
      });
    }
  }

  // Deterministically cap particle count while preserving high-contrast structure
  if (candidates.length <= maxParticles) {
    return candidates.map(({ tx, ty, size, alpha }) => ({ tx, ty, size, alpha }));
  }

  const stride = candidates.length / maxParticles;
  const sampled: ParticleTarget[] = [];
  for (let i = 0; i < maxParticles; i++) {
    const item = candidates[Math.floor(i * stride)];
    sampled.push({ tx: item.tx, ty: item.ty, size: item.size, alpha: item.alpha });
  }
  return sampled;
}

/**
 * Creates a procedural fallback portrait silhouette if an image ever fails to decode,
 * guaranteeing zero blank canvases.
 */
export function createFallbackSilhouetteTargets(
  canvasW: number,
  canvasH: number,
  count = 1800,
): ParticleTarget[] {
  const rand = mulberry32(9001);
  const cx = canvasW * 0.5;
  const cy = canvasH * 0.46;
  const radius = Math.min(canvasW, canvasH) * 0.24;
  const targets: ParticleTarget[] = [];

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * radius;
    const tx = cx + Math.cos(angle) * dist * 0.86;
    const ty = cy + Math.sin(angle) * dist * 1.05;
    targets.push({
      tx,
      ty,
      size: 1.1 + rand() * 1.1,
      alpha: 0.4 + (1 - dist / radius) * 0.55,
    });
  }
  return targets;
}

/**
 * Instantiates animated particles scattered across the viewport as stardust.
 * Set startAssembled = true for ?autostart=1 or reduced-motion instant settle.
 */
export function createParticles(
  targets: ParticleTarget[],
  canvasW: number,
  canvasH: number,
  startAssembled = false,
  seed = 1337,
): PortraitParticle[] {
  const rand = mulberry32(seed);
  return targets.map((target) => {
    const scatterX = rand() * canvasW;
    const scatterY = rand() * canvasH;
    return {
      ...target,
      x: startAssembled ? target.tx : scatterX,
      y: startAssembled ? target.ty : scatterY,
      vx: 0,
      vy: 0,
      scatterX,
      scatterY,
      phase: rand() * Math.PI * 2,
    };
  });
}

/**
 * Advances particle physics one simulation step (pure in-place update for 60fps zero-GC performance).
 * Supports damped spring assembly, radial pointer repulsion, and scroll-driven stardust dispersion.
 */
export function stepParticles(
  particles: PortraitParticle[],
  dtSeconds: number,
  interaction: ParticleInteraction,
): void {
  const dt = Math.min(0.05, Math.max(0.001, dtSeconds));
  const stepScale = dt * 60;
  const disperse = Math.max(0, Math.min(1, interaction.scrollDisperse));
  const springStrength = interaction.reducedMotion ? 0.35 : 0.088;
  const damping = Math.pow(0.84, stepScale);
  const mouseRadiusSq = interaction.mouseRadius * interaction.mouseRadius;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Blend between assembled portrait target and stardust scatter based on scroll
    const goalX = p.tx + (p.scatterX - p.tx) * disperse;
    const goalY = p.ty + (p.scatterY - p.ty) * disperse;

    // Gentle living micro-drift so the portrait feels alive without blurring details
    const driftAmp = interaction.reducedMotion ? 0 : 0.45 + disperse * 4.5;
    const driftX = Math.cos(interaction.time * 1.1 + p.phase) * driftAmp;
    const driftY = Math.sin(interaction.time * 0.9 + p.phase) * driftAmp;

    const ax = (goalX + driftX - p.x) * springStrength;
    const ay = (goalY + driftY - p.y) * springStrength;
    p.vx += ax * stepScale;
    p.vy += ay * stepScale;

    if (interaction.mouseActive && !interaction.reducedMotion) {
      const dx = p.x - interaction.mouseX;
      const dy = p.y - interaction.mouseY;
      const distSq = dx * dx + dy * dy;
      if (distSq > 0.01 && distSq < mouseRadiusSq) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / interaction.mouseRadius) * 6.5 * stepScale;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    p.vx *= damping;
    p.vy *= damping;
    p.x += p.vx * stepScale;
    p.y += p.vy * stepScale;
  }
}
