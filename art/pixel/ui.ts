// HUD pieces (PROMPT.md §4.5): the wood panel with brass corners as a 9-slice, the speech bubble,
// emote pops, and the warm light mask for night windows and lamps.
import { blank, fillCircle, px, set, type Pixmap } from './pixmap.ts';

const UI = {
  A: 'bark-dark',
  B: 'bark',
  C: 'timber',
  D: 'oak',
  E: 'honey',
  s: 'ochre-dark',
  g: 'gold',
  v: 'lantern',
  x: 'cream',
  '0': 'ink',
  '1': 'slate-dark',
  '5': 'bone',
  '4': 'stone-light',
  '3': 'stone',
};

/** 48×48 wood panel; slice at 16 px. Bark frame, oak planks inside, brass corner plates with a rivet. */
export function panel(): Pixmap {
  const p = blank(48, 48, 'bark');
  for (let i = 0; i < 48; i++) {
    set(p, i, 0, 'bark-dark');
    set(p, i, 47, 'bark-dark');
    set(p, 0, i, 'bark-dark');
    set(p, 47, i, 'bark-dark');
  }
  // inner plank field with a highlight on the lit edges and a shadow on the others
  for (let y = 9; y < 39; y++) {
    for (let x = 9; x < 39; x++) {
      let c = 'oak';
      if (y === 9 || x === 9) c = 'bark-dark';
      else if (y === 10 || x === 10) c = 'honey';
      else if (y === 38 || x === 38) c = 'bark-dark';
      else if (y === 37) c = 'timber';
      else if ((y - 10) % 9 === 8) c = 'timber';
      else if ((x + y) % 23 === 0) c = 'timber';
      set(p, x, y, c);
    }
  }
  // brass corner plates
  for (const [cx, cy] of [
    [2, 2],
    [40, 2],
    [2, 40],
    [40, 40],
  ] as const) {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const edge = x === 0 || y === 0 || x === 5 || y === 5;
        set(p, cx + x, cy + y, edge ? (x === 0 || y === 0 ? 'ochre' : 'ochre-dark') : 'lantern');
      }
    }
    set(p, cx + 1, cy + 1, 'cream');
    set(p, cx + 3, cy + 3, 'ink');
  }
  return p;
}
export const PANEL: Pixmap = panel();

/** 24×24 speech bubble; slice at 8 px. */
export const BUBBLE: Pixmap = px(
  `
  ...111111111111111111...
  ..15555555555555555551..
  .15555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555551
  155555555555555555555451
  .1555555555555555555441.
  ..15544444444444444441..
  ...111111111111111111...`,
  UI,
);

export const BUBBLE_TAIL: Pixmap = px(
  `
  15555551
  .155551.
  ..1551..
  ...11...`,
  UI,
);

const EM = {
  r: 'brick',
  R: 'brick-dark',
  p: 'peach',
  g: 'gold',
  v: 'lantern',
  s: 'ochre-dark',
  i: 'water',
  j: 'water-light',
  k: 'foam',
  m: 'mist',
  '1': 'slate-dark',
  '2': 'slate',
  '3': 'stone',
  '4': 'stone-light',
  '5': 'bone',
  '0': 'ink',
  x: 'cream',
};

export const EMOTES: Record<string, Pixmap> = {
  heart: px(
    `
    ................
    ................
    ....RRR..RRR....
    ...RrprRRrrrR...
    ..RrpprrrrrrrR..
    ..RrprrrrrrrrR..
    ..RrrrrrrrrrrR..
    ..RrrrrrrrrrrR..
    ...RrrrrrrrrR...
    ....RrrrrrrR....
    .....RrrrrR.....
    ......RrrR......
    .......RR.......
    ................
    ................
    ................`,
    EM,
  ),
  exclaim: px(
    `
    ................
    ......ssss......
    .....sgvvgs.....
    .....sgvvgs.....
    .....sgvvgs.....
    .....sgvvgs.....
    .....sgvvgs.....
    .....sgvvgs.....
    .....sgvvgs.....
    ......sggs......
    .......ss.......
    ......ssss......
    .....sgvvgs.....
    .....sgvvgs.....
    ......ssss......
    ................`,
    EM,
  ),
  question: px(
    `
    ................
    .....iiiiii.....
    ....ijkkkjii....
    ...iijiiiijji...
    ...iji....ijji..
    ..........ijji..
    .........ijji...
    ........ijji....
    .......ijji.....
    .......iji......
    .......iii......
    ................
    .......iii......
    ......ijjji.....
    .......iii......
    ................`,
    EM,
  ),
  zzz: px(
    `
    ..........mmmmm.
    ..........mkkkm.
    ...........mkm..
    ..........mkm...
    .........mkm....
    .........mkkkm..
    .........mmmmm..
    ....mmmmm.......
    ....mkkkm.......
    .....mkm........
    ....mkm.........
    ...mkm..........
    ...mkkkm........
    ...mmmmm........
    ................
    ................`,
    EM,
  ),
  gear: px(
    `
    ................
    ......1111......
    ...11.1441.11...
    ...1414444141...
    ....14433441....
    ..1144322344111.
    ..1443222234411.
    ..1443222234411.
    ..1144322344111.
    ....14433441....
    ...1414444141...
    ...11.1441.11...
    ......1111......
    ................
    ................
    ................`,
    EM,
  ),
  letter: px(
    `
    ................
    ................
    ................
    ..111111111111..
    ..155555555551..
    ..154555555451..
    ..155455554551..
    ..155545545551..
    ..155554455551..
    ..155555555551..
    ..155555555551..
    ..155555555551..
    ..1555rr555551..
    ..111111111111..
    ................
    ................`,
    EM,
  ),
};

/** 48×48 warm radial light mask for additive blending at night (three palette steps, no gradient). */
export function lightMask(): Pixmap {
  const p = blank(48, 48);
  fillCircle(p, 24, 24, 23, 'ochre@40');
  fillCircle(p, 24, 24, 17, 'gold@70');
  fillCircle(p, 24, 24, 10, 'lantern@110');
  fillCircle(p, 24, 24, 4, 'cream@160');
  return p;
}

/** A dotted 16×16 selection ring for the hovered agent. */
export function ring(): Pixmap {
  const p = blank(16, 16);
  for (let i = 0; i < 16; i += 2) {
    set(p, i, 0, 'cream');
    set(p, i + 1, 15, 'cream');
    set(p, 0, i + 1, 'cream');
    set(p, 15, i, 'cream');
  }
  return p;
}
