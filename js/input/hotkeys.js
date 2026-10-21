import { opts, saveOpts } from '../core/settings.js';
import { game, ui } from '../core/state.js';
import { muted, setMuted, audio, applyVolumes } from '../audio/mixer.js';
import { sfx } from '../audio/sfx.js';
import { held, pressed, GAME_KEYS, CONFIRM } from './keyboard.js';
import { endEnding } from '../ui/ending.js';
import { startMatch, togglePause, inOverlay } from '../ui/flow.js';
import { menuNav } from '../ui/menu.js';
import { selectKey } from '../ui/select.js';
import { started, titleView, crtOn, setCRT, setTitleView, pressStart } from '../ui/title.js';
import { vsFrames } from '../ui/vs.js';

// Global keys (mute, CRT filter, pause) and routing each key press to whichever screen is showing.
export function bindKeys() {
  addEventListener('keydown', e => {
    audio();
    const u = ui, overlay = inOverlay();
    if (e.code === 'KeyM' && !e.repeat) { setMuted(!muted); opts.muted = muted; saveOpts(); applyVolumes(); if (muted && 'speechSynthesis' in window) speechSynthesis.cancel(); }
    if (e.code === 'KeyC' && !e.repeat) setCRT(!crtOn);
    if (u === 'fight' && GAME_KEYS.has(e.code) && !(e.target instanceof HTMLButtonElement && (e.code === 'Space'))) e.preventDefault();
    if (u === 'fight' && e.code === 'Escape' && game && game.phase !== 'matchEnd') togglePause();
    else if (!e.repeat) {
      if (u === 'title') {
        if (!started) { if (CONFIRM.includes(e.code)) { e.preventDefault(); pressStart(); } }
        else if (e.code === 'Escape' && titleView !== 'main') { sfx('ui'); setTitleView('main'); }
        else menuNav(e);
      }
      else if (u === 'select') selectKey(e);
      else if (u === 'vs') { if (vsFrames() > 30) startMatch(); }
      else if (u === 'ending') { if (!['KeyM', 'KeyC', 'Tab', 'ShiftLeft', 'ShiftRight'].includes(e.code)) endEnding(); }
      else if (overlay) menuNav(e);
    }
    if (!e.repeat && !overlay) pressed.add(e.code); // keys used in the pause or result menu never reach the fight
    held.add(e.code);
  });
  addEventListener('keyup', e => held.delete(e.code));
  addEventListener('blur', () => held.clear());
}
