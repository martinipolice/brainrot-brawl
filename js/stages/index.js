import beach from './beach.js';
import village from './village.js';
import airfield from './airfield.js';
import opera from './opera.js';
import pier from './pier.js';
import storm from './storm.js';

// Every stage. A stage paints its backdrop once (paint, in world units with the shape helpers), may draw cheap
// per-frame details (ambient, straight onto the 320x180 canvas) and props that move (props(st, i), world shapes kept
// inside boxes[i], put through the pixel pass), and may react to the fight (on: 'wall', 'big', 'combo', 'ko', 'round';
// tick runs every 60 Hz step). Reactions are cosmetic only: they never change damage or position, and stage code never
// calls Math.random, so the fight's random rolls stay the same on every stage. home names the fighter whose stage it is;
// boss marks the shadow boss's stage, which random picks leave out.
export const STAGES = [beach, village, airfield, opera, pier, storm];
export const stageById = id => STAGES.find(s => s.id === id) || beach;
