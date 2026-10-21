import { OUT, LW, LH } from '../core/constants.js';
import { fxFlash } from '../core/settings.js';
import { game, tick } from '../core/state.js';
import { easeOutBack, pad7 } from '../core/util.js';
import { toLo } from './camera.js';
import { ctx, layCv } from './canvas.js';
import { figureLayer } from './figures.js';
import { drawText, drawMono } from './text.js';
import { maxHp } from '../game/match.js';
import { PCOL, firstName } from '../game/roster.js';
import { muted } from '../audio/mixer.js';
import { arcade } from '../ui/flow.js';

// Street Fighter-style HUD: scores on top, framed life bars with the KO badge between them, timer under the badge,
// names and round medals under the bars, special gauges along the bottom.
export function drawHUD() {
  const c = ctx, lowAny = game.p.some(f => f.state !== 'ko' && f.hp / maxHp(f) < .3);
  game.p.forEach((f, i) => {
    const R = i === 1, al = R ? 'right' : 'left', w = 128, h = 6, x0 = R ? LW - 10 - w : 10;
    // score line
    const lw = drawText(game.labels[i], R ? LW - 8 : 8, 6, 8, PCOL[i], { align: al });
    drawMono(pad7(game.shown[i]), R ? LW - 12 - lw : 12 + lw, 6, 8, '#f7efe3', { align: al });
    // life bar
    const bx = x0 + Math.round((Math.random() - .5) * f.barShake * 2), by = 15 + Math.round((Math.random() - .5) * f.barShake);
    c.fillStyle = OUT; c.fillRect(bx - 2, by - 2, w + 4, h + 4);
    c.fillStyle = '#bba9cc'; c.fillRect(bx - 1, by - 1, w + 2, h + 2);
    c.fillStyle = '#5a1028'; c.fillRect(bx, by, w, h);
    const seg = (v, col) => { const len = Math.round(w * Math.max(0, v) / maxHp(f)); c.fillStyle = col; c.fillRect(R ? bx : bx + w - len, by, len, h); return len; };
    seg(f.ghost, f.hitFlash > 0 && f.hitFlash % 4 < 2 ? '#fff' : '#ff3b5c');
    const low = f.hp / maxHp(f) < .3, len = seg(f.hp, low ? (tick % 20 < 10 ? '#ff9a3b' : '#ff4f7b') : '#ffd23f');
    const ax = R ? bx : bx + w - len;
    c.fillStyle = low ? '#ffc2de' : '#fff1b0'; c.fillRect(ax, by, len, 2);
    c.fillStyle = low ? '#c2416b' : '#ffb13b'; c.fillRect(ax, by + h - 2, len, 2);
    // name and round medals
    drawText(firstName(f.ch), R ? LW - 10 : 10, 29, 8, '#f7efe3', { align: al });
    if (f.rage && tick % 20 < 14) drawText('RAGE', R ? LW - 10 : 10, 40, 8, '#ff4f7b', { align: al, shadow: '#5a1028' });
    for (let k = 0; k < 2; k++) {
      const px = R ? x0 + 4 + k * 11 : x0 + w - 4 - k * 11;
      c.fillStyle = OUT; c.fillRect(px - 4, 25, 9, 9);
      c.fillStyle = k < f.wins ? '#ffd23f' : '#2a1f36'; c.fillRect(px - 3, 26, 7, 7);
      if (k < f.wins) { c.fillStyle = '#ff4f7b'; c.fillRect(px - 1, 28, 3, 3); }
    }
    // bottom gauges, no labels (the move list explains them): SUPER in gold above SP in blue
    const gw = 80, gx = R ? LW - 8 - gw : 8, full = f.meter >= 100, ready = f.sp >= 100;
    const mf = Math.round(gw * f.meter / 100), sf = Math.round(gw * f.sp / 100);
    c.fillStyle = OUT; c.fillRect(gx - 1, 164, gw + 2, 7); c.fillRect(gx - 1, 172, gw + 2, 5);
    c.fillStyle = '#2a1f36'; c.fillRect(gx, 165, gw, 5); c.fillRect(gx, 173, gw, 3);
    c.fillStyle = full ? ['#ffd23f', '#ff4f7b', '#3fb8ff', '#fff'][(tick >> 2) % 4] : '#ffb13b'; c.fillRect(R ? gx + gw - mf : gx, 165, mf, 5);
    c.fillStyle = OUT; for (let k = 1; k < 4; k++) c.fillRect(gx + Math.round(gw * k / 4), 165, 1, 5);
    c.fillStyle = ready ? (tick % 16 < 8 ? '#8fe8ff' : '#fff') : '#6b5a7d'; c.fillRect(R ? gx + gw - sf : gx, 173, sf, 3);
    if (f.glint > 0) { const gp = Math.round((1 - f.glint / 24) * (gw - 4)); c.fillStyle = '#fff'; c.fillRect(R ? gx + gw - 4 - gp : gx + gp, 172, 4, 5); }
    if (full && tick % 30 < 22) drawText(game.labels[f.i] === '1P' ? 'K+L' : game.labels[f.i] === '2P' ? '.+/' : 'MAX', R ? gx - 4 : gx + gw + 4, 168, 8, '#ffd23f', { align: R ? 'right' : 'left', shadow: '#ff4f7b' });
    if (f.comboShow > 0) drawText(`${f.comboN} HITS`, R ? LW - 8 : 8, 70, 8, '#fff', { scale: 2 + f.comboPop * 1.4, align: al, shadow: '#ff4f7b' });
  });
  // KO badge, blinking when someone is in danger
  const kx = LW / 2 - 13, blink = lowAny && tick % 30 < 15;
  c.fillStyle = OUT; c.fillRect(kx - 2, 12, 30, 15);
  c.fillStyle = blink ? '#ffd23f' : '#ff4f7b'; c.fillRect(kx, 14, 26, 11);
  drawText('KO', LW / 2, 19, 8, blink ? '#ff4f7b' : '#ffd23f');
  drawMono(String(Math.ceil(game.timer / 60)).padStart(2, '0'), LW / 2, 38, 16, game.timer < 600 ? '#ff4f7b' : '#f7efe3', { scale: 1 + game.timerPop * .4 });
  if (muted) drawText('MUTED', LW / 2, 55, 8, '#bba9cc');
}

// Round and result messages. Every banner is centred on the screen by its visible ink.
export function drawBanner(cam) {
  const t = game.phaseT, cx = LW / 2, cy = LH / 2;
  if (game.phase === 'intro') {
    const label = game.p[0].wins === 1 && game.p[1].wins === 1 ? 'FINAL ROUND' : `ROUND ${game.round}`;
    if (t < 60) drawText(label, cx, cy, 16, '#ffd23f', { scale: 2 * easeOutBack(Math.min(1, t / 14)), shadow: '#ff4f7b', fit: true });
    if (t < 60 && arcade && game.arcade) drawText(arcade.stage === arcade.order.length - 1 ? 'FINAL STAGE' : `STAGE ${arcade.stage + 1}`, cx, cy - 26, 8, '#f7efe3', { shadow: '#ff4f7b' });
    else drawText('FIGHT!', cx, cy, 16, '#fff', { scale: 2.5 + 3 * (1 - Math.min(1, (t - 60) / 7)), shadow: '#ff4f7b', fit: true });
    game.p.forEach(f => { // who's who
      const [x, y] = toLo(cam, f.x, f.y - f.ch.h - (f.ch.id === 'bombardiro' ? 70 : 40)), b = Math.round(Math.sin(tick * .15) * 2);
      drawText(game.labels[f.i], x, y + b - 7, 8, PCOL[f.i]);
      ctx.fillStyle = PCOL[f.i]; for (let k = 0; k < 4; k++) ctx.fillRect(x - 3 + k, y + b + k, 7 - 2 * k, 1);
    });
  }
  if (game.phase === 'roundEnd' && t < 80) {
    drawText(game.msg, cx, cy, 16, '#ffd23f', { scale: 3 + 4 * (1 - Math.min(1, t / 8)), shadow: '#ff4f7b', fit: true });
    if (game.perfect && t >= 30) drawText('PERFECT', cx, cy + 34, 16, '#fff', { scale: easeOutBack(Math.min(1, (t - 30) / 10)), shadow: '#3fb8ff', fit: true });
  } else if (game.phase === 'roundEnd' || game.phase === 'matchEnd') {
    const k = game.phase === 'roundEnd' ? Math.min(1, (t - 80) / 14) : 1, b = game.phase === 'roundEnd' ? game.bonus : null;
    const title = game.winner < 0 ? 'DRAW GAME' : `${firstName(game.p[game.winner].ch)} WINS`;
    drawText(title, cx, b ? cy - 26 : cy, 16, '#f7efe3', { scale: 1.5 * easeOutBack(k), shadow: game.winner < 0 ? '#ff4f7b' : PCOL[game.winner], fit: true });
    if (b) [['TIME', b.time, 92], ['VITAL', b.vital, 104], ['PERFECT', b.perfect, 116]].forEach(([lbl, v, at], n) => {
      if (t >= at && (v || lbl !== 'PERFECT')) drawText(`${lbl.padEnd(8, ' ')}${String(v).padStart(6, '0')}`, cx, cy + 4 + n * 14, 8, n === 2 ? '#ffd23f' : '#f7efe3');
    });
  }
}
// Ultimate cut-in: dim the fight, letterbox, a band in the player's colour with speed lines, the fighter sliding in big,
// and the move's name, all in slow motion. The fight itself is frozen while game.cut runs (see step).
export function drawCutscene() {
  const cut = game.cut; if (!cut) return;
  const f = game.p[cut.who], t = cut.T, c = ctx, col = PCOL[cut.who], R = cut.who === 1;
  const k = Math.min(1, t / 8) * (1 - Math.max(0, (t - (cut.len - 8)) / 8));
  c.fillStyle = 'rgba(10,6,20,.6)'; c.fillRect(0, 0, LW, LH);
  const bar = Math.round(24 * k); c.fillStyle = '#000'; c.fillRect(0, 0, LW, bar); c.fillRect(0, LH - bar, LW, bar);
  const bh = Math.round(88 * k), by = Math.round(LH / 2 - bh / 2);
  if (bh < 4) return;
  c.fillStyle = R ? '#5a1028' : '#1b4a73'; c.fillRect(0, by, LW, bh);
  c.fillStyle = R ? '#9a2f66' : '#2d6fa0';
  for (let i = 0; i < 14; i++) { // speed lines drifting slowly away from the fighter's side
    const y = by + 3 + (i * 13) % (bh - 6), len = 18 + (i * 17) % 40, run = (t * 2 + i * 47) % (LW + len);
    c.fillRect(Math.round(R ? LW - run : run - len), y, len, 1);
  }
  c.fillStyle = col; c.fillRect(0, by, LW, 2); c.fillRect(0, by + bh - 2, LW, 2);
  // the fighter, three times size, glides in from its own side and keeps drifting while the view slowly pushes in;
  // its pose animates at quarter speed
  const slide = 1 - easeOutBack(Math.min(1, t / 20)), fx = (R ? LW - 80 : 80) + (R ? 1 : -1) * (slide * 170 - t * .15);
  figureLayer(f.ch, fx, by + bh + 34, 3 + t * .004, R ? -1 : 1, { s: 'special', ph: 1, T: t * .25 }, f.shadow);
  c.drawImage(layCv, 0, by + 2, LW, bh - 4, 0, by + 2, LW, bh - 4);
  // the move's name on the free side
  const tx = R ? LW * .3 : LW * .7;
  if (t > 6) drawText('ULTIMATE!', tx, by + 16, 8, col, { shadow: '#000' });
  if (t > 10) drawText(cut.name.toUpperCase(), tx, by + bh / 2 + 6, 8, '#fff', { scale: 2 * easeOutBack(Math.min(1, (t - 10) / 16)), shadow: col, maxW: LW * .55 });
  if (t < 3 && fxFlash()) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, 0, LW, LH); }
}
