import { ui, tick } from '../core/state.js';
import { miniFrame, stand, demoPose } from '../render/figures.js';
import { CHARS, firstName } from '../game/roster.js';
import { announce } from '../audio/announcer.js';
import { sfx } from '../audio/sfx.js';
import { $ } from './dom.js';
import { setSelMode, setPicks, show, startArcade } from './flow.js';
import { startVS } from './vs.js';

// --- character select: SF-style cursor grid with 1P/2P cursors and big previews on each side ---
const portraits = [];
export let sel = null;
export function buildRoster() {
  CHARS.forEach((ch, idx) => {
    const b = document.createElement('button'); b.className = 'portrait'; b.type = 'button'; b.setAttribute('aria-label', ch.name);
    b.innerHTML = `<canvas width="64" height="56" aria-hidden="true"></canvas><span class="nm">${firstName(ch)}</span><i class="t1">1P</i><i class="t2">CPU</i>`;
    b.addEventListener('pointerenter', () => hoverPortrait(idx));
    b.addEventListener('focus', () => hoverPortrait(idx));
    b.addEventListener('click', () => { const p = mousePlayer(); if (p < 0 || sel.done) return; sel.cur[p] = idx; lockIn(p); });
    portraits.push(b); $('roster').append(b);
  });
}
const pips = n => `<span class="pips">${[0, 1, 2, 3, 4].map(k => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>`;
const infoHTML = ch => `<h3>${ch.name}</h3>
  <div class="stats"><span>SPD</span>${pips(ch.stats[0])}<span>POW</span>${pips(ch.stats[1])}<span>HP</span>${pips(ch.stats[2])}</div>`;
// mode: 1 = Versus CPU, 2 = two players, 'arcade' = arcade ladder (only player 1 picks)
const mousePlayer = () => !sel || sel.done ? -1 : sel.mode !== 2 ? sel.step : !sel.lock[0] ? 0 : !sel.lock[1] ? 1 : -1;
const pickers = () => sel.mode !== 2 ? [sel.step] : [0, 1].filter(p => !sel.lock[p]);
export function openSelect(mode) {
  setSelMode(mode);
  sel = { mode, cur: [0, 3], lock: [false, false], step: 0, t0: performance.now(), shown: -1, done: false, info: [-1, -1] };
  portraits.forEach(b => b.querySelector('.t2').textContent = mode === 2 ? '2P' : 'CPU');
  $('pw1').textContent = mode === 2 ? '2P' : 'CPU';
  $('selHint').textContent = mode === 2 ? '1P: WASD + J · 2P: Arrows + , · K or . undo · Esc back' : 'WASD or arrows move · J or Enter select · Esc back';
  show('select'); updateSel(); announce('choose your fighter!');
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}
function hoverPortrait(idx) {
  const p = mousePlayer();
  if (p < 0 || sel.cur[p] === idx) return;
  sel.cur[p] = idx; sfx('hover'); updateSel();
}
function moveCur(p, dx, dy) {
  const n = CHARS.length, rows = Math.ceil(n / 2);
  let col = sel.cur[p] % 2, row = sel.cur[p] / 2 | 0;
  col = (col + dx + 2) % 2; row = (row + dy + rows) % rows;
  sel.cur[p] = Math.min(n - 1, row * 2 + col); sfx('hover'); updateSel();
}
function lockIn(p) {
  if (sel.lock[p] || sel.done) return;
  sel.lock[p] = true; sfx('lock');
  const side = $('side' + p); side.classList.remove('locked'); void side.offsetWidth; side.classList.add('locked');
  if (sel.mode === 'arcade') { sel.done = true; setTimeout(() => { if (ui === 'select' && sel && sel.done) startArcade(sel.cur[0]); }, 550); }
  else {
    if (sel.mode === 1 && p === 0) { sel.step = 1; sel.t0 = performance.now(); sel.shown = -1; }
    if (sel.lock[0] && sel.lock[1]) {
      sel.done = true; setPicks([sel.cur[0], sel.cur[1]]);
      setTimeout(() => { if (ui === 'select' && sel && sel.done) startVS(); }, 550);
    }
  }
  updateSel();
}
function unlock(p) { if (sel.done || !sel.lock[p]) return; sel.lock[p] = false; if (sel.mode !== 2) sel.step = 0; sel.t0 = performance.now(); sel.shown = -1; sfx('hover'); updateSel(); }
function selBack() {
  if (!sel || sel.done) return;
  if (sel.lock[1]) unlock(1); else if (sel.lock[0]) unlock(0); else { sfx('ui'); show('title'); }
}
export function selectKey(e) {
  if (!sel || sel.done) return;
  const c = e.code;
  if (c === 'Escape') { selBack(); return; }
  const K1 = { KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }, K2 = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const ok1 = c === 'KeyJ' || c === 'KeyF', back1 = c === 'KeyK' || c === 'KeyG';
  const ok2 = c === 'Comma' || c === 'Numpad1', back2 = c === 'Period' || c === 'Numpad2';
  const enter = c === 'Enter' && !(document.activeElement instanceof HTMLButtonElement);
  const set = K1[c] || ok1 || back1 ? 0 : K2[c] || ok2 || back2 ? 1 : enter ? mousePlayer() : -1;
  if (set < 0) return;
  if (K2[c]) e.preventDefault();
  const p = sel.mode !== 2 ? sel.step : set;
  if (back1 || back2) { if (sel.mode !== 2) selBack(); else unlock(p); return; }
  if (sel.lock[p]) return;
  if (K1[c] || K2[c]) moveCur(p, ...(K1[c] || K2[c]));
  else lockIn(p);
}
function updateSel() {
  const arc = sel.mode === 'arcade', showC2 = sel.mode === 2 || (sel.mode === 1 && sel.step === 1);
  portraits.forEach((b, i) => {
    b.classList.toggle('c1', sel.cur[0] === i); b.classList.toggle('c2', showC2 && sel.cur[1] === i);
    b.classList.toggle('lock1', sel.lock[0] && sel.cur[0] === i); b.classList.toggle('lock2', sel.lock[1] && sel.cur[1] === i);
  });
  if (sel.info[0] !== sel.cur[0]) { sel.info[0] = sel.cur[0]; $('info0').innerHTML = infoHTML(CHARS[sel.cur[0]]); }
  if (!arc && sel.info[1] !== sel.cur[1]) { sel.info[1] = sel.cur[1]; $('info1').innerHTML = infoHTML(CHARS[sel.cur[1]]); }
  $('side1').hidden = arc; document.querySelector('.selgrid').classList.toggle('solo', arc);
  $('side1').classList.toggle('dim', !showC2);
  $('selTitle').textContent = arc ? 'Arcade: choose your fighter' : sel.mode === 2 ? 'Player select' : sel.step === 0 ? 'Player 1 select' : 'Choose your opponent';
}
export function renderSelect(now) {
  const secs = Math.max(0, 30 - Math.floor((now - sel.t0) / 1000));
  if (secs !== sel.shown) {
    sel.shown = secs; $('selTime').textContent = String(secs).padStart(2, '0');
    $('selTimeBox').classList.toggle('low', secs <= 5);
    if (secs <= 5 && secs > 0 && !sel.done) sfx('tick');
  }
  if (secs === 0 && !sel.done) pickers().forEach(p => lockIn(p)); // time's up: take whoever is under the cursor
  portraits.forEach((c, i) => miniFrame(c.querySelector('canvas'), () => stand(CHARS[i], 96, 160, .9, 1, { s: 'idle', ph: 0, T: tick + i * 20 })));
  (sel.mode === 'arcade' ? [0] : [0, 1]).forEach(p => {
    const cv2 = $('pv' + p);
    miniFrame(cv2, () => {
      const u = tick % 45, mv = ['light', 'heavy', 'special'][(tick / 45 | 0) % 3];
      stand(CHARS[sel.cur[p]], 180, 285, 1.55, p ? -1 : 1, sel.lock[p] ? demoPose(mv, u, tick) : { s: 'idle', ph: 0, T: tick + p * 30 });
    });
  });
}

export function bindSelect() {
  $('bRandom').onclick = () => { const p = mousePlayer(); if (p < 0) return; sel.cur[p] = Math.random() * CHARS.length | 0; lockIn(p); };
  $('bBack').onclick = selBack;
}
