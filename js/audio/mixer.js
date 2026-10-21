import { opts } from '../core/settings.js';

// ---------- sound ----------
// Mixer: every sound plays into a bus (sfx, ui, music). Music runs through a gentle low-pass EQ and a duck stage that
// dips under the announcer, big hits, ultimates, KOs and rage, so it never masks the fight. Everything meets in a master
// gain, a master low-pass (swept down for the muffled KO slow motion) and a limiter, so a pile-up of hits never clips.
// Effects also send a little into a short room reverb. Volume steps are decibels: loudness is perceived logarithmically.
export let ac = null, muted = !!opts.muted;
export const setMuted = v => { muted = v; };
let noiseBuf = null;
export const bus = {};
const volToGain = v => v <= 0 ? 0 : Math.pow(10, (v - 10) * 3.6 / 20); // 10 = 0 dB, each step -3.6 dB, 0 = silent
const MASTER = 2, MUSIC_SHARE = .42; // master make-up gain (the limiter holds the peaks); music sits under the fight
function buildGraph(c, b) {
  const g = v => { const n = c.createGain(); n.gain.value = v; return n; };
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -8; limiter.knee.value = 6; limiter.ratio.value = 12; limiter.attack.value = .003; limiter.release.value = .2;
  limiter.connect(c.destination);
  b.lp = c.createBiquadFilter(); b.lp.type = 'lowpass'; b.lp.frequency.value = 20000; b.lp.connect(limiter);
  b.master = g(MASTER); b.master.connect(b.lp);
  b.sfx = g(1); b.sfx.connect(b.master);
  b.ui = g(1); b.ui.connect(b.master);
  b.duck = g(1); b.duck.connect(b.master);
  b.mEQ = c.createBiquadFilter(); b.mEQ.type = 'lowpass'; b.mEQ.frequency.value = 6500; b.mEQ.Q.value = .5; b.mEQ.connect(b.duck);
  b.music = g(MUSIC_SHARE); b.music.connect(b.mEQ);
  const verb = c.createConvolver(), len = c.sampleRate * .9 | 0, ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  verb.buffer = ir; b.verb = g(.16); b.sfx.connect(b.verb); b.verb.connect(verb); verb.connect(b.master);
  const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return nb;
}
export function audio() {
  try {
    if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); noiseBuf = buildGraph(ac, bus); applyVolumes(); }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { }
}
export function applyVolumes() {
  if (!ac) return;
  const t = ac.currentTime;
  bus.master.gain.setTargetAtTime(muted ? 0 : MASTER, t, .02);
  bus.sfx.gain.setTargetAtTime(volToGain(opts.sfxVol), t, .02);
  bus.ui.gain.setTargetAtTime(volToGain(opts.sfxVol), t, .02);
  bus.music.gain.setTargetAtTime(volToGain(opts.musicVol) * MUSIC_SHARE, t, .05);
}
// dip the music to `depth` for `hold` seconds, then let it swell back
export function duck(depth, hold) {
  if (!ac) return;
  const g = bus.duck.gain, t = ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(depth, t + .03);
  g.setValueAtTime(depth, t + hold); g.linearRampToValueAtTime(1, t + hold + .6);
}
// hold the music down while the announcer speaks
export function duckHold(on) {
  if (!ac) return;
  const g = bus.duck.gain, t = ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(on ? .5 : 1, t, on ? .04 : .25);
}
// muffle everything (like ringing ears) for the KO slow motion, then open back up
export function muffle(hold) {
  if (!ac) return;
  const f = bus.lp.frequency, t = ac.currentTime;
  f.cancelScheduledValues(t); f.setValueAtTime(f.value, t); f.exponentialRampToValueAtTime(650, t + .08);
  f.setValueAtTime(650, t + hold); f.exponentialRampToValueAtTime(20000, t + hold + .7);
}
export function tone(f0, f1, d, wave, vol, t = ac.currentTime, out = bus.sfx) {
  const o = ac.createOscillator(), gn = ac.createGain();
  o.type = wave; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + d);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(gn).connect(out); o.start(t); o.stop(t + d + .02);
}
export function noise(d, vol, freq, type = 'bandpass', t = ac.currentTime, f1 = 0, out = bus.sfx) {
  const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain();
  s.buffer = noiseBuf; fl.type = type; fl.frequency.setValueAtTime(freq, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + d);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(fl).connect(gn).connect(out); s.start(t, Math.random() * .5); s.stop(t + d + .02);
}
// a chorused chip voice: two detuned oscillators through a gentle low-pass, with a soft attack
export function voice(f, d, vol, t, wave = 'square', out = bus.music, cut = 2600) {
  const fl = ac.createBiquadFilter(), gn = ac.createGain();
  fl.type = 'lowpass'; fl.frequency.value = cut;
  gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .006); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  for (const det of [-7, 7]) { const o = ac.createOscillator(); o.type = wave; o.frequency.value = f; o.detune.value = det; o.connect(fl); o.start(t); o.stop(t + d + .02); }
  fl.connect(gn).connect(out);
}
// plucky synth bass: a sawtooth through a resonant low-pass that closes over the note
export function bassNote(f, d, t, vol = .085) {
  const o = ac.createOscillator(), fl = ac.createBiquadFilter(), gn = ac.createGain();
  o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.Q.value = 4;
  fl.frequency.setValueAtTime(900, t); fl.frequency.exponentialRampToValueAtTime(260, t + d);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(fl).connect(gn).connect(bus.music); o.start(t); o.stop(t + d + .02);
}
