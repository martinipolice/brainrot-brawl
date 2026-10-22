import { W, H, GROUND, LW } from '../core/constants.js';
import { VH } from '../render/canvas.js';
import { fxFlash } from '../core/settings.js';
import { g, E, L } from '../render/shapes.js';
import { rect } from './draw.js';
import { sfx } from '../audio/sfx.js';

// The Storm: the beach at night in a thunderstorm, where the shadow boss waits. Rain sweeps across, lightning strikes
// every few seconds and on every KO (the flash respects the Shake & flash option), and the sea churns.
export default {
  id: 'storm', name: 'The Storm', boss: true,
  init: () => ({ t: 0, bolt: 0, boltX: 0 }),
  paint() {
    const sky = g.createLinearGradient(0, 0, 0, 340); sky.addColorStop(0, '#15101d'); sky.addColorStop(.6, '#2a1446'); sky.addColorStop(1, '#4b2350');
    g.fillStyle = sky; g.fillRect(0, 0, W, 340);
    g.fillStyle = '#2a1f36'; for (let i = 0; i < 9; i++) E((i * 137) % W, 200 + (i * 41) % 70, 120, 26, '#2a1f36', false); // storm clouds
    g.fillStyle = '#231a30'; g.beginPath(); g.moveTo(0, 340); g.lineTo(0, 250); g.quadraticCurveTo(120, 220, 230, 262); g.quadraticCurveTo(300, 290, 360, 340); g.fill();
    for (let i = 0; i < 9; i++) { const x = 18 + i * 34, h = 26 + (i * 13) % 22, y = 262 - (i < 5 ? i * 4 : (8 - i) * 6); g.fillStyle = '#3b2d4f'; g.fillRect(x, y - h + 30, 28, h); if (i % 3 === 0) { g.fillStyle = '#ffd23f'; g.fillRect(x + 6, y - h + 37, 6, 6); } }
    const sea = g.createLinearGradient(0, 340, 0, 405); sea.addColorStop(0, '#1b4a73'); sea.addColorStop(1, '#15101d'); g.fillStyle = sea; g.fillRect(0, 336, W, 70);
    g.fillStyle = '#2d6fa0'; for (let i = 0; i < 18; i++) g.fillRect((i * 151) % W, 344 + (i * 23) % 56, 30, 3);
    const sand = g.createLinearGradient(0, 400, 0, H); sand.addColorStop(0, '#8a5530'); sand.addColorStop(1, '#5b3a1e'); g.fillStyle = sand; g.fillRect(0, 402, W, H - 402);
    for (const x of [110, 860]) { L(x, 412, x + 6, 482, 3, '#bba9cc'); L(x - 4, 420, x + 2, 470, 8, '#5a1028'); } // umbrellas, closed for the storm
    g.fillStyle = '#5b3a1e'; g.fillRect(0, GROUND, W, 3);
  },
  ambient(c, cam, st, tick) {
    const r = (x, y, w, h, col) => rect(c, cam, x, y, w, h, col);
    for (let i = 0; i < 70; i++) { // rain, slanting in the wind
      const x = ((i * 97 + tick * 9) % (W + 200)) - 100, y = ((i * 61 + tick * 22) % 420) + 140;
      r(x, y, 2, 14, i % 4 ? '#7aa7cf' : '#bba9cc');
    }
    if (st.bolt > 0) {
      let x = st.boltX; // a jagged bolt from the clouds to the sea
      for (let y = 190, k = 0; y < 340; y += 22, k++) { const nx = x + ((k * 37 + st.boltX) % 5 - 2) * 9; r(Math.min(x, nx) - 2, y, Math.abs(nx - x) + 5, 24, '#fff1b0'); x = nx; }
      if (st.bolt > 6 && fxFlash()) { c.save(); c.globalAlpha = .35; c.fillStyle = '#eef4f8'; c.fillRect(0, 0, LW, VH); c.restore(); }
    }
  },
  tick(st) {
    st.t++; if (st.bolt > 0) st.bolt--;
    if (st.t % 330 === 150) strike(st);
  },
  on(type, d, st) { if (type === 'ko') strike(st); },
};
function strike(st) { st.bolt = 12; st.boltX = 260 + (st.t * 173) % 440; sfx('wall'); } // strikes stay over the middle of the stage, where the camera is
