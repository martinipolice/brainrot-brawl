import { audio } from '../audio/mixer.js';
import { held, pressed } from './keyboard.js';
import { $ } from '../ui/dom.js';

// On-screen pad for Player 1 on touch screens: each button holds and presses the key it stands for.
export function bindTouchPad() {
  $('pad').querySelectorAll('button').forEach(b => {
    const c = b.dataset.code;
    b.addEventListener('pointerdown', e => { e.preventDefault(); audio(); held.add(c); pressed.add(c); b.classList.add('down'); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => { held.delete(c); b.classList.remove('down'); }));
  });
}
