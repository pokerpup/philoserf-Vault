// The Year 1 map (PROMPT.md §7.5), 96×64 tiles, laid out from the kit: autotiled roads and
// shores, the cliffs of the Highlands, every building as a spec, trees seeded deterministically.
// Output is Tiled JSON with six tile layers and three object layers; the tileset grows as the
// map asks for pictures, so only tiles the town uses end up in the sheet.
import { BUILDINGS, compose, type ComposedBuilding } from './buildings.ts';
import * as O from './objects.ts';
import { blit, blank, flipH, type Pixmap, TILE, TilesetBuilder } from './pixmap.ts';
import * as T from './terrain.ts';

export const MAP_W = 96;
export const MAP_H = 64;

type Layer = 'ground' | 'edges' | 'water' | 'objects' | 'buildings' | 'above';
const LAYERS: Layer[] = ['ground', 'edges', 'water', 'objects', 'buildings', 'above'];

type Material = 'grass' | 'dirt' | 'cobble' | 'water' | 'sand' | 'tilled' | 'planks' | 'cliff';

export interface Zone {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  unlock: string;
}

export const ZONES: Zone[] = [
  { name: 'The Highlands', x: 0, y: 0, w: 31, h: 14, unlock: 'Vault of Marks reward' },
  { name: 'Firm Hill', x: 32, y: 0, w: 44, h: 17, unlock: 'Start' },
  { name: 'Riverside Plot', x: 0, y: 19, w: 31, h: 23, unlock: 'Start' },
  { name: 'Town Square', x: 33, y: 19, w: 24, h: 17, unlock: 'Start' },
  { name: 'The Old Exchange', x: 57, y: 19, w: 19, h: 17, unlock: 'Start' },
  { name: 'The Mill Lot', x: 33, y: 36, w: 20, h: 17, unlock: '15,000 ₥' },
  { name: 'Okonkwo Ranch', x: 0, y: 42, w: 31, h: 22, unlock: 'Start' },
  { name: 'The Ford and Docks', x: 53, y: 36, w: 23, h: 28, unlock: 'Start' },
  { name: 'Far Bank', x: 80, y: 0, w: 16, h: 64, unlock: "Anglers' Hall reward" },
];

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

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x2545f491;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export interface TownMap {
  json: unknown;
  tileset: TilesetBuilder;
  /** Frame-A gid → frame-B gid for every animated water tile. */
  waterSwap: Record<number, number>;
  spawns: { x: number; y: number }[];
  lights: { x: number; y: number; kind: string }[];
}

class Town {
  readonly ts: TilesetBuilder;
  readonly layers: Record<Layer, Uint32Array> = Object.fromEntries(
    LAYERS.map((l) => [l, new Uint32Array(MAP_W * MAP_H)]),
  ) as Record<Layer, Uint32Array>;
  readonly material: Material[] = new Array<Material>(MAP_W * MAP_H).fill('grass');
  /** Cells that trees and props must not take. */
  readonly blocked = new Uint8Array(MAP_W * MAP_H);
  readonly lights: { x: number; y: number; kind: string }[] = [];
  readonly spawns: { x: number; y: number }[] = [];
  readonly doors: { name: string; x: number; y: number }[] = [];
  readonly waterSwap: Record<number, number> = {};
  private readonly bigs = new Map<string, ReturnType<TilesetBuilder['big']>>();

  constructor(ts: TilesetBuilder) {
    this.ts = ts;
  }

  idx(x: number, y: number): number {
    return y * MAP_W + x;
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
  }

  put(layer: Layer, x: number, y: number, gid: number): void {
    if (this.inside(x, y)) this.layers[layer][this.idx(x, y)] = gid;
  }

  mark(x: number, y: number, w: number, h: number, m: Material): void {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (this.inside(i, j)) this.material[this.idx(i, j)] = m;
  }

  block(x: number, y: number, w: number, h: number): void {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (this.inside(i, j)) this.blocked[this.idx(i, j)] = 1;
  }

  isFree(x: number, y: number): boolean {
    return (
      this.inside(x, y) &&
      !this.blocked[this.idx(x, y)] &&
      this.material[this.idx(x, y)] === 'grass'
    );
  }

  big(name: string, pic: () => Pixmap, group: 'static' | 'leaf' | 'ground' = 'static') {
    let b = this.bigs.get(name);
    if (!b) {
      b = this.ts.big(name, pic(), group);
      this.bigs.set(name, b);
    }
    return b;
  }

  /** Place a multi-tile picture by its bottom-left tile; rows above `splitAt` go to `above`. */
  object(
    name: string,
    pic: () => Pixmap,
    x: number,
    bottomY: number,
    opts: {
      group?: 'static' | 'leaf' | 'ground';
      splitAt?: number;
      lower?: Layer;
      upper?: Layer;
      block?: boolean;
    } = {},
  ): void {
    const b = this.big(name, pic, opts.group ?? 'static');
    const top = bottomY - b.h + 1;
    const split = opts.splitAt ?? b.h; // default: everything in the lower layer
    for (let r = 0; r < b.h; r++) {
      for (let c = 0; c < b.w; c++) {
        const gid = b.ids[r]![c]!;
        if (!gid) continue;
        const layer: Layer = r < split ? (opts.upper ?? 'above') : (opts.lower ?? 'objects');
        this.put(layer, x + c, top + r, gid);
      }
    }
    if (opts.block !== false) this.block(x, bottomY - Math.min(b.h, 2) + 1, b.w, Math.min(b.h, 2));
  }

  /** A single 16×16 prop in the objects layer. */
  prop(
    name: string,
    pic: Pixmap,
    x: number,
    y: number,
    group: 'static' | 'leaf' | 'ground' = 'static',
    block = true,
  ): void {
    this.put('objects', x, y, this.ts.tile(pic, group, name));
    if (block) this.block(x, y, 1, 1);
  }

  building(key: keyof typeof BUILDINGS, x: number, y: number): ComposedBuilding {
    const b = compose(BUILDINGS[key]!);
    b.above.forEach((row, r) =>
      row.forEach((t, c) => this.put('above', x + c, y + r, this.ts.tile(t, 'static'))),
    );
    b.walls.forEach((row, r) =>
      row.forEach((t, c) =>
        this.put('buildings', x + c, y + b.spec.roofRows + r, this.ts.tile(t, 'static')),
      ),
    );
    for (const l of b.lights)
      this.lights.push({
        x: x * TILE + l.x,
        y: y * TILE + l.y,
        kind: key === 'trading-firm' ? 'firm' : 'window',
      });
    this.block(x, y, b.w, b.h + 1);
    const doorY = y + b.h;
    this.doors.push({ name: b.spec.name, x: x + b.doorX, y: doorY });
    this.put('objects', x + b.doorX, doorY, this.ts.tile(O.STEPS, 'static', 'steps'));
    if (b.spec.door?.kind === 'double' || b.spec.door?.kind === 'barn')
      this.put('objects', x + b.doorX + 1, doorY, this.ts.tile(O.STEPS, 'static', 'steps'));
    return b;
  }

  fenceRect(x: number, y: number, w: number, h: number, gaps: [number, number][] = []): void {
    const cells = new Set<number>();
    for (let i = x; i < x + w; i++) {
      cells.add(this.idx(i, y));
      cells.add(this.idx(i, y + h - 1));
    }
    for (let j = y; j < y + h; j++) {
      cells.add(this.idx(x, j));
      cells.add(this.idx(x + w - 1, j));
    }
    for (const [gx, gy] of gaps) cells.delete(this.idx(gx, gy));
    for (const c of cells) {
      const cx = c % MAP_W;
      const cy = Math.floor(c / MAP_W);
      let mask = 0;
      if (cells.has(this.idx(cx, cy - 1))) mask |= T.N;
      if (cells.has(this.idx(cx + 1, cy))) mask |= T.E;
      if (cells.has(this.idx(cx, cy + 1))) mask |= T.S;
      if (cells.has(this.idx(cx - 1, cy))) mask |= T.WEST;
      this.prop(`fence-${mask}`, O.fence(mask), cx, cy);
    }
  }

  /** Scatter a picture over the free grass of a rectangle. */
  scatter(
    rng: () => number,
    x: number,
    y: number,
    w: number,
    h: number,
    density: number,
    place: (tx: number, ty: number) => void,
    footprintW = 1,
    footprintH = 1,
  ): void {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (rng() > density) continue;
        let ok = true;
        for (let fy = 0; fy < footprintH && ok; fy++)
          for (let fx = 0; fx < footprintW; fx++) if (!this.isFree(i + fx, j - fy)) ok = false;
        if (ok) place(i, j);
      }
    }
  }

  resolveGround(): void {
    const sameAs = (x: number, y: number, ms: Material[]): boolean =>
      !this.inside(x, y) || ms.includes(this.material[this.idx(x, y)]!);
    const maskOf = (x: number, y: number, ms: Material[]): number =>
      (sameAs(x, y - 1, ms) ? T.N : 0) |
      (sameAs(x + 1, y, ms) ? T.E : 0) |
      (sameAs(x, y + 1, ms) ? T.S : 0) |
      (sameAs(x - 1, y, ms) ? T.WEST : 0);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const m = this.material[this.idx(x, y)]!;
        if (m === 'cliff') continue; // placed by hand: CLIFF_TOP / CLIFF_BOTTOM / the stairs
        const v = hash(x, y);
        let groundPic = T.GRASS[v % 7 === 0 ? 1 : v % 11 === 0 ? 2 : 0]!;
        if (m === 'cobble') groundPic = T.cobble(v % 3 === 0 ? 1 : 0);
        else if (m === 'tilled') groundPic = T.TILLED;
        else if (
          m === 'water' &&
          [
            this.material[this.idx(x - 1, y)],
            this.material[this.idx(x + 1, y)],
            this.material[this.idx(x, y - 1)],
            this.material[this.idx(x, y + 1)],
          ].includes('sand')
        )
          groundPic = T.SAND;
        this.put(
          'ground',
          x,
          y,
          this.ts.tile(groundPic, m === 'cobble' || m === 'tilled' ? 'static' : 'ground'),
        );
        if (m === 'dirt')
          this.put(
            'edges',
            x,
            y,
            this.ts.tile(
              T.dirt(maskOf(x, y, ['dirt', 'cobble', 'planks', 'sand', 'tilled']), v % 2),
              'static',
            ),
          );
        if (m === 'sand')
          this.put(
            'edges',
            x,
            y,
            this.ts.tile(
              T.sand(maskOf(x, y, ['sand', 'water', 'planks', 'dirt']), v % 2),
              'static',
            ),
          );
        if (m === 'water' || m === 'planks') {
          const mask = maskOf(x, y, ['water', 'planks']);
          const a = this.ts.tile(T.water(mask, 0, v % 2), 'static');
          const b = this.ts.tile(T.water(mask, 1, v % 2), 'static');
          this.waterSwap[a] = b;
          this.put('water', x, y, a);
        }
      }
    }
  }

  toTiled(): unknown {
    const tileLayer = (id: number, name: Layer) => ({
      type: 'tilelayer',
      id,
      name,
      width: MAP_W,
      height: MAP_H,
      x: 0,
      y: 0,
      opacity: 1,
      visible: true,
      data: Array.from(this.layers[name]),
    });
    let oid = 1;
    const objectLayer = (id: number, name: string, objects: Record<string, unknown>[]) => ({
      type: 'objectgroup',
      id,
      name,
      opacity: 1,
      visible: true,
      x: 0,
      y: 0,
      draworder: 'topdown',
      objects,
    });
    const zones = ZONES.map((z) => ({
      id: oid++,
      name: z.name,
      type: 'zone',
      x: z.x * TILE,
      y: z.y * TILE,
      width: z.w * TILE,
      height: z.h * TILE,
      rotation: 0,
      visible: true,
      properties: [{ name: 'unlock', type: 'string', value: z.unlock }],
    }));
    const spawns = this.spawns.map((s, i) => ({
      id: oid++,
      name: `slot-${i + 1}`,
      type: 'spawn',
      point: true,
      x: s.x,
      y: s.y,
      width: 0,
      height: 0,
      rotation: 0,
      visible: true,
    }));
    spawns.push({
      id: oid++,
      name: 'wander',
      type: 'wander',
      point: false,
      x: 45 * TILE,
      y: 11 * TILE,
      width: 14 * TILE,
      height: 5 * TILE,
      rotation: 0,
      visible: true,
    } as never);
    const lights = this.lights.map((l) => ({
      id: oid++,
      name: l.kind,
      type: 'light',
      point: true,
      x: l.x,
      y: l.y,
      width: 0,
      height: 0,
      rotation: 0,
      visible: true,
      properties: [{ name: 'kind', type: 'string', value: l.kind }],
    }));
    const doors = this.doors.map((d) => ({
      id: oid++,
      name: d.name,
      type: 'door',
      point: true,
      x: d.x * TILE + 8,
      y: d.y * TILE + 8,
      width: 0,
      height: 0,
      rotation: 0,
      visible: true,
    }));
    return {
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
      nextlayerid: 11,
      nextobjectid: oid,
      properties: [
        { name: 'source', type: 'string', value: 'art/pixel/town-map.ts (PROMPT.md §7.5)' },
        { name: 'waterSwap', type: 'string', value: JSON.stringify(this.waterSwap) },
      ],
      tilesets: [
        {
          firstgid: 1,
          name: 'tallyford',
          image: 'tiles-spring.png',
          imagewidth: this.ts.columns * TILE,
          imageheight: this.ts.rows * TILE,
          tilewidth: TILE,
          tileheight: TILE,
          tilecount: this.ts.tiles.length,
          columns: this.ts.columns,
          margin: 0,
          spacing: 0,
        },
      ],
      layers: [
        tileLayer(1, 'ground'),
        tileLayer(2, 'edges'),
        tileLayer(3, 'water'),
        tileLayer(4, 'objects'),
        tileLayer(5, 'buildings'),
        tileLayer(6, 'above'),
        objectLayer(7, 'zones', zones),
        objectLayer(8, 'spawns', spawns),
        objectLayer(9, 'lights', lights),
        objectLayer(10, 'doors', doors),
      ],
    };
  }
}

export function buildTown(ts = new TilesetBuilder()): TownMap {
  const t = new Town(ts);
  const rng = mulberry32(2026);

  // ---- water, banks, the ford ----
  t.mark(76, 0, 4, MAP_H, 'water');
  t.mark(73, 44, 3, 6, 'sand');
  t.mark(80, 44, 3, 6, 'sand');
  t.block(72, 0, 12, MAP_H);

  // ---- roads ----
  t.mark(0, 17, 75, 2, 'dirt'); // the main road
  t.mark(31, 14, 2, 50, 'dirt'); // the north–south road
  t.mark(27, 8, 2, 4, 'dirt'); // up to the Highlands stairs
  t.mark(27, 14, 2, 3, 'dirt');
  t.mark(51, 16, 2, 1, 'cobble'); // forecourt to road
  t.mark(44, 19, 2, 7, 'cobble'); // road to the square
  t.mark(65, 19, 2, 3, 'cobble'); // road to the exchange
  t.mark(5, 24, 1, 3, 'dirt'); // cottage door to the farm lane
  t.mark(5, 26, 26, 1, 'dirt');
  t.mark(29, 50, 2, 2, 'dirt'); // ranch gate
  t.mark(65, 36, 2, 14, 'dirt'); // exchange to the docks
  t.mark(33, 36, 2, 1, 'dirt');
  for (const [x, y, w, h] of [
    [0, 17, 75, 2],
    [31, 14, 2, 50],
    [27, 8, 2, 4],
    [27, 14, 2, 3],
    [5, 24, 1, 3],
    [5, 26, 26, 1],
    [65, 36, 2, 14],
  ] as const)
    t.block(x, y, w, h);

  // ---- the Highlands: plateau, cliff, stairs ----
  t.mark(0, 12, 31, 2, 'cliff');
  for (let x = 0; x < 31; x++) {
    const stairs = x === 27 || x === 28;
    t.put('ground', x, 12, ts.tile(stairs ? T.CLIFF_STAIRS_TOP : T.CLIFF_TOP, 'ground'));
    t.put('ground', x, 13, ts.tile(stairs ? T.CLIFF_STAIRS_BOTTOM : T.CLIFF_BOTTOM, 'ground'));
  }
  t.block(0, 12, 31, 2);
  t.mark(14, 4, 8, 6, 'tilled');
  t.block(14, 4, 8, 6);
  t.object('lantern-tree', () => O.fruitTree('lantern', 2), 8, 6, { group: 'leaf', splitAt: 2 });
  t.object('bench', () => O.BENCH, 23, 7);
  t.object('lamp', () => O.LAMP_POST, 25, 7, { splitAt: 1, lower: 'objects' });
  t.lights.push({ x: 25 * TILE + 8, y: 6 * TILE + 5, kind: 'lamp' });
  t.object('sign-lines', () => O.signpost('lines'), 13, 9, { splitAt: 0 });
  t.object('big-rock', () => O.BIG_ROCK, 2, 9);
  for (const x of [29, 30])
    for (const y of [3, 7, 11])
      if (t.isFree(x, y) && t.isFree(x + 1, y))
        t.object('pine', () => O.pine(), x, y, { group: 'leaf', splitAt: 3 });

  // ---- Firm Hill ----
  const firm = t.building('trading-firm', 45, 3);
  void firm;
  t.mark(44, 11, 16, 5, 'cobble');
  t.block(44, 11, 16, 5);
  t.object('lamp', () => O.LAMP_POST, 44, 11, { splitAt: 1 });
  t.object('lamp', () => O.LAMP_POST, 59, 11, { splitAt: 1 });
  t.lights.push(
    { x: 44 * TILE + 8, y: 10 * TILE + 5, kind: 'lamp' },
    { x: 59 * TILE + 8, y: 10 * TILE + 5, kind: 'lamp' },
  );
  for (const x of [46, 48, 50, 52, 54, 56])
    for (const y of [12, 14]) t.spawns.push({ x: x * TILE + 8, y: y * TILE + 12 });
  const lot = (x: number, y: number) => {
    t.fenceRect(x, y, 5, 4, [[x + 2, y + 3]]);
    t.mark(x + 1, y + 1, 3, 2, 'dirt');
    t.block(x, y, 5, 4);
    t.object('sign-coin', () => O.signpost('coin'), x + 3, y + 4, { splitAt: 0 });
  };
  lot(34, 4);
  lot(33, 11);
  lot(39, 11);
  lot(61, 11);
  lot(67, 11);

  // ---- Town Square ----
  t.building('town-hall', 34, 19);
  t.building('counting-house', 45, 19);
  t.mark(33, 26, 24, 3, 'cobble');
  t.block(33, 26, 24, 3);
  t.object('well', () => O.WELL, 43, 27);
  t.object('lamp', () => O.LAMP_POST, 36, 27, { splitAt: 1 });
  t.object('lamp', () => O.LAMP_POST, 53, 27, { splitAt: 1 });
  t.lights.push(
    { x: 36 * TILE + 8, y: 26 * TILE + 5, kind: 'lamp' },
    { x: 53 * TILE + 8, y: 26 * TILE + 5, kind: 'lamp' },
  );
  t.object('bench', () => O.BENCH, 38, 28);
  t.object('bench', () => O.BENCH, 49, 28);
  t.building('general-store', 34, 29);
  t.building('clinic', 46, 29);
  t.mark(33, 34, 24, 2, 'cobble');
  t.block(33, 34, 24, 2);
  t.prop('barrel', O.BARREL, 41, 34);
  t.prop('crate', O.CRATE, 42, 34);
  t.prop('flowers-a', O.FLOWERS[0]!, 52, 34, 'ground');
  t.prop('flowers-b', O.FLOWERS[1]!, 54, 35, 'ground');

  // ---- the Old Exchange ----
  t.mark(62, 22, 8, 14, 'cobble');
  t.block(62, 22, 8, 14);
  t.building('hall-growers', 57, 19);
  t.building('hall-anglers', 70, 19);
  t.building('hall-prospectors', 57, 25);
  t.building('hall-artisans', 70, 25);
  t.building('hall-stewards', 57, 31);
  t.building('hall-vault', 70, 31);
  t.object('vault-arch', () => O.VAULT_ARCH, 65, 27, {
    lower: 'buildings',
    splitAt: 0,
    upper: 'buildings',
  });
  for (const [x, y] of [
    [63, 24],
    [68, 24],
    [63, 33],
    [68, 33],
  ] as const) {
    t.prop('lantern', O.LANTERN_POST, x, y);
    t.lights.push({ x: x * TILE + 8, y: y * TILE + 4, kind: 'lantern' });
  }

  // ---- Riverside Plot ----
  t.building('founders-cottage', 3, 19);
  t.object('mailbox', () => O.MAILBOX, 2, 25, { splitAt: 0 });
  t.object('ledger-bin', () => O.LEDGER_BIN, 7, 24);
  t.object('well', () => O.WELL, 1, 29);
  t.mark(9, 28, 12, 12, 'tilled');
  t.block(9, 28, 12, 12);
  for (let j = 28; j < 40; j++)
    for (let i = 9; i < 21; i++)
      if (hash(i, j) % 4 === 0) t.put('objects', i, j, ts.tile(T.SPROUT, 'leaf', 'sprout'));
  t.fenceRect(8, 27, 14, 14, [
    [14, 27],
    [15, 27],
  ]);
  t.prop('flowers-c', O.FLOWERS[2]!, 1, 22, 'ground');
  t.prop('flowers-a', O.FLOWERS[0]!, 9, 22, 'ground');

  // ---- Okonkwo Ranch ----
  t.fenceRect(2, 43, 27, 19, [
    [28, 50],
    [28, 51],
  ]);
  t.building('barn', 5, 44);
  t.building('coop', 15, 46);
  t.building('wrens-cottage', 22, 45);
  t.object('trough', () => O.TROUGH, 12, 53);
  t.prop('hay', O.HAY, 15, 54);
  t.prop('hay', O.HAY, 16, 54);
  t.prop('hay', O.HAY, 15, 55);
  t.prop('barrel', O.BARREL, 24, 50);
  t.prop('crate', O.CRATE, 25, 50);
  t.scatter(rng, 3, 52, 25, 9, 0.08, (x, y) =>
    t.prop(`tuft-${(x + y) % 2}`, O.TUFTS[(x + y) % 2]!, x, y, 'leaf', false),
  );

  // ---- the Mill Lot ----
  t.object('windmill-tower', () => O.windmillTower(), 37, 44, {
    splitAt: 0,
    upper: 'buildings',
    lower: 'buildings',
  });
  t.object('windmill-sails', () => O.windmillSails(), 37, 41, { splitAt: 4, block: false });
  t.block(37, 40, 4, 5);
  t.object('sign-coin', () => O.signpost('coin'), 42, 47, { splitAt: 0 });
  t.fenceRect(33, 37, 20, 16, [
    [33, 44],
    [33, 45],
    [42, 52],
    [43, 52],
    [48, 37],
    [49, 37],
  ]);
  t.prop('stump', O.STUMP, 46, 42);
  t.prop('rock-a', O.ROCKS[0]!, 48, 45);
  t.prop('rock-b', O.ROCKS[1]!, 35, 49);
  t.scatter(rng, 34, 38, 18, 14, 0.14, (x, y) =>
    t.prop(`tuft-${(x + y) % 2}`, O.TUFTS[(x + y) % 2]!, x, y, 'leaf', false),
  );

  // ---- the Ford and Docks ----
  t.building('fishing-hut', 57, 40);
  t.prop('net', O.NET, 60, 42);
  t.prop('barrel', O.BARREL, 60, 43);
  t.prop('crate', O.CRATE, 61, 43);
  t.object('sign-fish', () => O.signpost('fish'), 72, 48, { splitAt: 0 });
  for (let y = 45; y < 49; y++)
    for (let x = 76; x < 80; x++)
      t.put('objects', x, y, ts.tile(O.FORD_STONES, 'static', 'ford-stones'));
  const pier = (x0: number, x1: number, y: number) => {
    for (let x = x0; x <= x1; x++) {
      if (t.material[t.idx(x, y)] === 'water') t.material[t.idx(x, y)] = 'planks';
      t.put('objects', x, y, ts.tile(T.PLANKS, 'static', 'planks'));
      t.block(x, y, 1, 1);
    }
    t.prop('pier-post', O.PIER_POST, x1, y + 1);
  };
  pier(68, 77, 50);
  pier(68, 77, 51);
  pier(70, 77, 57);
  pier(70, 77, 58);
  t.object('boat', () => O.BOAT, 76, 54, { block: false });
  for (const x of [70, 74]) {
    t.prop('lantern', O.LANTERN_POST, x, 56);
    t.lights.push({ x: x * TILE + 8, y: 56 * TILE + 4, kind: 'lantern' });
  }
  for (const x of [68, 70, 72, 74]) {
    t.prop('lantern', O.LANTERN_POST, x, 61);
    t.lights.push({ x: x * TILE + 8, y: 61 * TILE + 4, kind: 'lantern' });
  }
  t.prop('rock-a', O.ROCKS[0]!, 71, 62);
  t.prop('rock-b', O.ROCKS[1]!, 73, 62);

  // ---- the broken bridge and the Far Bank ----
  t.put('objects', 75, 17, ts.tile(T.PLANKS, 'static', 'planks'));
  t.put('objects', 75, 18, ts.tile(T.PLANKS, 'static', 'planks'));
  t.put('objects', 76, 17, ts.tile(T.PLANKS_BROKEN, 'static', 'planks-broken'));
  t.put('objects', 76, 18, ts.tile(T.PLANKS_BROKEN, 'static', 'planks-broken'));
  t.put('objects', 80, 17, ts.tile(T.PLANKS, 'static', 'planks'));
  t.put('objects', 80, 18, ts.tile(T.PLANKS, 'static', 'planks'));
  t.put('objects', 79, 17, ts.tile(flipH(T.PLANKS_BROKEN), 'static', 'planks-broken-r'));
  t.put('objects', 79, 18, ts.tile(flipH(T.PLANKS_BROKEN), 'static', 'planks-broken-r'));
  for (const x of [83, 87, 91])
    for (const y of [24, 28, 32, 36, 40])
      t.object(`fruit-${(x + y) % 3}`, () => O.fruitTree('ember', (x + y) % 3), x, y, {
        group: 'leaf',
        splitAt: 2,
      });
  t.object('sign-fish', () => O.signpost('fish'), 82, 56, { splitAt: 0 });

  // ---- trees: a dark border, then scattered oaks and pines on the free grass ----
  const tree = (kind: 'oak' | 'pine', x: number, y: number) => {
    if (kind === 'oak')
      t.object(`oak-${(x + y) % 3}`, () => O.oak((x + y) % 3), x, y, { group: 'leaf', splitAt: 3 });
    else t.object('pine', () => O.pine(), x, y, { group: 'leaf', splitAt: 3 });
  };
  for (let x = 0; x < MAP_W; x += 3)
    if (t.isFree(x, 63) && t.isFree(x + 1, 63) && t.isFree(x + 2, 63))
      tree((x / 3) % 2 ? 'oak' : 'pine', x, 63);
  for (let x = 32; x < 72; x += 3)
    if (t.isFree(x, 2) && t.isFree(x + 1, 2) && t.isFree(x + 2, 2))
      tree((x / 3) % 2 ? 'pine' : 'oak', x, 2);
  for (let y = 4; y < 62; y += 4) if (t.isFree(94, y) && t.isFree(95, y)) tree('pine', 94, y);
  const zoneTrees: [number, number, number, number, number][] = [
    [0, 2, 12, 9, 0.05],
    [0, 20, 8, 5, 0.03],
    [22, 20, 9, 20, 0.05],
    [33, 1, 42, 15, 0.025],
    [54, 37, 20, 25, 0.05],
    [81, 2, 14, 60, 0.06],
    [34, 38, 18, 14, 0.01],
    [0, 44, 30, 18, 0.01],
  ];
  for (const [x, y, w, h, d] of zoneTrees) {
    t.scatter(rng, x, y, w, h, d, (tx, ty) => tree(rng() < 0.65 ? 'oak' : 'pine', tx, ty), 3, 3);
    t.scatter(rng, x, y, w, h, d * 0.8, (tx, ty) => t.prop('bush', O.bush(), tx, ty, 'leaf'));
    t.scatter(rng, x, y, w, h, d * 0.6, (tx, ty) =>
      t.prop(`flowers-${(tx + ty) % 3}`, O.FLOWERS[(tx + ty) % 3]!, tx, ty, 'ground', false),
    );
    t.scatter(rng, x, y, w, h, d * 0.4, (tx, ty) =>
      t.prop(`rock-${(tx + ty) % 2}`, O.ROCKS[(tx + ty) % 2]!, tx, ty),
    );
  }

  t.resolveGround();
  return {
    json: t.toTiled(),
    tileset: ts,
    waterSwap: t.waterSwap,
    spawns: t.spawns,
    lights: t.lights,
  };
}

export const _m = { blit, blank };
