import { opts } from '../core/settings.js';
import { game, ui, paused } from '../core/state.js';
import { step } from '../game/match.js';
import { ac, muted, bus, tone, noise, voice, bassNote } from './mixer.js';

// ---------- music ----------
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
// Title theme: a slower arpeggio (Am, F, C, G). 0 = rest.
const TITLE = { step: .19, lead: [69, 72, 76, 72, 69, 72, 76, 79, 65, 69, 72, 69, 65, 69, 72, 77, 67, 72, 76, 72, 67, 72, 76, 79, 67, 71, 74, 71, 67, 71, 74, 79],
  bass: [45, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0] };
// Battle theme: 150 BPM in A minor, eight bars (Am Am F G Am Am F E) on a 16th-note grid. Layers build with tension:
// base = plucky bass, kick, snare, hats, chord stabs and the lead; final round adds 16th hats and open hats; rage or the
// last 10 seconds adds crashes, a doubled bass and a lower harmony. During ROUND/FIGHT only the rhythm section plays.
const SIXTEENTH = 60 / 150 / 4;
const CHORDS = [[45, [57, 60, 64]], [45, [57, 60, 64]], [41, [53, 57, 60]], [43, [55, 59, 62]], [45, [57, 60, 64]], [45, [57, 60, 64]], [41, [53, 57, 60]], [40, [52, 56, 59]]];
const MELODY = [ // per bar: [16th step, MIDI note, length in 16ths]
  [[0, 76, 2], [2, 81, 2], [4, 84, 2], [6, 83, 1], [7, 81, 1], [8, 83, 2], [10, 84, 2], [12, 81, 4]],
  [[0, 76, 2], [2, 77, 1], [3, 76, 1], [4, 74, 2], [6, 72, 2], [8, 71, 2], [10, 72, 2], [12, 69, 4]],
  [[0, 77, 2], [2, 81, 2], [4, 84, 2], [6, 81, 2], [8, 79, 2], [10, 77, 2], [12, 76, 4]],
  [[0, 79, 2], [2, 83, 2], [4, 86, 2], [6, 83, 2], [8, 81, 2], [10, 79, 2], [12, 83, 4]],
  [[0, 76, 2], [2, 81, 2], [4, 84, 2], [6, 83, 1], [7, 81, 1], [8, 83, 2], [10, 84, 2], [12, 88, 4]],
  [[0, 84, 2], [2, 83, 2], [4, 81, 2], [6, 79, 2], [8, 77, 2], [10, 76, 2], [12, 74, 4]],
  [[0, 72, 2], [2, 74, 2], [4, 76, 2], [6, 77, 2], [8, 79, 2], [10, 81, 2], [12, 84, 4]],
  [[0, 83, 2], [2, 80, 2], [4, 76, 2], [6, 80, 2], [8, 83, 4], [12, 88, 4]],
];
const BASS_HITS = { 0: 0, 3: 0, 6: 12, 8: 0, 10: 0, 11: 12, 14: 0 }; // 16th step: octave offset
function fightStep(step, t, tension, intro) {
  const bar = (step >> 4) % 8, s = step & 15, [root, chord] = CHORDS[bar], out = bus.music;
  if (s in BASS_HITS) { bassNote(mtof(root + BASS_HITS[s]), SIXTEENTH * 1.6, t); if (tension === 2) bassNote(mtof(root + 12 + BASS_HITS[s]), SIXTEENTH * 1.2, t, .03); }
  if (s === 0 || s === 8) tone(mtof(root - 12), mtof(root - 12), SIXTEENTH * 6, 'sine', .13, t, out); // sub
  if (s === 0 || s === 6 || s === 8 || (tension >= 1 && s === 14)) tone(150, 45, .12, 'sine', .4, t, out); // kick
  if (s === 4 || s === 12) { noise(.1, .16, 1900, 'bandpass', t, 0, out); tone(200, 120, .07, 'triangle', .07, t, out); } // snare
  if (s % 2 === 0 || tension >= 1) noise(.022, s % 4 === 2 ? .042 : .026, 8500, 'highpass', t, 0, out); // hats
  if (tension >= 1 && s === 14) noise(.18, .045, 6000, 'highpass', t, 0, out); // open hat
  if (tension === 2 && s === 0 && bar % 2 === 0) noise(.9, .06, 5000, 'highpass', t, 0, out); // crash
  if (intro) return;
  if (s === 2 || s === 10) chord.forEach(n => voice(mtof(n), SIXTEENTH * 1.2, .011, t, 'square', out, 1800)); // stabs
  for (const [ms, n, len] of MELODY[bar]) if (ms === s) {
    voice(mtof(n), SIXTEENTH * len * .95, .024, t, 'square', out, tension ? 3200 : 2200);
    if (tension === 2) voice(mtof(n - 12), SIXTEENTH * len * .95, .011, t, 'triangle', out, 2000);
  }
}
let mStep = 0, mNext = 0, mTrack = null;
export const setMStep = v => { mStep = v; }; // a new match or round restarts the battle theme from bar one
export function music() {
  let want = null;
  if (ui === 'title' || ui === 'select' || ui === 'ending') want = 'title';
  else if (ui === 'fight' && game && !paused && (game.phase === 'fight' || game.phase === 'intro')) want = 'fight';
  if (!ac || muted || opts.musicVol === 0 || ac.state !== 'running') want = null;
  if (want !== mTrack) { mTrack = want; mStep = 0; mNext = 0; }
  if (!want) return;
  if (mNext < ac.currentTime) mNext = ac.currentTime + .05;
  if (want === 'fight') {
    const tension = game.p.some(f => f.rage) || game.timer < 600 ? 2 : game.p[0].wins === 1 && game.p[1].wins === 1 ? 1 : 0;
    while (mNext < ac.currentTime + .15) { fightStep(mStep, mNext, tension, game.phase === 'intro'); mStep++; mNext += SIXTEENTH; }
    return;
  }
  const n = TITLE.lead.length;
  while (mNext < ac.currentTime + .15) {
    const i = mStep % n, l = TITLE.lead[i], b = TITLE.bass[i], t = mNext;
    if (l) voice(mtof(l), TITLE.step * 1.6, .05, t, 'triangle');
    if (b) tone(mtof(b), mtof(b), TITLE.step * 2.6, 'triangle', .12, t, bus.music);
    if (i % 2 === 0) noise(.02, .025, 9000, 'highpass', t, 0, bus.music);
    mStep++; mNext += TITLE.step;
  }
}
