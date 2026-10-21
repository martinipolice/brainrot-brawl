import { W, H, GROUND } from '../core/constants.js';
import { g, E, R, P, L } from '../render/shapes.js';
import { rect } from './draw.js';
import { pop } from '../game/effects.js';
import { sfx } from '../audio/sfx.js';

// Tralalero's Shark Pier: a wooden pier over a choppy morning sea. Seagulls wheel overhead and scatter after big hits,
// waves throw spray over the pier's edge every few seconds (a big splash after a KO), the lighthouse blinks, and the
// crate stacks at each end smash when someone is slammed into them (they're stacked again next round).
const CRATES = [60, 900]; // centre of the crate stack at each end

export default {
  id: 'pier', name: 'Shark Pier', home: 'tralalero',
  init: () => ({ t: 0, scatter: 0, splash: 0, broken: [false, false], hit: [0, 0] }),
  paint() {
    const sky = g.createLinearGradient(0, 0, 0, 340); sky.addColorStop(0, '#6b93b8'); sky.addColorStop(.6, '#9fd6ff'); sky.addColorStop(1, '#f3e2c7');
    g.fillStyle = sky; g.fillRect(0, 0, W, 340);
    E(250, 262, 54, 54, 'rgba(255,241,176,.25)', false); E(250, 262, 36, 36, '#fff1b0', false); // hazy morning sun
    // lighthouse on rocks far out
    P([740, 344, 770, 316, 820, 308, 880, 322, 910, 344], '#3b2d4f');
    P([808, 314, 816, 214, 840, 214, 848, 314], '#f7efe3'); g.fillStyle = '#ff3b5c'; g.fillRect(814, 238, 28, 12); g.fillRect(812, 278, 32, 12);
    R(810, 196, 36, 20, 3, '#2b2b33');
    // choppy sea with crest lines
    const sea = g.createLinearGradient(0, 336, 0, 420); sea.addColorStop(0, '#2d6fa0'); sea.addColorStop(1, '#1b4a73'); g.fillStyle = sea; g.fillRect(0, 336, W, 84);
    g.fillStyle = '#9fd6ff'; for (let i = 0; i < 22; i++) g.fillRect((i * 151) % W, 344 + (i * 29) % 60, 26 + (i * 13) % 20, 3);
    // back railing, then the deck boards
    g.fillStyle = '#8a5a30'; for (let x = 0; x < W; x += 80) g.fillRect(x, 360, 8, 44); g.fillRect(0, 362, W, 6); g.fillRect(0, 382, W, 4);
    const deck = g.createLinearGradient(0, 400, 0, H); deck.addColorStop(0, '#c99556'); deck.addColorStop(1, '#8a5a30'); g.fillStyle = deck; g.fillRect(0, 402, W, H - 402);
    g.fillStyle = '#5b3a1e'; for (let y = 420; y < H; y += 22) g.fillRect(0, y, W, 2);
    for (let i = 0; i < 26; i++) g.fillRect((i * 193) % W, 402 + (i * 22) % 132, 2, 20); // board ends
    g.fillStyle = '#4a2c14'; for (let i = 0; i < 18; i++) E((i * 211) % W, 430 + (i * 47) % 100, 3, 2, '#4a2c14', false); // nail heads
    g.fillStyle = '#1a1024'; g.fillRect(0, GROUND, W, 3);
  },
  ambient(c, cam, st, tick) {
    const r = (x, y, w, h, col) => rect(c, cam, x, y, w, h, col);
    for (let i = 0; i < 5; i++) { // seagulls circling; after big hits they flap off higher
      const a = tick * .012 + i * 1.3, up = st.scatter * (2 + i);
      const x = 480 + Math.cos(a) * (240 + i * 40), y = 278 + Math.sin(a * 1.7) * 20 - up, flap = (tick >> 3) + i & 1;
      r(x - 14, y + (flap ? 0 : 6), 12, 4, '#f7efe3'); r(x + 2, y + (flap ? 0 : 6), 12, 4, '#f7efe3'); r(x - 3, y + 3, 6, 5, '#f7efe3'); r(x - 1, y + 7, 2, 2, '#ffb13b');
    }
    r(818, 200, 20, 12, (tick % 90) < 30 ? '#fff1b0' : '#ffb13b'); // lighthouse lamp
    for (let i = 0; i < 12; i++) { // glints on the water
      if (((tick / 9 | 0) + i * 5) % 6) continue;
      r((i * 173) % W, 350 + (i * 41) % 60, 6, 2, '#eef4f8');
    }
    // spray thrown over the railing when a wave hits the pier: a wave every 4 s, plus a big one after a KO
    const wave = st.t % 240, k = wave < 40 ? wave / 40 : -1, big = st.splash > 0 ? 1 - st.splash / 60 : -1;
    for (const [p, size] of [[k, 1], [big, 2.2]]) {
      if (p < 0) continue;
      for (let j = 0; j < 14; j++) {
        const x = (j * 71 + (size > 1 ? 30 : 0)) % W, h = Math.sin(p * Math.PI) * (30 + (j * 17) % 30) * size;
        r(x, 364 - h, 12, 10, j % 3 ? '#eef4f8' : '#9fd6ff'); r(x + 16, 370 - h * .7, 8, 8, '#eef4f8'); r(x - 10, 372 - h * .5, 6, 6, '#9fd6ff');
      }
    }
  },
  boxes: [[CRATES[0] - 60, 330, CRATES[0] + 70, 472], [CRATES[1] - 70, 330, CRATES[1] + 60, 472]],
  props(st, i) {
    const x = CRATES[i], shake = st.hit[i] > 0 ? (st.hit[i] % 4 < 2 ? 3 : -3) : 0;
    const crate = (cx, y, s) => { R(cx - s / 2, y - s, s, s, 2, '#c99556'); L(cx - s / 2 + 4, y - s + 4, cx + s / 2 - 4, y - 4, 4, '#8a5530'); R(cx - s / 2, y - s, s, 6, 1, '#8a5530'); };
    if (!st.broken[i]) { crate(x - 24 + shake, GROUND, 48); crate(x + 24 + shake, GROUND, 48); crate(x + shake, GROUND - 48, 46); }
    else { // smashed: one crate left, planks scattered on the deck
      crate(x + (i ? 20 : -20), GROUND, 48);
      for (let k = 0; k < 5; k++) { g.save(); g.translate(x - 40 + k * 22, GROUND - 4); g.rotate((k % 3 - 1) * .4); R(-14, -4, 28, 7, 2, '#c99556'); g.restore(); }
    }
  },
  tick(st) { st.t++; st.scatter *= .985; if (st.splash > 0) st.splash--; st.hit = st.hit.map(h => Math.max(0, h - 1)); },
  on(type, d, st) {
    if (type === 'big') st.scatter = Math.max(st.scatter, 30);
    if (type === 'wall') { // slammed into a crate stack: it smashes (or rattles, if it's already down)
      const i = d.x < W / 2 ? 0 : 1;
      if (!st.broken[i]) { st.broken[i] = true; pop('CRASH!', CRATES[i], GROUND - 120, '#ffb13b'); sfx('heavy'); } else st.hit[i] = 16;
    }
    if (type === 'ko') { st.splash = 60; st.scatter = 50; }
    if (type === 'round') st.broken = [false, false];
  },
};
