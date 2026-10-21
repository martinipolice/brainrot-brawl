import { drawTralalero, drawTung, drawBombardiro, drawBallerina } from './art.js';

// ---------- roster ----------
export const CHARS = [
  { id: 'tralalero', name: 'Tralalero Tralala', tag: 'Shark on three sneakers. Quick, with a wave that keeps foes away.',
    hp: 124, speed: 4.4, jump: 15.1, grav: .7, w: 78, h: 108, zoner: true, stats: [5, 3, 3], draw: drawTralalero, koLift: 92, face: [50, -76], words: ['TRALALA!', 'SPLASH!', 'SNEAKER!'],
    quote: 'Three sneakers, zero losses. Tralala!',
    moves: {
      light: { name: 'Fin Jab', startup: 4, active: 3, recovery: 8, dmg: 6, kb: 3, stun: 14, hb: { x: 64, y: 72, w: 58, h: 36 } },
      heavy: { name: 'Sneaker Kick', startup: 9, active: 5, recovery: 17, dmg: 11, kb: 7, stun: 22, hitstop: 8, hb: { x: 70, y: 28, w: 66, h: 40 } },
      special: { name: 'Tralala Wave', startup: 14, active: 1, recovery: 20, proj: 'wave' },
      ult: { name: 'Tralala Tsunami', startup: 8, active: 1, recovery: 32, proj: 'tsunami', pose: 'special' } } },
  { id: 'tung', name: 'Tung Tung Tung Sahur', tag: 'A log with a bat. Slow and armored, and it hits hardest.',
    hp: 108, speed: 2.5, jump: 12.9, grav: .72, w: 72, h: 142, rush: true, stats: [1, 5, 2], draw: drawTung, koLift: 36, face: [3, -104], words: ['TUNG!', 'BONK!', 'SAHUR!'],
    quote: 'Tung. Tung. Tung. Wake up, it is time for sahur.',
    moves: {
      light: { name: 'Bat Poke', startup: 7, active: 3, recovery: 15, dmg: 6, kb: 4, stun: 14, hb: { x: 76, y: 80, w: 62, h: 28 } },
      heavy: { name: 'Sahur Swing', startup: 15, active: 5, recovery: 22, dmg: 12, kb: 9, stun: 22, hitstop: 10, hb: { x: 72, y: 90, w: 96, h: 90 } },
      special: { name: 'Tung Tung Tung', startup: 10, active: 30, recovery: 20, dmg: 5, kb: 3, stun: 16, hits: 3, rehit: 10, lunge: 4.5, armor: true, hb: { x: 72, y: 88, w: 92, h: 76 } },
      ult: { name: 'Tung x9 Sahur', startup: 6, active: 50, recovery: 24, dmg: 4, kb: 2, stun: 18, hits: 7, rehit: 7, lunge: 7, armor: true, pose: 'special', hb: { x: 76, y: 88, w: 112, h: 110 } } } },
  { id: 'bombardiro', name: 'Bombardiro Crocodilo', tag: 'Crocodile bomber plane. Floaty jumps and lobbed bombs.',
    hp: 123, speed: 3.5, jump: 13, grav: .42, w: 96, h: 96, zoner: true, stats: [3, 4, 3], draw: drawBombardiro, koLift: 74, face: [45, -102], words: ['KABOOM!', 'CHOMP!', 'CROC!'],
    quote: 'Bombs away. Next time, look up.',
    moves: {
      light: { name: 'Snout Snap', startup: 5, active: 3, recovery: 9, dmg: 6, kb: 3, stun: 14, hb: { x: 86, y: 86, w: 52, h: 32 } },
      heavy: { name: 'Propeller Ram', startup: 10, active: 8, recovery: 18, dmg: 10, kb: 8, stun: 22, hitstop: 8, lunge: 7, hb: { x: 62, y: 60, w: 80, h: 56 } },
      special: { name: 'Bombardino', startup: 12, active: 1, recovery: 18, proj: 'bomb' },
      ult: { name: 'Bombardino Barrage', startup: 10, active: 1, recovery: 34, proj: 'barrage', pose: 'special' } } },
  { id: 'ballerina', name: 'Ballerina Cappuccina', tag: 'Cappuccino-cup dancer. Long legs, spinning combos, hard to put down.',
    hp: 129, speed: 4.1, jump: 16.2, grav: .7, w: 50, h: 134, rush: true, stats: [4, 3, 4], draw: drawBallerina, koLift: 34, face: [1, -112], words: ['CAPPU!', 'SPIN!', 'MIMIMI!'],
    quote: 'Pirouette, cappuccino, victory. In that order.',
    moves: {
      light: { name: 'Foam Flick', startup: 4, active: 3, recovery: 7, dmg: 5, kb: 3, stun: 13, hb: { x: 52, y: 96, w: 52, h: 32 } },
      heavy: { name: 'Grand Jeté', startup: 9, active: 5, recovery: 16, dmg: 11, kb: 8, stun: 22, hitstop: 8, hb: { x: 62, y: 54, w: 72, h: 42 } },
      special: { name: 'Pirouette', startup: 6, active: 36, recovery: 18, dmg: 4, kb: 2, stun: 14, hits: 4, rehit: 9, lunge: 6.5, hb: { x: 20, y: 70, w: 96, h: 112 } },
      ult: { name: 'Cappuccino Cyclone', startup: 6, active: 50, recovery: 22, dmg: 4, kb: 2, stun: 16, hits: 7, rehit: 7, lunge: 8.5, pose: 'special', hb: { x: 30, y: 75, w: 130, h: 140 } } } },
];
// Command normals every fighter gets, built from their heavy: forward+H rushes in, back+H is a rising anti-air launcher.
CHARS.forEach(ch => {
  const hv = ch.moves.heavy;
  ch.moves.rush = { ...hv, name: `Rush ${hv.name}`, startup: hv.startup + 3, dmg: hv.dmg + 1, kb: hv.kb + 2, lunge: 6.5, pose: 'heavy' };
  ch.moves.rise = { name: 'Launcher', startup: 7, active: 5, recovery: 20, dmg: 7, kb: 3, stun: 28, launch: true, pose: 'heavy',
    hb: { x: ch.w / 2 + 26, y: ch.h * .85, w: 76, h: 100 } };
});
export const PCOL = ['#3fb8ff', '#ff7a3d'];
export const firstName = ch => ch.name.split(' ')[0].toUpperCase();
