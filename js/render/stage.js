import { W, H } from '../core/constants.js';
import { BGS } from './camera.js';
import { pixelize } from './pixel.js';
import { withTarget } from './shapes.js';

// Each stage's backdrop is painted once, on first use, into its own canvas and pixelized with dithering.
const painted = new Map();
export function stageCanvas(def) {
  let c = painted.get(def.id);
  if (!c) {
    c = document.createElement('canvas'); c.width = W * BGS; c.height = H * BGS;
    const b = c.getContext('2d', { willReadFrequently: true });
    b.ol = 1.1 / BGS; b.setTransform(BGS, 0, 0, BGS, 0, 0);
    withTarget(b, () => def.paint());
    b.setTransform(1, 0, 0, 1, 0, 0);
    pixelize(b, 0, 0, c.width, c.height, true);
    painted.set(def.id, c);
  }
  return c;
}
