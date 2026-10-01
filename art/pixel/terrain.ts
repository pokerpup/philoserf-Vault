// Ground tiles: grass, dirt paths and water edges as 4-bit autotiles, cobbles, tilled soil, sand,
// cliffs, planks. Top-down 3/4 view, light from the upper left (GAME-LAYER.md §5).
import {
  blank,
  blit,
  clone,
  flipH,
  flipV,
  get,
  px,
  rotCCW,
  rotCW,
  set,
  type Pixmap,
} from './pixmap.ts';

const G = { d: 'grass', e: 'grass-light', c: 'moss', f: 'meadow' };

export const GRASS: Pixmap[] = [
  px(
    `
    dddddddddddddddd
    ddddddddddddeddd
    dddcdddddddeeddd
    dddddddddddddddd
    dddddddeddddddcd
    ddddddeedddddddd
    dddddddddddddddd
    dcdddddddddddddd
    ddddddddddcddddd
    dddddddddddddddd
    ddddeddddddddddd
    dddeedddddddcddd
    dddddddddddddddd
    ddddddddddeddddd
    ddcddddddddddddd
    dddddddddddddddd`,
    G,
  ),
  px(
    `
    dddddddddddddddd
    dddddddddddddddd
    ddddddddeddddddd
    dddcddddeddddddd
    dddddddddddddcdd
    dddddddddddddddd
    dedddddddddddddd
    deddddddddcddddd
    dddddddddddddddd
    ddddddddddddeedd
    ddddcddddddddedd
    dddddddddddddddd
    dddddddedddddddd
    dddddddddddddddd
    dddddddddddcdddd
    ddeddddddddddddd`,
    G,
  ),
  px(
    `
    dddddddddddddddd
    dddddddddddddddd
    ddddddcddddddddd
    dddddddddddddddd
    dddddddddddeeddd
    dddddddddddddddd
    ddddddddddddddcd
    dddddddddddddddd
    ddeddddddddddddd
    dddddddddcdddddd
    dddddddddddddddd
    dddddddddddddddd
    ddddddddddddeddd
    dddcdddddddddddd
    dddddddddddddddd
    dddddddeeddddddd`,
    G,
  ),
];

const DIRT = { E: 'honey', D: 'oak', F: 'straw', C: 'timber' };
export const DIRT_FILL: Pixmap[] = [
  px(
    `
    EEEEEEEEEEEEEEEE
    EEEEDEEEEEEEEEEE
    EEEEEEEEEEEEFEEE
    EEEEEEEEEEEEEEEE
    EEEEEEEEDDEEEEEE
    EFEEEEEEEEEEEEEE
    EEEEEEEEEEEEEEDE
    EEEEEEEEEEEEEEEE
    EEEEEEDEEEEEEEEE
    EEEEEEEEEEEFEEEE
    EEEEEEEEEEEEEEEE
    EEDEEEEEEEEEEEEE
    EEEEEEEEEEEDDEEE
    EEEEEEEEEEEEEEEE
    EEEEEEEFEEEEEEEE
    EEEEEEEEEEEEEEEE`,
    DIRT,
  ),
  px(
    `
    EEEEEEEEEEEEEEEE
    EEEEEEEEEEEDEEEE
    EEFEEEEEEEEEEEEE
    EEEEEEEEEEEEEEEE
    EEEEEEEEEEEEEEEE
    EEEEEDEEEEEEEFEE
    EEEEEEEEEEEEEEEE
    EEEEEEEEEDDEEEEE
    EEEEEEEEEEEEEEEE
    EDEEEEEEEEEEEEEE
    EEEEEEEEEEEEEEEE
    EEEEEEEFEEEEEEEE
    EEEEEEEEEEEEEEDE
    EEEEDEEEEEEEEEEE
    EEEEEEEEEEEEEEEE
    EEEEEEEEEEFEEEEE`,
    DIRT,
  ),
];

const W = { i: 'water', j: 'water-light', k: 'foam', h: 'river' };
export const WATER_FILL: [Pixmap, Pixmap] = [
  px(
    `
    iiiiiiiiiiiiiiii
    iiijjiiiiiiiiiii
    iiiiiiiiiiiijjii
    iiiiiiiiiiiiiiii
    iiiiiiiikkiiiiii
    iiiiiiiiiiiiiiii
    ihiiiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiihi
    iiiiijjjiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiikkki
    iihiiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiiii`,
    W,
  ),
  px(
    `
    iiiiiiiiiiiiiiii
    iiiijjiiiiiiiiii
    iiiiiiiiiiiiijji
    iiiiiiiiiiiiiiii
    iiiiiiiiikkiiiii
    iiiiiiiiiiiiiiii
    iihiiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiiih
    iiiiiijjjiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiikkk
    iiihiiiiiiiiiiii
    iiiiiiiiiiiiiiii
    iiiiiiiiiiiiiiii`,
    W,
  ),
];

// ---- 4-bit autotiles ------------------------------------------------------------------------
// Bits: N=1 E=2 S=4 W=8 are set when the neighbour is the same material. A missing side gets an
// organic cut (the ground below shows through) and, on the lit sides, a one-pixel rim.

export const N = 1;
export const E = 2;
export const S = 4;
export const WEST = 8;

const CUT = 'CUT';
const RIM = 'RIM';
const RIM2 = 'RIM2';

/** The north edge: columns cut down to `profile[c]` rows, a rim on the next row, flecks after. */
function northMask(profile: number[], flecks: number[]): Pixmap {
  const m = blank(16, 16);
  for (let x = 0; x < 16; x++) {
    const b = profile[x]!;
    for (let y = 0; y < b; y++) set(m, x, y, CUT);
    set(m, x, b, RIM);
    if (flecks.includes(x)) set(m, x, b + 1, RIM2);
  }
  return m;
}

const PROFILES: [number[], number[]][] = [
  [
    [2, 2, 1, 1, 1, 2, 2, 3, 3, 2, 1, 1, 2, 2, 2, 2],
    [3, 9, 14],
  ],
  [
    [1, 2, 2, 3, 2, 1, 1, 1, 2, 2, 3, 3, 2, 2, 1, 1],
    [0, 6, 12],
  ],
];

function applyMask(base: Pixmap, mask: Pixmap, rim: string | null, rim2: string | null): Pixmap {
  const out = clone(base);
  for (let i = 0; i < out.px.length; i++) {
    const t = mask.px[i];
    if (t === CUT) out.px[i] = null;
    else if (t === RIM) out.px[i] = rim ?? out.px[i]!;
    else if (t === RIM2) out.px[i] = rim2 ?? out.px[i]!;
  }
  return out;
}

export interface EdgeStyle {
  /** Rim colour on the north and west (shadow) sides; null for none. */
  rimLit: string | null;
  /** Rim colour on the south and east sides. */
  rimShade: string | null;
  fleck: string | null;
}

/** Cut the missing sides of `fill` for a 4-bit neighbour mask. */
export function autotile(fill: Pixmap, mask: number, style: EdgeStyle, variant = 0): Pixmap {
  const [profile, flecks] = PROFILES[variant % PROFILES.length]!;
  const north = northMask(profile, flecks);
  let out = clone(fill);
  if (!(mask & N)) out = applyMask(out, north, style.rimLit, style.fleck);
  if (!(mask & WEST)) out = applyMask(out, rotCCW(north), style.rimLit, style.fleck);
  if (!(mask & S)) out = applyMask(out, flipV(north), style.rimShade, style.fleck);
  if (!(mask & E)) out = applyMask(out, rotCW(north), style.rimShade, style.fleck);
  return out;
}

export const DIRT_EDGE: EdgeStyle = { rimLit: 'oak', rimShade: null, fleck: null };
export const WATER_EDGE: EdgeStyle = { rimLit: 'river', rimShade: 'river', fleck: 'foam' };
export const SAND_EDGE: EdgeStyle = { rimLit: 'gold', rimShade: null, fleck: null };

export function dirt(mask: number, variant = 0): Pixmap {
  return autotile(DIRT_FILL[variant % DIRT_FILL.length]!, mask, DIRT_EDGE, variant);
}

export function water(mask: number, frame: 0 | 1, variant = 0): Pixmap {
  return autotile(WATER_FILL[frame], mask, WATER_EDGE, variant);
}

export const SAND = px(
  `
  wwwwwwwwwwwwwwww
  wwwwwwwwwuwwwwww
  wwwxwwwwwwwwwwww
  wwwwwwwwwwwwwwww
  wwwwwwwwwwwwwuww
  wwwwwwuwwwwwwwww
  wwwwwwwwwwwwwwww
  wwwwwwwwwwxwwwww
  wwwwwwwwwwwwwwww
  wuwwwwwwwwwwwwww
  wwwwwwwwwwwwwwww
  wwwwwwwwwwwwwuww
  wwwwwxwwwwwwwwww
  wwwwwwwwwwwwwwww
  wwwwwwwwwwuwwwww
  wwwwwwwwwwwwwwww`,
  { w: 'sand-light', u: 'gold', x: 'cream' },
);

export function sand(mask: number, variant = 0): Pixmap {
  return autotile(SAND, mask, SAND_EDGE, variant);
}

/** Cobbles: offset rows of rounded stones with a slate grout, a bone glint on each stone's lit corner. */
export function cobble(variant = 0): Pixmap {
  const p = blank(16, 16, 'slate');
  const dark =
    variant === 0
      ? [
          [0, 2],
          [2, 1],
          [1, 3],
        ]
      : [
          [1, 0],
          [3, 2],
          [0, 3],
        ];
  for (let band = 0; band < 4; band++) {
    const off = (band % 2) * 2;
    for (let s = -1; s < 5; s++) {
      const x0 = s * 4 + off;
      const y0 = band * 4;
      const isDark = dark.some(([sx, sy]) => sx === (s + 4) % 4 && sy === band);
      const body = isDark ? 'stone' : 'stone-light';
      for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 3; x++) set(p, x, y, body);
      set(p, x0, y0, 'bone');
      set(p, x0 + 2, y0 + 2, isDark ? 'slate' : 'stone');
    }
  }
  return p;
}

/** Tilled soil: horizontal furrows, the ridge lit from above. */
export const TILLED: Pixmap = px(
  `
  CBBBBBBBBBBBBBBB
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  CCCCCCCCCCCCCCCC
  BBBBBBBBBBBBBBBB
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  CCCCCCCCCCCCCCCC
  BBBBBBBBBBBBBBBB
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  CCCCCCCCCCCCCCCC
  BBBBBBBBBBBBBBBB
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  CCCCCCCCCCCCCCCC`,
  { A: 'bark-dark', B: 'bark', C: 'timber' },
);
export const TILLED_WET: Pixmap = px(
  `
  BAAAAAAAAAAAAAAA
  AAAAAAAAAAAAAAAA
  0000000000000000
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  AAAAAAAAAAAAAAAA
  0000000000000000
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  AAAAAAAAAAAAAAAA
  0000000000000000
  BBBBBBBBBBBBBBBB
  AAAAAAAAAAAAAAAA
  AAAAAAAAAAAAAAAA
  0000000000000000
  BBBBBBBBBBBBBBBB`,
  { '0': 'ink', A: 'bark-dark', B: 'bark' },
);

/** A seedling on tilled soil (farm flavour until Phase 6 grows real crops). */
export const SPROUT: Pixmap = px(
  `
  ................
  ................
  ................
  ................
  ................
  .......e........
  ......ded.......
  ......cd........
  .......d........
  .......c........
  ................
  ................
  ................
  ................
  ................
  ................`,
  G,
);

/** Cliff faces for the Highlands: a grass lip, blocky rock, a shadowed foot. */
export const CLIFF_TOP: Pixmap = px(
  `
  dddddddddddddddd
  ddcccddddcccdddd
  cc111cccc111cccc
  1444431444443144
  1444431444443144
  1333321333332133
  3122223122223122
  4431444443144444
  4431444443144444
  3321333332133333
  2231222223122222
  1444431444443144
  1444431444443144
  1333321333332133
  2122223122223122
  4431444443144444`,
  { d: 'grass', c: 'moss', '1': 'slate-dark', '2': 'slate', '3': 'stone', '4': 'stone-light' },
);
export const CLIFF_BOTTOM: Pixmap = px(
  `
  4431444443144444
  3321333332133333
  2231222223122222
  1444431444443144
  1333331333332133
  1333321333332133
  2122223122223122
  3321333332133333
  2231222223122222
  2222222222222222
  1111111111111111
  0000000000000000
  cdddddcdddddcddd
  dddddddddddddddd
  dddddddddddddddd
  dddddddddddddddd`,
  {
    d: 'grass',
    c: 'moss',
    '0': 'ink',
    '1': 'slate-dark',
    '2': 'slate',
    '3': 'stone',
    '4': 'stone-light',
  },
);
/** Steps cut into the cliff; two tiles tall like the face. */
export const CLIFF_STAIRS_TOP: Pixmap = px(
  `
  dddddddddddddddd
  ddcccddddcccdddd
  cc11111111111ccc
  1444444444444414
  1333333333333314
  1222222222222213
  1444444444444412
  1333333333333314
  1222222222222214
  1444444444444413
  1333333333333312
  1222222222222214
  1444444444444414
  1333333333333313
  1222222222222212
  1444444444444414`,
  { d: 'grass', c: 'moss', '1': 'slate-dark', '2': 'slate', '3': 'stone', '4': 'stone-light' },
);
export const CLIFF_STAIRS_BOTTOM: Pixmap = px(
  `
  1333333333333314
  1222222222222213
  1444444444444412
  1333333333333314
  1222222222222214
  1444444444444413
  1333333333333312
  1222222222222214
  1444444444444414
  1333333333333313
  1111111111111112
  0000000000000000
  cdddddcdddddcddd
  dddddddddddddddd
  dddddddddddddddd
  dddddddddddddddd`,
  {
    d: 'grass',
    c: 'moss',
    '0': 'ink',
    '1': 'slate-dark',
    '2': 'slate',
    '3': 'stone',
    '4': 'stone-light',
  },
);

/** Dock and bridge planks, running east–west; nails in ink. */
export const PLANKS: Pixmap = px(
  `
  EDDDDDDDDDDDDDDD
  DDDDDDDDDDDDDDDD
  D0DDDDDDDDDDD0DD
  CCCCCCCCCCCCCCCC
  EDDDDDDDDDDDDDDD
  DDDDDDDDDDDDDDDD
  DDDDDD0DDDDDDDDD
  CCCCCCCCCCCCCCCC
  EDDDDDDDDDDDDDDD
  DDDDDDDDDDDDDDDD
  D0DDDDDDDDDDD0DD
  CCCCCCCCCCCCCCCC
  EDDDDDDDDDDDDDDD
  DDDDDDDDDDDDDDDD
  DDDDDD0DDDDDDDDD
  CCCCCCCCCCCCCCCC`,
  { '0': 'ink', C: 'timber', D: 'oak', E: 'honey' },
);
/** Planks running north–south (a pier reaching into the river). */
export const PLANKS_NS: Pixmap = rotCW(PLANKS);
/** The end of a broken bridge: splintered planks over nothing. */
export const PLANKS_BROKEN: Pixmap = px(
  `
  EDDDDDDDDD......
  DDDDDDDD........
  D0DDDDDDDDD.....
  CCCCCCCCC.......
  EDDDDDD.........
  DDDDDDDDDD......
  DDDDDD0DD.......
  CCCCCCCC........
  EDDDDDDDDDDD....
  DDDDDDDDD.......
  D0DDDDDD........
  CCCCCCCCCC......
  EDDDDDD.........
  DDDDDDDDDDD.....
  DDDDDD0DDDD.....
  CCCCCCCCC.......`,
  { '0': 'ink', C: 'timber', D: 'oak', E: 'honey' },
);

/** Shadow a plank tile casts on the water to its south (east–west pier). */
export function pierShadow(onto: Pixmap): Pixmap {
  const out = clone(onto);
  for (let x = 0; x < 16; x++)
    for (let y = 0; y < 2; y++) if (get(out, x, y)) set(out, x, y, 'river-deep');
  return out;
}

/** Helpers used by the map builder for the rarely-needed fills. */
export const SOLID = {
  grass: (v: number) => GRASS[v % GRASS.length]!,
  dirt: (v: number) => DIRT_FILL[v % DIRT_FILL.length]!,
};

export const _internal = { blit, flipH };
