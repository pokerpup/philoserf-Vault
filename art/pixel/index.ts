import * as B from './buildings.ts';
import { frame, type Look, DIRS } from './characters.ts';
import { buildFont, text } from './font.ts';
import * as O from './objects.ts';
import { blank, blit, type Pixmap } from './pixmap.ts';
import { portraitStrip } from './portraits.ts';
import * as T from './terrain.ts';
import { buildTown, MAP_H, MAP_W } from './town-map.ts';
import { BUBBLE, BUBBLE_TAIL, EMOTES, lightMask, PANEL } from './ui.ts';

/** Lay pictures out in rows for `pnpm art:preview`. */
export function shelf(items: Pixmap[], width = 320, gap = 2, bg = 'plum-dark'): Pixmap {
  let x = 0;
  let y = 0;
  let rowH = 0;
  const placed: [Pixmap, number, number][] = [];
  for (const p of items) {
    if (x + p.w > width) {
      x = 0;
      y += rowH + gap;
      rowH = 0;
    }
    placed.push([p, x, y]);
    x += p.w + gap;
    rowH = Math.max(rowH, p.h);
  }
  const out = blank(width, y + rowH, bg);
  for (const [p, px, py] of placed) blit(out, p, px, py);
  return out;
}

export const SAMPLE_LOOKS: Look[] = [
  {
    skin: 'fair',
    hair: 'slick',
    hairColor: 'hair-grey',
    eyes: 'water',
    top: 'cloth-grey',
    bottom: 'cloth-charcoal',
    shoes: 'ink',
    accessory: 'glasses-up',
  },
  {
    skin: 'fair',
    hair: 'curly',
    hairColor: 'hair-black',
    eyes: 'bark',
    top: 'cloth-plum',
    bottom: 'cloth-navy',
    shoes: 'slate',
  },
  {
    skin: 'umber',
    hair: 'bun',
    hairColor: 'hair-black',
    eyes: 'bark',
    top: 'cloth-teal',
    bottom: 'cloth-charcoal',
    shoes: 'bark-dark',
  },
  {
    skin: 'fair',
    hair: 'side-part',
    hairColor: 'hair-blonde',
    eyes: 'water-light',
    top: 'cloth-sky',
    bottom: 'cloth-grey',
    shoes: 'bark',
    accessory: 'headset',
  },
  {
    skin: 'tan',
    hair: 'bob',
    hairColor: 'hair-black',
    eyes: 'bark',
    top: 'cloth-red',
    bottom: 'cloth-navy',
    shoes: 'ink',
  },
  {
    skin: 'fair',
    hair: 'crop',
    hairColor: 'hair-chestnut',
    eyes: 'moss',
    top: 'cloth-wine',
    bottom: 'cloth-charcoal',
    shoes: 'bark-dark',
    accessory: 'tie',
  },
  {
    skin: 'fair',
    hair: 'ponytail',
    hairColor: 'hair-blonde',
    eyes: 'water',
    top: 'cloth-navy',
    bottom: 'cloth-grey',
    shoes: 'ink',
    accessory: 'glasses',
  },
  {
    skin: 'umber',
    hair: 'crop',
    hairColor: 'hair-black',
    eyes: 'bark',
    top: 'cloth-charcoal',
    bottom: 'cloth-charcoal',
    shoes: 'ink',
    accessory: 'tie',
  },
  {
    skin: 'tan',
    hair: 'long',
    hairColor: 'hair-black',
    eyes: 'bark',
    top: 'cloth-orange',
    bottom: 'cloth-navy',
    shoes: 'bark',
  },
  {
    skin: 'fair',
    hair: 'curly',
    hairColor: 'hair-red',
    eyes: 'moss',
    top: 'cloth-green',
    bottom: 'cloth-brown',
    shoes: 'bark-dark',
    accessory: 'glasses',
  },
  {
    skin: 'tan',
    hair: 'bob',
    hairColor: 'hair-brown',
    eyes: 'bark',
    top: 'cloth-cream',
    bottom: 'cloth-plum',
    shoes: 'ink',
    accessory: 'headset',
  },
  {
    skin: 'fair',
    hair: 'balding',
    hairColor: 'hair-white',
    eyes: 'slate',
    top: 'cloth-tan',
    bottom: 'cloth-brown',
    shoes: 'bark-dark',
    accessory: 'glasses',
  },
];

/** The whole town flattened, as the scene draws it (ground → above). */
export function renderMap(): Pixmap {
  const town = buildTown();
  const json = town.json as { layers: { type: string; name: string; data?: number[] }[] };
  const out = blank(MAP_W * 16, MAP_H * 16, 'ink');
  for (const layer of json.layers) {
    if (layer.type !== 'tilelayer' || !layer.data) continue;
    layer.data.forEach((gid, i) => {
      if (!gid) return;
      blit(out, town.tileset.tiles[gid - 1]!, (i % MAP_W) * 16, Math.floor(i / MAP_W) * 16);
    });
  }
  return out;
}

export function previews(): Record<string, Pixmap> {
  const dirt16 = Array.from({ length: 16 }, (_, m) => T.dirt(m, m % 2));
  const water16 = Array.from({ length: 16 }, (_, m) => T.water(m, 0, m % 2));
  const sand16 = Array.from({ length: 16 }, (_, m) => T.sand(m, m % 2));
  const chars: Pixmap[] = [];
  for (const look of SAMPLE_LOOKS)
    for (const d of DIRS) for (let n = 0; n < 4; n++) chars.push(frame(look, d, n));
  return {
    terrain: shelf(
      [
        ...T.GRASS,
        T.cobble(0),
        T.cobble(1),
        T.TILLED,
        T.TILLED_WET,
        T.SPROUT,
        T.SAND,
        T.PLANKS,
        T.PLANKS_NS,
        T.PLANKS_BROKEN,
        T.CLIFF_TOP,
        T.CLIFF_BOTTOM,
        T.CLIFF_STAIRS_TOP,
        T.CLIFF_STAIRS_BOTTOM,
        ...T.WATER_FILL,
        ...dirt16,
        ...water16,
        ...sand16,
      ],
      18 * 16,
    ),
    objects: shelf(O.previewObjects(), 400),
    buildings: shelf(B.previewBuildings(), 480, 4),
    characters: shelf(chars, 16 * 18, 2),
    portraits: shelf(
      SAMPLE_LOOKS.map((l) => portraitStrip(l)),
      384 * 2,
      2,
    ),
    map: renderMap(),
    ui: shelf(
      [
        PANEL,
        BUBBLE,
        BUBBLE_TAIL,
        ...Object.values(EMOTES),
        lightMask(),
        buildFont().sheet,
        text('Tallyford · Year 1 · Spring 1 · 9:30 · 12,500 ₥'),
      ],
      400,
    ),
  };
}
