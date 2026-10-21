// World coordinates stay 960x540; everything is drawn at 1/PX scale and upscaled with nearest-neighbour.
export const W = 960, H = 540, GROUND = 468, OUT = '#1a1024', PX = 3, LW = W / PX, LH = H / PX;
export const STEP = 1000 / 60; // one 60 Hz frame in ms
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
