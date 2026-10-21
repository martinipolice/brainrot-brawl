import { opts } from '../core/settings.js';
import { muted, duckHold } from './mixer.js';

// ---------- announcer ----------
// Arcade announcer in the style of Street Fighter and Tekken, through the browser's speech voices. JP mode reads the
// lines in katakana with a Japanese voice, which gives the classic Japanese-accented English. When the browser has no
// Japanese voice it falls back to an English voice reading a phonetic respelling ("Raundo wan... Faito!"). EN mode uses
// plain English. The music dips while the announcer speaks.
const VOICE = { ja: null, en: null };
function pickVoices() {
  const v = speechSynthesis.getVoices();
  VOICE.ja = v.find(x => /^ja/i.test(x.lang) && /ichiro|keita|otoya|daichi|male/i.test(x.name)) || v.find(x => /^ja/i.test(x.lang)) || null;
  VOICE.en = v.find(x => /^en/i.test(x.lang) && /david|mark|guy|daniel|christopher|eric|male/i.test(x.name)) || v.find(x => /^en/i.test(x.lang)) || null;
}
if ('speechSynthesis' in window) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
const SAY = { // word: [katakana, phonetic respelling, plain English]
  round: ['ラウンド', 'Raundo', 'Round'], one: ['ワン', 'wan', 'one'], two: ['ツー', 'tsuu', 'two'], three: ['スリー', 'surii', 'three'],
  four: ['フォー', 'foa', 'four'], five: ['ファイブ', 'faibu', 'five'], six: ['シックス', 'shikkusu', 'six'], final: ['ファイナル', 'Fainaru', 'Final'],
  fight: ['ファイト', 'Faito', 'Fight'], ko: ['ケーオー', 'Kei Oh', 'K. O.'], double: ['ダブル', 'Daburu', 'Double'], time: ['タイム', 'Taimu', 'Time'],
  over: ['オーバー', 'oobaa', 'over'], perfect: ['パーフェクト', 'Paafekuto', 'Perfect'], wins: ['ウィンズ', 'winzu', 'wins'],
  versus: ['バーサス', 'baasasu', 'versus'], shadow: ['シャドウ', 'Shadou', 'Shadow'], draw: ['ドロー', 'Doroo', 'Draw'],
  choose: ['チューズ', 'Chuuzu', 'Choose'], your: ['ユア', 'yua', 'your'], fighter: ['ファイター', 'faitaa', 'fighter'],
  continue: ['コンティニュー', 'Kontinyuu', 'Continue'], game: ['ゲーム', 'Geemu', 'Game'], congratulations: ['コングラチュレーション', 'Kongurachureeshon', 'Congratulations'],
  excellent: ['エクセレント', 'Ekuserento', 'Excellent'], announcer: ['アナウンサー', 'Anaunsaa', 'Announcer'], on: ['オン', 'on', 'on'],
  tralalero: ['トララレロ', 'Torararero', 'Tralalero'], tung: ['トゥン', 'Tun', 'Tung'], bombardiro: ['ボンバルディーロ', 'Bonbarudiiro', 'Bombardiro'], ballerina: ['バレリーナ', 'Bareriina', 'Ballerina'],
};
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
export function announce(text) {
  const mode = opts.announcer;
  if (mode === 'OFF' || muted || opts.sfxVol === 0 || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const ja = mode === 'JP' && !!VOICE.ja, col = mode === 'EN' ? 2 : ja ? 0 : 1;
    let line = text.replace(/\d+/g, n => NUM[+n] || n).replace(/[A-Za-z]+/g, w => (SAY[w.toLowerCase()] || [w, w, w])[col]);
    if (ja) line = line.replace(/!/g, '！').replace(/\?/g, '？');
    const u = new SpeechSynthesisUtterance(line);
    const v = ja ? VOICE.ja : VOICE.en; if (v) u.voice = v;
    u.lang = ja ? 'ja-JP' : 'en-US'; u.rate = ja ? .95 : .9; u.pitch = ja ? .75 : .55; u.volume = Math.min(1, opts.sfxVol / 10);
    u.onstart = () => duckHold(true); u.onend = u.onerror = () => duckHold(false);
    speechSynthesis.speak(u);
  } catch (e) { }
}
