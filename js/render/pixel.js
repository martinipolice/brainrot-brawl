// ---------- pixel pass: hard alpha edges + snap every colour to a fixed palette ----------
const PAL = ('1a1024 15101d 111111 222222 2b2b33 2a1f36 231a30 3b2d4f 6b6b72 6b5a7d bba9cc 8f9aa3 ffffff f7efe3 fdfaf5 eef4f8 f3e2c7 ' +
  '6b93b8 7aa7cf 2b6cf0 9fd6ff 8fe8ff 3fb8ff 2d6fa0 1b4a73 5a1028 ff3b5c ff4f7b e8505b e86a5c c2416b 9a2f66 6a1f5a 4b2350 2a1446 ' +
  '8a5a30 5b3a1e b9834d 8f5d31 e0b278 c99556 e6c38c d1aa70 8a5530 44542c 5c6e36 3f7530 4d8b3a ' +
  'ffde3b ffd23f ffe45c fff1b0 ffb13b ff9a3b ff9a5a ff7a3d f77d5e f2a65a f7d27a 9ec7b9 f19bb0 e8c39e f0c27b c98f4f f1c7a5 ff8fc4 ffc2de')
  .split(' ').map(h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4), 16)]);
function nearestSlow(r, gr, b) {
  let best = 1e9, v = 0;
  for (const p of PAL) { const dr = r - p[0], dg = gr - p[1], db = b - p[2], d = 2 * dr * dr + 4 * dg * dg + 3 * db * db; if (d < best) { best = d; v = (p[0] << 16) | (p[1] << 8) | p[2]; } }
  return v;
}
// Palette lookup table built once at load: every colour, bucketed to 5 bits per channel, maps straight to its palette
// colour. Lookups cost one array read and there is no cache to warm up, so the first fight doesn't stutter.
const PAL_LUT = new Int32Array(32768);
for (let r5 = 0; r5 < 32; r5++) for (let g5 = 0; g5 < 32; g5++) for (let b5 = 0; b5 < 32; b5++)
  PAL_LUT[(r5 << 10) | (g5 << 5) | b5] = nearestSlow(r5 * 8 + 4, g5 * 8 + 4, b5 * 8 + 4);
{ // exact palette colours map to themselves; a bucket holding two palette colours falls back to the exact search
  const seen = new Map();
  for (const p of PAL) { const k = ((p[0] >> 3) << 10) | ((p[1] >> 3) << 5) | (p[2] >> 3); PAL_LUT[k] = seen.has(k) ? -1 : (p[0] << 16) | (p[1] << 8) | p[2]; seen.set(k, 1); }
}
const nearest = (r, gr, b) => { const v = PAL_LUT[((r >> 3) << 10) | ((gr >> 3) << 5) | (b >> 3)]; return v >= 0 ? v : nearestSlow(r, gr, b); };
// The same table as whole opaque pixels, so the per-frame pass reads and writes one 32-bit word per pixel. Canvas pixels
// are R, G, B, A bytes, which every current browser (all little-endian) reads as one word with A in the top byte.
// 0 marks a bucket that needs the exact search.
const word = v => (0xff000000 | (v & 255) << 16 | (v & 0xff00) | (v >> 16 & 255)) >>> 0;
const PAL_WORD = Uint32Array.from(PAL_LUT, v => v < 0 ? 0 : word(v));
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function pixelize(c, x, y, w, h, dither = false) {
  if (w <= 0 || h <= 0) return;
  const id = c.getImageData(x, y, w, h), d = id.data;
  if (!dither) { // every frame's sprites: empty pixels (most of each box) are skipped, faint ones dropped, the rest snapped
    const p = new Uint32Array(d.buffer);
    for (let i = 0; i < p.length; i++) {
      const v = p[i];
      if (v === 0) continue;
      if (v >>> 24 < 100) { p[i] = v & 0xffffff; continue; }
      const r = v & 255, gr = v >> 8 & 255, b = v >> 16 & 255;
      p[i] = PAL_WORD[((r >> 3) << 10) | ((gr >> 3) << 5) | (b >> 3)] || word(nearestSlow(r, gr, b));
    }
    c.putImageData(id, x, y);
    return;
  }
  for (let i = 0, n = w * h; i < n; i++) {
    const o = i * 4;
    if (d[o + 3] < 100) { d[o + 3] = 0; continue; }
    const t = (BAYER[((i / w | 0) & 3) * 4 + (i % w & 3)] / 16 - .5) * 30; // dithered backdrops
    const v = nearest(Math.max(0, Math.min(255, d[o] + t | 0)), Math.max(0, Math.min(255, d[o + 1] + t | 0)), Math.max(0, Math.min(255, d[o + 2] + t | 0)));
    d[o] = v >> 16; d[o + 1] = v >> 8 & 255; d[o + 2] = v & 255; d[o + 3] = 255;
  }
  c.putImageData(id, x, y);
}
// Recolour what is already drawn in a box (alpha kept): hit flashes, rage glow, the shadow boss.
export const SHADOW_TINT = 'rgba(40,0,70,.6)';
export function tint(c, color, x, y, w, h) {
  c.globalCompositeOperation = 'source-atop'; c.fillStyle = color; c.fillRect(x, y, w, h); c.globalCompositeOperation = 'source-over';
}
