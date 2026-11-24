import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFallbackSilhouetteTargets,
  createParticles,
  sampleLuminanceTargets,
  stepParticles,
} from './particleEngine';

test('sampleLuminanceTargets extracts bright pixels and ignores pure black background', () => {
  const w = 16;
  const h = 16;
  const rgba = new Uint8ClampedArray(w * h * 4);

  // Fill center 8x8 square with bright white, leave outer ring pure black
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 12; x++) {
      const idx = (y * w + x) * 4;
      rgba[idx] = 250;
      rgba[idx + 1] = 250;
      rgba[idx + 2] = 250;
      rgba[idx + 3] = 255;
    }
  }

  const targets = sampleLuminanceTargets(rgba, w, h, 800, 600, {
    step: 1,
    threshold: 40,
    maxParticles: 500,
  });

  assert.ok(targets.length > 10, 'Should extract bright center particles');
  assert.ok(targets.length <= 64, 'Should not exceed bright pixel count');
  for (const t of targets) {
    assert.ok(t.alpha > 0 && t.alpha <= 1);
    assert.ok(t.size >= 0.9);
  }
});

test('sampleLuminanceTargets subjectIsolation suppresses uniform tan wall corners and preserves center face', () => {
  const w = 40;
  const h = 40;
  const rgba = new Uint8ClampedArray(w * h * 4);

  // Fill entire image with bright warm tan background wall
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = 190;
    rgba[i * 4 + 1] = 160;
    rgba[i * 4 + 2] = 125;
    rgba[i * 4 + 3] = 255;
  }

  // Paint centered bright portrait subject (head + shoulders)
  for (let y = 10; y < 34; y++) {
    for (let x = 14; x < 26; x++) {
      const idx = (y * w + x) * 4;
      rgba[idx] = 235;
      rgba[idx + 1] = 225;
      rgba[idx + 2] = 215;
    }
  }

  const targets = sampleLuminanceTargets(rgba, w, h, 800, 600, {
    step: 1,
    threshold: 18,
    maxParticles: 1000,
    subjectIsolation: true,
  });

  assert.ok(targets.length > 20, 'Should extract centered subject particles');
  // Ensure corner background pixels are NOT emitted
  for (const t of targets) {
    assert.ok(t.tx > 220 && t.tx < 580, `Expected particle within center bust, got x=${t.tx}`);
  }
});

test('stepParticles converges particles toward target and disperses when scrollDisperse increases', () => {
  const targets = createFallbackSilhouetteTargets(800, 600, 20);
  const particles = createParticles(targets, 800, 600, false, 77);

  const distBefore = Math.hypot(
    particles[0].x - particles[0].tx,
    particles[0].y - particles[0].ty,
  );

  for (let i = 0; i < 90; i++) {
    stepParticles(particles, 1 / 60, {
      mouseX: 0,
      mouseY: 0,
      mouseActive: false,
      mouseRadius: 100,
      scrollDisperse: 0,
      time: i * 0.016,
    });
  }

  const distAssembled = Math.hypot(
    particles[0].x - particles[0].tx,
    particles[0].y - particles[0].ty,
  );
  assert.ok(
    distAssembled < distBefore * 0.25,
    `Expected particle to converge (${distAssembled} < ${distBefore * 0.25})`,
  );

  // Now disperse with scrollDisperse = 1
  for (let i = 0; i < 60; i++) {
    stepParticles(particles, 1 / 60, {
      mouseX: 0,
      mouseY: 0,
      mouseActive: false,
      mouseRadius: 100,
      scrollDisperse: 1,
      time: i * 0.016,
    });
  }

  const distDispersed = Math.hypot(
    particles[0].x - particles[0].tx,
    particles[0].y - particles[0].ty,
  );
  assert.ok(
    distDispersed > distAssembled + 15,
    'Scroll dispersion should move particles away from portrait target',
  );
});
