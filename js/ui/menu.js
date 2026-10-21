import { sfx } from '../audio/sfx.js';
import { CONFIRM } from '../input/keyboard.js';
import { cycleOpt } from './title.js';

// Arrow keys or WASD move through whichever retro menu is on screen; F, comma or Numpad 1 picks (Enter and Space work natively).
export function menuNav(e) {
  const menus = [...document.querySelectorAll('.menu')].filter(m => m.offsetParent !== null), m = menus[menus.length - 1];
  if (!m) return;
  const items = [...m.querySelectorAll('button')], i = items.indexOf(document.activeElement), c = e.code;
  const opt = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.opt;
  if (opt && ['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(c)) { e.preventDefault(); cycleOpt(opt, c === 'ArrowLeft' || c === 'KeyA' ? -1 : 1); return; }
  const d = ['ArrowUp', 'KeyW', 'ArrowLeft', 'KeyA'].includes(c) ? -1 : ['ArrowDown', 'KeyS', 'ArrowRight', 'KeyD'].includes(c) ? 1 : 0;
  if (d) { e.preventDefault(); items[i < 0 ? 0 : (i + d + items.length) % items.length].focus(); sfx('hover'); }
  else if (CONFIRM.includes(c)) { e.preventDefault(); (items[i] || items[0]).click(); }
}

export function bindMenus() {
  document.querySelectorAll('.mi').forEach(b => {
    b.addEventListener('pointerenter', () => { if (document.activeElement !== b) { b.focus({ preventScroll: true }); sfx('hover'); } });
    // the cursor follows the last focused item in each menu, so it stays put even when the window loses focus
    b.addEventListener('focus', () => { b.parentElement.querySelectorAll('.mi').forEach(x => x.classList.toggle('cur', x === b)); });
  });
}
