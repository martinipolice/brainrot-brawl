import { OUT, RM, STEP } from '../core/constants.js';
import { VERSION, CRTKEY, load, save, CPU_LEVELS, opts, saveOpts } from '../core/settings.js';
import { tick } from '../core/state.js';
import { easeOutBack } from '../core/util.js';
import { pixelize } from '../render/pixel.js';
import { FONT } from '../render/text.js';
import { CHARS, firstName } from '../game/roster.js';
import { announce } from '../audio/announcer.js';
import { audio, applyVolumes } from '../audio/mixer.js';
import { sfx } from '../audio/sfx.js';
import { $ } from './dom.js';
import { show } from './flow.js';
import { openSelect } from './select.js';

// Title screen: PRESS START, the main menu, options, the move list and the animated logo.
const logoCv = $('logo');
export let started = false, titleView = 'press', crtOn = load(CRTKEY) !== '0';
let logoT0 = 0, logoImg = null;
export const setLogoT0 = v => { logoT0 = v; };
export function setCRT(on) { crtOn = on; $('crt').classList.toggle('off', !on); save(CRTKEY, on ? '1' : '0'); syncOpts(); }
export function setTitleView(v) {
  titleView = v;
  $('bStart').hidden = v !== 'press'; $('mainMenu').hidden = v !== 'main'; $('optMenu').hidden = v !== 'options';
  $('movesView').hidden = v !== 'moves'; $('exitView').hidden = v !== 'exit';
  document.querySelector('.trow').classList.toggle('wide', v === 'moves'); // the move list gets the full width
  const first = { press: $('bStart'), main: $('bArcade'), options: $('optMenu').querySelector('.mi'), moves: $('movesView').querySelector('.mi'), exit: $('exitView').querySelector('.mi') }[v];
  first.focus({ preventScroll: true });
}
export function pressStart() { if (started) return; audio(); started = true; sfx('start'); show('title'); }

// options: CPU level for Versus CPU, sound, music, CRT filter (all remembered in this browser)
function syncOpts() {
  const vol = v => `<span class="vol" aria-label="${v} of 10">${Array.from({ length: 10 }, (_, k) => `<i class="${k < v ? 'on' : ''}"></i>`).join('')}</span>`;
  const val = { cpu: opts.cpu, sfx: vol(opts.sfxVol), music: vol(opts.musicVol), announcer: opts.announcer, crt: crtOn ? 'ON' : 'OFF', fx: opts.fx };
  document.querySelectorAll('[data-opt]').forEach(b => b.querySelector('.val').innerHTML = val[b.dataset.opt]);
}
// left/right step a setting (volumes stop at 0 and 10); clicking cycles it, wrapping around
export function cycleOpt(name, dir, wrap = false) {
  if (name === 'cpu') { const k = Object.keys(CPU_LEVELS); opts.cpu = k[(k.indexOf(opts.cpu) + dir + k.length) % k.length]; }
  if (name === 'sfx' || name === 'music') {
    const k = name === 'sfx' ? 'sfxVol' : 'musicVol';
    opts[k] = wrap ? (opts[k] + 1) % 11 : Math.max(0, Math.min(10, opts[k] + dir));
    applyVolumes();
  }
  if (name === 'announcer') { const k = ['JP', 'EN', 'OFF']; opts.announcer = k[(k.indexOf(opts.announcer) + dir + k.length) % k.length]; announce('announcer on!'); }
  if (name === 'crt') setCRT(!crtOn);
  if (name === 'fx') { const k = ['FULL', 'REDUCED', 'OFF']; opts.fx = k[(k.indexOf(opts.fx) + dir + k.length) % k.length]; }
  saveOpts(); syncOpts(); sfx(name === 'sfx' ? 'hit' : 'hover');
}

// move list, shared by the title screen and the pause menu (directions assume you face right)
const MOVES_HTML = `<dt class="hd">All fighters (facing right)</dt>
  <dt>J K L</dt><dd>Light, heavy, special (P2: , . /)</dd>
  <dt>→ →</dt><dd>Dash in (← ← backsteps)</dd>
  <dt>Hold ← or ↓</dt><dd>Guard</dd>
  <dt>→ + H</dt><dd>Rush attack: a lunging heavy</dd>
  <dt>← + H</dt><dd>Launcher: anti-air that pops them up</dd>
  <dt>L, L, H</dt><dd>Chain combo when the hits connect</dd>
  <dt>L or H, S</dt><dd>Cancel a connected hit into your special</dd>
  <dt>K + L</dt><dd>ULTIMATE when SUPER (the gold bar) is full: Heavy and Special together (P2: . + /, or ↓ → + Special)</dd>
  <dt>SP gauge</dt><dd>The blue bar under SUPER: empty at the start of each round; land lights and heavies to charge your special</dd>
  <dt>Rage</dt><dd>Below 30% health: 10% more damage and a third of a SUPER bar, once a round</dd>
  <dt class="hd">Specials and ultimates</dt>` +
  CHARS.map(ch => `<dt>${firstName(ch)}</dt><dd>${ch.moves.special.name} · Ultimate: ${ch.moves.ult.name}</dd>`).join('');
export function initTitle() {
  $('mlist').innerHTML = MOVES_HTML; $('pmlist').innerHTML = MOVES_HTML;
  document.querySelectorAll('.ver').forEach(e => e.textContent = 'v' + VERSION);
}

// --- game logo: chunky extruded pixel title, drops in on the title screen and glints every few seconds ---
function buildLogo() {
  const c = document.createElement('canvas'); c.width = 320; c.height = 104;
  const t = c.getContext('2d', { willReadFrequently: true }); t.textBaseline = 'top'; t.textAlign = 'center';
  const line = (txt, size, y, top = '#fff1b0', mid = '#ffd23f', bot = '#ff7a3d', depth = 6) => {
    t.font = `${size}px ${FONT}`;
    for (let k = depth; k >= 1; k--) { t.fillStyle = k > depth / 2 ? '#5a1028' : '#9a2f66'; t.fillText(txt, 160 + k, y + k); } // extrusion
    t.fillStyle = OUT; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [-2, 2], [2, -2]]) t.fillText(txt, 160 + dx, y + dy);
    const gr = t.createLinearGradient(0, y, 0, y + size); gr.addColorStop(0, top); gr.addColorStop(.45, mid); gr.addColorStop(1, bot);
    t.fillStyle = gr; t.fillText(txt, 160, y);
  };
  line("MARTINI'S", 16, 4, '#eef4f8', '#8fe8ff', '#3fb8ff', 3);
  line('BRAINROT', 28, 26); line('BRAWL', 36, 60);
  pixelize(t, 0, 0, 320, 104, true);
  return c;
}
document.fonts && document.fonts.load(`28px ${FONT}`).then(() => { logoImg = null; }, () => { });
export function renderLogo(now) {
  if (!logoImg && (!document.fonts || document.fonts.check(`28px ${FONT}`) || now > 3000)) logoImg = buildLogo();
  const lc = logoCv.getContext('2d'), LH2 = logoCv.height; lc.clearRect(0, 0, 320, LH2);
  if (!logoImg) return;
  const t = (now - logoT0) / STEP, drop = RM ? 0 : Math.round((1 - easeOutBack(Math.min(1, t / 24))) * -90);
  lc.drawImage(logoImg, 0, drop);
  const gt = t % 200 - 150; // glint sweep
  if (gt >= 0 && !RM) {
    lc.save(); lc.globalCompositeOperation = 'source-atop'; lc.fillStyle = 'rgba(255,255,255,.75)';
    for (let y = 0; y < LH2; y++) lc.fillRect(Math.round(gt * 8 - 40 + y * .5), y, 8, 1);
    lc.restore();
  }
  lc.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) if (((tick >> 3) + i * 3) % 6 === 0) { const x = 30 + i * 52, y = 8 + (i * 29) % 86; lc.fillRect(x - 2, y, 5, 1); lc.fillRect(x, y - 2, 1, 5); } // sparkles
}

export function bindTitle() {
  $('bStart').onclick = pressStart;
  $('scTitle').addEventListener('pointerdown', e => { if (!started && e.target === e.currentTarget) pressStart(); });
  $('bArcade').onclick = () => { audio(); sfx('ui'); openSelect('arcade'); };
  $('b1p').onclick = () => { audio(); sfx('ui'); openSelect(1); };
  $('b2p').onclick = () => { audio(); sfx('ui'); openSelect(2); };
  $('bMoves').onclick = () => { sfx('ui'); setTitleView('moves'); };
  $('bOptions').onclick = () => { sfx('ui'); setTitleView('options'); };
  $('bExit').onclick = () => { sfx('ui'); setTitleView('exit'); };
  document.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => cycleOpt(b.dataset.opt, 1, true));
  document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { sfx('ui'); setTitleView('main'); });
}
