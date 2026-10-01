// pnpm placeholders — writes the placeholder tileset (16 flat-colour 16×16 tiles from art/palette.gpl)
// and the Year 1 Tiled map (PROMPT.md §7.5, 96×64) into apps/town-client/public/assets/placeholder,
// then records both in art/provenance.json. Deterministic: the same seed draws the same town.
// This is a stand-in for Kenney Tiny Town (CC0), which drops into assets/third_party (see its README).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { readPalette } from './palette.ts';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'apps', 'town-client', 'public', 'assets', 'placeholder');
const TILE = 16;
const MAP_W = 96;
const MAP_H = 64;

// tile index → palette colour name (two shades per tile for a little texture)
const TILES: [string, string, string][] = [
  ['grass', 'grass', 'grass-light'],
  ['grass-alt', 'grass', 'moss'],
  ['dirt-path', 'soil', 'tilled'],
  ['cobble', 'stone-light', 'ash'],
  ['water', 'river', 'water'],
  ['water-alt', 'water', 'water-light'],
  ['ford-sand', 'sand', 'sand-light'],
  ['tilled-soil', 'soil-dark', 'soil'],
  ['wall', 'bone', 'stone-light'],
  ['roof', 'brick', 'terracotta'],
  ['door', 'bark', 'timber'],
  ['tree', 'pine', 'pine-dark'],
  ['fence', 'oak', 'timber'],
  ['flower', 'grass', 'rose'],
  ['rock', 'ash', 'dusk'],
  ['lot-marker', 'straw', 'brass'],
];
const T = Object.fromEntries(TILES.map(([name], i) => [name, i + 1])) as Record<string, number>; // Tiled gids (0 = empty)

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

function drawTileset(palette: Map<string, [number, number, number]>): Buffer {
  const cols = 8;
  const rows = Math.ceil(TILES.length / cols);
  const png = new PNG({ width: cols * TILE, height: rows * TILE });
  const rnd = mulberry32(7);
  TILES.forEach(([name, baseName, accentName], i) => {
    const base = palette.get(baseName);
    const accent = palette.get(accentName);
    if (!base || !accent) throw new Error(`palette lacks ${baseName} or ${accentName} for ${name}`);
    const ox = (i % cols) * TILE;
    const oy = Math.floor(i / cols) * TILE;
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        let c = base;
        if (name === 'wall' || name === 'roof')
          c = (x + y) % 8 < 4 ? base : accent; // coarse brick pattern
        else if (name === 'door') c = x > 4 && x < 11 && y > 2 ? accent : base;
        else if (name === 'tree') c = (x - 8) ** 2 + (y - 7) ** 2 < 36 ? base : accent;
        else if (name === 'fence') c = y > 5 && y < 10 ? accent : base;
        else if (name === 'flower') c = x % 6 === 2 && y % 6 === 3 ? accent : base;
        else if (name === 'tilled-soil') c = y % 4 < 2 ? base : accent;
        else if (name === 'cobble') c = x % 5 === 0 || y % 5 === 0 ? accent : base;
        else if (name === 'lot-marker')
          c = x === 0 || y === 0 || x === 15 || y === 15 ? accent : base;
        else if (rnd() < 0.12) c = accent; // speckle grass, dirt, water, sand, rock
        const idx = ((oy + y) * png.width + ox + x) * 4;
        png.data[idx] = c[0];
        png.data[idx + 1] = c[1];
        png.data[idx + 2] = c[2];
        png.data[idx + 3] = 255;
      }
    }
  });
  return PNG.sync.write(png);
}

interface Zone {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  unlock: string;
}

// PROMPT.md §7.5, laid out on the 96×64 grid; the river runs north–south at x 76–79.
const ZONES: Zone[] = [
  { name: 'The Highlands', x: 0, y: 0, w: 31, h: 13, unlock: 'Vault of Marks reward' },
  { name: 'Firm Hill', x: 32, y: 0, w: 44, h: 17, unlock: 'Start' },
  { name: 'Riverside Plot', x: 0, y: 14, w: 31, h: 27, unlock: 'Start' },
  { name: 'Town Square', x: 32, y: 18, w: 24, h: 17, unlock: 'Start' },
  { name: 'The Old Exchange', x: 56, y: 18, w: 20, h: 13, unlock: 'Start' },
  { name: 'The Mill Lot', x: 32, y: 36, w: 20, h: 16, unlock: '15,000 ₥' },
  { name: 'Okonkwo Ranch', x: 0, y: 42, w: 31, h: 22, unlock: 'Start' },
  { name: 'The Ford and Docks', x: 52, y: 34, w: 28, h: 30, unlock: 'Start' },
  { name: 'Far Bank', x: 80, y: 0, w: 16, h: 64, unlock: "Anglers' Hall reward" },
];

function buildLayers() {
  const ground = new Array<number>(MAP_W * MAP_H).fill(T.grass!);
  const buildings = new Array<number>(MAP_W * MAP_H).fill(0);
  const rnd = mulberry32(42);
  const at = (x: number, y: number) => y * MAP_W + x;
  const fill = (layer: number[], x: number, y: number, w: number, h: number, gid: number) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (i >= 0 && j >= 0 && i < MAP_W && j < MAP_H) layer[at(i, j)] = gid;
  };
  const house = (x: number, y: number, w: number, h: number) => {
    fill(buildings, x, y, w, 2, T.roof!);
    fill(buildings, x, y + 2, w, h - 2, T.wall!);
    buildings[at(x + Math.floor(w / 2), y + h - 1)] = T.door!;
  };

  for (let i = 0; i < ground.length; i++) if (rnd() < 0.18) ground[i] = T['grass-alt']!;
  // river and the ford
  fill(ground, 76, 0, 4, MAP_H, T.water!);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 76; x < 80; x++) if (rnd() < 0.3) ground[at(x, y)] = T['water-alt']!;
  fill(ground, 76, 44, 4, 4, T['ford-sand']!);
  fill(ground, 72, 44, 4, 4, T['ford-sand']!);
  // paths between zones
  fill(ground, 2, 17, 74, 1, T['dirt-path']!);
  fill(ground, 31, 0, 1, MAP_H, T['dirt-path']!);
  fill(ground, 31, 35, 45, 1, T['dirt-path']!);
  fill(ground, 55, 17, 1, 19, T['dirt-path']!);
  fill(ground, 40, 18, 16, 17, T.cobble!); // the square itself
  // Riverside Plot: Founder's Cottage, 12×12 farm, Ledger Bin, well
  house(4, 16, 6, 5);
  fill(ground, 14, 22, 12, 12, T['tilled-soil']!);
  fill(buildings, 4, 24, 2, 2, T.rock!);
  buildings[at(8, 24)] = T.rock!;
  // Town Square: Town Hall, general store, tavern, clinic
  house(42, 20, 10, 6);
  house(33, 27, 6, 5);
  house(47, 28, 8, 6);
  house(33, 20, 6, 4);
  // Firm Hill: the Trading Firm and five empty lots
  house(40, 3, 14, 8);
  for (const lx of [34, 42, 50, 58, 66]) fill(buildings, lx, 12, 5, 3, T['lot-marker']!);
  // The Old Exchange: six charter halls
  for (const hy of [20, 26]) for (const hx of [58, 64, 70]) house(hx, hy, 5, 4);
  // Okonkwo Ranch: barn, Wren's cottage, fences
  house(6, 46, 8, 6);
  house(18, 46, 5, 4);
  fill(buildings, 4, 44, 25, 1, T.fence!);
  fill(buildings, 4, 60, 25, 1, T.fence!);
  fill(buildings, 4, 44, 1, 17, T.fence!);
  fill(buildings, 28, 44, 1, 17, T.fence!);
  // The Mill Lot (contested)
  fill(buildings, 36, 40, 8, 6, T['lot-marker']!);
  // docks
  fill(buildings, 70, 52, 6, 1, T.fence!);
  // trees on the locked zones and along the edges, flowers in the meadows
  for (const z of ZONES.filter((zz) => zz.unlock !== 'Start')) {
    for (let j = z.y; j < z.y + z.h; j++)
      for (let i = z.x; i < z.x + z.w; i++) {
        if (
          buildings[at(i, j)] === 0 &&
          ground[at(i, j)] !== T.water &&
          ground[at(i, j)] !== T['water-alt'] &&
          rnd() < 0.2
        )
          buildings[at(i, j)] = T.tree!;
      }
  }
  for (let i = 0; i < ground.length; i++)
    if (buildings[i] === 0 && ground[i] === T.grass && rnd() < 0.03) buildings[i] = T.flower!;
  return { ground, buildings };
}

function tiledMap(): string {
  const { ground, buildings } = buildLayers();
  const layer = (id: number, name: string, data: number[]) => ({
    type: 'tilelayer',
    id,
    name,
    width: MAP_W,
    height: MAP_H,
    x: 0,
    y: 0,
    opacity: 1,
    visible: true,
    data,
  });
  const map = {
    type: 'map',
    version: '1.10',
    tiledversion: '1.11.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    infinite: false,
    width: MAP_W,
    height: MAP_H,
    tilewidth: TILE,
    tileheight: TILE,
    nextlayerid: 4,
    nextobjectid: ZONES.length + 1,
    properties: [
      { name: 'source', type: 'string', value: 'scripts/gen-placeholders.ts (PROMPT.md §7.5)' },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: 'placeholder',
        image: 'tileset.png',
        imagewidth: 8 * TILE,
        imageheight: 2 * TILE,
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: TILES.length,
        columns: 8,
        margin: 0,
        spacing: 0,
      },
    ],
    layers: [
      layer(1, 'ground', ground),
      layer(2, 'buildings', buildings),
      {
        type: 'objectgroup',
        id: 3,
        name: 'zones',
        opacity: 1,
        visible: true,
        x: 0,
        y: 0,
        draworder: 'topdown',
        objects: ZONES.map((z, i) => ({
          id: i + 1,
          name: z.name,
          type: 'zone',
          x: z.x * TILE,
          y: z.y * TILE,
          width: z.w * TILE,
          height: z.h * TILE,
          rotation: 0,
          visible: true,
          properties: [{ name: 'unlock', type: 'string', value: z.unlock }],
        })),
      },
    ],
  };
  return JSON.stringify(map) + '\n';
}

function recordProvenance(files: string[]) {
  const file = join(ROOT, 'art', 'provenance.json');
  const entries = JSON.parse(readFileSync(file, 'utf8')) as { file: string }[];
  const today = new Date().toISOString().slice(0, 10);
  for (const f of files) {
    const rel = f.replace(ROOT + '/', '');
    const entry = {
      file: rel,
      source: 'generated: scripts/gen-placeholders.ts',
      prompt: null,
      date: today,
      licence: 'project (CC0-equivalent placeholder; replaced by the art pipeline)',
    };
    const i = entries.findIndex((e) => e.file === rel);
    if (i >= 0)
      entries[i] = {
        ...entries[i],
        ...entry,
        date: (entries[i] as { date?: string }).date ?? today,
      };
    else entries.push(entry);
  }
  writeFileSync(file, JSON.stringify(entries, null, 2) + '\n');
}

mkdirSync(OUT, { recursive: true });
const palette = readPalette(join(ROOT, 'art', 'palette.gpl'));
const tilesetPath = join(OUT, 'tileset.png');
const mapPath = join(OUT, 'town.json');
writeFileSync(tilesetPath, drawTileset(palette));
writeFileSync(mapPath, tiledMap());
recordProvenance([tilesetPath, mapPath]);
console.log(
  `placeholders: ${TILES.length} tiles → ${tilesetPath.replace(ROOT + '/', '')}, ${MAP_W}×${MAP_H} map → ${mapPath.replace(ROOT + '/', '')}`,
);
