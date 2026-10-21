import { game, setGame } from '../core/state.js';
import { newGame, step } from '../game/match.js';
import { CHARS } from '../game/roster.js';
import { muted, setMuted } from '../audio/mixer.js';

// ---------- self-check: open the page with #selftest, or call selfTest() in the console ----------
export function selfTest() {
  const none = () => ({}), [A, B] = [CHARS[0], CHARS[1]], out = [], wasMuted = muted, wasGame = game;
  setMuted(true);
  try {
    const setup = (ctrl2, ctrl1 = none) => { newGame(A, B, [ctrl1, ctrl2], ['1P', '2P']); game.phase = 'fight'; game.p[0].x = 400; game.p[1].x = 470; game.p[1].face = -1; };
    const script = plan => { let n = 0; return () => plan[++n] || {}; }; // inputs by call number
    setup(none); game.p[0].buf.light = 8; for (let i = 0; i < 40; i++) step();
    out.push(['light hit lands', game.p[1].hp === B.hp - A.moves.light.dmg]);
    out.push(['hit scores points', game.score[0] === A.moves.light.dmg * 100]);
    out.push(['hit builds SUPER meter', game.p[0].meter > 0 && game.p[1].meter > 0]);
    setup(() => ({ block: true })); game.p[0].buf.light = 8; for (let i = 0; i < 40; i++) step();
    out.push(['block takes chip only', game.p[1].hp < B.hp && game.p[1].hp > B.hp - A.moves.light.dmg / 2]);
    setup(() => ({ right: true })); game.p[0].buf.light = 8; for (let i = 0; i < 40; i++) step(); // P2 faces left, so right is back
    out.push(['holding back guards', game.p[1].hp < B.hp && game.p[1].hp > B.hp - A.moves.light.dmg / 2]);
    setup(none, script({ 1: { light: true }, 6: { light: true }, 13: { heavy: true } })); let maxCombo = 0;
    for (let i = 0; i < 90; i++) { step(); maxCombo = Math.max(maxCombo, game.p[1].combo); }
    out.push(['L, L, H chain combo', maxCombo >= 3]);
    setup(none, script({ 1: { right: true }, 4: { right: true } })); game.p[1].x = 900; const x0 = game.p[0].x;
    for (let i = 0; i < 12; i++) step();
    out.push(['double-tap dash', game.p[0].x - x0 > 50]);
    setup(none, script({ 1: { block: true }, 4: { right: true }, 6: { special: true } }));
    for (let i = 0; i < 8; i++) step();
    out.push(['no ultimate without full SUPER', !game.cut && game.p[0].atkName !== 'ult']);
    setup(none, script({ 1: { block: true }, 4: { right: true }, 6: { special: true } })); game.p[0].meter = 100;
    for (let i = 0; i < 8; i++) step();
    out.push(['down, forward + special = ultimate', !!game.cut && game.p[0].atkName === 'ult' && game.p[0].meter === 0]);
    for (let i = 0; i < 200; i++) step();
    out.push(['ultimate deals big damage', game.p[1].hp <= B.hp - 20]);
    setup(none, script({ 1: { heavy: true, special: true } })); game.p[0].meter = 100;
    for (let i = 0; i < 3; i++) step();
    out.push(['heavy + special together = ultimate', !!game.cut && game.p[0].atkName === 'ult']);
    setup(none, script({ 1: { heavy: true }, 3: { special: true } })); game.p[0].meter = 100;
    for (let i = 0; i < 5; i++) step();
    out.push(['heavy then special a moment later = ultimate', !!game.cut && game.p[0].atkName === 'ult']);
    setup(none);
    out.push(['SP gauge starts empty', game.p.every(f => f.sp === 0)]);
    setup(none); game.p[0].sp = 0; game.p[0].buf.special = 8; for (let i = 0; i < 5; i++) step();
    out.push(['special needs a charged SP gauge', game.p[0].atkName !== 'special']);
    setup(none); game.p[0].sp = 0; game.p[0].buf.light = 8; for (let i = 0; i < 40; i++) step();
    out.push(['a landed light charges SP by 25%', game.p[0].sp === 25]);
    setup(none); game.p[1].hp = 35; game.p[0].buf.light = 8; for (let i = 0; i < 40; i++) step();
    out.push(['rage below 30% health adds 35% SUPER', game.p[1].rage && game.p[1].meter >= 35 && game.p[1].meter < 40]);
    setup(none); game.p[1].x = 800; game.p[0].sp = 100; game.p[0].buf.special = 8; for (let i = 0; i < 140; i++) step();
    out.push(['wave projectile hits', game.p[1].hp === B.hp - 10]);
    setup(none); game.p[1].hp = 1; game.p[0].buf.light = 8; for (let i = 0; i < 60; i++) step();
    out.push(['KO ends round', game.phase === 'roundEnd' && game.p[0].wins === 1]);
    out.push(['perfect round bonus', game.perfect && game.bonus.perfect === 10000]);
    for (let i = 0; i < 120; i++) step();
    out.push(['bonus added to score', game.score[0] >= A.moves.light.dmg * 100 + game.bonus.time + game.bonus.vital + 10000]);
  } finally { setGame(wasGame); setMuted(wasMuted); } // a match in progress carries on afterwards
  console.table(out); console.assert(out.every(r => r[1]), 'selfTest failed');
  return out.every(r => r[1]);
}
