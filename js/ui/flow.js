import { LH, RM, TOUCH } from '../core/constants.js';
import { hi, CPU_LEVELS, opts } from '../core/settings.js';
import { game, ui, paused, setUi, setPaused } from '../core/state.js';
import { pad7, pickOne } from '../core/util.js';
import { cv, VH, setView } from '../render/canvas.js';
import { newGame, maxHp } from '../game/match.js';
import { CHARS } from '../game/roster.js';
import { announce } from '../audio/announcer.js';
import { sfx } from '../audio/sfx.js';
import { MAPS, keyCtrl } from '../input/keyboard.js';
import { cpuCtrl } from '../ai/cpu.js';
import { STAGES, stageById } from '../stages/index.js';
import { $ } from './dom.js';
import { showEnding, endEnding } from './ending.js';
import { openSelect } from './select.js';
import { started, setLogoT0, setTitleView } from './title.js';
import { vs, setVs, vsFrames, startVS } from './vs.js';

// Switching screens, and the match flow: the arcade ladder, starting a match, results, continue and pause.
export let selMode = 1, picks = [0, 1], arcade = null, cont = null;
export const setSelMode = v => { selMode = v; }, setPicks = v => { picks = v; };
let resAction = null;
function wipe() { if (RM) return; const f = $('fade'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
export function show(name) {
  setUi(name);
  $('scTitle').hidden = name !== 'title'; $('scSelect').hidden = name !== 'select'; $('scFight').hidden = !(name === 'fight' || name === 'vs' || name === 'ending');
  const arena = TOUCH && $('scFight').hidden === false; // touch: the fight, VS and ending fill the screen, with the pad
  $('pad').hidden = !arena; document.body.classList.toggle('arena', arena); document.body.dataset.ui = name;
  if (name === 'vs' || name === 'ending') { $('tip').textContent = name === 'vs' ? 'Get ready! Tap any button to fight' : 'Tap any button to continue'; $('tip').classList.add('hot'); }
  fitView();
  if (name !== 'fight') { cont = null; $('pPause').hidden = true; $('pResult').hidden = true; setPaused(false); }
  wipe();
  if (name === 'title') { arcade = null; $('hiScore').textContent = pad7(hi); setLogoT0(performance.now()); setTitleView(started ? 'main' : 'press'); }
}

// --- arcade ladder: the other fighters in random order, then a shadow copy of you; the CPU sharpens every stage ---
const arcadeLevel = () => .12 + .63 * arcade.stage / (arcade.order.length - 1);
export function startArcade(me) {
  const others = CHARS.map((_, i) => i).filter(i => i !== me);
  for (let i = others.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [others[i], others[j]] = [others[j], others[i]]; }
  arcade = { me, order: [...others.map(c => ({ c, boss: false })), { c: me, boss: true }], stage: 0, score: 0, continues: 0 };
  startStageVS();
}
function startStageVS() { selMode = 'arcade'; picks = [arcade.me, arcade.order[arcade.stage].c]; startVS(); }

// The match's stage: arcade fights each opponent on their home stage (the shadow boss on its own); versus and 2 Players
// pick one at random.
export function chooseStage() {
  if (selMode !== 'arcade') return pickOne(STAGES.filter(s => !s.boss));
  const o = arcade.order[arcade.stage];
  return o.boss ? stageById('storm') : STAGES.find(s => s.home === CHARS[o.c].id) || STAGES[0];
}
export function startMatch(stage) {
  const sd = stage || (vs && vs.stage) || chooseStage(); // a restart keeps its stage; otherwise the VS screen already picked (and named) it
  const c = [CHARS[picks[0]], CHARS[picks[1]]], arc = selMode === 'arcade';
  const lvl = arc ? arcadeLevel() : CPU_LEVELS[opts.cpu];
  newGame(c[0], c[1], [keyCtrl(MAPS[0]), selMode === 2 ? keyCtrl(MAPS[1]) : cpuCtrl(1, lvl)], ['1P', selMode === 2 ? '2P' : 'CPU']);
  game.stage = { def: sd, st: sd.init ? sd.init() : {} };
  if (arc) {
    game.arcade = true; game.score[0] = game.shown[0] = arcade.score;
    if (arcade.order[arcade.stage].boss) { const b = game.p[1]; b.shadow = true; b.hp = b.ghost = maxHp(b); }
  }
  setVs(null); cont = null; setPaused(false); $('pPause').hidden = true; $('pResult').hidden = true; show('fight');
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}
export function showResult() {
  const [a, b] = game.p, w = a.wins >= 2 && b.wins >= 2 ? -1 : a.wins >= 2 ? 0 : 1, vsCpu = selMode !== 2, cpuWon = vsCpu && w !== 0;
  let title, label = 'Rematch', next = '';
  resAction = startMatch;
  if (selMode === 'arcade' && !cpuWon) {
    arcade.score = game.score[0];
    if (arcade.stage === arcade.order.length - 1) { showEnding(); return; }
    const nx = arcade.order[arcade.stage + 1];
    title = 'Stage clear!'; label = 'Next stage'; next = ` · Next: ${nx.boss ? 'Your shadow' : CHARS[nx.c].name}`;
    resAction = () => { arcade.stage++; startStageVS(); };
  } else if (cpuWon) {
    title = w < 0 ? 'Draw game' : 'You lose'; label = 'Continue';
    resAction = () => { if (arcade) arcade.continues++; startMatch(); };
  } else title = w < 0 ? 'Draw game' : vsCpu ? 'You win!' : `${game.labels[w]} wins!`;
  $('resTitle').textContent = title;
  $('resQuote').innerHTML = w < 0 ? '<b>Nobody</b>Nobody wins. Everybody goes home brainrotted.' : `<b>${game.p[w].shadow ? 'Shadow ' : ''}${game.p[w].ch.name}</b>“${game.p[w].ch.quote}”`;
  const scores = selMode === 2 ? `1P ${pad7(game.score[0])} · 2P ${pad7(game.score[1])}` : `Score ${pad7(game.score[0])}`;
  $('resSub').innerHTML = `${game.labels[0]} ${a.wins} – ${b.wins} ${game.labels[1]} · ${scores}${next}${game.newHi ? ' · <span class="hi">New hi-score!</span>' : ''}`;
  $('resMenu').hidden = false; $('bChange').hidden = selMode === 'arcade';
  $('bRematch').textContent = label;
  $('resCont').hidden = !cpuWon;
  cont = cpuWon ? { t0: performance.now(), n: 9 } : null;
  if (cpuWon) announce('continue?');
  $('contN').textContent = '9';
  $('pResult').hidden = false; $('bRematch').focus({ preventScroll: true });
}
export function updateContinue(now) {
  const n = 9 - Math.floor((now - cont.t0) / 1000);
  if (n === cont.n) return;
  cont.n = n;
  if (n >= 0) { $('contN').textContent = n; sfx('tick'); return; }
  cont = null; // out of time: game over, back to the title
  $('resTitle').textContent = 'Game over'; $('resCont').hidden = true; $('resMenu').hidden = true; sfx('lose'); announce('game over!');
  setTimeout(() => { if (ui === 'fight' && !$('pResult').hidden && $('resMenu').hidden) show('title'); }, 2500);
}
// The pause or result menu is up: input belongs to the menu, not the fight.
// A phone held upright gets the taller 4:3 view for the fight, VS and ending; turning it re-fits the screen.
const UPRIGHT = matchMedia('(orientation: portrait)');
function fitView() { setView(document.body.classList.contains('arena') && UPRIGHT.matches ? 240 : LH); document.body.classList.toggle('tall', VH > LH); }
UPRIGHT.addEventListener('change', fitView); addEventListener('resize', fitView); // resize too: some browsers report rotation late
export const inOverlay = () => ui === 'fight' && (paused || !$('pResult').hidden);
export function togglePause() { setPaused(!paused); $('pPause').hidden = !paused; $('pmlist').hidden = true; if (paused) $('bResume').focus({ preventScroll: true }); else document.activeElement.blur(); }

export function bindFight() {
  $('bResume').onclick = togglePause;
  $('bRestart').onclick = () => startMatch(game.stage.def);
  $('bPMoves').onclick = () => { $('pmlist').hidden = !$('pmlist').hidden; };
  $('bQuit').onclick = () => show('title');
  $('bRematch').onclick = () => resAction();
  $('bChange').onclick = () => openSelect(selMode);
  $('bMenu').onclick = () => show('title');
  // leaving the window or tab pauses the fight, so the CPU doesn't play on alone
  const autoPause = () => { if (ui === 'fight' && game && game.phase !== 'matchEnd' && !paused && $('pResult').hidden) togglePause(); };
  addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
  cv.addEventListener('pointerdown', () => { if (ui === 'vs' && vsFrames() > 30) startMatch(); else if (ui === 'ending') endEnding(); });
}
