import { LW, LH } from '../core/constants.js';
import { tick } from '../core/state.js';
import { easeOutBack, pad7 } from '../core/util.js';
import { ctx } from '../render/canvas.js';
import { demoPose, drawFigure } from '../render/figures.js';
import { stageCanvas } from '../render/stage.js';
import { STAGES } from '../stages/index.js';
import { drawText } from '../render/text.js';
import { CHARS, PCOL, firstName } from '../game/roster.js';
import { announce } from '../audio/announcer.js';
import { sfx } from '../audio/sfx.js';
import { arcade, show } from './flow.js';

// Arcade ending: your fighter celebrates while the credits roll.
export let ending = null;
const endFrames = () => ending ? (performance.now() - ending.t0) / (1000 / 60) : 0;
export function showEnding() { ending = { t0: performance.now(), ch: CHARS[arcade.me], score: arcade.score, continues: arcade.continues }; show('ending'); sfx('win'); announce('congratulations!'); }
export function renderEnding() {
  const t = endFrames(), c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false; c.globalAlpha = 1;
  const bgc = stageCanvas(STAGES[0]); // the credits roll over the beach
  c.drawImage(bgc, (bgc.width - LW) / 2, (bgc.height - LH) / 2, LW, LH, 0, 0, LW, LH); c.fillStyle = 'rgba(10,6,20,.6)'; c.fillRect(0, 0, LW, LH);
  const cols = ['#ffd23f', '#ff4f7b', '#3fb8ff', '#fff', '#ff8fc4'];
  for (let i = 0; i < 40; i++) { c.fillStyle = cols[i % 5]; c.fillRect((i * 53 + Math.round(t * .3 * (i % 3 + 1))) % LW, (i * 37 + Math.round(t * (1 + i % 3) * .5)) % LH, 2, 2); } // confetti
  const mv = ['special', 'heavy', 'light'][(t / 60 | 0) % 3];
  drawFigure(ending.ch, 64, 165, 1.5, 1, demoPose(mv, t % 60 | 0, t | 0));
  const lines = [['YOU BEAT ARCADE MODE', '#fff', 8], [`WITH ${firstName(ending.ch)}`, PCOL[0], 8], null, ['FINAL SCORE', '#bba9cc', 8], [pad7(ending.score), '#fff', 16],
    [`CONTINUES ${ending.continues}`, '#bba9cc', 8], null, ["MARTINI'S BRAINROT BRAWL", '#ffd23f', 8], ['A GAME BY', '#bba9cc', 8], ['MARTINIPOLICE', '#3fb8ff', 16], null, ['THANKS FOR PLAYING!', '#fff', 8]];
  const gap = 15, total = (lines.length - 1) * gap, off = Math.min(t * .45, LH + 10 + total - (LH / 2 + 30));
  c.save(); c.beginPath(); c.rect(0, 40, LW, LH - 40); c.clip();
  lines.forEach((l, i) => { if (l) drawText(l[0], 205, LH + 10 + i * gap - off, l[2], l[1]); });
  c.restore();
  drawText('CONGRATULATIONS!', LW / 2, 22, 8, '#ffd23f', { scale: 2 * easeOutBack(Math.min(1, t / 16)), shadow: '#ff4f7b', fit: true });
  if (t > 120 && tick % 60 < 40) drawText('PRESS START', 205, LH - 10, 8, '#ffd23f');
}
export function endEnding() { if (endFrames() > 90) { ending = null; show('title'); } }
