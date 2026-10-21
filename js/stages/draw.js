import { toLo } from '../render/camera.js';

// A rectangle in world units, drawn straight onto the 320x180 canvas: for a stage's cheap per-frame details.
export function rect(c, cam, x, y, w, h, col) {
  const [X, Y] = toLo(cam, x, y);
  c.fillStyle = col; c.fillRect(X, Y, Math.max(1, Math.round(w * cam.s)), Math.max(1, Math.round(h * cam.s)));
}
// A small person seen from the waist up (crowds in windows and theatre boxes); arms up and bobbing while cheering.
export function fan(c, cam, x, y, shirt, skin, cheer, tick, i) {
  const up = cheer ? Math.round(Math.abs(Math.sin(tick * .25 + i)) * 3) : 0, wave = Math.sin(tick * .5 + i) > 0 ? 0 : 3;
  rect(c, cam, x - 6, y + 10 - up, 12, 8 + up, shirt);
  rect(c, cam, x - 4, y + 1 - up, 8, 9, skin); rect(c, cam, x - 4, y - 1 - up, 8, 3, '#1a1024');
  rect(c, cam, x - 3, y + 4 - up, 2, 2, '#1a1024'); rect(c, cam, x + 1, y + 4 - up, 2, 2, '#1a1024');
  if (cheer) { rect(c, cam, x - 9, y - 3 + wave - up, 3, 10, skin); rect(c, cam, x + 6, y - wave - up, 3, 10, skin); }
}
