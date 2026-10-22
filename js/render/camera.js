import { W, H, PX, LW } from '../core/constants.js';
import { fxShake } from '../core/settings.js';
import { game } from '../core/state.js';
import { VH } from './canvas.js';

// The battle camera sits 1.5x closer than the whole-stage view and follows the fighters (like Street Fighter), so they
// read bigger against the HUD. CAMY puts the ground near the bottom; MAXSEP keeps both fighters on one screen.
const BASEZ = 1.5;
export const BGS = BASEZ / PX, CAMY = 328, MAXSEP = W / BASEZ - 120;
// Battle camera rig, run once per fixed 60 Hz step after movement resolves (so it never trails the fighters by a frame).
// Horizontal: frame both fighters plus any projectile in flight, never at the cost of losing a fighter; clamp to the stage
// before smoothing so it eases into the edges; ignore small shuffles with a deadzone. Both axes follow a critically damped
// spring, so the camera starts and stops smoothly instead of jerking. Vertical: rise only enough to keep a jumper's head
// clear of the HUD, and never so far that the ground leaves the bottom of the screen.
const CAM_M = 60, CAM_DZ = 16, CAM_W = 7, CAM_WY = 5, CAMY_MIN = 296;
export function updateCamera() {
  const half = W / BASEZ / 2, xs = game.p.map(f => f.x), lo = Math.min(...xs), hi = Math.max(...xs);
  const keepA = hi + CAM_M - half, keepB = lo - CAM_M + half; // camera centres that keep both fighters on screen
  let a = lo - CAM_M, b = hi + CAM_M;
  for (const q of game.proj) if (q.y > 0) { a = Math.min(a, q.x - 40); b = Math.max(b, q.x + 40); }
  const clampX = x => Math.max(half, Math.min(W - half, Math.max(keepA, Math.min(keepB, x))));
  const want = clampX((a + b) / 2), d = want - game.camAim;
  if (Math.abs(d) > CAM_DZ) game.camAim += d - Math.sign(d) * CAM_DZ;
  game.camAim = clampX(game.camAim);
  const wantY = Math.max(CAMY_MIN, Math.min(CAMY, Math.min(...game.p.map(f => f.y - f.ch.h)) + 76)), dt = 1 / 60;
  game.camVX += (-2 * CAM_W * game.camVX - CAM_W * CAM_W * (game.camX - game.camAim)) * dt; game.camX += game.camVX * dt;
  game.camVY += (-2 * CAM_WY * game.camVY - CAM_WY * CAM_WY * (game.camY - wantY)) * dt; game.camY += game.camVY * dt;
}

export function camera() {
  const z = BASEZ * (1 + game.zp), vw = W / z, vh = VH * PX / z, s = z / PX, w = Math.min(1, game.zp / .12); // punch-ins pull focus to the hit
  let cx = game.camX;
  if (w < 1 && !game.p.some(f => f.state === 'ko')) { const xs = game.p.map(f => f.x); cx = Math.max(Math.max(...xs) + 50 - vw / 2, Math.min(Math.min(...xs) - 50 + vw / 2, cx)); }
  const fx = Math.max(vw / 2, Math.min(W - vw / 2, cx + (game.zx - cx) * w)), fy = Math.max(vh / 2, Math.min(H - vh / 2, game.camY + (game.zy - game.camY) * w));
  const amp = game.trauma * game.trauma * 16 * fxShake(), T = game.shakeT; // up to 16 screen pixels at full trauma
  const sx = amp * (Math.sin(T * .9) + .5 * Math.sin(T * 2.3 + 1)) / 1.5, sy = amp * .6 * (Math.sin(T * 1.37 + 2) + .5 * Math.sin(T * 2.9)) / 1.5;
  return { z, s, ox: Math.round(LW / 2 - fx * s + sx), oy: Math.round(VH / 2 - fy * s + sy) };
}
export const toLo = (cam, x, y) => [Math.round(x * cam.s + cam.ox), Math.round(y * cam.s + cam.oy)];
