import { game, ui, paused, tick, setTick } from './core/state.js';
import { renderFight } from './render/fight.js';
import { paintStage } from './render/stage.js';
import { updateFx } from './game/effects.js';
import { step } from './game/match.js';
import { music } from './audio/music.js';
import { bindKeys } from './input/hotkeys.js';
import { bindTouchPad } from './input/touch.js';
import { $ } from './ui/dom.js';
import { ending, renderEnding } from './ui/ending.js';
import { cont, show, updateContinue, bindFight } from './ui/flow.js';
import { bindMenus } from './ui/menu.js';
import { sel, buildRoster, renderSelect, bindSelect } from './ui/select.js';
import { crtOn, setCRT, initTitle, renderLogo, bindTitle } from './ui/title.js';
import { vs, renderVS } from './ui/vs.js';
import { selfTest } from './tests/selftest.js';

// Entry point: paint the stage, fill in and wire up the page, then run the game loop from the title screen.
paintStage();
initTitle();
buildRoster();
bindKeys();
bindMenus();
bindTitle();
bindSelect();
bindFight();
bindTouchPad();
setCRT(crtOn);

// ---------- main loop (fixed 60 Hz simulation) ----------
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now; setTick(tick + 1);
  music();
  if (ui === 'fight' && game) {
    while (acc >= 1000 / 60) { if (!paused) { step(); updateFx(); } acc -= 1000 / 60; }
    renderFight();
    if (cont && !$('pResult').hidden) updateContinue(now);
  } else {
    acc = 0;
    if (ui === 'vs' && vs) renderVS();
    else if (ui === 'ending' && ending) renderEnding();
    else if (ui === 'title') {
      renderLogo(now);
    } else if (ui === 'select' && sel) renderSelect(now);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.selfTest = selfTest; // modules keep their names private, so expose the self-check to the console
if (location.hash === '#selftest') selfTest();
show('title');
