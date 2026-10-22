import { LW, LH } from '../core/constants.js';

// The game canvas (drawn at 320x180, upscaled with nearest-neighbour by CSS) and an offscreen layer of the same size,
// where sprites are drawn before the pixel pass.
export const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const layCv = document.createElement('canvas'); layCv.width = LW; layCv.height = LH;
export const lay = layCv.getContext('2d', { willReadFrequently: true });
// Height of the fight view: 180, or 240 (4:3) for the taller arena on a phone held upright. Same width and zoom, so the
// fight shows more sky and floor and the pixel art stays crisp. Everything else always draws at 320x180.
export let VH = LH;
export function setView(h) {
  if (h === VH) return;
  VH = h; cv.height = h; layCv.height = h; ctx.imageSmoothingEnabled = false; // resizing resets the context
}
