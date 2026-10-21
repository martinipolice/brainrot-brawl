import { W, H, GROUND } from '../core/constants.js';
import { g, E, R, P, L, S } from '../render/shapes.js';
import { pop } from '../game/effects.js';
import { sfx } from '../audio/sfx.js';
import { rect, fan } from './draw.js';

// Sahur Village: an Indonesian village street before dawn in Ramadan, Tung's home. Lanterns sway on strings and swing
// after big hits, the neighbours appear in their windows waving to cheer combos and KOs, and the kentongan drum hanging
// in the guard post swings with every big hit, ringing "TUNG!" when one lands close to it and on every KO.
const HOUSES = [...Array(8)].map((_, i) => ({ x: -30 + i * 118, w: 104, top: 318 + (i * 23) % 26 }));
const WINDOWS = HOUSES.flatMap(h => [h.x + 18, h.x + h.w - 38].map(x => ({ x, y: h.top + 18 }))); // top-left of each 20x22 window
const STRINGS = [[0, 284, 460, 300, 26], [470, 296, 712, 300, 18], [808, 300, 960, 288, 12]]; // x0, y0, x1, y1, sag
const DRUM = { x: 760, y: 322 }; // where the kentongan hangs from the guard post's crossbar, near the middle of the stage
const SHIRTS = ['#3fb8ff', '#ff4f7b', '#4d8b3a', '#f7efe3', '#ff9a3b'];

export default {
  id: 'village', name: 'Sahur Village', home: 'tung',
  init: () => ({ a: 0, v: 0, t: 0, cheer: 0, jolt: 0 }),
  paint() {
    const sky = g.createLinearGradient(0, 0, 0, 380); sky.addColorStop(0, '#15101d'); sky.addColorStop(.55, '#2a1446'); sky.addColorStop(1, '#6a1f5a');
    g.fillStyle = sky; g.fillRect(0, 0, W, 380);
    for (let i = 0; i < 46; i++) { g.fillStyle = i % 3 ? '#bba9cc' : '#fff1b0'; g.fillRect((i * 211) % W, 120 + (i * 97) % 170, 3, 3); } // stars, low enough for the fight camera to show
    E(740, 222, 50, 50, 'rgba(255,241,176,.1)', false); // crescent moon: a disc with a bite taken out by a clip
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.arc(758, 210, 31, 0, Math.PI * 2, true); g.clip(); E(740, 222, 34, 34, '#fff1b0', false); g.restore();
    // far rooftops and a mosque with its minaret, dark against the dawn glow
    g.fillStyle = '#2a1f36';
    for (let i = 0; i < 12; i++) g.fillRect(i * 82, 330 - (i * 37) % 30, 70, 60);
    g.fillRect(470, 288, 120, 60); E(530, 290, 46, 40, '#2a1f36', false); g.fillRect(527, 236, 6, 18);
    g.fillRect(618, 210, 16, 140); E(626, 210, 12, 12, '#2a1f36', false); P([620, 204, 626, 182, 632, 204], '#2a1f36', false);
    // village houses with lit windows and tiled roofs
    const walls = ['#8a5a30', '#8f5d31', '#5b3a1e', '#8a5530'], roofs = ['#5a1028', '#9a2f66', '#6a1f5a'];
    HOUSES.forEach((h, i) => {
      R(h.x, h.top, h.w, 402 - h.top, 2, walls[i % 4]);
      P([h.x - 8, h.top + 2, h.x + h.w / 2, h.top - 30, h.x + h.w + 8, h.top + 2], roofs[i % 3]);
      for (const wx of [h.x + 18, h.x + h.w - 38]) { R(wx, h.top + 18, 20, 22, 2, '#ffd23f'); g.beginPath(); g.moveTo(wx + 10, h.top + 18); g.lineTo(wx + 10, h.top + 40); S(2, '#8a5a30'); }
      R(h.x + h.w / 2 - 10, 368, 20, 34, 2, '#5b3a1e'); // door
    });
    // low stone wall, then the dirt street
    R(-4, 386, W + 8, 18, 0, '#6b5a7d'); g.fillStyle = '#3b2d4f'; for (let x = 20; x < W; x += 44) g.fillRect(x, 388, 3, 14);
    const road = g.createLinearGradient(0, 402, 0, H); road.addColorStop(0, '#b9834d'); road.addColorStop(1, '#8a5530'); g.fillStyle = road; g.fillRect(0, 404, W, H - 404);
    g.fillStyle = '#8f5d31'; for (let i = 0; i < 14; i++) g.fillRect((i * 173) % W, 420 + (i * 31) % 100, 40 + (i * 7) % 30, 3); // ruts
    // lantern strings (the lanterns themselves sway, see ambient)
    for (const [x0, y0, x1, y1, sag] of STRINGS) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); S(2, '#1a1024'); }
    // the guard post (pos ronda) that the kentongan drum hangs in
    L(DRUM.x - 42, 300, DRUM.x - 42, 468, 6, '#5b3a1e'); L(DRUM.x + 42, 300, DRUM.x + 42, 468, 6, '#5b3a1e'); L(DRUM.x - 48, DRUM.y, DRUM.x + 48, DRUM.y, 4, '#8a5a30');
    P([DRUM.x - 60, 306, DRUM.x, 270, DRUM.x + 60, 306], '#5a1028'); R(DRUM.x - 38, 432, 76, 10, 3, '#8a5a30');
    g.fillStyle = '#8a5530'; g.fillRect(0, GROUND, W, 3);
  },
  ambient(c, cam, st, tick) {
    const r = (x, y, w, h, col) => rect(c, cam, x, y, w, h, col);
    const cols = ['#ff4f7b', '#ffd23f', '#ff7a3d', '#3fb8ff'];
    STRINGS.forEach(([x0, y0, x1, y1, sag], s) => { // lanterns sway on their strings, and swing hard after big hits
      for (let i = 1; i < 6; i++) {
        const t = i / 6, sway = Math.sin(tick * .05 + i * 1.7 + s) * 5 + st.jolt * Math.sin(tick * .4 + i) * 18;
        const x = x0 + (x1 - x0) * t + sway, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t) + 2;
        r(x - 1, y - 2, 2, 4, '#1a1024'); r(x - 6, y + 2, 12, 16, cols[(i + s) % 4]); r(x - 6, y + 14, 12, 4, '#5a1028'); r(x - 2, y + 6, 4, 6, '#fff1b0');
      }
    });
    if (st.cheer > 0) WINDOWS.forEach((w, i) => { if (i % 4 !== 3) fan(c, cam, w.x + 10, w.y + 4, SHIRTS[i % SHIRTS.length], '#e0b278', true, tick, i); }); // neighbours waving
  },
  boxes: [[DRUM.x - 60, DRUM.y - 10, DRUM.x + 60, DRUM.y + 100]], // the drum swings inside this
  props(st) {
    g.save(); g.translate(DRUM.x, DRUM.y); g.rotate(st.a);
    L(0, 0, 0, 16, 2, '#5b3a1e'); R(-12, 16, 24, 66, 9, '#b9834d'); R(-3, 32, 6, 30, 3, '#4a2c14'); E(0, 17, 11, 3, '#e0b278');
    g.restore();
  },
  tick(st) { // a damped spring toward a gentle breeze
    st.t++; st.v += (Math.sin(st.t * .03) * .06 - st.a) * .06; st.v *= .95;
    st.a = Math.max(-.8, Math.min(.8, st.a + st.v)); if (Math.abs(st.a) === .8) st.v *= -.4; // it bumps the guard post's side and bounces back
    if (st.cheer > 0) st.cheer--; st.jolt *= .97;
  },
  on(type, d, st) {
    if (type !== 'combo') { // every impact shakes the street: the drum swings away from it, hard and ringing when close
      const near = Math.abs(d.x - DRUM.x) < 200;
      st.v += (d.x < DRUM.x ? -1 : 1) * (type === 'ko' ? .32 : near ? .22 : .08);
      if (near || type === 'ko') { pop('TUNG!', DRUM.x, DRUM.y - 24, '#ffd23f'); sfx('fl_tung'); }
    }
    if (type === 'wall' || type === 'big') st.jolt = Math.max(st.jolt, 1);
    if (type === 'combo') st.cheer = Math.max(st.cheer, 100);
    if (type === 'ko') { st.cheer = 180; st.jolt = 1.4; }
  },
};
