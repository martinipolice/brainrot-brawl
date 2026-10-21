// Small helpers shared by the renderer, the screens and the fight.
export const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const pad7 = n => String(Math.max(0, Math.round(n))).padStart(7, '0');
export const pickOne = a => a[Math.random() * a.length | 0];
