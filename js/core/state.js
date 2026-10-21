// ---------- game state ----------
// Which screen is showing, the match in progress, pause, and the frame counter. ES modules cannot assign to an
// imported binding, so other modules change these through the setters.
export let game = null, ui = 'title', paused = false, tick = 0;
export const setGame = v => { game = v; }, setUi = v => { ui = v; }, setPaused = v => { paused = v; }, setTick = v => { tick = v; };
