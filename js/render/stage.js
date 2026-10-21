import { W, H, GROUND, OUT } from '../core/constants.js';
import { BGS } from './camera.js';
import { ctx } from './canvas.js';
import { pixelize } from './pixel.js';
import { g, setG, E, L } from './shapes.js';

// The beach stage, painted once into its own canvas and pixelized with dithering.
export const bgc = document.createElement('canvas'); bgc.width = W * BGS; bgc.height = H * BGS;
export function paintStage() {
  const b = bgc.getContext('2d', { willReadFrequently: true });
  setG(b); b.ol = 1.1 / BGS; g.setTransform(BGS, 0, 0, BGS, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, 340); sky.addColorStop(0, '#2a1446'); sky.addColorStop(.6, '#c2416b'); sky.addColorStop(1, '#ff9a5a');
  g.fillStyle = sky; g.fillRect(0, 0, W, 340);
  E(690, 318, 96, 96, 'rgba(255,210,63,.3)', false); E(690, 318, 78, 78, '#ffd23f', false);
  g.fillStyle = '#4b2350'; g.beginPath(); g.moveTo(0, 340); g.lineTo(0, 250); g.quadraticCurveTo(120, 220, 230, 262); g.quadraticCurveTo(300, 290, 360, 340); g.fill();
  const houses = ['#f2a65a', '#e86a5c', '#f7d27a', '#9ec7b9', '#f19bb0', '#e8c39e'];
  for (let i = 0; i < 9; i++) { const x = 18 + i * 34, h = 26 + (i * 13) % 22, y = 262 - (i < 5 ? i * 4 : (8 - i) * 6); g.fillStyle = houses[i % 6]; g.fillRect(x, y - h + 30, 28, h); g.fillStyle = '#4b2350'; g.fillRect(x + 6, y - h + 37, 6, 6); g.fillRect(x + 16, y - h + 37, 6, 6); }
  const sea = g.createLinearGradient(0, 340, 0, 405); sea.addColorStop(0, '#2d6fa0'); sea.addColorStop(1, '#1b4a73'); g.fillStyle = sea; g.fillRect(0, 336, W, 70);
  g.fillStyle = '#ffd23f'; for (let i = 0; i < 6; i++) g.fillRect(640 + (i % 3) * 24 - i * 6, 346 + i * 9, 80 - i * 10, 3);
  const sand = g.createLinearGradient(0, 400, 0, H); sand.addColorStop(0, '#f0c27b'); sand.addColorStop(1, '#c98f4f'); g.fillStyle = sand; g.fillRect(0, 402, W, H - 402);
  [[110, 412, '#e8505b'], [860, 420, '#3fb8ff']].forEach(([x, y, c]) => {
    L(x, y, x + 6, y + 70, 3, '#f7efe3');
    g.beginPath(); g.moveTo(x - 62, y + 8); g.quadraticCurveTo(x, y - 40, x + 62, y + 8); g.closePath(); g.fillStyle = c; g.fill(); g.lineWidth = 3; g.strokeStyle = OUT; g.stroke();
    g.beginPath(); g.moveTo(x - 20, y + 4); g.quadraticCurveTo(x, y - 34, x + 20, y + 4); g.closePath(); g.fillStyle = '#f7efe3'; g.fill();
  });
  g.fillStyle = '#c98f4f'; g.fillRect(0, GROUND, W, 3);
  g.setTransform(1, 0, 0, 1, 0, 0);
  pixelize(b, 0, 0, bgc.width, bgc.height, true);
  setG(ctx);
}
