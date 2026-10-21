// ---------- input ----------
export const held = new Set(), pressed = new Set();
export const MAPS = [
  // P1: WASD to move, J K L to attack (both hands); F G H kept as an alternative. TouchUlt is the on-screen ULT button.
  { left: 'KeyA', right: 'KeyD', up: 'KeyW', block: 'KeyS', light: ['KeyJ', 'KeyF'], heavy: ['KeyK', 'KeyG'], special: ['KeyL', 'KeyH'], ult: ['TouchUlt'] },
  { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', block: 'ArrowDown', light: ['Comma', 'Numpad1'], heavy: ['Period', 'Numpad2'], special: ['Slash', 'Numpad3'], ult: [] },
];
const has = (set, c) => Array.isArray(c) ? c.some(k => set.has(k)) : set.has(c);
export const keyCtrl = m => () => ({ left: has(held, m.left), right: has(held, m.right), block: has(held, m.block),
  up: has(pressed, m.up), light: has(pressed, m.light), heavy: has(pressed, m.heavy), special: has(pressed, m.special), ult: has(pressed, m.ult) });
export const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Slash', 'Comma', 'Period']);
export const CONFIRM = ['KeyJ', 'KeyF', 'Comma', 'Numpad1'];
