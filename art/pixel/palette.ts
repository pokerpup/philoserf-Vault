// The shared 48-colour warm palette (PROMPT.md §4.3, GAME-LAYER.md §5 rule 2): eight ramps of six,
// hue-shifted toward orange in the highlights and blue in the shadows; no pure black or white.
// art/palette.gpl is generated from this file by `pnpm art:build`; `pnpm art:qa` reads the .gpl.

export type Rgb = readonly [number, number, number];

export const PALETTE: Readonly<Record<string, Rgb>> = {
  // greens — leaves and grass
  'deep-pine': [31, 59, 37],
  pine: [47, 93, 50],
  moss: [74, 138, 58],
  grass: [108, 176, 74],
  'grass-light': [155, 210, 94],
  meadow: [211, 236, 138],
  // browns — wood, soil, hair
  'bark-dark': [46, 26, 18],
  bark: [90, 52, 32],
  timber: [138, 90, 43],
  oak: [184, 130, 63],
  honey: [216, 168, 92],
  straw: [240, 212, 154],
  // greys — stone, slate, ink
  ink: [21, 18, 28],
  'slate-dark': [58, 53, 69],
  slate: [98, 92, 110],
  stone: [142, 138, 153],
  'stone-light': [188, 185, 194],
  bone: [238, 233, 224],
  // blues — water and night
  'river-deep': [28, 42, 77],
  river: [40, 69, 122],
  water: [59, 111, 176],
  'water-light': [90, 160, 216],
  foam: [143, 208, 236],
  mist: [212, 240, 248],
  // reds and oranges — roofs, brick, ember
  wine: [92, 31, 36],
  'brick-dark': [143, 47, 46],
  brick: [192, 69, 58],
  terracotta: [224, 106, 70],
  ember: [240, 154, 98],
  peach: [251, 201, 140],
  // yellows and creams — plaster, sand, light
  'ochre-dark': [122, 90, 32],
  ochre: [176, 138, 48],
  gold: [224, 184, 60],
  lantern: [245, 216, 102],
  'sand-light': [248, 232, 168],
  cream: [255, 247, 220],
  // skin — three tones, two shades each
  umber: [107, 63, 42],
  sienna: [154, 100, 66],
  tan: [201, 138, 94],
  'warm-tan': [232, 178, 138],
  fair: [244, 207, 174],
  'fair-light': [253, 227, 204],
  // accents — plum and teal
  'plum-dark': [59, 42, 79],
  plum: [106, 76, 138],
  lavender: [169, 138, 208],
  'teal-dark': [31, 90, 92],
  teal: [63, 154, 148],
  mint: [143, 216, 200],
};

export const PALETTE_NAMES = Object.keys(PALETTE);

/** A 5-step ramp, darkest first: index 0 is the outline shade, 3 the main body, 4 the highlight. */
export type Ramp = readonly [string, string, string, string, string];

export const RAMPS = {
  // walls
  plaster: ['bark', 'ochre', 'honey', 'sand-light', 'cream'],
  whitewash: ['slate-dark', 'slate', 'stone', 'stone-light', 'bone'],
  brick: ['wine', 'brick-dark', 'brick', 'terracotta', 'ember'],
  stone: ['ink', 'slate-dark', 'slate', 'stone', 'stone-light'],
  planks: ['bark-dark', 'bark', 'timber', 'oak', 'honey'],
  'red-wood': ['wine', 'brick-dark', 'brick', 'terracotta', 'peach'],
  // roofs
  'red-shingle': ['wine', 'brick-dark', 'brick', 'terracotta', 'ember'],
  slate: ['ink', 'slate-dark', 'slate', 'stone', 'stone-light'],
  thatch: ['bark-dark', 'ochre-dark', 'ochre', 'gold', 'lantern'],
  'green-shingle': ['deep-pine', 'pine', 'moss', 'grass', 'grass-light'],
  'teal-shingle': ['ink', 'teal-dark', 'teal', 'mint', 'mist'],
  'plum-shingle': ['ink', 'plum-dark', 'plum', 'lavender', 'mist'],
  'gold-shingle': ['ochre-dark', 'ochre', 'gold', 'lantern', 'cream'],
  terracotta: ['brick-dark', 'brick', 'terracotta', 'ember', 'peach'],
  'dark-wood': ['ink', 'bark-dark', 'bark', 'timber', 'oak'],
  // misc
  frame: ['bark-dark', 'bark', 'timber', 'oak', 'honey'],
  iron: ['ink', 'ink', 'slate-dark', 'slate', 'stone'],
  brass: ['ochre-dark', 'ochre', 'gold', 'lantern', 'cream'],
  leaf: ['deep-pine', 'pine', 'moss', 'grass', 'grass-light'],
} as const satisfies Record<string, Ramp>;
export type RampName = keyof typeof RAMPS;

/** Skin: [shadow, main, highlight]. */
export const SKIN = {
  fair: ['warm-tan', 'fair', 'fair-light'],
  tan: ['sienna', 'tan', 'warm-tan'],
  umber: ['bark-dark', 'umber', 'sienna'],
} as const;
export type SkinName = keyof typeof SKIN;

/** Hair and cloth: [shadow, main, highlight]. */
export const TRIO = {
  'hair-black': ['ink', 'slate-dark', 'slate'],
  'hair-brown': ['bark-dark', 'bark', 'timber'],
  'hair-chestnut': ['bark', 'timber', 'oak'],
  'hair-blonde': ['ochre', 'gold', 'lantern'],
  'hair-red': ['wine', 'brick', 'terracotta'],
  'hair-grey': ['slate', 'stone', 'stone-light'],
  'hair-white': ['stone', 'stone-light', 'bone'],
  'hair-plum': ['plum-dark', 'plum', 'lavender'],
  'hair-teal': ['teal-dark', 'teal', 'mint'],
  'cloth-navy': ['river-deep', 'river', 'water'],
  'cloth-blue': ['river', 'water', 'water-light'],
  'cloth-sky': ['water', 'water-light', 'foam'],
  'cloth-wine': ['wine', 'brick-dark', 'brick'],
  'cloth-red': ['brick-dark', 'brick', 'terracotta'],
  'cloth-orange': ['brick', 'terracotta', 'ember'],
  'cloth-peach': ['terracotta', 'ember', 'peach'],
  'cloth-gold': ['ochre-dark', 'ochre', 'gold'],
  'cloth-cream': ['honey', 'sand-light', 'cream'],
  'cloth-bone': ['stone', 'stone-light', 'bone'],
  'cloth-grey': ['slate-dark', 'slate', 'stone'],
  'cloth-charcoal': ['ink', 'slate-dark', 'slate'],
  'cloth-green': ['pine', 'moss', 'grass'],
  'cloth-teal': ['teal-dark', 'teal', 'mint'],
  'cloth-plum': ['plum-dark', 'plum', 'lavender'],
  'cloth-brown': ['bark-dark', 'bark', 'timber'],
  'cloth-tan': ['timber', 'oak', 'honey'],
} as const;
export type TrioName = keyof typeof TRIO;

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
/** Which season swap a tile takes: ground follows the grass, leaf follows the trees, static never changes. */
export type TileGroup = 'ground' | 'leaf' | 'static';

const GREENS = ['deep-pine', 'pine', 'moss', 'grass', 'grass-light', 'meadow'] as const;
const swap = (to: readonly string[]): Record<string, string> =>
  Object.fromEntries(GREENS.map((g, i) => [g, to[i]!]));

/** PROMPT.md §4.3: seasons are palette swaps (plus a few replacement tiles, which come with the art phase). */
export const SEASON_SWAPS: Record<Season, Record<TileGroup, Record<string, string>>> = {
  spring: { ground: {}, leaf: {}, static: {} },
  summer: {
    ground: { meadow: 'grass-light', lavender: 'ember' },
    leaf: { 'grass-light': 'grass', meadow: 'grass-light' },
    static: {},
  },
  fall: {
    ground: swap(['bark-dark', 'bark', 'ochre-dark', 'ochre', 'gold', 'lantern']),
    leaf: swap(['wine', 'brick-dark', 'brick', 'terracotta', 'ember', 'peach']),
    static: {},
  },
  winter: {
    ground: swap(['slate-dark', 'slate', 'stone', 'stone-light', 'bone', 'mist']),
    leaf: swap(['slate-dark', 'slate', 'stone', 'stone-light', 'bone', 'mist']),
    static: {},
  },
};

export function paletteGpl(): string {
  const lines = [
    'GIMP Palette',
    'Name: Tallyford 48',
    'Columns: 6',
    '# Generated by pnpm art:build from art/pixel/palette.ts (PROMPT.md §4.3). Do not edit by hand.',
  ];
  for (const [name, [r, g, b]] of Object.entries(PALETTE))
    lines.push(
      `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${name}`,
    );
  return lines.join('\n') + '\n';
}
