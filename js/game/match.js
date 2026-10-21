import { W, H, GROUND } from '../core/constants.js';
import { HIKEY, save, hi, setHi } from '../core/settings.js';
import { game, setGame } from '../core/state.js';
import { CAMY } from '../render/camera.js';
import { checkMelee, updateProj, keepOnScreen, separate } from './combat.js';
import { addTrauma, pool } from './effects.js';
import { updateFighter } from './fighter.js';
import { firstName } from './roster.js';
import { announce } from '../audio/announcer.js';
import { setMStep } from '../audio/music.js';
import { sfx } from '../audio/sfx.js';
import { pressed } from '../input/keyboard.js';
import { selMode, showResult } from '../ui/flow.js';

// A match: fighters, rounds, the fixed 60 Hz simulation step, and how rounds and matches end.
function makeFighter(ch, i) {
  return { ch, i, x: i ? W - 300 : 300, y: GROUND, vx: 0, vy: 0, face: i ? -1 : 1, hp: ch.hp, ghost: ch.hp, state: 'idle',
    atk: null, atkName: '', atkT: 0, hitN: 0, lastHitT: -99, stun: 0, sp: 100, buf: {}, T: 0, flash: 0, rot: 0, rotV: 0, combo: 0, comboN: 0, comboShow: 0, wins: 0, ai: { hold: 0, keys: {} },
    sq: 0, sqv: 0, jit: 0, barShake: 0, hitFlash: 0, glint: 0, comboPop: 0,
    meter: 0, rage: false, hist: [], prev: { fwd: false, back: false, down: false }, backHeld: false, dashT: 0, chain: 0, shadow: false };
}
const freshFx = () => ({ proj: [], fx: [], parts: [], pops: [], trails: [], stop: 0, slowT: 0, koZoom: 0, zp: 0, zx: W / 2, zy: H / 2, flash: 0, timerPop: 0, bonus: null, perfect: false, cut: null, rageFlash: 0, camX: W / 2, camY: CAMY, camAim: W / 2, camVX: 0, camVY: 0 });
export function newGame(c0, c1, ctrl, labels) {
  setGame(Object.assign({ chars: [c0, c1], ctrl, labels, p: [makeFighter(c0, 0), makeFighter(c1, 1)], round: 1, timer: 3600, phase: 'intro', phaseT: 0,
    trauma: 0, shakeT: 0, msg: '', winner: -1, score: [0, 0], shown: [0, 0], newHi: false }, freshFx()));
  setMStep(0); pressed.clear();
}
function resetRound() {
  game.trails.forEach(t => pool.push(t.c));
  game.p = game.p.map((f, i) => Object.assign(makeFighter(f.ch, i), { wins: f.wins, meter: f.meter, shadow: f.shadow, hp: maxHp(f), ghost: maxHp(f) }));
  Object.assign(game, { timer: 3600, phase: 'intro', phaseT: 0 }, freshFx());
  setMStep(0);
}

// The final arcade boss is a shadow copy of your own fighter with 30% more health.
export const maxHp = f => f.ch.hp * (f.shadow ? 1.3 : 1);

function endRound() {
  const [a, b] = game.p, ka = a.state === 'ko', kb = b.state === 'ko';
  game.msg = ka && kb ? 'DOUBLE K.O.' : (ka || kb) ? 'K.O.' : 'TIME OVER';
  const ra = a.hp / maxHp(a), rb = b.hp / maxHp(b);
  game.winner = (ka && kb) || (!ka && !kb && Math.abs(ra - rb) < 1e-6) ? -1 : ka ? 1 : kb ? 0 : ra > rb ? 0 : 1;
  if (game.winner < 0) { a.wins++; b.wins++; } else game.p[game.winner].wins++;
  if (game.winner >= 0) { // arcade-style end-of-round bonuses, added during the tally
    const w = game.p[game.winner];
    game.perfect = w.hp >= maxHp(w);
    game.bonus = { time: Math.ceil(game.timer / 60) * 100, vital: Math.round(w.hp) * 50, perfect: game.perfect ? 10000 : 0 };
  }
  game.phase = 'roundEnd'; game.phaseT = 0; game.proj = [];
}

export function step() {
  if (game.cut) { if (++game.cut.T >= game.cut.len) { game.cut = null; game.slowT = 24; } return; } // ultimate cut-in: the fight is frozen, then the move opens in slow motion
  if (game.stop > 0) { game.stop--; return; } // hitstop: keep presses queued
  game.p.forEach(f => f.jit = 0);
  if (game.slowT > 0) { game.slowT--; if (game.slowT % 3) return; } // KO slow motion
  game.phaseT++;
  const live = game.phase === 'fight';
  const ins = game.p.map((f, i) => live ? game.ctrl[i]() : {});
  pressed.clear();
  game.p.forEach((f, i) => updateFighter(f, game.p[1 - i], ins[i]));
  if (live) { checkMelee(game.p[0], game.p[1]); checkMelee(game.p[1], game.p[0]); updateProj(); }
  separate(game.p[0], game.p[1]); keepOnScreen(game.p[0], game.p[1]);
  game.fx.forEach(e => e.T++); game.fx = game.fx.filter(e => e.T < e.life);
  if (game.phase === 'intro') {
    if (game.phaseT === 1) { sfx('round'); announce(game.p[0].wins === 1 && game.p[1].wins === 1 ? 'final round!' : `round ${game.round}!`); }
    if (game.phaseT === 60) { sfx('fight'); announce('fight!'); addTrauma('medium'); }
    if (game.phaseT >= 100) { game.phase = 'fight'; game.phaseT = 0; }
  }
  else if (live) {
    game.timer--;
    if (game.timer < 600 && game.timer % 60 === 0) { sfx('tick'); game.timerPop = 1; }
    if (game.p.some(f => f.state === 'ko') || game.timer <= 0) endRound();
  }
  else if (game.phase === 'roundEnd') {
    const b = game.bonus;
    if (game.phaseT === 1) announce({ 'K.O.': 'ko!', 'DOUBLE K.O.': 'double ko!', 'TIME OVER': 'time over!' }[game.msg]);
    if (game.phaseT === 32 && game.perfect) announce('perfect!');
    if (game.phaseT === 80) announce(game.winner < 0 ? 'draw!' : `${game.p[game.winner].shadow ? 'shadow ' : ''}${firstName(game.p[game.winner].ch)} wins!`);
    if (b && game.phaseT === 80) game.score[game.winner] += b.time + b.vital + b.perfect;
    if (b && (game.phaseT === 92 || game.phaseT === 104 || (game.phaseT === 116 && b.perfect))) sfx('tick');
    if (game.phaseT >= 170) {
      if (game.p.some(f => f.wins >= 2)) { game.phase = 'matchEnd'; game.phaseT = 0; }
      else { game.round++; resetRound(); }
    }
  } else if (game.phase === 'matchEnd') {
    if (game.phaseT === 1) {
      const best = Math.max(...game.labels.map((l, i) => l === 'CPU' ? 0 : game.score[i]));
      if (best > hi) { setHi(best); game.newHi = true; save(HIKEY, hi); }
      sfx(selMode !== 2 && game.p[1].wins >= 2 && game.p[0].wins < 2 ? 'lose' : 'win');
    }
    if (game.phaseT === 40) showResult();
  }
}
