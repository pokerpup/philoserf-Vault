import { describe, expect, it } from 'vitest';
import { BUILDINGS, compose } from '../buildings.ts';
import { DIRS, frame, FRAMES_PER_DIR, HAIR_STYLES, type Look } from '../characters.ts';
import { buildFont } from '../font.ts';
import { PALETTE, PALETTE_NAMES, RAMPS, SEASON_SWAPS, SKIN, TRIO } from '../palette.ts';
import { get, toPNG, type Pixmap } from '../pixmap.ts';
import { EXPRESSIONS, portrait } from '../portraits.ts';
import { buildTown, MAP_H, MAP_W, ZONES } from '../town-map.ts';

const look: Look = {
  skin: 'tan',
  hair: 'bob',
  hairColor: 'hair-brown',
  eyes: 'bark',
  top: 'cloth-red',
  bottom: 'cloth-navy',
  shoes: 'ink',
  accessory: 'glasses',
};

const opaque = (p: Pixmap) => p.px.filter((c) => c !== null).length;

describe('palette (§4.3)', () => {
  it('has exactly 48 colours, none pure black or white', () => {
    expect(PALETTE_NAMES).toHaveLength(48);
    for (const [r, g, b] of Object.values(PALETTE)) {
      expect(r + g + b).toBeGreaterThan(0);
      expect(r + g + b).toBeLessThan(765);
    }
  });
  it('ramps, skin tones, cloth trios and season swaps only name palette colours', () => {
    const names = new Set(PALETTE_NAMES);
    for (const ramp of Object.values(RAMPS))
      for (const c of ramp) expect(names.has(c), c).toBe(true);
    for (const trio of [...Object.values(SKIN), ...Object.values(TRIO)])
      for (const c of trio) expect(names.has(c), c).toBe(true);
    for (const season of Object.values(SEASON_SWAPS))
      for (const group of Object.values(season))
        for (const [from, to] of Object.entries(group))
          expect(names.has(from) && names.has(to), `${from}→${to}`).toBe(true);
  });
});

describe('the town (§7.5)', () => {
  const town = buildTown();
  const json = town.json as {
    width: number;
    height: number;
    layers: {
      type: string;
      name: string;
      data?: number[];
      objects?: { name: string; type: string }[];
    }[];
  };
  it('is 96×64 with six tile layers and the nine zones', () => {
    expect([json.width, json.height]).toEqual([MAP_W, MAP_H]);
    expect(json.layers.filter((l) => l.type === 'tilelayer').map((l) => l.name)).toEqual([
      'ground',
      'edges',
      'water',
      'objects',
      'buildings',
      'above',
    ]);
    const zones = json.layers.find((l) => l.name === 'zones')!.objects!;
    expect(zones.map((z) => z.name)).toEqual(ZONES.map((z) => z.name));
  });
  it('covers every cell with ground and references only tiles in the sheet', () => {
    const ground = json.layers.find((l) => l.name === 'ground')!.data!;
    expect(ground.every((g) => g > 0)).toBe(true);
    for (const l of json.layers)
      for (const g of l.data ?? []) expect(g).toBeLessThanOrEqual(town.tileset.tiles.length);
  });
  it('has twelve spawn slots on Firm Hill and a wander rectangle', () => {
    expect(town.spawns).toHaveLength(12);
    const spawns = json.layers.find((l) => l.name === 'spawns')!.objects!;
    expect(spawns.filter((o) => o.type === 'spawn')).toHaveLength(12);
    expect(spawns.some((o) => o.name === 'wander')).toBe(true);
  });
  it('animates every water tile through a three-frame cycle', () => {
    const water = json.layers.find((l) => l.name === 'water')!.data!.filter((g) => g > 0);
    for (const g of new Set(water)) {
      const b = town.waterCycle[g]!;
      const c = town.waterCycle[b]!;
      expect(b).toBeGreaterThan(0);
      expect(town.waterCycle[c]).toBe(g);
    }
  });
  it('renders the same sheet twice (deterministic)', () => {
    expect(toPNG(buildTown().tileset.render()).equals(toPNG(town.tileset.render()))).toBe(true);
  });
});

describe('the building kit', () => {
  it('composes every §7.5 building with a door and lit windows where specified', () => {
    for (const [key, spec] of Object.entries(BUILDINGS)) {
      const b = compose(spec);
      expect(b.above, key).toHaveLength(spec.roofRows);
      expect(b.above[0], key).toHaveLength(spec.w + 2);
      expect(b.walls, key).toHaveLength(spec.wallRows);
      expect(b.lights.filter((l) => l.kind === 'window').length, key).toBe(
        spec.lit === false ? 0 : (spec.windows ?? []).length,
      );
      expect(b.smoke, key).toHaveLength((spec.chimneys ?? []).length);
    }
  });
});

describe('characters (§4.4)', () => {
  it('draws 20 frames per look inside a 16×32 cell with one pixel of padding', () => {
    for (const hair of HAIR_STYLES) {
      for (const d of DIRS) {
        for (let n = 0; n < FRAMES_PER_DIR; n++) {
          const f = frame({ ...look, hair }, d, n);
          expect([f.w, f.h]).toEqual([16, 32]);
          for (let y = 0; y < 32; y++) {
            expect(get(f, 0, y), `${hair}/${d}/${n} left`).toBeNull();
            expect(get(f, 15, y), `${hair}/${d}/${n} right`).toBeNull();
          }
          for (let x = 0; x < 16; x++) expect(get(f, x, 0), `${hair}/${d}/${n} top`).toBeNull();
        }
      }
    }
  });
  it('mirrors right from left', () => {
    const l = frame(look, 'left', 1);
    const r = frame(look, 'right', 1);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 16; x++) expect(get(r, x, y)).toBe(get(l, 15 - x, y));
  });
});

describe('portraits (§4.3)', () => {
  it('changes at least 12 pixels per expression and stays 64×64', () => {
    const neutral = portrait(look, 'neutral');
    expect([neutral.w, neutral.h]).toEqual([64, 64]);
    for (const e of EXPRESSIONS.slice(1)) {
      const p = portrait(look, e);
      let diff = 0;
      for (let i = 0; i < p.px.length; i++) if (p.px[i] !== neutral.px[i]) diff++;
      expect(diff, e).toBeGreaterThanOrEqual(12);
    }
    expect(opaque(neutral)).toBeGreaterThan(1500);
  });
});

describe('font (§4.5)', () => {
  it('maps capitals, digits and punctuation, lower-case sharing the capitals', () => {
    const { xml } = buildFont();
    for (const ch of ['A', 'a', 'Z', '0', '9', '₥', '?'])
      expect(xml, ch).toContain(`<char id="${ch.codePointAt(0)}"`);
  });
});
