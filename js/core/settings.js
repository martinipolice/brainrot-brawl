import { RM } from './constants.js';

// ---------- saved settings (per browser, optional) ----------
export const VERSION = '1.9.0';
export const HIKEY = 'brainrot-brawl-hi', CRTKEY = 'brainrot-brawl-crt';
export const load = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
export const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
export let hi = +load(HIKEY) || 0;
export const setHi = v => { hi = v; };
const OPTKEY = 'brainrot-brawl-opts';
export const CPU_LEVELS = { EASY: .15, NORMAL: .45, HARD: .8 };
export const opts = Object.assign({ cpu: 'NORMAL', sfxVol: 8, musicVol: 6, announcer: 'JP', muted: false }, (() => { try { return JSON.parse(load(OPTKEY)) || {}; } catch (e) { return {}; } })());
if (!(opts.cpu in CPU_LEVELS)) opts.cpu = 'NORMAL';
if (opts.announcer === true) opts.announcer = 'JP'; if (opts.announcer === false) opts.announcer = 'OFF';
if (!['JP', 'EN', 'OFF'].includes(opts.announcer)) opts.announcer = 'JP';
if (opts.sound === false) opts.sfxVol = 0; if (opts.music === false) opts.musicVol = 0; delete opts.sound; delete opts.music; // settings from v1.3
opts.sfxVol = Math.max(0, Math.min(10, opts.sfxVol | 0)); opts.musicVol = Math.max(0, Math.min(10, opts.musicVol | 0));
if (!['FULL', 'REDUCED', 'OFF'].includes(opts.fx)) opts.fx = RM ? 'REDUCED' : 'FULL';
export const saveOpts = () => save(OPTKEY, JSON.stringify(opts));
// Shake & flash option: REDUCED keeps a third of the shake and drops full-screen flashes; OFF removes both.
export const fxShake = () => ({ FULL: 1, REDUCED: .35, OFF: 0 })[opts.fx], fxFlash = () => opts.fx === 'FULL';
