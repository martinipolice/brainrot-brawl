import { game, ui, paused, tick } from '../core/state.js';
import { audio } from '../audio/mixer.js';
import { held, pressed } from './keyboard.js';
import { $ } from '../ui/dom.js';
import { inOverlay, togglePause, startMatch } from '../ui/flow.js';
import { endEnding } from '../ui/ending.js';
import { vsFrames } from '../ui/vs.js';

// On-screen pad for Player 1 on touch screens. Like the keyboard, a tap while the pause or result menu is up never
// reaches the fight. On the VS and ending screens any button moves on, as any key does.
const down = c => {
  if (ui === 'vs') { if (vsFrames() > 30) startMatch(); return; }
  if (ui === 'ending') { endEnding(); return; }
  held.add(c); if (!inOverlay()) pressed.add(c);
};

// The d-pad is one touch area: the direction is the angle from its centre, in eight 45° slices, so a thumb slides
// between directions (and diagonals, like up-forward to jump in) without lifting.
const SLICES = [['KeyD'], ['KeyD', 'KeyS'], ['KeyS'], ['KeyA', 'KeyS'], ['KeyA'], ['KeyA', 'KeyW'], ['KeyW'], ['KeyD', 'KeyW']];
const ARM = { KeyW: 'u', KeyS: 'd', KeyA: 'l', KeyD: 'r' };
function bindDpad(pad) {
  let id = null, on = [];
  const set = keys => {
    for (const c of on) if (!keys.includes(c)) held.delete(c);
    for (const c of keys) if (!on.includes(c)) down(c);
    on = keys;
    pad.dataset.dir = keys.map(c => ARM[c]).join(''); // lights up the pressed arms
  };
  const aim = e => {
    const r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * .14) return set([]); // a small dead zone in the middle
    set(SLICES[Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) & 7]);
  };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); audio(); if (id !== null) return; id = e.pointerId; try { pad.setPointerCapture(id); } catch (err) { } pad.classList.add('on'); aim(e); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === id) aim(e); });
  const end = e => { if (e.pointerId === id) { id = null; pad.classList.remove('on'); set([]); } };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => pad.addEventListener(t, end));
}

// Attack buttons let go of the touch, so a thumb can roll from one button onto the next (L into H, or H onto S).
function bindButton(b) {
  const c = b.dataset.code;
  const press = () => { if (!b.classList.contains('down')) { b.classList.add('down'); down(c); } };
  const release = () => { b.classList.remove('down'); held.delete(c); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); audio(); if (b.hasPointerCapture(e.pointerId)) b.releasePointerCapture(e.pointerId); press(); });
  b.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse' || e.buttons) press(); });
  ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => b.addEventListener(t, release));
}

const canPause = () => ui === 'fight' && game && game.phase !== 'matchEnd' && !inOverlay();
export function bindTouchPad() {
  bindDpad($('dpad'));
  $('pad').querySelectorAll('.atk button').forEach(bindButton);
  $('bPause').addEventListener('click', () => { if (canPause()) togglePause(); });
  $('bPause2').addEventListener('click', () => { if (canPause()) togglePause(); });
  $('bMoves2').addEventListener('click', () => { if (canPause()) { togglePause(); $('pmlist').hidden = false; } }); // pause with the move list open
  $('pad').addEventListener('contextmenu', e => e.preventDefault()); // no long-press menu
}

// The strip under the portrait screen: what Player 1 can do right now (ultimate or special ready, rage), otherwise a tip
// that changes every few seconds. The ULT button glows while SUPER is full, in either orientation.
const TIPS = ['L, L, H chains a combo', 'Hold ◀ or ▼ to guard', 'Double-tap ▶ to dash in', '◀ + H launches them up', '▶ + H is a lunging rush', 'Land hits to charge your special'];
export function updateTip() {
  const f = game && game.p[0];
  if (!f) return;
  $('pad').querySelector('[data-code=TouchUlt]').classList.toggle('ready', f.meter >= 100);
  const t = f.meter >= 100 ? '★ SUPER full: tap ULT' : f.sp >= 100 ? 'Special ready: tap S' : f.rage ? 'Rage: you hit 10% harder' : 'Tip: ' + TIPS[(tick / 360 | 0) % TIPS.length];
  if (t !== $('tip').textContent && !paused) { $('tip').textContent = t; $('tip').classList.toggle('hot', !t.startsWith('Tip')); }
}
