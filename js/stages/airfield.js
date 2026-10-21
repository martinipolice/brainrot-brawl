import { W, H, GROUND } from '../core/constants.js';
import { g, E, R, L, S } from '../render/shapes.js';
import { rect } from './draw.js';
import { sfx } from '../audio/sfx.js';

// Bombardiro's Airfield: a runway on a clear afternoon. Clouds drift, the windsock flaps (wildly after big hits), a
// bomber crosses the sky every ten seconds and drops a bomb far out on the field, the control tower's beacon flashes
// after a KO, and two mechanics by the hangar jump and cheer for combos and KOs. All of it stays in the background.
const SOCK = { x: 930, y: 296 };
const TOWER = 470;

export default {
  id: 'airfield', name: 'Bombardiro Airfield', home: 'bombardiro',
  init: () => ({ t: 0, plane: null, bomb: null, puff: 0, puffX: 0, flap: 0, beacon: 0, cheer: 0 }),
  paint() {
    const sky = g.createLinearGradient(0, 0, 0, 390); sky.addColorStop(0, '#3fb8ff'); sky.addColorStop(1, '#9fd6ff');
    g.fillStyle = sky; g.fillRect(0, 0, W, 390);
    // far hills
    g.fillStyle = '#5c6e36'; g.beginPath(); g.moveTo(0, 400); g.lineTo(0, 330); g.quadraticCurveTo(160, 300, 330, 336); g.quadraticCurveTo(520, 370, 700, 318); g.quadraticCurveTo(840, 290, W, 326); g.lineTo(W, 400); g.fill();
    g.fillStyle = '#44542c'; g.beginPath(); g.moveTo(0, 400); g.lineTo(0, 360); g.quadraticCurveTo(240, 340, 480, 366); g.quadraticCurveTo(720, 390, W, 352); g.lineTo(W, 400); g.fill();
    // two arched hangars with dark open doors
    for (const x of [40, 640]) {
      E(x + 125, 404, 125, 112, '#8f9aa3');
      for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(x + 125, 404, 125 * k / 6, 112, 0, Math.PI, 0); S(2, '#6b6b72'); }
      R(x + 65, 330, 120, 74, 4, '#2b2b33'); g.fillStyle = '#ffd23f'; for (let i = 0; i < 6; i++) g.fillRect(x + 65 + i * 20, 322, 10, 6); // hazard stripe
    }
    // control tower
    R(TOWER - 18, 222, 36, 182, 2, '#f7efe3'); g.fillStyle = '#bba9cc'; g.fillRect(TOWER - 16, 260, 32, 4); g.fillRect(TOWER - 16, 320, 32, 4);
    R(TOWER - 34, 190, 68, 36, 4, '#bba9cc'); R(TOWER - 30, 196, 60, 16, 2, '#2d6fa0'); R(TOWER - 26, 182, 52, 10, 2, '#6b6b72');
    L(TOWER, 182, TOWER, 162, 2, '#2b2b33');
    // perimeter fence, grass verge, then the tarmac with its edge line and centre dashes
    g.fillStyle = '#6b6b72'; for (let x = 10; x < W; x += 48) g.fillRect(x, 372, 3, 32); g.fillRect(0, 374, W, 2); g.fillRect(0, 386, W, 1);
    g.fillStyle = '#4d8b3a'; g.fillRect(0, 398, W, 12);
    const tar = g.createLinearGradient(0, 410, 0, H); tar.addColorStop(0, '#2b2b33'); tar.addColorStop(1, '#222222'); g.fillStyle = tar; g.fillRect(0, 410, W, H - 410);
    g.fillStyle = '#ffd23f'; g.fillRect(0, 412, W, 3);
    g.fillStyle = '#f7efe3'; for (let x = 20; x < W; x += 90) g.fillRect(x, 500, 50, 5);
    L(SOCK.x, SOCK.y, SOCK.x, 404, 3, '#bba9cc'); // windsock pole (the sock flaps, see ambient)
    g.fillStyle = '#1a1024'; g.fillRect(0, GROUND, W, 3);
  },
  ambient(c, cam, st, tick) {
    const r = (x, y, w, h, col) => rect(c, cam, x, y, w, h, col);
    for (let i = 0; i < 4; i++) { // drifting clouds
      const x = ((tick * .1 + i * 290) % (W + 300)) - 150, y = 246 + (i * 37) % 50;
      r(x, y, 70, 14, '#eef4f8'); r(x + 14, y - 10, 36, 12, '#eef4f8'); r(x + 4, y + 12, 62, 4, '#bba9cc');
    }
    if (st.plane !== null) { // the bomber: a dark silhouette high up
      const x = st.plane, y = 262, prop = tick % 4 < 2;
      r(x - 44, y, 88, 10, '#2b2b33'); r(x - 12, y - 8, 22, 26, '#2b2b33'); r(x - 44, y - 10, 10, 12, '#2b2b33'); r(x + 44, y + 2, 4, prop ? 10 : 4, '#6b6b72');
    }
    if (st.bomb) r(st.bomb.x - 3, st.bomb.y, 6, 10, '#2b2b33');
    if (st.puff > 0) { // far-off blast and dust where the bomb landed
      const k = 1 - st.puff / 46, rad = 12 + 40 * k, x = st.puffX, rise = k * 16, col = k < .25 ? '#ffb13b' : k < .6 ? '#e6c38c' : '#bba9cc';
      r(x - rad, 396 - rad * .35, rad * 2, rad * .35, col); // a billowing cloud: wide at the ground, rounder as it climbs
      r(x - rad * .7, 396 - rad * .7 - rise * .5, rad * 1.4, rad * .4, col);
      r(x - rad * .4, 396 - rad * .95 - rise, rad * .8, rad * .3, k < .6 ? '#bba9cc' : '#8f9aa3');
      if (k < .25) r(x - rad * .35, 396 - rad * .3, rad * .7, rad * .25, '#fff1b0');
    }
    // windsock: five striped segments, drooping and swinging with the wind, flapping hard after big hits
    const swing = Math.sin(tick * .07) * .25 + st.flap * Math.sin(tick * .6) * .6;
    for (let k = 0; k < 5; k++) {
      const a = Math.PI + .15 + swing * (k + 1) / 5;
      r(SOCK.x + Math.cos(a) * 12 * k - 6, SOCK.y + 2 + Math.sin(a) * 12 * k + k * 2, 12, 10 - k, k % 2 ? '#f7efe3' : '#ff7a3d');
    }
    r(TOWER - 4, 156, 8, 6, st.beacon > 0 && tick % 12 < 6 ? '#ff3b5c' : '#5a1028'); // tower beacon
    for (const m of [0, 1]) { // mechanics in orange overalls by the left hangar
      const x = 140 + m * 70, j = st.cheer > 0 ? Math.abs(Math.sin(tick * .3 + m * 2)) * 10 : 0, y = 372 - j;
      r(x - 6, y, 12, 20, '#ff9a3b'); r(x - 5, y - 10, 10, 10, '#e0b278'); r(x - 5, y - 13, 10, 4, '#2b6cf0');
      if (st.cheer > 0) { r(x - 10, y - 14, 3, 12, '#e0b278'); r(x + 7, y - 14, 3, 12, '#e0b278'); } else { r(x - 9, y + 2, 3, 12, '#e0b278'); r(x + 6, y + 2, 3, 12, '#e0b278'); }
      r(x - 5, y + 20, 4, 6, '#2b2b33'); r(x + 1, y + 20, 4, 6, '#2b2b33');
    }
  },
  tick(st) {
    st.t++; st.flap *= .97; if (st.beacon > 0) st.beacon--; if (st.cheer > 0) st.cheer--; if (st.puff > 0) st.puff--;
    if (st.plane === null && st.t % 600 === 240) { st.plane = -100; st.dropped = false; } // a flyover every ten seconds
    if (st.plane !== null) {
      st.plane += 2.4;
      if (!st.dropped && st.plane > 300 + (st.t % 1200 < 600 ? 0 : 220)) { st.bomb = { x: st.plane, y: 272, vy: 0 }; st.dropped = true; }
      if (st.plane > W + 120) st.plane = null;
    }
    if (st.bomb) { st.bomb.vy += .2; st.bomb.y += st.bomb.vy; st.bomb.x += 1.2; if (st.bomb.y >= 388) { st.puff = 46; st.puffX = st.bomb.x; st.bomb = null; sfx('land'); } }
  },
  on(type, d, st) {
    if (type === 'big' || type === 'wall') st.flap = Math.max(st.flap, 1);
    if (type === 'combo') st.cheer = Math.max(st.cheer, 100);
    if (type === 'ko') { st.cheer = 180; st.beacon = 180; st.flap = 1.4; }
  },
};
