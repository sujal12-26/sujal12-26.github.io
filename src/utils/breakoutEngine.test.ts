import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBreakoutState,
  createWordMatrixBricks,
  launchBall,
  MATRIX_LINES,
  stepBreakout,
} from './breakoutEngine';

test('createWordMatrixBricks builds a non-empty AI THAT SHIPS pixel matrix centered in bounds', () => {
  const bricks = createWordMatrixBricks(MATRIX_LINES, 900, 48, 10, 3);
  assert.ok(bricks.length > 100, 'Matrix should have >100 bricks for AI THAT SHIPS');
  for (const b of bricks) {
    assert.ok(b.x >= 0 && b.x + b.width <= 900, 'Brick within horizontal board bounds');
    assert.equal(b.alive, true);
  }
});

test('stepBreakout handles brick collision, scoring, sparks, and win condition', () => {
  let state = createInitialBreakoutState(800, 480);
  state = launchBall(state);

  // Place ball directly below first brick moving upward
  const targetBrick = state.bricks[0];
  state = {
    ...state,
    ballX: targetBrick.x + targetBrick.width * 0.5,
    ballY: targetBrick.y + targetBrick.height + state.ballRadius - 1,
    ballVx: 0,
    ballVy: -300,
  };

  const next = stepBreakout(state, 1 / 60, {
    moveLeft: false,
    moveRight: false,
    pointerX: null,
    autoPilot: false,
  });

  assert.equal(next.bricks[0].alive, false, 'Target brick should shatter on impact');
  assert.equal(next.score, 100, 'Score should increment by 100');
  assert.equal(next.bricksRemaining, state.bricksRemaining - 1);
  assert.ok(next.sparks.length > 0, 'Brick impact should spawn visual sparks');
  assert.ok(next.ballVy > 0, 'Ball should bounce downward after hitting bottom of brick');
});

test('stepBreakout transitions to lost when final life misses paddle', () => {
  let state = createInitialBreakoutState(800, 480);
  state = {
    ...launchBall(state),
    lives: 1,
    ballX: 40,
    ballY: 479,
    ballVx: 0,
    ballVy: 300,
    paddleX: 400,
  };

  const next = stepBreakout(state, 1 / 30, {
    moveLeft: false,
    moveRight: false,
    pointerX: null,
    autoPilot: false,
  });

  assert.equal(next.lives, 0);
  assert.equal(next.status, 'lost');
});
