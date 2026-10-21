import { OUT } from '../core/constants.js';
import { ctx } from './canvas.js';

export let g = ctx; // drawing target for the shape helpers below
// draw() runs with the shape helpers pointed at canvas context c; the previous target comes back even if draw() throws
export function withTarget(c, draw) { const prev = g; g = c; try { draw(); } finally { g = prev; } }

// ---------- shape helpers (cartoon fill + dark outline) ----------
export const ow = () => g.ol || 3;
export function E(x, y, rx, ry, fill, stroke = true) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = ow(); g.strokeStyle = OUT; g.stroke(); } }
export function R(x, y, w, h, r, fill, stroke = true) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = ow(); g.strokeStyle = OUT; g.stroke(); } }
export function P(pts, fill, stroke = true) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = ow(); g.strokeStyle = OUT; g.stroke(); } }
export function L(x1, y1, x2, y2, w, color) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineCap = 'round'; g.lineWidth = w + ow() * 1.7; g.strokeStyle = OUT; g.stroke(); g.lineWidth = w; g.strokeStyle = color; g.stroke(); }
export function S(w, color) { g.lineWidth = w; g.strokeStyle = color; g.lineCap = 'round'; g.stroke(); }
