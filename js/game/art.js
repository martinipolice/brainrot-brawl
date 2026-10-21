import { OUT } from '../core/constants.js';
import { g, ow, E, R, P, L, S } from '../render/shapes.js';

// ---------- fighters' art (origin = feet centre, facing +x) ----------
// Tralalero Tralala: a blue shark walking on three legs in blue Nike-style sneakers with a white swoosh.
// Torpedo body with a pointed snout, tall dorsal fin, crescent tail, white underbelly, gill slits, small dark eye, toothy grin.
export function drawTralalero(p) {
  const t = p.T, walk = p.s === 'walk' ? Math.sin(t * .45) : 0, bob = (p.s === 'idle' || p.s === 'block') ? Math.sin(t * .09) * 2 : 0;
  const skin = '#6f9fc8', dark = '#4f7aa6';
  let fwd = 0, kick = 0;
  if (p.s === 'light') fwd = p.ph === 1 ? 16 : p.ph === 0 ? -4 : 6;
  if (p.s === 'heavy') kick = p.ph === 0 ? -.3 : p.ph === 1 ? 1 : .4;
  [-22, 0, 22].forEach((lx, i) => {
    let fx = lx + walk * (i === 1 ? -9 : 9), fy = 0;
    if (p.s === 'jump') { fy = -14; fx = lx * .8; }
    if (i === 2 && kick > 0) { fx = 22 + 52 * kick; fy = -34 * kick; }
    if (i === 2 && kick < 0) fx = 8;
    L(lx * .7, -50 + bob, fx, fy - 8, 8, skin);
    R(fx - 10, fy - 13, 28, 12, 5, '#2b6cf0');
    R(fx - 10, fy - 4, 28, 4, 2, '#eef4f8', false); // white sole
    g.beginPath(); g.moveTo(fx - 4, fy - 7); g.quadraticCurveTo(fx + 6, fy - 5, fx + 14, fy - 11); S(2.5, '#fff'); // swoosh
  });
  g.save(); g.translate(fwd, bob);
  P([-50, -84, -88, -124, -76, -86, -92, -48, -52, -72], dark); // crescent tail
  P([-10, -102, 0, -142, 24, -100], dark); // dorsal fin
  const body = () => { g.beginPath(); g.moveTo(76, -72); g.quadraticCurveTo(58, -106, 4, -108); g.quadraticCurveTo(-44, -106, -58, -80); g.quadraticCurveTo(-48, -54, -16, -52); g.quadraticCurveTo(42, -46, 76, -72); g.closePath(); };
  body(); g.fillStyle = skin; g.fill();
  g.save(); body(); g.clip(); g.fillStyle = '#eef4f8'; g.beginPath(); g.ellipse(16, -50, 70, 16, -.06, 0, Math.PI * 2); g.fill(); g.restore(); // white belly
  body(); g.lineWidth = ow(); g.strokeStyle = OUT; g.stroke();
  P([8, -60, -14, -36, 24, -56], dark); // pectoral fin
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-4 + i * 7, -86); g.lineTo(-7 + i * 7, -70); S(2.5, OUT); } // gills
  E(44, -88, 5, 5.5, '#111'); E(45.5, -89.5, 1.7, 1.7, '#fff', false); // eye
  if (p.s === 'special' || p.s === 'hit') {
    E(58, -64, 15, 9, '#5a1028');
    P([46, -71, 49, -64, 52, -71], '#fff', false); P([55, -72, 58, -65, 61, -72], '#fff', false); P([64, -71, 66, -66, 69, -70], '#fff', false);
  } else {
    g.beginPath(); g.moveTo(34, -62); g.quadraticCurveTo(54, -55, 72, -68); S(3, OUT);
    P([40, -61, 43, -55, 46, -60], '#fff', false); P([50, -59, 53, -53, 56, -59], '#fff', false); P([60, -62, 63, -56, 66, -63], '#fff', false);
  }
  g.restore();
}

// Tung Tung Tung Sahur: a kentongan (wooden slit drum) come to life: tall cylindrical log with a carved slit, bulging
// eyes with small pupils, angry brows and a wide grin, thin limbs, and a wooden bat held in his right hand at his side.
export function drawTung(p) {
  const t = p.T, walk = p.s === 'walk' ? Math.sin(t * .35) : 0, bob = p.s === 'idle' ? Math.sin(t * .08) * 1.5 : 0;
  L(-10, -42, -12 + walk * 8, -4, 6, '#8a5a30'); L(10, -42, 12 - walk * 8, -4, 6, '#8a5a30');
  E(-13 + walk * 8, -3, 9, 4, '#5b3a1e'); E(13 - walk * 8, -3, 9, 4, '#5b3a1e');
  L(-22, -88 + bob, -32, -60 + bob, 5, '#8a5a30');
  // The bat is held in the right hand, out at his side (hand at 42,-60). Idle, it stands upright beside him.
  let a = -1.45 + Math.sin(t * .08) * .04;
  if (p.s === 'walk') a = -1.35;
  if (p.s === 'jump') a = -1.6;
  if (p.s === 'block') a = -1.57;
  if (p.s === 'light') a = p.ph === 0 ? -.6 : p.ph === 1 ? 0 : -.3;
  if (p.s === 'heavy') a = p.ph === 0 ? -2.5 : p.ph === 1 ? .55 : .8;
  if (p.s === 'special') a = p.ph === 1 ? -1 + Math.sin(t * .63) * 1.3 : -2.2;
  if (p.s === 'hit') a = -2.4;
  const bat = () => {
    L(24, -78 + bob, 42, -60 + bob, 5, '#8a5a30');
    g.save(); g.translate(42, -60 + bob); g.rotate(a);
    P([0, -4, 92, -10, 92, 10, 0, 4], '#e6c38c'); E(92, 0, 5, 10, '#d1aa70');
    g.beginPath(); g.moveTo(10, -5); g.lineTo(10, 5); g.moveTo(16, -5); g.lineTo(16, 5); S(2, '#a87442'); // grip tape
    g.restore();
  };
  const behind = Math.cos(a) < -.2; // swung back: the bat passes behind the log, never across his face
  if (behind) bat();
  g.save(); g.translate(0, bob);
  R(-27, -142, 54, 104, 16, '#b9834d');
  g.beginPath(); g.moveTo(-14, -128); g.quadraticCurveTo(-20, -90, -12, -50); S(2.5, '#8f5d31'); // wood grain
  g.beginPath(); g.moveTo(16, -60); g.quadraticCurveTo(20, -78, 15, -96); S(2.5, '#8f5d31');
  g.beginPath(); g.moveTo(-22, -46); g.lineTo(22, -46); S(2, '#a87442');
  R(-5, -76, 10, 26, 5, '#4a2c14'); // the drum's carved slit
  E(0, -140, 26, 6, '#e0b278'); E(0, -140, 13, 3, '#c99556', false); // cut log top with rings
  E(-10, -112, 10, 11, '#fff'); E(13, -112, 10, 11, '#fff'); // bulging eyes
  E(-7, -111, 3.5, 4.5, '#111', false); E(16, -111, 3.5, 4.5, '#111', false);
  g.beginPath(); g.moveTo(-19, -128); g.lineTo(-2, -123); g.moveTo(23, -128); g.lineTo(6, -123); S(3, OUT); // angry brows
  g.beginPath(); g.moveTo(-9, -95); g.quadraticCurveTo(3, -84, 16, -95); g.closePath(); g.fillStyle = '#5a1028'; g.fill(); g.lineWidth = ow(); g.strokeStyle = OUT; g.stroke(); // grin
  g.restore();
  if (!behind) bat();
}

// Bombardiro Crocodilo: a crocodile fused with a military bomber. Green scaly crocodile body as the fuselage with a
// crocodile head and toothy jaws in front, olive military wings and tail fin, a cockpit, a propeller engine, and a bomb.
export function drawBombardiro(p) {
  const t = p.T, hov = -26 + Math.sin(t * .1) * 4;
  let lunge = 0, tilt = 0, jaw = .12;
  if (p.s === 'light') jaw = p.ph === 0 ? .5 : p.ph === 1 ? 0 : .2;
  if (p.s === 'heavy') { lunge = p.ph === 1 ? 18 : p.ph === 0 ? -6 : 4; tilt = p.ph === 1 ? .14 : 0; }
  if (p.s === 'special') tilt = -.16;
  if (p.s === 'walk') tilt = .05;
  if (p.s === 'hit') jaw = .4;
  g.save(); g.translate(lunge, hov); g.rotate(tilt);
  P([-30, -60, 14, -60, 2, -82, -40, -80], '#44542c'); // far wing
  P([-48, -56, -72, -96, -56, -96, -40, -58], '#5c6e36'); // tail fin
  E(-6, -55, 56, 21, '#4d8b3a'); // crocodile body
  g.save(); g.beginPath(); g.ellipse(-6, -55, 56, 21, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = '#a8c66c'; g.beginPath(); g.ellipse(-4, -36, 54, 12, 0, 0, Math.PI * 2); g.fill(); g.restore(); // pale belly
  for (let x = -44; x <= 16; x += 12) P([x, -73, x + 5, -80, x + 10, -73], '#3f7530', false); // back scutes
  E(-10, -72, 15, 8, '#9fd6ff'); // cockpit
  g.save(); g.translate(30, -58); g.rotate(jaw);
  R(0, -2, 52, 10, 5, '#3f7530');
  P([8, -2, 11, -8, 14, -2], '#fff', false); P([22, -2, 25, -8, 28, -2], '#fff', false); P([36, -2, 39, -8, 42, -2], '#fff', false);
  g.restore();
  R(28, -74, 62, 16, 8, '#4d8b3a');
  P([36, -58, 39, -52, 42, -58], '#fff', false); P([50, -58, 53, -52, 56, -58], '#fff', false); P([64, -58, 67, -52, 70, -58], '#fff', false);
  E(84, -70, 2, 2, OUT, false); // nostril
  E(40, -78, 9, 8, '#4d8b3a'); E(42, -80, 4.5, 4.5, '#ffde3b'); E(42, -80, 1.3, 3.5, '#111', false); // eye
  if (!(p.s === 'special' && p.ph > 0)) { E(-8, -30, 13, 6, '#2b2b33'); P([-22, -30, -30, -36, -30, -24], '#2b2b33'); } // bomb
  P([-26, -52, 12, -52, -2, -16, -40, -18], '#5c6e36'); // near wing
  R(2, -46, 16, 12, 4, '#6b6b72'); E(19, -40, 2.5, 2.5, '#2b2b33'); // engine and hub
  E(20, -40, 2.5, 14 * Math.abs(Math.sin(t * .9)) + 3, 'rgba(255,255,255,.55)', false); // spinning propeller
  g.restore();
}

// Ballerina Cappuccina: a ballerina with a cappuccino mug for a head (handle, coffee and foam on top, cartoon face),
// pink leotard and layered tutu, pointe shoes with crossed ribbons, arms raised in an arch above her head.
export function drawBallerina(p) {
  const t = p.T, walk = p.s === 'walk' ? Math.sin(t * .45) : 0, bob = p.s === 'idle' ? Math.sin(t * .1) * 2 : 0;
  g.save();
  if (p.s === 'special' && p.ph === 1) { const c = Math.cos(t * .7); g.scale(Math.abs(c) < .25 ? .25 * Math.sign(c || 1) : c, 1); }
  const leg = '#f1c7a5';
  let back = [-8 + walk * 10, 0], front = [8 - walk * 10, 0];
  if (p.s === 'jump') { back = [-26, -26]; front = [26, -26]; }
  if (p.s === 'heavy') front = p.ph === 1 ? [64, -52] : p.ph === 0 ? [14, -30] : [30, -14];
  if (p.s === 'special') { back = [-4, 0]; front = [10, -26]; }
  const foot = ([fx, fy]) => {
    E(fx, fy - 3, 6, 4, '#ff8fc4');
    g.beginPath(); g.moveTo(fx - 4, fy - 6); g.lineTo(fx + 3, fy - 15); g.moveTo(fx + 4, fy - 6); g.lineTo(fx - 3, fy - 15); S(1.6, '#ffc2de'); // ribbons
  };
  L(-4, -54 + bob, back[0], back[1] - 4, 5, leg); foot(back);
  L(4, -54 + bob, front[0], front[1] - 4, 5, leg); foot(front);
  g.translate(0, bob);
  E(0, -52, 42, 7, '#ffc2de'); E(0, -56, 38, 9, '#ff8fc4'); E(0, -59, 30, 6, '#ffc2de'); // layered tutu
  R(-9, -90, 18, 34, 7, '#ff8fc4');
  g.beginPath(); g.moveTo(-8, -86); g.quadraticCurveTo(0, -80, 8, -86); S(1.6, '#ffc2de'); // neckline
  let hand = [34, -150];
  if (p.s === 'light') hand = p.ph === 1 ? [52, -96] : [26, -104];
  if (p.s === 'block') hand = [24, -100];
  g.beginPath(); g.moveTo(-7, -86); g.quadraticCurveTo(-36, -120, -6, -152); S(8, OUT); g.beginPath(); g.moveTo(-7, -86); g.quadraticCurveTo(-36, -120, -6, -152); S(4, leg);
  if (p.s === 'light' || p.s === 'block') L(7, -86, hand[0], hand[1], 4, leg);
  else { g.beginPath(); g.moveTo(7, -86); g.quadraticCurveTo(36, -120, 6, -152); S(8, OUT); g.beginPath(); g.moveTo(7, -86); g.quadraticCurveTo(36, -120, 6, -152); S(4, leg); }
  g.beginPath(); g.arc(-22, -112, 9, Math.PI * .5, Math.PI * 1.5); S(8, OUT); g.beginPath(); g.arc(-22, -112, 9, Math.PI * .5, Math.PI * 1.5); S(4, '#fdfaf5'); // mug handle
  P([-21, -130, 21, -130, 15, -92, -15, -92], '#fdfaf5'); // mug
  g.beginPath(); g.moveTo(-20, -124); g.lineTo(20, -124); S(1.6, '#f3e2c7');
  E(0, -130, 21, 5, '#8a5530'); E(3, -131, 8, 2.5, '#f3e2c7', false); // coffee and foam
  E(-6, -114, 2.6, 3.6, '#222', false); E(8, -114, 2.6, 3.6, '#222', false);
  E(-11, -106, 4, 2.5, 'rgba(255,120,160,.6)', false); E(13, -106, 4, 2.5, 'rgba(255,120,160,.6)', false);
  g.beginPath(); g.arc(1, -106, 5, .2, Math.PI - .2); S(2.5, OUT);
  g.restore();
}
