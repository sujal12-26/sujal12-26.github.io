export type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

export interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface BreakoutState {
  width: number;
  height: number;
  paddleX: number;
  paddleWidth: number;
  paddleHeight: number;
  paddleY: number;
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  ballRadius: number;
  trail: { x: number; y: number }[];
  bricks: Brick[];
  totalBricks: number;
  bricksRemaining: number;
  score: number;
  lives: number;
  status: GameStatus;
  sparks: Spark[];
}

export interface BreakoutInput {
  moveLeft: boolean;
  moveRight: boolean;
  pointerX: number | null;
  autoPilot: boolean;
}

/**
 * Crisp 5x5 pixel font matching the glowing white "AI THAT SHIPS" block matrix.
 */
const PIXEL_FONT: Record<string, string[]> = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  ' ': ['00', '00', '00', '00', '00'],
};

export const MATRIX_LINES = ['AI THAT', 'SHIPS'] as const;

export function createWordMatrixBricks(
  lines: readonly string[],
  boardWidth: number,
  topOffset: number,
  cellSize: number,
  gap: number,
): Brick[] {
  const bricks: Brick[] = [];
  let id = 1;
  const letterGapCols = 1;
  const rowStride = 5 * (cellSize + gap) + cellSize * 1.9;

  lines.forEach((line, lineIdx) => {
    const chars = line.toUpperCase().split('');
    const totalCols = chars.reduce((acc, ch, i) => {
      const glyph = PIXEL_FONT[ch] ?? PIXEL_FONT[' '];
      const cols = glyph[0].length;
      return acc + cols + (i < chars.length - 1 ? letterGapCols : 0);
    }, 0);

    const lineWidth = totalCols * cellSize + Math.max(0, totalCols - 1) * gap;
    let cursorX = (boardWidth - lineWidth) * 0.5;
    const baseY = topOffset + lineIdx * rowStride;

    chars.forEach((ch) => {
      const glyph = PIXEL_FONT[ch] ?? PIXEL_FONT[' '];
      const cols = glyph[0].length;
      for (let r = 0; r < glyph.length; r++) {
        for (let c = 0; c < cols; c++) {
          if (glyph[r][c] === '1') {
            bricks.push({
              id: id++,
              x: cursorX + c * (cellSize + gap),
              y: baseY + r * (cellSize + gap),
              width: cellSize,
              height: cellSize,
              alive: true,
            });
          }
        }
      }
      cursorX += (cols + letterGapCols) * (cellSize + gap);
    });
  });

  return bricks;
}

export function createInitialBreakoutState(
  width: number,
  height: number,
): BreakoutState {
  const safeW = Math.max(320, width);
  const safeH = Math.max(340, height);
  const cellSize = Math.max(6, Math.min(13, Math.floor(safeW / 66)));
  const gap = Math.max(2, Math.round(cellSize * 0.28));
  const topOffset = Math.max(36, Math.round(safeH * 0.1));
  const bricks = createWordMatrixBricks(MATRIX_LINES, safeW, topOffset, cellSize, gap);

  const paddleWidth = Math.max(84, Math.min(140, Math.round(safeW * 0.16)));
  const paddleHeight = 10;
  const paddleY = safeH - 36;
  const paddleX = (safeW - paddleWidth) * 0.5;
  const ballRadius = 7;

  return {
    width: safeW,
    height: safeH,
    paddleX,
    paddleWidth,
    paddleHeight,
    paddleY,
    ballX: safeW * 0.5,
    ballY: paddleY - ballRadius - 4,
    ballVx: 260,
    ballVy: -420,
    ballRadius,
    trail: [],
    bricks,
    totalBricks: bricks.length,
    bricksRemaining: bricks.length,
    score: 0,
    lives: 3,
    status: 'ready',
    sparks: [],
  };
}

export function launchBall(state: BreakoutState): BreakoutState {
  if (state.status === 'playing') return state;
  if (state.status === 'won' || state.status === 'lost') {
    const fresh = createInitialBreakoutState(state.width, state.height);
    return { ...fresh, status: 'playing' };
  }
  return { ...state, status: 'playing' };
}

export function stepBreakout(
  state: BreakoutState,
  dtSeconds: number,
  input: BreakoutInput,
): BreakoutState {
  const dt = Math.min(0.033, Math.max(0.001, dtSeconds));

  // Update sparks even when paused/won
  const nextSparks: Spark[] = [];
  for (let i = 0; i < state.sparks.length; i++) {
    const s = state.sparks[i];
    const life = s.life - dt;
    if (life > 0) {
      nextSparks.push({
        ...s,
        x: s.x + s.vx * dt,
        y: s.y + s.vy * dt,
        vy: s.vy + 220 * dt,
        life,
      });
    }
  }

  // Update paddle position cleanly
  let paddleX = state.paddleX;
  const paddleSpeed = Math.max(460, state.width * 0.72);
  if (input.autoPilot && state.status === 'playing') {
    const targetX = state.ballX - state.paddleWidth * 0.5;
    const diff = targetX - paddleX;
    paddleX += Math.sign(diff) * Math.min(Math.abs(diff), paddleSpeed * dt);
  } else if (input.pointerX !== null) {
    paddleX = input.pointerX - state.paddleWidth * 0.5;
  } else {
    if (input.moveLeft) paddleX -= paddleSpeed * dt;
    if (input.moveRight) paddleX += paddleSpeed * dt;
  }
  paddleX = Math.max(12, Math.min(state.width - state.paddleWidth - 12, paddleX));

  if (state.status === 'ready') {
    return {
      ...state,
      paddleX,
      ballX: paddleX + state.paddleWidth * 0.5,
      ballY: state.paddleY - state.ballRadius - 4,
      sparks: nextSparks,
    };
  }

  if (state.status !== 'playing') {
    return { ...state, paddleX, sparks: nextSparks };
  }

  let ballX = state.ballX + state.ballVx * dt;
  let ballY = state.ballY + state.ballVy * dt;
  let ballVx = state.ballVx;
  let ballVy = state.ballVy;

  // Wall collisions
  if (ballX - state.ballRadius < 0) {
    ballX = state.ballRadius;
    ballVx = Math.abs(ballVx);
  } else if (ballX + state.ballRadius > state.width) {
    ballX = state.width - state.ballRadius;
    ballVx = -Math.abs(ballVx);
  }

  if (ballY - state.ballRadius < 0) {
    ballY = state.ballRadius;
    ballVy = Math.abs(ballVy);
  }

  // Paddle collision
  if (
    ballVy > 0 &&
    ballY + state.ballRadius >= state.paddleY &&
    ballY - state.ballRadius <= state.paddleY + state.paddleHeight &&
    ballX >= paddleX - state.ballRadius &&
    ballX <= paddleX + state.paddleWidth + state.ballRadius
  ) {
    const hitOffset =
      (ballX - (paddleX + state.paddleWidth * 0.5)) / (state.paddleWidth * 0.5);
    const clampedOffset = Math.max(-0.92, Math.min(0.92, hitOffset));
    const speed = Math.min(560, Math.hypot(ballVx, ballVy) * 1.015);
    const bounceAngle = clampedOffset * (Math.PI * 0.36);
    ballVx = Math.sin(bounceAngle) * speed;
    ballVy = -Math.cos(bounceAngle) * speed;
    ballY = state.paddleY - state.ballRadius - 0.5;
  }

  // Brick AABB collision (at most 1 brick hit per substep for crisp reflection)
  let bricksRemaining = state.bricksRemaining;
  let score = state.score;
  let hitBrickIndex = -1;

  for (let i = 0; i < state.bricks.length; i++) {
    const b = state.bricks[i];
    if (!b.alive) continue;

    const closestX = Math.max(b.x, Math.min(ballX, b.x + b.width));
    const closestY = Math.max(b.y, Math.min(ballY, b.y + b.height));
    const dx = ballX - closestX;
    const dy = ballY - closestY;

    if (dx * dx + dy * dy <= state.ballRadius * state.ballRadius) {
      hitBrickIndex = i;
      if (Math.abs(dx) > Math.abs(dy)) {
        ballVx = -ballVx;
      } else {
        ballVy = -ballVy;
      }
      break;
    }
  }

  let bricks = state.bricks;
  if (hitBrickIndex !== -1) {
    const target = state.bricks[hitBrickIndex];
    bricks = state.bricks.slice();
    bricks[hitBrickIndex] = { ...target, alive: false };
    bricksRemaining -= 1;
    score += 100;

    // Emit crisp impact sparks
    const cx = target.x + target.width * 0.5;
    const cy = target.y + target.height * 0.5;
    for (let k = 0; k < 6; k++) {
      const angle = (Math.PI * 2 * k) / 6 + 0.35;
      const spd = 85 + (k % 3) * 45;
      nextSparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 40,
        life: 0.38,
        maxLife: 0.38,
      });
    }
  }

  // Check victory
  if (bricksRemaining <= 0) {
    return {
      ...state,
      paddleX,
      ballX,
      ballY,
      ballVx,
      ballVy,
      bricks,
      bricksRemaining: 0,
      score,
      status: 'won',
      sparks: nextSparks,
      trail: [...state.trail.slice(-10), { x: ballX, y: ballY }],
    };
  }

  // Check bottom miss
  if (ballY - state.ballRadius > state.height) {
    const lives = state.lives - 1;
    if (lives <= 0) {
      return {
        ...state,
        paddleX,
        bricks,
        bricksRemaining,
        score,
        lives: 0,
        status: 'lost',
        trail: [],
        sparks: nextSparks,
      };
    }

    return {
      ...state,
      paddleX,
      ballX: paddleX + state.paddleWidth * 0.5,
      ballY: state.paddleY - state.ballRadius - 4,
      ballVx: 230 * (lives % 2 === 0 ? -1 : 1),
      ballVy: -355,
      bricks,
      bricksRemaining,
      score,
      lives,
      status: 'ready',
      trail: [],
      sparks: nextSparks,
    };
  }

  const trail = [...state.trail.slice(-11), { x: ballX, y: ballY }];

  return {
    ...state,
    paddleX,
    ballX,
    ballY,
    ballVx,
    ballVy,
    trail,
    bricks,
    bricksRemaining,
    score,
    sparks: nextSparks,
  };
}
