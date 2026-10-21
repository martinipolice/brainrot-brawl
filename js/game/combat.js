import { W, GROUND } from '../core/constants.js';
import { game } from '../core/state.js';
import { pickOne } from '../core/util.js';
import { MAXSEP } from '../render/camera.js';
import { addTrauma, burst, pop, spark } from './effects.js';
import { gainSp, checkRage, gainMeter } from './fighter.js';
import { announce } from '../audio/announcer.js';
import { duck, muffle } from '../audio/mixer.js';
import { sfx } from '../audio/sfx.js';

// Hits: hitboxes, damage, blocking, armor, projectiles, and keeping the fighters apart and on one screen.
const overlap = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
const hurt = f => [f.x - f.ch.w / 2, f.y - f.ch.h, f.ch.w, f.ch.h];

function applyHit(t, h, attacker) {
  if (t.state === 'ko') return;
  if (attacker && attacker.rage) h = { ...h, dmg: h.dmg * 1.1 };
  // guard by holding block, or by holding back while standing or walking (like Street Fighter)
  const guarding = t.state === 'block' || t.state === 'blockstun' || (t.backHeld && t.y >= GROUND && !t.atk && !t.stun && (t.state === 'walk' || t.state === 'idle'));
  const blocking = guarding && t.face === -h.dir, big = h.stop > 6;
  game.stop = h.stop;
  if (blocking) {
    t.hp -= h.dmg * (h.chip ?? .15); t.stun = Math.round(h.stun * .7); t.state = 'blockstun'; t.vx = h.dir * Math.min(h.kb, 12) * .6;
    t.sq = .08; t.barShake = 1.5;
    if (!h.ult) gainMeter(attacker, h.dmg * .35); gainMeter(t, h.dmg * .25); gainSp(attacker, h.src, .5);
    if (attacker) game.score[attacker.i] += 20;
    spark(h.x, h.y, 'block'); sfx('block');
    burst(h.x, h.y, 6, { ang: h.dir > 0 ? Math.PI : 0, spread: 2, sp: [2, 6], g: .2, life: [8, 14], cols: ['#8fe8ff', '#9fd6ff', '#fff'], sz: 2 });
  } else if (t.atk && t.atk.armor && t.atkT < t.atk.startup + t.atk.active) {
    t.hp -= h.dmg; t.flash = 6; t.jit = 1; t.barShake = 3; t.hitFlash = 10; spark(h.x, h.y, 'hit'); sfx('hit'); // armored: takes damage, keeps swinging
    if (!h.ult) gainMeter(attacker, h.dmg * .7); gainMeter(t, h.dmg * .5); gainSp(attacker, h.src, 1);
    if (attacker) game.score[attacker.i] += Math.round(h.dmg) * 100;
    burst(h.x, h.y, 8, { ang: h.dir > 0 ? 0 : Math.PI, spread: 1.6, sp: [3, 9], life: [10, 18], cols: ['#fff', '#ffe45c', '#e6c38c'], floor: true });
  } else {
    t.hp -= h.dmg; t.atk = null; t.dashT = 0; t.stun = h.stun; t.state = 'hit'; t.vx = h.dir * h.kb; if (t.y < GROUND) t.vy = -4;
    if (h.launch) t.vy = -11; // launcher pops them up for a juggle
    if (h.finisher) t.vy = -9;
    t.flash = 6; t.combo++; t.jit = 1; t.sq = -.18; t.sqv = 0; t.barShake = big ? 6 : 3; t.hitFlash = 12;
    if (!h.ult) gainMeter(attacker, h.dmg * .7); gainMeter(t, h.dmg * .5); gainSp(attacker, h.src, 1);
    if (attacker) game.score[attacker.i] += Math.round(h.dmg) * 100 + (t.combo >= 2 ? t.combo * 200 : 0);
    if (attacker && t.combo >= 2) { attacker.comboN = t.combo; attacker.comboShow = 70; attacker.comboPop = 1; sfx('combo', t.combo); if (t.combo === 5) announce('excellent!'); }
    spark(h.x, h.y, 'hit'); sfx(big ? 'heavy' : 'hit'); if (attacker) sfx('fl_' + attacker.ch.id); if (big) duck(.7, .12); addTrauma(h.finisher ? 'big' : big ? 'heavy' : 'medium');
    burst(h.x, h.y, big ? 18 : 10, { ang: h.dir > 0 ? 0 : Math.PI, spread: 1.7, sp: big ? [4, 14] : [3, 9], g: .35, life: [10, 22],
      cols: ['#fff', '#ffe45c', '#ffd23f', '#ffb13b'], sz: big ? 3 : 2, floor: true });
    if (big || h.word) {
      if (attacker) pop(pickOne(attacker.ch.words), h.x, h.y - 40);
      game.zp = Math.max(game.zp, h.finisher ? .16 : .07); game.zx = h.x; game.zy = h.y;
    }
  }
  checkRage(t);
  if (t.hp <= 0) {
    Object.assign(t, { hp: 0, state: 'ko', atk: null, stun: 0, vy: -9, vx: h.dir * 6 });
    Object.assign(game, { stop: 22, slowT: 60, koZoom: 80, zx: t.x, zy: t.y - t.ch.h / 2, flash: 6 }); addTrauma('ko');
    burst(t.x, t.y - t.ch.h / 2, 34, { sp: [3, 13], g: .25, life: [20, 40], cols: ['#ffd23f', '#ff4f7b', '#3fb8ff', '#fff', '#ff8fc4'], sz: 3, floor: true });
    sfx('ko'); duck(.15, 1.2); muffle(1);
  }
}

export function checkMelee(f, foe) {
  const m = f.atk;
  if (!m || m.proj || foe.state === 'ko') return;
  const a0 = m.startup, a1 = a0 + m.active;
  if (f.atkT < a0 || f.atkT >= a1 || f.hitN >= (m.hits || 1) || f.atkT - f.lastHitT < (m.rehit || 99)) return;
  const hx = f.x + f.face * m.hb.x - m.hb.w / 2, hy = f.y - m.hb.y - m.hb.h / 2;
  if (overlap(hx, hy, m.hb.w, m.hb.h, ...hurt(foe))) {
    f.hitN++; f.lastHitT = f.atkT;
    const ult = f.atkName === 'ult', last = ult && f.hitN === m.hits; // an ultimate's last hit is a big launching finisher
    applyHit(foe, { dmg: m.dmg, kb: last ? m.kb * 5 : m.kb, stun: m.stun, stop: last ? 14 : m.hitstop || 5, dir: f.face, x: hx + m.hb.w / 2, y: hy + m.hb.h / 2,
      word: (f.atkName === 'special' && f.hitN === 1) || last, launch: m.launch, chip: ult ? .3 : .15, finisher: last, ult,
      src: f.atkName === 'light' ? 'light' : f.atkName === 'heavy' || f.atkName === 'rush' || f.atkName === 'rise' ? 'heavy' : null }, f);
  }
}

export function spawnProj(f, kind) {
  if (kind === 'wave') game.proj.push({ kind, owner: f.i, x: f.x + f.face * 56, y: GROUND - 38, vx: 7.5 * f.face, vy: 0, g: 0, w: 48, h: 46, dmg: 10, kb: 6, stun: 20, T: 0 });
  else if (kind === 'tsunami') game.proj.push({ kind, owner: f.i, x: f.x + f.face * 70, y: GROUND - 70, vx: 8.5 * f.face, vy: 0, g: 0, w: 96, h: 140, dmg: 26, kb: 12, stun: 40, T: 0, ult: true });
  else if (kind === 'barrage') { // five bombs rain down around the opponent
    const foe = game.p[1 - f.i];
    for (let k = 0; k < 5; k++) game.proj.push({ kind: 'bomb', owner: f.i, x: Math.max(60, Math.min(W - 60, foe.x + (k - 2) * 42)), y: -60 - k * 50, vx: 0, vy: 3, g: .38, w: 26, h: 26, dmg: 6, kb: 5, stun: 22, T: 0, ult: true });
  }
  else game.proj.push({ kind, owner: f.i, x: f.x + f.face * 40, y: f.y - 70, vx: 5.2 * f.face, vy: -6.5, g: .38, w: 26, h: 26, dmg: 14, kb: 8, stun: 24, T: 0 });
  sfx('special');
}
function explode(q) {
  const y = Math.min(q.y, GROUND - 10), t = game.p[1 - q.owner];
  game.fx.push({ kind: 'blast', x: q.x, y, T: 0, life: 30 }); sfx('heavy'); addTrauma('big');
  burst(q.x, y, 24, { sp: [3, 11], g: .3, life: [14, 30], cols: ['#ffb13b', '#ffe45c', '#fff1b0', '#ff7a3d'], sz: 3, floor: true });
  burst(q.x, y, 10, { ang: -Math.PI / 2, spread: 2, sp: [1, 3], g: -.05, drag: .9, life: [24, 40], cols: ['#6b6b72', '#2b2b33'], sz: 3 });
  if (t.state !== 'ko' && Math.hypot(t.x - q.x, t.y - t.ch.h / 2 - y) < 80 + t.ch.w / 2)
    applyHit(t, { dmg: q.dmg, kb: q.kb, stun: q.stun, stop: 8, dir: Math.sign(t.x - q.x) || Math.sign(q.vx) || 1, x: t.x, y: t.y - t.ch.h / 2, chip: q.ult ? .3 : .15, ult: q.ult }, game.p[q.owner]);
}
export function updateProj() {
  for (const q of game.proj) {
    q.T++; q.vy += q.g; q.x += q.vx; q.y += q.vy;
    if (q.kind === 'tsunami' && q.T % 2 === 0) burst(q.x - Math.sign(q.vx) * 50, q.y + 40, 3, { ang: -Math.PI / 2, spread: 1.6, sp: [2, 6], g: .3, life: [14, 26], cols: ['#9fd6ff', '#fff', '#3fb8ff', '#eef4f8'], sz: 3 });
    if (q.kind === 'wave' && q.T % 2 === 0) burst(q.x - Math.sign(q.vx) * 20, q.y + 10, 1, { ang: -Math.PI / 2, spread: 1.4, sp: [1, 3], g: .25, life: [10, 18], cols: ['#9fd6ff', '#fff', '#3fb8ff'] });
    if (q.kind === 'bomb' && q.T % 3 === 0) burst(q.x, q.y, 1, { sp: [0, .6], g: -.03, life: [14, 22], cols: ['#6b6b72', '#8f9aa3'], sz: 2 });
    const t = game.p[1 - q.owner], hit = t.state !== 'ko' && overlap(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h, ...hurt(t));
    if (q.kind === 'bomb') { if (hit || q.y >= GROUND - 10) { explode(q); q.dead = true; } }
    else if (hit) { applyHit(t, { dmg: q.dmg, kb: q.kb, stun: q.stun, stop: q.ult ? 14 : 6, dir: Math.sign(q.vx), x: q.x, y: q.y, word: true, chip: q.ult ? .3 : .15, finisher: q.kind === 'tsunami', ult: q.ult }, game.p[q.owner]); q.dead = true; }
    if (q.x < -60 || q.x > W + 60) q.dead = true;
  }
  for (const a of game.proj) for (const b of game.proj)
    if (a.owner < b.owner && !a.dead && !b.dead && !(a.kind === 'tsunami' && b.kind === 'tsunami') && overlap(a.x - a.w / 2, a.y - a.h / 2, a.w, a.h, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)) {
      a.dead = a.kind !== 'tsunami'; b.dead = b.kind !== 'tsunami'; // the tsunami washes through smaller projectiles
      spark((a.x + b.x) / 2, (a.y + b.y) / 2, 'block'); sfx('block');
      burst((a.x + b.x) / 2, (a.y + b.y) / 2, 14, { sp: [2, 8], life: [10, 20], cols: ['#8fe8ff', '#fff', '#ffe45c'] });
    }
  game.proj = game.proj.filter(q => !q.dead);
}
// The camera is zoomed in, so fighters can't drift further apart than one screen (the walls still stop them).
export function keepOnScreen(a, b) {
  if (a.state === 'ko' || b.state === 'ko') return;
  for (let k = 0; k < 6; k++) {
    const d = b.x - a.x, ex = Math.abs(d) - MAXSEP; if (ex <= 0) return;
    const dir = Math.sign(d);
    a.x = Math.max(40, Math.min(W - 40, a.x + dir * ex / 2)); b.x = Math.max(40, Math.min(W - 40, b.x - dir * ex / 2));
  }
}
export function separate(a, b) {
  if (a.state === 'ko' || b.state === 'ko') return;
  const min = (a.ch.w + b.ch.w) / 2 * .75, dx = b.x - a.x;
  if (Math.abs(dx) < min && Math.abs(a.y - b.y) < Math.min(a.ch.h, b.ch.h) * .8) {
    const push = (min - Math.abs(dx)) / 2 * (dx ? Math.sign(dx) : a.face);
    a.x = Math.max(40, Math.min(W - 40, a.x - push)); b.x = Math.max(40, Math.min(W - 40, b.x + push));
  }
}
