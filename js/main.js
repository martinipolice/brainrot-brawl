import { STEP, TOUCH } from './core/constants.js';
import { game, ui, paused, tick, setTick } from './core/state.js';
import { renderFight } from './render/fight.js';
import { stageCanvas } from './render/stage.js';
import { updateFx } from './game/effects.js';
import { step } from './game/match.js';
import { music } from './audio/music.js';
import { bindKeys } from './input/hotkeys.js';
import { bindTouchPad, updateTip } from './input/touch.js';
import { $ } from './ui/dom.js';
import { ending, renderEnding } from './ui/ending.js';
import { cont, show, updateContinue, bindFight } from './ui/flow.js';
import { bindMenus } from './ui/menu.js';
import { sel, buildRoster, renderSelect, bindSelect } from './ui/select.js';
import { crtOn, setCRT, initTitle, renderLogo, bindTitle } from './ui/title.js';
import { vs, renderVS } from './ui/vs.js';
import { STAGES } from './stages/index.js';
import { selfTest } from './tests/selftest.js';

// Entry point: fill in and wire up the page, then run the game loop from the title screen.
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
  acc += Math.min(100, now - last); last = now;
  // tick counts 60 Hz steps of real time, not screen refreshes, so everything runs at the same speed on a 60, 120 or
  // 144 Hz screen. A refresh that starts no new step would draw the same picture again, so it draws nothing.
  const ticks = Math.floor(acc / STEP); acc -= ticks * STEP;
  music();
  if (ui === 'fight' && game && cont && !$('pResult').hidden) updateContinue(now);
  if (!ticks) { requestAnimationFrame(frame); return; }
  setTick(tick + ticks);
  if (ui === 'fight' && game) {
    if (!paused) for (let i = 0; i < ticks; i++) { step(); updateFx(); }
    renderFight();
    if (TOUCH) updateTip();
  }
  else if (ui === 'vs' && vs) renderVS();
  else if (ui === 'ending' && ending) renderEnding();
  else if (ui === 'title') renderLogo(now);
  else if (ui === 'select' && sel) renderSelect(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.selfTest = selfTest; // modules keep their names private, so expose the self-check to the console
if (location.hash === '#selftest') selfTest();
show('title');
setTimeout(() => STAGES.forEach(stageCanvas), 400); // paint every stage while the title screen is up, so no fight starts with a hitch
