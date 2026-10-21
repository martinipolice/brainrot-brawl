import { W, H, GROUND } from '../core/constants.js';
import { game } from '../core/state.js';
import { g, E, R, P, L, S } from '../render/shapes.js';
import { toLo } from '../render/camera.js';
import { rect, fan } from './draw.js';
import { sfx } from '../audio/sfx.js';

// Ballerina's Opera House: the stage of an Italian theatre. Red curtains frame it and the audience fills the boxes;
// spotlights follow both fighters, the footlights flare on big hits, the chandelier sways, the audience stands and
// cheers combos and KOs, roses rain onto the stage after a KO, and a KO brings the chandelier crashing down behind the
// fighters (it's hung again for the next round).
const BOXES = [...Array(7)].map((_, i) => 30 + i * 132); // left edges of the theatre boxes, two tiers
const SHIRTS = ['#5a1028', '#2b2b33', '#6a1f5a', '#1b4a73'];
const CH = { x: 480, y: 214, drop: 96 }; // the chandelier hangs from (x, y) on a chain `drop` long

export default {
  id: 'opera', name: 'Opera Cappuccina', home: 'ballerina',
  init: () => ({ a: 0, v: 0, fall: 0, fv: 0, broken: false, cheer: 0, flare: 0, roses: [] }),
  paint() {
    const wall = g.createLinearGradient(0, 0, 0, 404); wall.addColorStop(0, '#15101d'); wall.addColorStop(1, '#5a1028');
    g.fillStyle = wall; g.fillRect(0, 0, W, 404);
    // two tiers of theatre boxes with gold rails
    for (const [y, h] of [[214, 54], [290, 54]]) for (const x of BOXES) {
      R(x, y, 100, h, 12, '#15101d'); L(x - 4, y + h, x + 104, y + h, 5, '#ffd23f');
      g.fillStyle = '#c99556'; g.fillRect(x - 14, y - 6, 8, h + 10);
    }
    // the stage's back curtain behind the fighters, and the floor boards
    g.fillStyle = '#6a1f5a'; g.fillRect(110, 352, W - 220, 52);
    g.fillStyle = '#4b2350'; for (let x = 120; x < W - 110; x += 28) g.fillRect(x, 352, 6, 52);
    const floor = g.createLinearGradient(0, 404, 0, H); floor.addColorStop(0, '#b9834d'); floor.addColorStop(1, '#8a5a30'); g.fillStyle = floor; g.fillRect(0, 404, W, H - 404);
    g.fillStyle = '#8f5d31'; for (let y = 418; y < H; y += 18) g.fillRect(0, y, W, 2);
    for (let i = 0; i < 30; i++) g.fillRect((i * 167) % W, 404 + (i * 18) % 136, 2, 16); // board ends
    // red side curtains with folds and gold tie-backs, and the swagged valance across the top
    for (const [x0, dir] of [[0, 1], [W, -1]]) {
      P([x0, 120, x0 + dir * 130, 120, x0 + dir * 96, 300, x0 + dir * 120, 470, x0, 470], '#c2416b');
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x0 + dir * k * 30, 120); g.quadraticCurveTo(x0 + dir * (k * 22), 300, x0 + dir * k * 28, 470); S(4, '#9a2f66'); }
      L(x0 + dir * 70, 296, x0 + dir * 118, 300, 5, '#ffd23f');
    }
    for (let x = -40; x < W + 80; x += 120) E(x + 60, 150, 76, 44, '#c2416b');
    g.fillStyle = '#9a2f66'; g.fillRect(0, 100, W, 30); g.fillStyle = '#ffd23f'; g.fillRect(0, 128, W, 4);
    g.fillStyle = '#1a1024'; g.fillRect(0, GROUND, W, 3);
  },
  ambient(c, cam, st, tick) {
    const r = (x, y, w, h, col) => rect(c, cam, x, y, w, h, col);
    // the audience in the boxes, standing and waving when they cheer
    let i = 0;
    for (const y of [214, 290]) for (const x of BOXES) for (const k of [24, 50, 76]) fan(c, cam, x + k, y + 22, SHIRTS[i % 4], '#e8c39e', st.cheer > 0 && i % 3 !== 1, tick, i++);
    // spotlights: a soft cone from the rigging to each fighter, and a bright pool at their feet
    if (game && game.p) {
      c.save(); c.globalAlpha = .13; c.fillStyle = '#fff1b0';
      for (const [k, f] of game.p.entries()) {
        const [sx, sy] = toLo(cam, k ? 760 : 200, 96), [fx, fy] = toLo(cam, f.x, GROUND), half = 70 * cam.s;
        c.beginPath(); c.moveTo(sx - 4, sy); c.lineTo(sx + 4, sy); c.lineTo(fx + half, fy); c.lineTo(fx - half, fy); c.closePath(); c.fill();
      }
      c.globalAlpha = .22; for (const f of game.p) { const [fx, fy] = toLo(cam, f.x, GROUND); c.beginPath(); c.ellipse(fx, fy, 72 * cam.s, 12 * cam.s, 0, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    // footlights along the front of the stage, flaring after big hits
    for (let x = 30; x < W; x += 60) { r(x - 6, 512, 12, 8, '#2b2b33'); r(x - 4, 506, 8, 6, st.flare > 0 && (tick >> 1) % 2 ? '#fff1b0' : '#ffd23f'); }
    for (const p of st.roses) { r(p.x - 6, p.y - 6, 12, 10, '#ff3b5c'); r(p.x - 3, p.y - 8, 6, 4, '#ff8fc4'); r(p.x - 1, p.y + 4, 3, 10, '#4d8b3a'); } // roses
  },
  boxes: [[CH.x - 90, 150, CH.x + 90, 430]], // the chandelier swings, then falls, inside this
  props(st) {
    const y0 = CH.y + st.fall;
    if (!st.broken) L(CH.x, CH.y - 40 + st.fall, CH.x, y0, 2, '#6b6b72'); // chain
    g.save(); g.translate(CH.x, y0); if (!st.broken) g.rotate(st.a);
    if (st.broken) { // smashed on the boards at the back of the stage: a flattened ring, crystals and candles scattered
      E(0, -6, 62, 10, '#ffb13b'); E(0, -8, 40, 5, '#8a5a30', false); R(-4, -26, 8, 20, 3, '#ffb13b');
      for (let k = -4; k <= 4; k++) E(k * 22 + (k % 2) * 6, -2 + (k * k) % 5, 5, 4, '#9fd6ff');
      for (const k of [-1, 1]) { g.save(); g.translate(k * 70, -3); g.rotate(k * 1.4); R(-3, -12, 6, 12, 2, '#f7efe3'); g.restore(); }
    } else {
      R(-6, 0, 12, CH.drop - 40, 3, '#ffb13b');
      E(0, CH.drop - 30, 58, 14, '#ffb13b'); // gold ring
      for (let k = -2; k <= 2; k++) { E(k * 22, CH.drop - 14, 5, 9, '#9fd6ff'); R(k * 22 - 3, CH.drop - 50, 6, 14, 2, '#f7efe3'); E(k * 22, CH.drop - 54, 3, 4, '#ffd23f', false); } // crystals and candles
    }
    g.restore();
  },
  tick(st) {
    st.v += -st.a * .05; st.v *= .96; st.a = Math.max(-.5, Math.min(.5, st.a + st.v)); if (st.cheer > 0) st.cheer--; if (st.flare > 0) st.flare--;
    if (st.fv > 0 || (st.fall > 0 && !st.broken)) { // falling: it lands behind the fighters and smashes
      st.fv += .5; st.fall += st.fv;
      if (CH.y + st.fall >= 412) { st.fall = 412 - CH.y; st.fv = 0; st.broken = true; sfx('heavy'); st.flare = 30; }
    }
    for (const p of st.roses) if (p.y < p.rest) { p.y += p.vy; p.vy = Math.min(4, p.vy + .12); p.x += p.vx; }
  },
  on(type, d, st) {
    if (type === 'big') { st.flare = 24; st.v += (d.x < CH.x ? 1 : -1) * .05; }
    if (type === 'combo') st.cheer = Math.max(st.cheer, 100);
    if (type === 'ko') {
      st.cheer = 200; st.flare = 40;
      if (!st.broken && !st.fv) { st.fv = .5; st.fall = 1; }
      st.roses = [...Array(9)].map((_, k) => ({ x: 120 + k * 90, y: 260 + (k * 37) % 50, vx: ((k * 7) % 5 - 2) * .4, vy: -2, rest: 440 + (k * 23) % 50 }));
    }
    if (type === 'round') Object.assign(st, { a: 0, v: 0, fall: 0, fv: 0, broken: false, roses: [] });
  },
};
