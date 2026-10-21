import { LW, LH, STEP } from '../core/constants.js';
import { fxFlash } from '../core/settings.js';
import { easeOutBack } from '../core/util.js';
import { ctx } from '../render/canvas.js';
import { drawFigure } from '../render/figures.js';
import { drawText } from '../render/text.js';
import { CHARS, PCOL, firstName } from '../game/roster.js';
import { announce } from '../audio/announcer.js';
import { sfx } from '../audio/sfx.js';
import { selMode, picks, arcade, show, startMatch, chooseStage } from './flow.js';

// VS splash between select and fight: split screen, fighters slide in, VS slams down, and the stage is named.
export let vs = null;
export const setVs = v => { vs = v; };
export const vsFrames = () => vs ? (performance.now() - vs.t0) / STEP : 0;
export function startVS() { vs = { t0: performance.now(), slam: false, stage: chooseStage() }; show('vs'); sfx('whoosh'); }
export function renderVS() {
  const t = vsFrames(), c = ctx, boss = selMode === 'arcade' && arcade.order[arcade.stage].boss;
  if (t > 165) { startMatch(); return; }
  if (t >= 18 && !vs.slam) { vs.slam = true; sfx('vs'); announce(`${firstName(CHARS[picks[0]])} versus ${boss ? 'shadow ' : ''}${firstName(CHARS[picks[1]])}!`); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false; c.globalAlpha = 1;
  c.fillStyle = '#1b4a73'; c.fillRect(0, 0, LW, LH);
  c.fillStyle = boss ? '#2a1446' : '#5a1028'; for (let y = 0; y < LH; y++) { const x = Math.round(LW / 2 + 24 - 48 * y / LH); c.fillRect(x, y, LW - x, 1); }
  for (let i = 0; i < 16; i++) { // speed lines, each side running toward the middle
    const y = (i * 23 + 7) % LH, len = 24 + (i * 17) % 40, run = (t * 7 + i * 53) % (LW / 2 + len);
    c.fillStyle = '#2d6fa0'; c.fillRect(Math.round(run - len), y, len, 1);
    c.fillStyle = boss ? '#4b2350' : '#9a2f66'; c.fillRect(Math.round(LW - run), y + 3, len, 1);
  }
  const e = easeOutBack(Math.min(1, t / 16)), T = Math.round(t);
  drawFigure(CHARS[picks[0]], -70 + 150 * e, 156, 2.1, 1, { s: 'idle', ph: 0, T });
  drawFigure(CHARS[picks[1]], LW + 70 - 150 * e, 156, 2.1, -1, { s: 'idle', ph: 0, T: T + 20 }, boss);
  const labels = ['1P', selMode === 2 ? '2P' : 'CPU'];
  drawText(labels[0], 8, 10, 8, PCOL[0], { align: 'left' }); drawText(labels[1], LW - 8, 10, 8, PCOL[1], { align: 'right' });
  if (selMode === 'arcade') drawText(boss ? 'FINAL STAGE' : `STAGE ${arcade.stage + 1}`, LW / 2, 12, 8, '#ffd23f', { shadow: '#ff4f7b' });
  if (t > 8) {
    drawText(firstName(CHARS[picks[0]]), 8, 170, 8, '#fff', { scale: 1.5, align: 'left', shadow: PCOL[0], maxW: LW / 2 - 16 });
    drawText((boss ? 'SHADOW ' : '') + firstName(CHARS[picks[1]]), LW - 8, 170, 8, '#fff', { scale: 1.5, align: 'right', shadow: PCOL[1], maxW: LW / 2 - 16 });
  }
  if (t >= 18) {
    const k = Math.min(1, (t - 18) / 6);
    drawText('VS', LW / 2, LH / 2 - 8, 16, '#ffd23f', { scale: 3 + 3 * (1 - k), shadow: '#ff4f7b' });
    if (t >= 30) drawText(vs.stage.name.toUpperCase(), LW / 2, LH / 2 + 22, 8, '#f7efe3', { shadow: '#000' });
    if (t < 21 && fxFlash()) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(0, 0, LW, LH); }
  }
}
