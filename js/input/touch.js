import { audio } from '../audio/mixer.js';
import { held, pressed } from './keyboard.js';
import { $ } from '../ui/dom.js';
import { inOverlay } from '../ui/flow.js';

// On-screen pad for Player 1 on touch screens: each button holds and presses the key it stands for. Like the keyboard,
// a tap while the pause or result menu is up never reaches the fight.
export function bindTouchPad() {
  $('pad').querySelectorAll('button').forEach(b => {
    const c = b.dataset.code;
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); audio(); held.add(c); b.classList.add('down');
      if (!inOverlay()) pressed.add(c);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => { held.delete(c); b.classList.remove('down'); }));
  });
}
