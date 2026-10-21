import { PX, LW, LH } from '../core/constants.js';
import { ctx, layCv, lay } from './canvas.js';
import { pixelize } from './pixel.js';
import { g, setG } from './shapes.js';

// ---------- title, select and VS previews (same pixel pass) ----------
export function miniFrame(c, draw) {
  const t = c.getContext('2d', { willReadFrequently: true });
  t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, c.width, c.height);
  t.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0); setG(t); draw(); setG(ctx);
  t.setTransform(1, 0, 0, 1, 0, 0); pixelize(t, 0, 0, c.width, c.height);
}
export function stand(ch, x, y, scale, face, p) { const ol = g.ol; g.ol = 1.1 * PX / scale; g.save(); g.translate(x, y); g.scale(scale * face, scale); ch.draw(p); g.restore(); g.ol = ol; }
export function demoPose(mv, u, T) { return u < 40 ? { s: mv, ph: u < 10 ? 0 : u < 24 ? 1 : 2, T } : { s: 'idle', ph: 0, T }; }
export function drawFigure(ch, x, y, scale, face, p, shadow) { // one fighter through the pixel pass, optionally shadow-tinted
  lay.setTransform(1, 0, 0, 1, 0, 0); lay.clearRect(0, 0, LW, LH); lay.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0); setG(lay);
  stand(ch, x * PX, y * PX, scale, face, p);
  setG(ctx); lay.setTransform(1, 0, 0, 1, 0, 0); pixelize(lay, 0, 0, LW, LH);
  if (shadow) { lay.globalCompositeOperation = 'source-atop'; lay.fillStyle = 'rgba(40,0,70,.6)'; lay.fillRect(0, 0, LW, LH); lay.globalCompositeOperation = 'source-over'; }
  ctx.drawImage(layCv, 0, 0);
}
