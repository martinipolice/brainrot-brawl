import { step } from '../game/match.js';
import { ac, muted, bus, tone, noise } from './mixer.js';

// Sound effects, synthesized on the fly through the mixer.
const notes = (fs, step, d, wave, vol, out = bus.ui) => { const t = ac.currentTime; fs.forEach((f, i) => tone(f, f, d, wave, vol, t + i * step, out)); };
const SFX = {
  hit: v => { tone(260 * v, 80, .08, 'square', .14); noise(.06, .42, 1800 * v); tone(110, 50, .05, 'sine', .4); },
  heavy: v => { tone(170 * v, 40, .2, 'sawtooth', .12); tone(95, 30, .26, 'sine', .45); noise(.16, .5, 1000, 'lowpass'); noise(.05, .3, 3200 * v, 'bandpass'); },
  block: v => { tone(950 * v, 620, .05, 'triangle', .12); noise(.04, .22, 4200, 'highpass'); },
  ko: () => { tone(440, 40, .9, 'sawtooth', .12); tone(120, 28, .9, 'sine', .5); noise(.7, .45, 2000, 'lowpass', ac.currentTime, 90); },
  special: v => { const t = ac.currentTime; [440, 554, 698].forEach((f, i) => tone(f * v, f * v, .09, 'square', .06, t + i * .045)); },
  whoosh: v => noise(.07, .16, 700 * v, 'bandpass', ac.currentTime, 2400 * v), // light: short and bright
  whooshH: v => { noise(.16, .24, 380 * v, 'bandpass', ac.currentTime, 1500 * v); tone(120 * v, 70, .12, 'sine', .08); }, // heavy: long and low
  jump: v => tone(280 * v, 640 * v, .09, 'square', .05),
  land: () => { tone(130, 50, .08, 'sine', .28); noise(.05, .16, 600, 'lowpass'); },
  step: v => noise(.03, .05, 420 * v, 'lowpass'),
  wall: () => { tone(110, 40, .12, 'sine', .4); noise(.1, .35, 900, 'lowpass'); },
  // each fighter's hits carry their own flavour on top of the shared impact
  fl_tung: v => { tone(620 * v, 560 * v, .05, 'sine', .22); tone(1240 * v, 1100 * v, .03, 'sine', .07); noise(.03, .12, 2400 * v); }, // wooden "tung"
  fl_tralalero: v => { noise(.14, .14, 1200 * v, 'highpass', ac.currentTime, 4500); tone(300 * v, 180, .06, 'sine', .08); }, // splash
  fl_bombardiro: v => { tone(200 * v, 90, .07, 'sawtooth', .07); noise(.02, .2, 3000 * v); }, // chomp
  fl_ballerina: v => { tone(900 * v, 1500 * v, .09, 'sine', .07); tone(1800 * v, 2600 * v, .07, 'sine', .03); }, // twirl
  ui: () => tone(660, 990, .07, 'square', .07, ac.currentTime, bus.ui),
  hover: () => tone(880, 880, .025, 'square', .03, ac.currentTime, bus.ui),
  lock: () => notes([523, 784, 1047], .05, .09, 'square', .08),
  start: () => notes([392, 523, 659, 784, 1047], .06, .1, 'square', .07),
  ready: () => notes([988, 1319], .07, .1, 'triangle', .12),
  super: () => notes([784, 988, 1175, 1568], .05, .12, 'triangle', .1),
  combo: n => tone(440 * Math.pow(1.122, Math.min(n, 12)), 440 * Math.pow(1.122, Math.min(n, 12)) * 1.5, .07, 'square', .06),
  tick: () => tone(1200, 1200, .03, 'square', .05, ac.currentTime, bus.ui),
  round: () => notes([523, 659, 784], .09, .08, 'square', .08),
  fight: () => { [523, 659, 784, 1047].forEach(f => tone(f, f, .45, 'sawtooth', .04)); noise(.25, .25, 3000, 'highpass'); },
  vs: () => { tone(220, 110, .45, 'sawtooth', .1); tone(110, 55, .45, 'square', .08); noise(.35, .4, 1600, 'bandpass', ac.currentTime, 300); },
  ult: () => { tone(220, 1760, .5, 'sawtooth', .08); notes([523, 659, 784, 1047, 1319], .05, .12, 'square', .07, bus.sfx); noise(.5, .3, 600, 'bandpass', ac.currentTime, 5000); },
  rage: () => { tone(70, 55, .7, 'sawtooth', .16); tone(140, 110, .6, 'square', .05); noise(.6, .3, 300, 'bandpass', ac.currentTime, 2400); notes([220, 262, 311], .07, .3, 'sawtooth', .05, bus.sfx); },
  win: () => notes([523, 659, 784, 1047, 784, 1047, 1319], .1, .14, 'square', .08),
  lose: () => notes([392, 370, 349, 330], .22, .25, 'triangle', .1),
};
export function sfx(type, arg) {
  if (!ac || muted || ac.state !== 'running' || !SFX[type]) return;
  SFX[type](arg ?? (.92 + Math.random() * .16)); // ±8% pitch so repeats never sound identical
}
