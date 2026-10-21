import { W, GROUND } from '../core/constants.js';
import { game } from '../core/state.js';
import { spawnProj } from './combat.js';
import { addTrauma, burst, SAND, dust, pop } from './effects.js';
import { maxHp } from './match.js';
import { duck } from '../audio/mixer.js';
import { sfx } from '../audio/sfx.js';

// A fighter's turn each tick: attacks, the ultimate, command inputs, movement and landing, and the SP, rage and
// SUPER meters.
function startAtk(f, name, cancel = false) {
  const m = f.ch.moves[name];
  Object.assign(f, { atk: m, atkName: name, atkT: 0, hitN: 0, lastHitT: -99, state: name, dashT: 0 });
  f.chain = cancel ? f.chain + 1 : 0;
  if (name === 'special') f.sp = 0; // spend the SP gauge
  if (name === 'heavy' || name === 'rush') { f.sq = .12; f.sqv = 0; } // wind-up crouch
  if (f.y >= GROUND) f.vx *= .5; // keep some walking momentum so attacking on the move feels fluid
  sfx(name === 'light' ? 'whoosh' : 'whooshH');
}
// The ultimate: spends a full SUPER meter, freezes the fight for the cut-in, then the move plays out.
function startUlt(f) {
  f.meter = 0; f.buf.special = 0; f.buf.ult = 0; f.hist.length = 0;
  startAtk(f, 'ult');
  game.cut = { who: f.i, T: 0, len: 120, name: f.ch.moves.ult.name };
  game.stop = 0; sfx('ult'); duck(.2, 2);
}
// down then forward (relative to facing) within 15 frames, with the forward no more than 12 frames ago
const motionQCF = f => {
  const h = f.hist;
  for (let k = h.length - 1; k > 0; k--) {
    if (h[k].d !== 'fwd' || f.T - h[k].t > 12) continue;
    for (let j = k - 1; j >= 0; j--) if (h[j].d === 'down' && h[k].t - h[j].t <= 15) return true;
  }
  return false;
};
// the same direction pressed twice within 12 frames, the second press this frame
const doubleTap = (f, d) => { const h = f.hist, n = h.length; return n >= 2 && h[n - 1].d === d && h[n - 1].t === f.T && h[n - 2].d === d && h[n - 1].t - h[n - 2].t <= 12; };

// A knocked-out body keeps the spin of the blow while airborne (rot 0 = upright, -PI/2 = flat on its back). On the sand a
// damped spring settles it flat, so an over-rotated body rocks back. Each bounce bleeds spin off (see land).
function tumble(f, ground) {
  if (ground && f.vy >= 0) f.rotV = f.rotV * .7 + (-Math.PI / 2 - f.rot) * .18;
  f.rot += f.rotV;
}

function land(f, impact) {
  if (f.state === 'ko' && impact > 4) { // KO'd bodies bounce
    f.vy = -impact * .45; f.rotV *= .5; dust(f.x, 10, 3.5); addTrauma('small'); sfx('wall'); return;
  }
  f.vy = 0; f.sq = Math.min(.32, impact * .025); f.sqv = 0;
  if (impact > 3) { dust(f.x, 6); sfx('land'); }
}

export function updateFighter(f, foe, inp) {
  f.T++; if (f.flash > 0) f.flash--; if (f.comboShow > 0) f.comboShow--;
  for (const k in f.buf) if (f.buf[k] > 0) f.buf[k]--;
  for (const k of ['up', 'light', 'heavy', 'special', 'ult']) if (inp[k]) f.buf[k] = 10; // 10-frame input buffer
  // directions relative to facing, and the press history that the motion and dash commands read
  const fwdH = f.face > 0 ? !!inp.right : !!inp.left, backH = f.face > 0 ? !!inp.left : !!inp.right, downH = !!inp.block;
  for (const [d, on] of [['fwd', fwdH], ['back', backH], ['down', downH]]) if (on && !f.prev[d]) { f.hist.push({ d, t: f.T }); if (f.hist.length > 8) f.hist.shift(); }
  f.prev = { fwd: fwdH, back: backH, down: downH }; f.backHeld = backH;
  const ground = f.y >= GROUND, take = k => f.buf[k] > 0 ? (f.buf[k] = 0, true) : false;
  const wantUlt = () => f.meter >= 100 && (f.buf.ult > 0 || (f.buf.special > 0 && (f.buf.heavy > 0 || motionQCF(f))));
  const heavyFor = () => fwdH ? 'rush' : backH ? 'rise' : 'heavy';
  if (f.state === 'ko') tumble(f, ground);
  else if (f.stun > 0) { if (--f.stun === 0) { f.state = ground ? 'idle' : 'jump'; f.combo = 0; } }
  else if (f.atk) {
    const m = f.atk, a0 = m.startup, a1 = a0 + m.active;
    f.atkT++;
    // Heavy and Special pressed together come in a frame or two apart: the second press turns the move into the ultimate
    const pair = (f.atkName === 'special' && f.buf.heavy > 0) || ((f.atkName === 'heavy' || f.atkName === 'rush' || f.atkName === 'rise') && f.buf.special > 0);
    if (f.meter >= 100 && f.atkT <= 4 && f.hitN === 0 && pair) { if (f.atkName === 'special') f.sp = 100; f.buf.heavy = 0; startUlt(f); return; }
    if (f.atkT === a0 && (f.atkName === 'heavy' || f.atkName === 'rush')) { f.sq = -.14; f.sqv = 0; } // release stretch
    if (m.lunge && f.atkT >= a0 && f.atkT < a1) f.vx = f.face * m.lunge; else if (ground) f.vx *= .8;
    if (m.proj && f.atkT === a0) spawnProj(f, m.proj);
    // cancels: a connected light chains into light (up to twice) or a heavy; any connected normal cancels into special or ultimate
    const recovering = f.atkT >= a1, normal = f.atkName === 'light' || f.atkName === 'heavy' || f.atkName === 'rush';
    if (normal && f.hitN > 0) {
      if (wantUlt()) startUlt(f);
      else if (f.sp >= 100 && take('special')) startAtk(f, 'special', true);
      else if (recovering && f.atkName === 'light' && f.chain < 2 && take('light')) startAtk(f, 'light', true);
      else if (recovering && f.atkName === 'light' && take('heavy')) startAtk(f, heavyFor(), true);
    }
    if (f.atk === m && f.atkT >= a1 + m.recovery) { f.atk = null; f.state = ground ? 'idle' : 'jump'; }
  } else if (ground) {
    f.face = foe.x >= f.x ? 1 : -1;
    const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    // attacks win over guarding, so pressing a button while holding back or down still attacks
    if (wantUlt()) startUlt(f);
    else if (f.sp >= 100 && take('special')) startAtk(f, 'special');
    else if (take('heavy')) startAtk(f, heavyFor());
    else if (take('light')) startAtk(f, 'light');
    else if (inp.block) { f.state = 'block'; f.vx = 0; f.dashT = 0; }
    else if (take('up')) { f.vy = -f.ch.jump; f.vx = d * f.ch.speed * 1.1; f.state = 'jump'; f.dashT = 0; f.sq = -.22; f.sqv = 0; dust(f.x, 5); sfx('jump'); }
    else if (doubleTap(f, 'fwd') || doubleTap(f, 'back')) {
      const dir = doubleTap(f, 'fwd') ? 1 : -1;
      f.dashT = dir > 0 ? 14 : 16; f.vx = f.face * dir * (dir > 0 ? 9.5 : 8); f.state = 'walk'; f.hist.length = 0;
      dust(f.x - f.face * dir * 16, 5, 2.6); sfx('whoosh');
    }
    else if (f.dashT > 0) { f.dashT--; f.vx *= .9; f.state = 'walk'; }
    else { f.vx = d * f.ch.speed; f.state = d ? 'walk' : 'idle'; }
  } else {
    const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (d && f.state === 'jump') f.vx = Math.max(-f.ch.speed * 1.2, Math.min(f.ch.speed * 1.2, f.vx + d * .25)); // a little air control
    if (wantUlt()) startUlt(f);
    else if (take('heavy')) startAtk(f, 'heavy');
    else if (take('light')) startAtk(f, 'light');
    else if (f.sp >= 100 && take('special')) startAtk(f, 'special');
  }
  const wasAir = f.y < GROUND, impact = f.vy;
  f.vy += f.ch.grav * (f.vy > 0 ? 1.2 : 1); f.y += f.vy; f.x += f.vx; // falls a bit faster than it rises: higher jumps that stay snappy
  if (f.y >= GROUND) {
    f.y = GROUND;
    if (wasAir) land(f, impact); else f.vy = 0;
    if (f.state === 'jump') f.state = 'idle';
    if (f.stun > 0 || f.state === 'ko') f.vx *= .85;
  }
  const nx = Math.max(40, Math.min(W - 40, f.x));
  if (nx !== f.x && (f.stun > 0 || f.state === 'ko') && Math.abs(f.vx) > 3) { // wall splat
    burst(nx + Math.sign(f.vx) * 8, f.y - f.ch.h / 2, 8, { ang: f.vx > 0 ? Math.PI : 0, spread: 1.8, sp: [1, 4], g: .15, life: [12, 22], cols: SAND, sz: 2 });
    f.vx = -f.vx * .5; f.rotV *= -.5; addTrauma('small'); sfx('wall'); // a tumbling body bounces off the wall spinning back
  }
  f.x = nx;
  if (f.y >= GROUND && f.state === 'walk' && f.T % 14 === 0) { dust(f.x - f.face * 14, 2, 1.2); sfx('step'); }
  f.sqv += -f.sq * .35; f.sqv *= .72; f.sq += f.sqv; // squash spring
  if (!f.stun && f.state !== 'ko') f.ghost += (f.hp - f.ghost) * .08;
}

// SP gauge: landing a light fills a quarter, a heavy (or rush/launcher) 40%; blocked hits count half.
export function gainSp(f, src, mult) {
  if (!f || !src || f.sp >= 100) return;
  f.sp = Math.min(100, f.sp + (src === 'light' ? 25 : 40) * mult);
  if (f.sp >= 100) { f.glint = 24; if (game.labels[f.i] !== 'CPU') sfx('ready'); }
}
// Rage (like Tekken): below 30% health a fighter hits 10% harder for the rest of the round, and SUPER fills once.
export function checkRage(f) {
  if (f.rage || f.hp <= 0 || f.hp > maxHp(f) * .3) return;
  f.rage = true; f.meter = 100; game.rageFlash = 10;
  pop('RAGE!', f.x, f.y - f.ch.h - 30, '#ff4f7b');
  burst(f.x, f.y - f.ch.h / 2, 24, { ang: -Math.PI / 2, spread: 2.4, sp: [2, 7], g: -.05, drag: .92, life: [16, 30], cols: ['#ff3b5c', '#ff4f7b', '#ff9a3b'], sz: 3 });
  sfx('rage'); duck(.35, .5);
}
// SUPER meter: dealing damage builds it faster than taking it; blocked hits give a little; nothing while an ultimate plays.
export function gainMeter(f, v) { if (f && !(f.atk && f.atkName === 'ult')) f.meter = Math.min(100, f.meter + v); }
