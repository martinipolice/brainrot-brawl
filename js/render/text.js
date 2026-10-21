import { OUT, LW } from '../core/constants.js';
import { ctx } from './canvas.js';
import { pixelize } from './pixel.js';

// ---------- pixel text (Press Start 2P, outlined, cached per string) ----------
const textCache = new Map();
export const FONT = '"Press Start 2P", monospace';
document.fonts && document.fonts.load(`16px ${FONT}`).then(() => textCache.clear(), () => { });
function textImg(s, size, fill, shadow) {
  const key = `${s}|${size}|${fill}|${shadow}`; let c = textCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); let t = c.getContext('2d', { willReadFrequently: true });
  t.font = `${size}px ${FONT}`;
  const d = Math.max(1, size / 8 | 0), pad = 2 * d + 1, w = Math.ceil(t.measureText(s).width);
  c.width = w + pad * 2 + d; c.height = size + pad * 2 + d;
  t = c.getContext('2d', { willReadFrequently: true }); t.font = `${size}px ${FONT}`; t.textBaseline = 'top';
  t.fillStyle = OUT;
  for (let dx = -d; dx <= d; dx += d) for (let dy = -d; dy <= d; dy += d) t.fillText(s, pad + dx, pad + dy);
  t.fillText(s, pad + 2 * d, pad + 2 * d);
  if (shadow) { t.fillStyle = shadow; t.fillText(s, pad + d, pad + d); }
  t.fillStyle = fill; t.fillText(s, pad, pad);
  pixelize(t, 0, 0, c.width, c.height);
  // visible bounds, so text is placed by its ink rather than by the glyph cells (which carry blank space on the right)
  const a = t.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (a[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  Object.assign(c, x1 < 0 ? { vx0: 0, vx1: c.width, vy0: 0, vy1: c.height } : { vx0: x0, vx1: x1 + 1, vy0: y0, vy1: y1 + 1 });
  if (textCache.size > 300) textCache.clear();
  textCache.set(key, c);
  return c;
}
// x/y anchor the visible ink: centre by default, or its left/right edge with align. Returns the visible width.
export function drawText(s, x, y, size, fill, o = {}) {
  const img = textImg(s, size, fill, o.shadow || null), iw = img.vx1 - img.vx0, ih = img.vy1 - img.vy0;
  let sc = o.scale ?? 1;
  if (o.fit) sc = Math.min(sc, (LW - 12) / iw);
  if (o.maxW) sc = Math.min(sc, o.maxW / iw);
  if (sc <= 0) return 0;
  const vw = iw * sc;
  let left = o.align === 'left' ? x : o.align === 'right' ? x - vw : x - vw / 2;
  if (o.clamp) left = Math.max(2, Math.min(LW - 2 - vw, left));
  const top = y - ih * sc / 2;
  ctx.drawImage(img, Math.round(left - img.vx0 * sc), Math.round(top - img.vy0 * sc), Math.round(img.width * sc), Math.round(img.height * sc));
  return vw;
}
// Numbers that change every frame (scores, timer) are drawn one cached glyph at a time, so they never create new images.
// Press Start 2P is monospaced: every glyph advances by exactly the font size. Anchoring matches drawText (visible ink).
export function drawMono(s, x, y, size, fill, o = {}) {
  const sc = o.scale ?? 1, adv = size * sc, pad = 2 * Math.max(1, size / 8 | 0) + 1, imgs = [...s].map(ch => textImg(ch, size, fill, null));
  const ink0 = (imgs[0].vx0 - pad) * sc, vw = (s.length - 1) * adv + (imgs[imgs.length - 1].vx1 - pad) * sc - ink0;
  const left = (o.align === 'left' ? x : o.align === 'right' ? x - vw : x - vw / 2) - ink0, ref = imgs[0];
  const top = y - (ref.vy1 - ref.vy0) * sc / 2 - ref.vy0 * sc;
  imgs.forEach((img, i) => ctx.drawImage(img, Math.round(left + i * adv - pad * sc), Math.round(top), Math.round(img.width * sc), Math.round(img.height * sc)));
  return vw;
}
