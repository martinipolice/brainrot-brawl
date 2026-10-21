import { GROUND, OUT, LW, LH } from '../core/constants.js';
import { fxFlash } from '../core/settings.js';
import { game, paused, tick } from '../core/state.js';
import { easeOutBack } from '../core/util.js';
import { camera, toLo } from './camera.js';
import { ctx, layCv, lay } from './canvas.js';
import { drawHUD, drawBanner, drawCutscene } from './hud.js';
import { pixelize, tint, SHADOW_TINT } from './pixel.js';
import { g, withTarget, E, P, S } from './shapes.js';
import { stageCanvas } from './stage.js';
import { drawText } from './text.js';
import { pool } from '../game/effects.js';
import { PCOL } from '../game/roster.js';
import { STAGES } from '../stages/index.js';

// ---------- rendering (all at 320x180) ----------
// The fight scene: fighters through the pixel pass, shadows, afterimages, projectiles, effects and particles.
function pose(f) {
  let s = f.state, ph = 0;
  if (f.atk) { s = f.atk.pose || f.atkName; const m = f.atk; ph = f.atkT < m.startup ? 0 : f.atkT < m.startup + m.active ? 1 : 2; }
  if (s === 'blockstun') s = 'block';
  return { s, ph, T: f.T };
}
function drawBody(f) {
  const p = pose(f);
  let dx = 0, dy = 0;
  if (game.stop > 0 && f.jit) dx = game.stop % 2 ? 6 : -6; // shudder while frozen in hitstop
  if ((game.phase === 'roundEnd' || game.phase === 'matchEnd') && game.winner === f.i && game.phaseT > 90) dy = -Math.abs(Math.sin(game.phaseT * .15)) * 24;
  g.save(); g.translate(f.x + dx, f.y + dy); g.scale(f.face, 1);
  if (f.state === 'ko') { g.translate(0, -f.ch.koLift * Math.min(1, Math.abs(Math.sin(f.rot)))); g.rotate(f.rot); } // lifted as it tips, so it lies on the sand, not in it
  else if (f.state === 'hit') g.rotate(-.16);
  g.scale(1 + f.sq, 1 - f.sq);
  f.ch.draw(p);
  if (p.s === 'block') { g.beginPath(); g.arc(f.ch.w / 2 + 4, -f.ch.h / 2, f.ch.h * .48, -1, 1); S(5, '#8fe8ff'); }
  const m = f.atk;
  if (m && m.hb && p.ph === 1) {
    g.beginPath(); g.ellipse(m.hb.x, -m.hb.y, m.hb.w / 2, m.hb.h / 2, 0, m.hits ? 0 : -1.1, m.hits ? Math.PI * 2 : 1.1);
    S(5, '#fff');
  }
  g.restore();
}
function pixEllipse(cx, cy, rx, ry, col) {
  ctx.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) { const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + .5)) ** 2))); ctx.fillRect(Math.round(cx - half), Math.round(cy) + dy, half * 2, 1); }
}
function drawShadow(f, cam) {
  const [x, y] = toLo(cam, f.x, GROUND + 3), k = Math.max(.4, 1 - (GROUND - f.y) / 400);
  pixEllipse(x, y, (f.ch.w / 2 + 6) * cam.s * k, Math.max(1, Math.round(2 * cam.z)), 'rgba(30,10,30,.35)');
}
function drawActor(f, cam) {
  // box around the fighter that fits every pose: bat swings, ultimates, raised arms, a KO'd body lying flat, victory hops
  const s = cam.s, x0 = Math.floor((f.x - 170) * s + cam.ox), y0 = Math.floor((f.y - 200) * s + cam.oy);
  const bx = Math.max(0, x0), by = Math.max(0, y0), bw = Math.min(LW, x0 + Math.ceil(340 * s) + 2) - bx, bh = Math.min(LH, y0 + Math.ceil(220 * s) + 2) - by;
  if (bw <= 0 || bh <= 0) return;
  lay.setTransform(1, 0, 0, 1, 0, 0); lay.clearRect(bx, by, bw, bh);
  lay.setTransform(s, 0, 0, s, cam.ox, cam.oy);
  lay.ol = 1.1 / s; withTarget(lay, () => drawBody(f));
  lay.setTransform(1, 0, 0, 1, 0, 0);
  pixelize(lay, bx, by, bw, bh);
  if (f.shadow || f.flash > 2) tint(lay, f.flash > 2 ? '#fff' : SHADOW_TINT, bx, by, bw, bh);
  if (f.rage && f.flash <= 2) tint(lay, `rgba(255,40,60,${(.14 + .12 * Math.sin(tick * .3)).toFixed(3)})`, bx, by, bw, bh);
  // afterimages on dashes and big knockback, one every 3 ticks at most (however often the screen refreshes)
  if (!paused && game.stop === 0 && tick - f.trailT >= 3 && Math.abs(f.vx) > 3.5 && (f.atk || f.state === 'hit' || f.state === 'ko')) {
    f.trailT = tick;
    const c = pool.pop() || document.createElement('canvas'); c.width = bw; c.height = bh;
    const t = c.getContext('2d'); t.drawImage(layCv, bx, by, bw, bh, 0, 0, bw, bh);
    t.globalCompositeOperation = 'source-atop'; t.fillStyle = PCOL[f.i]; t.fillRect(0, 0, bw, bh);
    game.trails.push({ c, x: bx, y: by, T: 0, life: 12 });
  }
  ctx.drawImage(layCv, bx, by, bw, bh, bx, by, bw, bh);
}
function drawProj(q) {
  g.save(); g.translate(q.x, q.y);
  if (q.kind === 'wave' || q.kind === 'tsunami') {
    const k = q.kind === 'tsunami' ? 2.8 : 1;
    g.scale(Math.sign(q.vx) * k, k);
    const wob = Math.sin(q.T * .5) * 3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-i * 14, 0, 22 - i * 4 + wob, -1.3, 1.3); S(7 - i * 2, i ? '#9fd6ff' : '#eef4f8'); }
    E(4, -2, 9, 18, '#3fb8ff', false);
  } else {
    g.rotate(Math.atan2(q.vy, q.vx)); E(0, 0, 15, 10, '#2b2b33'); P([-14, 0, -22, -8, -22, 8], '#2b2b33'); E(4, -4, 4, 2, '#8f9aa3', false);
    if (q.T % 8 < 4) E(-24, 0, 4, 4, '#ff9a3b', false); // fuse
  }
  g.restore();
}
function drawFx(e) {
  const k = e.T / e.life;
  g.save(); g.translate(e.x, e.y);
  if (e.kind === 'blast') {
    const r = 26 + 80 * (1 - (1 - k) * (1 - k));
    if (k < .55) { E(0, 0, r, r * .7, '#ffb13b', false); E(0, 0, r * .75 * (1 - k), r * .55 * (1 - k), '#fff1b0', false); }
    else { g.beginPath(); g.ellipse(0, 0, r, r * .7, 0, 0, Math.PI * 2); S(Math.max(3, 30 * (1 - k)), '#6b6b72'); }
  } else {
    const n = e.kind === 'hit' ? 8 : 6, r0 = 4 + k * 34, r1 = 22 + k * 22;
    g.beginPath(); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + e.x; g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); }
    S(e.kind === 'hit' ? 6 : 4, e.kind === 'hit' ? '#ffe45c' : '#8fe8ff');
  }
  g.restore();
}
// draw() in world space onto the layer, pixelize just the screen box covering world box x0..x1, y0..y1, copy it over
function drawPixelized(cam, wx0, wy0, wx1, wy1, draw) {
  const bx = Math.max(0, Math.floor(wx0 * cam.s + cam.ox)), by = Math.max(0, Math.floor(wy0 * cam.s + cam.oy));
  const bw = Math.min(LW, Math.ceil(wx1 * cam.s + cam.ox) + 1) - bx, bh = Math.min(LH, Math.ceil(wy1 * cam.s + cam.oy) + 1) - by;
  if (bw <= 0 || bh <= 0) return;
  lay.setTransform(1, 0, 0, 1, 0, 0); lay.clearRect(bx, by, bw, bh); lay.setTransform(cam.s, 0, 0, cam.s, cam.ox, cam.oy);
  lay.ol = 1.1 / cam.s; withTarget(lay, draw);
  lay.setTransform(1, 0, 0, 1, 0, 0); pixelize(lay, bx, by, bw, bh); ctx.drawImage(layCv, bx, by, bw, bh, bx, by, bw, bh);
}

export function renderFight() {
  const cam = camera(), c = ctx, stage = game.stage || (game.stage = { def: STAGES[0], st: {} }), sd = stage.def, bg = stageCanvas(sd);
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false; c.globalAlpha = 1;
  c.fillStyle = OUT; c.fillRect(0, 0, LW, LH);
  c.drawImage(bg, cam.ox, cam.oy, Math.round(bg.width * (1 + game.zp)), Math.round(bg.height * (1 + game.zp)));
  if (sd.ambient) sd.ambient(c, cam, stage.st, tick);
  if (sd.props) sd.boxes.forEach((b, i) => drawPixelized(cam, ...b, () => sd.props(stage.st, i, tick)));
  game.p.forEach(f => drawShadow(f, cam));
  for (const t of game.trails) { c.globalAlpha = .45 * (1 - t.T / t.life); c.drawImage(t.c, t.x, t.y); }
  c.globalAlpha = 1;
  [...game.p].sort((a, b) => (a.atk ? 1 : 0) - (b.atk ? 1 : 0)).forEach(f => drawActor(f, cam));
  if (game.proj.length || game.fx.length) {
    // pixelize only the box around projectiles and effects (world-space reach of each), not the whole screen
    let wx0 = Infinity, wy0 = Infinity, wx1 = -Infinity, wy1 = -Infinity;
    for (const e of [...game.proj, ...game.fx]) {
      const r = e.kind === 'blast' ? 150 : e.kind === 'tsunami' ? 120 : 60;
      wx0 = Math.min(wx0, e.x - r); wy0 = Math.min(wy0, e.y - r); wx1 = Math.max(wx1, e.x + r); wy1 = Math.max(wy1, e.y + r);
    }
    drawPixelized(cam, wx0, wy0, wx1, wy1, () => { game.proj.forEach(drawProj); game.fx.forEach(drawFx); });
  }
  for (const q of game.parts) {
    const k = q.T / q.life, sz = Math.max(1, Math.round(q.sz * (1 - k * k) * cam.z)), [x, y] = toLo(cam, q.x, q.y);
    c.fillStyle = q.c; c.fillRect(x - (sz >> 1), y - (sz >> 1), sz, sz);
  }
  for (const p of game.pops) {
    if (p.T > p.life * .75 && p.T % 4 < 2) continue;
    const [x, y] = toLo(cam, p.x, p.y - p.T * 1.2);
    drawText(p.s, x, y, 8, p.c, { scale: 2 * easeOutBack(Math.min(1, p.T / 8)), shadow: '#ff4f7b', clamp: true });
  }
  if (game.rageFlash > 0 && fxFlash()) { c.fillStyle = 'rgba(255,40,60,.22)'; c.fillRect(0, 0, LW, LH); }
  if (game.flash > 0 && fxFlash()) { c.fillStyle = game.flash % 2 ? '#fff' : 'rgba(255,255,255,.5)'; c.fillRect(0, 0, LW, LH); }
  drawHUD();
  drawBanner(cam);
  drawCutscene();
}
