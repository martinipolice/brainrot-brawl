import { GROUND } from '../core/constants.js';
import { game } from '../core/state.js';

// CPU opponent. lvl runs 0 (easy) to 1 (hard) and sets how fast it reacts to your attacks, how often it guards,
// how aggressive it is, how long it hesitates between decisions, and whether it uses combos, launchers and ultimates.
export function cpuCtrl(i, lvl = .5) {
  const react = Math.round(24 - lvl * 18), guard = .1 + lvl * .42, aggro = .35 + lvl * .45, think = Math.round(16 - lvl * 10);
  return () => {
    const me = game.p[i], foe = game.p[1 - i], ai = me.ai, inp = {};
    const dx = foe.x - me.x, dist = Math.abs(dx), toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right', r = Math.random();
    const threat = (foe.atk && foe.atkT < foe.atk.startup + foe.atk.active && dist < 240) ||
      game.proj.some(q => q.owner !== i && Math.abs(q.x - me.x) < 190 && Math.sign(q.vx || dx) === Math.sign(me.x - q.x));
    ai.threatT = threat ? (ai.threatT || 0) + 1 : 0;
    // one guard roll per threat, after a human-like reaction delay
    if (ai.threatT === react && !me.atk && !me.stun && r < guard) { ai.keys = { block: true }; ai.hold = 16; }
    if (ai.hold > 0) { ai.hold--; return Object.assign(inp, ai.keys); }
    ai.keys = {};
    if (me.stun) return inp;
    if (me.atk) { // harder CPUs chain a connected light into a heavy
      if (me.atkName === 'light' && me.hitN > 0 && Math.random() < lvl * .5) inp.heavy = true;
      return inp;
    }
    const reach = me.ch.moves.light.hb.x + me.ch.moves.light.hb.w / 2 + foe.ch.w / 2 - 6;
    if (me.meter >= 100 && Math.random() < .02 + lvl * .1 && (dist < reach + 60 || me.ch.zoner || me.ch.id === 'bombardiro')) { inp.ult = true; ai.hold = 10; return inp; }
    if (foe.y < GROUND - 60 && dist < 200 && r < lvl * .5) { inp.heavy = true; ai.keys = { [away]: true }; ai.hold = 2; return inp; } // anti-air launcher (back + H)
    if (r < (1 - lvl) * .22) { ai.hold = 14 + (Math.random() * 20 | 0); return inp; } // hesitate
    if (dist < reach) {
      const q = Math.random();
      if (q < aggro) {
        const pick = Math.random();
        if (pick < .5) inp.light = true; else if (pick < .82) inp.heavy = true; else if (me.sp >= 100) inp.special = true; else inp.light = true;
      } else if (q < aggro + .2) ai.keys = { [away]: true };
      else ai.keys = { block: true };
      ai.hold = think + (Math.random() * 12 | 0);
    } else if (me.sp >= 100 && ((me.ch.zoner && dist > 300 && r < .15 + lvl * .15) || (me.ch.rush && dist < 280 && r < .06 + lvl * .08))) { inp.special = true; ai.hold = 18; }
    else {
      ai.keys = { [toward]: true }; ai.hold = 6 + (Math.random() * 14 | 0);
      if (r < .04 + lvl * .04) inp.up = true;
    }
    return Object.assign(inp, ai.keys);
  };
}
