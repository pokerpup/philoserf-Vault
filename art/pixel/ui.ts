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

/**
 * 48×48 wood panel; slice at 16 px. A bark frame with grain, a bevel, brass corner plates with a
 * rivet and a dark leather field inside so cream text keeps its contrast.
 */
export function panel(): Pixmap {
  const p = blank(48, 48, 'bark');
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      if ((x * 7 + y * 3) % 17 === 0) set(p, x, y, 'timber');
      if ((x * 5 + y * 11) % 23 === 0) set(p, x, y, 'bark-dark');
    }
  }
  for (let i = 0; i < 48; i++) {
    set(p, i, 0, 'bark-dark');
    set(p, i, 47, 'bark-dark');
    set(p, 0, i, 'bark-dark');
    set(p, 47, i, 'bark-dark');
    set(p, i, 1, 'timber');
    set(p, 1, i, 'timber');
    set(p, i, 46, 'ink');
    set(p, 46, i, 'ink');
  }
  // the field: dark leather with a faint grain and an inner bevel
  for (let y = 9; y < 39; y++) {
    for (let x = 9; x < 39; x++) {
      let c = 'bark-dark';
      if ((x * 3 + y * 7) % 13 === 0) c = 'ink';
      if (y === 9 || x === 9) c = 'ink';
      else if (y === 10 || x === 10) c = 'ochre-dark';
      else if (y === 38 || x === 38) c = 'timber';
      set(p, x, y, c);
    }
  }
  // brass corner plates
  for (const [cx, cy] of [
    [2, 2],
    [39, 2],
    [2, 39],
    [39, 39],
  ] as const) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        set(p, cx + x, cy + y, edge ? (x === 0 || y === 0 ? 'lantern' : 'ochre-dark') : 'gold');
      }
    }
    set(p, cx + 1, cy + 1, 'cream');
    set(p, cx + 2, cy + 1, 'cream');
    set(p, cx + 1, cy + 2, 'cream');
    set(p, cx + 3, cy + 3, 'ink');
    set(p, cx + 4, cy + 4, 'ochre-dark');
  }
  return p;
}
export const PANEL: Pixmap = panel();

/** 24×24 parchment speech bubble; slice at 8 px, with an inner rule and a soft drop shadow. */
export const BUBBLE: Pixmap = px(
  `
  ...1111111111111111.....
  ..155555555555555551....
  .15xxxxxxxxxxxxxxxx51...
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51..
  15xxxxxxxxxxxxxxxxxx51z.
  15xxxxxxxxxxxxxxxxxw51z.
  .15xxxxxxxxxxxxxxxww51z.
  ..155wwwwwwwwwwwwww51zz.
  ...1111111111111111zzz..
  ....zzzzzzzzzzzzzzzzz...`,
  { ...UI, x: 'cream', w: 'sand-light', '1': 'ochre-dark', z: 'ink@70' },
);

export const BUBBLE_TAIL: Pixmap = px(
  `
  1xxxxxx1
  .1xxxx1z
  ..1xx1z.
  ...11z..`,
  { x: 'cream', '1': 'ochre-dark', z: 'ink@70' },
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
