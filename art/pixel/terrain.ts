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

const G = { d: 'grass', e: 'grass-light', c: 'moss', f: 'meadow', b: 'pine' };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Grass with the dense, low-contrast blade texture a meadow needs to read as soft rather than
 * flat: "v" blades and short strokes in the light shade, a few dark tufts, a rare bright tip.
 */
function grassTile(seed: number): Pixmap {
  const p = blank(16, 16, 'grass');
  const rnd = mulberry32(seed);
  const at = () => [Math.floor(rnd() * 16), Math.floor(rnd() * 16)] as const;
  for (let i = 0; i < 7; i++) {
    const [x, y] = at();
    if (rnd() < 0.5) {
      set(p, x, y, 'grass-light');
      set(p, x + 2, y, 'grass-light');
      set(p, x + 1, y + 1, 'grass-light');
    } else {
      set(p, x, y, 'grass-light');
      set(p, x, y + 1, 'grass-light');
    }
  }
  for (let i = 0; i < 6; i++) {
    const [x, y] = at();
    set(p, x, y, 'moss');
    if (rnd() < 0.6) set(p, x + 1, y + 1, 'moss');
  }
  for (let i = 0; i < 2; i++) {
    const [x, y] = at();
    set(p, x, y, 'pine');
  }
  if (rnd() < 0.7) {
    const [x, y] = at();
    set(p, x, y, 'meadow');
  }
  return p;
}

export const GRASS: Pixmap[] = Array.from({ length: 8 }, (_, i) => grassTile(101 + i));

/** Rare ground decals laid on grass: a clover patch, a few pebbles, a worn bare patch. */
export const GRASS_DECALS: Pixmap[] = [
  blit(
    grassTile(201),
    px(
      `
      ................
      ................
      ....c.c.........
      ...cbcbc........
      ....c.c...c.c...
      .........cbcbc..
      ..........c.c...
      ................
      ......c.c.......
      .....cbcbc......
      ......c.c.......
      ..c.c...........
      .cbcbc..........
      ..c.c...........
      ................
      ................`,
      G,
    ),
    0,
    0,
  ),
  blit(
    grassTile(202),
    px(
      `
      ................
      ................
      ................
      ......44........
      ......33........
      ................
      ...........4....
      ..........433...
      ................
      ...44...........
      ...33...........
      ................
      ..........44....
      ..........33....
      ................
      ................`,
      { '4': 'stone-light', '3': 'stone' },
    ),
    0,
    0,
  ),
  blit(
    grassTile(203),
    px(
      `
      ................
      ................
      ................
      ......cccc......
      ....ccEEEEcc....
      ...cEEEEDEEEc...
      ...cEEDEEEEEc...
      ...cEEEEEEDEc...
      ....cEEEEEEc....
      .....ccEEcc.....
      .......cc.......
      ................
      ................
      ................
      ................
      ................`,
      { c: 'moss', E: 'honey', D: 'oak' },
    ),
    0,
    0,
  ),
];

const DIRT = { E: 'honey', D: 'oak', F: 'straw', C: 'timber', '4': 'stone-light', '3': 'stone' };
function dirtTile(seed: number): Pixmap {
  const p = blank(16, 16, 'honey');
  const rnd = mulberry32(seed);
  const at = () => [Math.floor(rnd() * 16), Math.floor(rnd() * 16)] as const;
  for (let i = 0; i < 6; i++) {
    const [x, y] = at();
    set(p, x, y, 'oak');
    if (rnd() < 0.5) set(p, x + 1, y, 'oak');
  }
  for (let i = 0; i < 3; i++) {
    const [x, y] = at();
    set(p, x, y, 'straw');
  }
  for (let i = 0; i < 2; i++) {
    const [x, y] = at();
    set(p, x, y, 'stone-light');
    set(p, x + 1, y, 'stone-light');
    set(p, x, y + 1, 'stone');
    set(p, x + 1, y + 1, 'stone');
  }
  return p;
}
export const DIRT_FILL: Pixmap[] = [dirtTile(301), dirtTile(302), dirtTile(303)];
export const _dirtLegend = DIRT;

/**
 * River water: a periodic diagonal depth band so tiles join seamlessly, and wave crests that
 * slide one pixel per frame. Three frames cycle a → b → c.
 */
function waterTile(frame: number, variant: number): Pixmap {
  const p = blank(16, 16, 'water');
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) if ((x + y + variant * 5) % 16 < 2) set(p, x, y, 'river');
  const crests: [number, number, number][] =
    variant === 0
      ? [
          [2, 3, 4],
          [9, 7, 3],
          [4, 12, 4],
          [12, 14, 2],
        ]
      : [
          [6, 2, 3],
          [1, 8, 4],
          [11, 10, 3],
          [7, 15, 2],
        ];
  for (const [cx, cy, len] of crests) {
    const x0 = (cx + frame) % 16;
    for (let i = 0; i < len; i++) set(p, (x0 + i) % 16, cy, 'water-light');
    set(p, (x0 + len) % 16, cy, 'foam');
  }
  return p;
}
export const WATER_FILL: [Pixmap, Pixmap, Pixmap] = [
  waterTile(0, 0),
  waterTile(1, 0),
  waterTile(2, 0),
];
export const WATER_FILL_B: [Pixmap, Pixmap, Pixmap] = [
  waterTile(0, 1),
  waterTile(1, 1),
  waterTile(2, 1),
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

export function water(mask: number, frame: 0 | 1 | 2, variant = 0): Pixmap {
  const fills = variant % 2 ? WATER_FILL_B : WATER_FILL;
  return autotile(fills[frame], mask, WATER_EDGE, variant);
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

/**
 * Cobbles: irregular stones packed in rows with a slate grout, each stone with a lit corner and a
 * shaded foot; three variants, and a mossy one for old courtyards.
 */
export function cobble(variant = 0, moss = false): Pixmap {
  const p = blank(16, 16, 'slate');
  const rnd = mulberry32(401 + variant);
  let y = -Math.floor(rnd() * 2);
  while (y < 16) {
    const h = 2 + Math.floor(rnd() * 2);
    let x = -Math.floor(rnd() * 3);
    while (x < 16) {
      const w = 3 + Math.floor(rnd() * 3);
      const roll = rnd();
      const body = roll < 0.62 ? 'stone-light' : roll < 0.95 ? 'stone' : 'bone';
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(p, i, j, body);
      set(p, x, y, body === 'bone' ? 'bone' : 'bone');
      for (let i = x; i < x + w; i++)
        set(
          p,
          i,
          y + h - 1,
          body === 'stone-light' ? 'stone' : body === 'stone' ? 'slate' : 'stone-light',
        );
      set(p, x + w - 1, y + h - 1, 'slate');
      x += w + 1;
    }
    y += h + 1;
  }
  if (moss)
    for (let i = 0; i < 16 * 16; i++)
      if (p.px[i] === 'slate' && (i * 7919 + variant) % 5 === 0) p.px[i] = 'moss';
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
