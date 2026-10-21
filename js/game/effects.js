import { GROUND, RM } from '../core/constants.js';
import { game } from '../core/state.js';
import { pickOne } from '../core/util.js';
import { updateCamera } from '../render/camera.js';

// Juice: screen-shake trauma, particles, word pops, hit sparks, and the cosmetic update that runs every tick.
// Screen shake by trauma: impacts ADD trauma (0..1) by tier, it drains at 1.2 per second, and the camera offset is
// trauma squared, so light taps barely move the screen and big impacts punch. One table keeps every impact proportional.
const TRAUMA = { small: .28, medium: .35, heavy: .5, big: .65, ko: .8 };
export function addTrauma(tier) { if (game) game.trauma = Math.min(1, game.trauma + TRAUMA[tier]); }

// particles live in world space; ang/spread in radians, sp = [min, max] speed
export function burst(x, y, n, o) {
  for (let k = 0; k < n; k++) {
    const a = o.ang === undefined ? Math.random() * Math.PI * 2 : o.ang + (Math.random() - .5) * (o.spread || 1);
    const sp = o.sp[0] + Math.random() * (o.sp[1] - o.sp[0]);
    game.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g ?? .3, drag: o.drag ?? .93, floor: o.floor ?? false,
      T: 0, life: o.life[0] + Math.random() * (o.life[1] - o.life[0]), c: pickOne(o.cols), sz: o.sz ?? 2 });
  }
}
export const SAND = ['#f0c27b', '#e8c39e', '#c98f4f'];
export const dust = (x, n, sp = 2.2) => burst(x, GROUND - 4, n, { ang: -Math.PI / 2, spread: 2.6, sp: [.6, sp], g: -.02, drag: .9, life: [14, 28], cols: SAND, sz: 2 });
export function pop(s, x, y, c = '#ffd23f') { game.pops.push({ s, x, y, T: 0, life: 48, c }); }
export function spark(x, y, kind) { game.fx.push({ kind, x, y, T: 0, life: kind === 'block' ? 12 : 16 }); }

// cosmetic state: runs every 60 Hz tick, even during hitstop, so sparks fly while the fighters freeze
export const pool = [];
// Stage reactions to the fight: props swing, crowds cheer. Purely cosmetic, they never change damage or position.
export function react(type, d = {}) { const s = game.stage; if (s && s.def.on) s.def.on(type, d, s.st); }
export function updateFx() {
  if (game.stage && game.stage.def.tick) game.stage.def.tick(game.stage.st);
  const rate = game.slowT > 0 ? .4 : 1;
  for (const q of game.parts) {
    q.T += rate; q.vx *= q.drag; q.vy = q.vy * q.drag + q.g * rate; q.x += q.vx * rate; q.y += q.vy * rate;
    if (q.floor && q.y > GROUND) { q.y = GROUND; q.vy *= -.4; q.vx *= .7; }
  }
  game.parts = game.parts.filter(q => q.T < q.life);
  if (game.parts.length > 400) game.parts.splice(0, game.parts.length - 400);
  game.pops.forEach(p => p.T++); game.pops = game.pops.filter(p => p.T < p.life);
  game.trails.forEach(t => t.T++);
  game.trails = game.trails.filter(t => t.T < t.life || (pool.length < 40 && pool.push(t.c), false));
  game.p.forEach(f => { f.comboPop *= .85; f.barShake *= .85; if (f.glint > 0) f.glint--; if (f.hitFlash > 0) f.hitFlash--; });
  game.shown = game.shown.map((v, i) => Math.abs(game.score[i] - v) < 1 ? game.score[i] : v + (game.score[i] - v) * .15);
  updateCamera();
  if (game.koZoom > 0) game.koZoom--;
  const ulting = game.p.find(f => f.atk && f.atkName === 'ult');
  if (ulting && !game.koZoom) { const o = game.p[1 - ulting.i]; game.zx = (ulting.x + o.x) / 2; game.zy = GROUND - 120; }
  const zt = game.koZoom > 0 ? (RM ? .1 : .32) : ulting ? (RM ? .05 : .18) : 0;
  game.zp += (zt - game.zp) * (zt ? .15 : .1);
  game.trauma = Math.max(0, game.trauma - 1.2 / 60); game.shakeT++; game.timerPop *= .85;
  if (game.flash > 0) game.flash--;
  if (game.rageFlash > 0) game.rageFlash--;
  for (const f of game.p) if (f.rage && f.state !== 'ko' && Math.random() < .35) // rage aura: red embers rising
    burst(f.x + (Math.random() - .5) * f.ch.w, f.y - Math.random() * f.ch.h, 1, { ang: -Math.PI / 2, spread: .6, sp: [1, 2.5], g: -.04, drag: .95, life: [14, 24], cols: ['#ff3b5c', '#ff4f7b', '#ff9a3b'], sz: 2 });
}
