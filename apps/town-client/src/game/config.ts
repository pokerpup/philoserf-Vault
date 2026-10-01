// Scene constants with names (CLAUDE.md: no magic numbers in scenes). Timings in ms, speeds px/s.
export const ASSETS = 'assets/tallyford';
export const TILESET_NAME = 'tallyford';
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;

export const DEPTH = {
  ground: 0,
  edges: 1,
  water: 2,
  objects: 3,
  buildings: 4,
  actors: 10,
  above: 20,
  labels: 30,
  night: 50,
  lights: 51,
  bubbles: 60,
} as const;

export const WATER_FRAME_MS = 650;
export const WALK_SPEED = 28;
export const WALK_FPS = 8;
export const WANDER_PAUSE_MS: [number, number] = [1800, 5200];
export const BUBBLE_MS = 6500;
export const BUBBLE_LINE_CHARS = 20;
export const BUBBLE_MAX_LINES = 3;
export const EMOTE_MS = 2400;
export const CAMERA_PAN_SPEED = 180;

/** §4.3: night is one blue-violet overlay at 55%; dusk 18:00–21:00, dawn 05:00–07:00. */
export const NIGHT = {
  color: 0x3b2a4f,
  max: 0.55,
  duskFrom: 18 * 60,
  duskTo: 21 * 60,
  dawnFrom: 5 * 60,
  dawnTo: 7 * 60,
} as const;
export const FIRM_GLOW_ALPHA = 0.55;
