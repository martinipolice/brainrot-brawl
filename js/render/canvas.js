import { LW, LH } from '../core/constants.js';

// The game canvas (drawn at 320x180, upscaled with nearest-neighbour by CSS) and an offscreen layer of the same size,
// where sprites are drawn before the pixel pass.
export const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const layCv = document.createElement('canvas'); layCv.width = LW; layCv.height = LH;
export const lay = layCv.getContext('2d', { willReadFrequently: true });
