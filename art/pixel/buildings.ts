// The modular building kit (GAME-LAYER.md §5): roof, wall, window, door, chimney, sign and awning
// pieces drawn in a neutral ramp and recoloured per material, plus a composer that lays a whole
// building out from a short spec. Every §7.5 building is a spec, not a drawing.
import { RAMPS, type Ramp, type RampName } from './palette.ts';
import { applyRamp, blank, blit, clone, px, set, shaded, type Pixmap } from './pixmap.ts';
import { CLOCK, CUPOLA, FLOWER_BOX, PLAQUE } from './objects.ts';

// ---- roofs ---------------------------------------------------------------------------------

/** One shingle row for an absolute roof y: bands of four rows, every other band offset by half a shingle. */
function shingleRow(absY: number, x: number): string {
  const band = Math.floor(absY / 4);
  const r = absY % 4;
  const off = (band % 2) * 4;
  const inShingle = (x + off) % 8;
  if (r === 0) return inShingle === 1 || inShingle === 2 ? 'R5' : 'R4';
  if (r === 3) return 'R2';
  return inShingle === 7 ? 'R2' : 'R3';
}

export type Col = 'l' | 'm' | 'r' | 'lr';
export type RoofPart = 'ridge' | 'mid' | 'eave';

export function roofPiece(part: RoofPart, col: Col, absRow: number, ramp: Ramp): Pixmap {
  const p = blank(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let c: string;
      const absY = absRow * 16 + y;
      if (part === 'ridge' && y === 0) c = 'R1';
      else if (part === 'ridge' && y === 1) c = 'R4';
      else if (part === 'ridge' && y === 2) c = 'R5';
      else if (part === 'eave' && y >= 13) c = y === 15 ? 'R1' : 'R2';
      else c = shingleRow(absY, x);
      if ((col === 'l' || col === 'lr') && x === 0) c = 'R1';
      if ((col === 'r' || col === 'lr') && x === 15) c = 'R1';
      set(p, x, y, c);
    }
  }
  return applyRamp(p, ramp);
}

// ---- walls ---------------------------------------------------------------------------------

export type WallMaterial = 'plaster' | 'whitewash' | 'brick' | 'stone' | 'planks' | 'red-wood';
export type WallPart = 'top' | 'mid' | 'bot';

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % 1000;
}

function wallTexture(material: WallMaterial, absX: number, absY: number): string {
  switch (material) {
    case 'brick': {
      const band = Math.floor(absY / 4);
      const r = absY % 4;
      const off = (band % 2) * 4;
      const i = (absX + off) % 8;
      if (r === 3 || i === 7) return 'R2';
      if (r === 0 && i === 0) return 'R4';
      return hash(Math.floor((absX + off) / 8), band) % 7 === 0 ? 'R2' : 'R3';
    }
    case 'stone': {
      const band = Math.floor(absY / 5);
      const r = absY % 5;
      const off = (band % 2) * 3;
      const i = (absX + off) % 7;
      if (r === 4 || i === 6) return 'R2';
      if (r === 0 && i === 0) return 'R5';
      return hash(Math.floor((absX + off) / 7), band) % 4 === 0 ? 'R3' : 'R4';
    }
    case 'planks':
    case 'red-wood': {
      const r = absY % 4;
      const band = Math.floor(absY / 4);
      const seam = ((band % 3) * 5 + 4) % 16;
      if (r === 3) return 'R2';
      if (r === 0) return 'R5';
      if (absX % 16 === seam) return 'R2';
      return 'R4';
    }
    default: {
      const h = hash(absX, absY);
      return h % 41 === 0 ? 'R5' : h % 47 === 0 ? 'R3' : 'R4';
    }
  }
}

export function wallPiece(
  material: WallMaterial,
  part: WallPart,
  col: Col,
  absCol: number,
  absRow: number,
): Pixmap {
  const p = blank(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let c = wallTexture(material, absCol * 16 + x, absRow * 16 + y);
      if (part === 'top' && y < 2) c = 'R2';
      if (part === 'bot' && y >= 13) c = y === 13 ? 'R2' : 'F';
      if ((col === 'l' || col === 'lr') && x === 0) c = 'R1';
      if ((col === 'r' || col === 'lr') && x === 15) c = 'R1';
      set(p, x, y, c);
    }
  }
  const out = applyRamp(p, RAMPS[material]);
  // foundation stones below the wall
  for (let y = 14; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (out.px[y * 16 + x] !== 'F') continue;
      const absX = absCol * 16 + x;
      out.px[y * 16 + x] =
        y === 15
          ? 'slate-dark'
          : absX % 5 === 4
            ? 'slate'
            : (Math.floor(absX / 5) + absRow) % 2
              ? 'stone'
              : 'stone-light';
    }
  }
  return out;
}

/** Timber framing laid over plaster: beams on the lit edge in highlight, shadow on the other. */
export function timberFrame(
  part: WallPart,
  col: Col,
  brace: boolean,
  ramp: Ramp = RAMPS.frame,
): Pixmap {
  const p = blank(16, 16);
  const beamV = (x0: number) => {
    for (let y = 0; y < 16; y++) {
      set(p, x0, y, 'R4');
      set(p, x0 + 1, y, 'R2');
    }
  };
  if (col === 'l' || col === 'lr') beamV(1);
  if (col === 'r' || col === 'lr') beamV(13);
  if (col === 'm') beamV(7);
  if (part === 'top')
    for (let x = 0; x < 16; x++) {
      set(p, x, 2, 'R4');
      set(p, x, 3, 'R2');
    }
  if (part === 'bot')
    for (let x = 0; x < 16; x++) {
      set(p, x, 11, 'R4');
      set(p, x, 12, 'R2');
    }
  if (brace && part === 'mid') {
    for (let i = 0; i < 12; i++) {
      set(p, 2 + i, 2 + i, 'R3');
      set(p, 13 - i, 2 + i, 'R3');
    }
  }
  return applyRamp(p, ramp);
}

// ---- openings ------------------------------------------------------------------------------

const GLASS = {
  i: 'water',
  j: 'water-light',
  k: 'foam',
  h: 'river',
  x: 'cream',
  '0': 'ink',
  g: 'gold',
};

export function windowPiece(kind: 'small' | 'arched' = 'small', ramp: Ramp = RAMPS.frame): Pixmap {
  const rows =
    kind === 'arched'
      ? `
      ................
      ......1111......
      ....11444411....
      ...1444444441...
      ...14kjjhjjj41..
      ...14jjjhjjj41..
      ...14jjjhiii41..
      ...14hhhhhhh41..
      ...14iiihiii41..
      ...14iiihiii41..
      ...14iiihiii41..
      ...14iiihiii41..
      ...1444444441...
      ..155555555551..
      ..111111111111..
      ................`
      : `
      ................
      ................
      ...1111111111...
      ...1444444441...
      ...14kjjhjjj41..
      ...14jjjhjjj41..
      ...14jjjhiii41..
      ...14hhhhhhh41..
      ...14iiihiii41..
      ...14iiihiii41..
      ...14iiihiii41..
      ...1444444441...
      ..155555555551..
      ..111111111111..
      ................
      ................`;
  return applyRamp(shaded(rows.replace(/^ {6}/gm, ''), GLASS), ramp);
}

/** A tall window for the Firm, 16×32, arched. */
export function tallWindow(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................
    ......1111......
    ....11444411....
    ...1444444441...
    ...14kjjhjjj41..
    ...14jjjhjjj41..
    ...14jjjhjjj41..
    ...14jjjhiii41..
    ...14hhhhhhh41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14hhhhhhh41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14hhhhhhh41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...14iiihiii41..
    ...1444444441...
    ..155555555551..
    ..111111111111..
    ................
    ................
    ................
    ................
    ................
    ................
    ................`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

/** A shop window, 32×16: one wide pane with a sill. */
export function shopWindow(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................................
    ................................
    ..1111111111111111111111111111..
    ..1444444444444444444444444441..
    ..14kjjjjjjjjjjjjhjjjjjjjjjjj41.
    ..14jjjjjjjjjjjjjhjjjjjjjjjjj41.
    ..14jjjjjjjjjjjjjhiiiiiiiiiii41.
    ..14jjjjjjjjjjjjjhiiiiiiiiiii41.
    ..14iiiiiiiiiiiiihiiiiiiiiiii41.
    ..14iiiiiiiiiiiiihiiiiiiiiiii41.
    ..14iiiiiiiiiiiiihiiiiiiiiiii41.
    ..1444444444444444444444444441..
    .155555555555555555555555555555.
    .111111111111111111111111111111.
    ................................
    ................................`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

export function door(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    ......1111......
    ....11433441....
    ...1443334431...
    ...1433333331...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233g31...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1433233231...
    ...1222222221...
    ...1111111111...`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

export function doubleDoor(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ............11111111............
    ..........114444444411..........
    ........1144333333334411........
    .......14433333333333344........
    ......1433333333333333331.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233g33g33233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1433233233233233231.......
    ......1222222222222222221.......
    ......1111111111111111111.......`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

/** A barn door, 32×32: wide planks with a cross brace, in the barn's own ramp. */
export function barnDoor(ramp: Ramp = RAMPS['dark-wood']): Pixmap {
  const rows = `
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ...11111111111111111111111111...
    ...14444444444444444444444441...
    ...14333333333333333333333331...
    ...13533333333333333333333531...
    ...13353333333333333333335331...
    ...13335333333333333333353331...
    ...13333533333333333333533331...
    ...13333353333333333335333331...
    ...13333335333333333353333331...
    ...13333333533333333533333331...
    ...13333333353333335333333331...
    ...13333333335333353333333331...
    ...13333333333533533333333331...
    ...13333333333353333333333331...
    ...13333333333533533333333331...
    ...13333333333333333333333331...
    ...13333333333333333333333331...
    ...13333333333333333333333331...
    ...13333333333333333333333331...
    ...13333333333333333333333331...
    ...13333333333333333333333331...
    ...12222222222222222222222221...
    ...11111111111111111111111111...
    ................................`;
  return applyRamp(shaded(rows), ramp);
}

export const CHIMNEY: Pixmap = px(
  `
  .....000000.....
  ....4444444.....
  ....4nnnnn3.....
  .....nmnnm......
  .....nnmnn......
  .....mnnmn......
  .....nnmnn......
  .....nmnnm......
  .....nnmnn......
  .....mnnmn......
  .....nnmnn......
  .....nmnnm......
  .....nnmnn......
  .....mnnmn......
  .....nnmnn......
  ................`,
  { '0': 'ink', '3': 'stone', '4': 'stone-light', n: 'brick', m: 'brick-dark' },
);

const ICONS: Record<string, string> = {
  cup: `.0000.\n.0..0.\n.0..00\n.0..0.\n.0000.\n.0000.`,
  coin: `..00..\n.0gg0.\n0gvvg0\n0gvgg0\n.0gg0.\n..00..`,
  leaf: `....0.\n..000.\n.00.0.\n00..0.\n0...0.\n.0000.`,
  hammer: `.0000.\n.0000.\n...0..\n...0..\n...0..\n...0..`,
  fish: `..000.\n.0..00\n00..0.\n.0..00\n..000.\n......`,
  book: `000000\n0.00.0\n0.00.0\n0.00.0\n0.00.0\n000000`,
  scales: `..00..\n000000\n.0..0.\n000000\n..00..\n..00..`,
  bell: `..00..\n.0000.\n.0000.\n000000\n..00..\n......`,
  seed: `..00..\n.0..0.\n0....0\n0....0\n.0..0.\n..00..`,
  gem: `.0000.\n0....0\n0....0\n.0..0.\n..00..\n......`,
  pick: `.0000.\n0....0\n...0..\n...0..\n...0..\n...0..`,
  bottle: `..00..\n..00..\n.0000.\n.0..0.\n.0..0.\n.0000.`,
};

/** A hanging shop sign with a 6×6 icon. */
export function sign(icon: string, ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    .......11.......
    .......11.......
    ..111111111111..
    ..1444444444441.
    ..1433333333331.
    ..1433333333331.
    ..1433333333331.
    ..1433333333331.
    ..1433333333331.
    ..1433333333331.
    ..1433333333331.
    ..1222222222221.
    ..111111111111..
    ................
    ................
    ................`;
  const board = applyRamp(shaded(rows), ramp);
  const glyph = px(ICONS[icon] ?? ICONS.coin!, { '0': 'ink', g: 'gold', v: 'lantern' });
  return blit(board, glyph, 5, 5);
}

/** A striped awning, 16×16, with its shadow on the wall below. */
export function awning(a: string, b: string, col: Col): Pixmap {
  const p = blank(16, 16);
  for (let y = 3; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      const stripe = Math.floor(x / 4) % 2 === 0 ? a : b;
      set(p, x, y, y === 3 ? 'bark-dark' : stripe);
    }
  }
  for (let x = 0; x < 16; x++) {
    if (x % 4 === 1 || x % 4 === 2) set(p, x, 10, Math.floor(x / 4) % 2 === 0 ? a : b);
    set(p, x, 11, 'ink@60');
  }
  if (col === 'l' || col === 'lr') for (let y = 3; y < 11; y++) set(p, 0, y, 'bark-dark');
  if (col === 'r' || col === 'lr') for (let y = 3; y < 11; y++) set(p, 15, y, 'bark-dark');
  return p;
}

// ---- composer ------------------------------------------------------------------------------

export interface WindowSpec {
  x: number;
  row: number;
  kind?: 'small' | 'arched' | 'tall' | 'shop';
}

export interface BuildingSpec {
  name: string;
  w: number;
  roofRows: number;
  wallRows: number;
  wall: WallMaterial;
  roof: RampName;
  frame?: RampName;
  timber?: boolean;
  brace?: boolean;
  door?: { x: number; kind?: 'single' | 'double' | 'barn' };
  windows?: WindowSpec[];
  chimneys?: number[];
  sign?: { x: number; icon: string };
  awning?: { x: number; w: number; colors: [string, string] };
  boxes?: number[];
  decor?: { what: 'clock' | 'plaque' | 'cupola'; x: number; row: number }[];
  /** Windows glow at night; false for a derelict or an empty hall. */
  lit?: boolean;
}

export interface ComposedBuilding {
  spec: BuildingSpec;
  w: number;
  h: number;
  /** Roof rows, drawn above characters. */
  above: Pixmap[][];
  /** Wall rows, drawn behind characters. */
  walls: Pixmap[][];
  /** Pixel centres (relative to the building's top-left) of windows, for night light masks. */
  lights: { x: number; y: number }[];
  /** Tile x of the door's left tile (relative). */
  doorX: number;
}

function cellCol(x: number, w: number): Col {
  if (w === 1) return 'lr';
  return x === 0 ? 'l' : x === w - 1 ? 'r' : 'm';
}

/** Blit a tall picture across a stack of wall tiles starting at (tx, row). */
function blitAcross(cells: Pixmap[][], pic: Pixmap, tx: number, row: number): void {
  for (let ty = 0; ty < pic.h / 16; ty++) {
    for (let txx = 0; txx < pic.w / 16; txx++) {
      const target = cells[row + ty]?.[tx + txx];
      if (!target) continue;
      const slice = blank(16, 16);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
          slice.px[y * 16 + x] = pic.px[(ty * 16 + y) * pic.w + txx * 16 + x] ?? null;
      blit(target, slice, 0, 0);
    }
  }
}

export function compose(spec: BuildingSpec): ComposedBuilding {
  const roofRamp = RAMPS[spec.roof];
  const frameRamp = RAMPS[spec.frame ?? 'frame'];
  const above: Pixmap[][] = [];
  for (let r = 0; r < spec.roofRows; r++) {
    const part: RoofPart = r === 0 ? 'ridge' : r === spec.roofRows - 1 ? 'eave' : 'mid';
    const row: Pixmap[] = [];
    for (let x = 0; x < spec.w; x++)
      row.push(roofPiece(spec.roofRows === 1 ? 'eave' : part, cellCol(x, spec.w), r, roofRamp));
    above.push(row);
  }
  const walls: Pixmap[][] = [];
  for (let r = 0; r < spec.wallRows; r++) {
    const part: WallPart = r === 0 ? 'top' : r === spec.wallRows - 1 ? 'bot' : 'mid';
    const row: Pixmap[] = [];
    for (let x = 0; x < spec.w; x++) {
      const col = cellCol(x, spec.w);
      const base = clone(wallPiece(spec.wall, spec.wallRows === 1 ? 'bot' : part, col, x, r));
      if (spec.timber)
        blit(base, timberFrame(part, col, !!spec.brace && x % 2 === 1, frameRamp), 0, 0);
      row.push(base);
    }
    walls.push(row);
  }
  const lights: { x: number; y: number }[] = [];
  for (const w of spec.windows ?? []) {
    const kind = w.kind ?? 'small';
    const pic =
      kind === 'tall'
        ? tallWindow(frameRamp)
        : kind === 'shop'
          ? shopWindow(frameRamp)
          : windowPiece(kind, frameRamp);
    blitAcross(walls, pic, w.x, w.row);
    if (spec.lit !== false)
      lights.push({
        x: w.x * 16 + pic.w / 2,
        y: (spec.roofRows + w.row) * 16 + (kind === 'tall' ? 12 : 8),
      });
  }
  for (const bx of spec.boxes ?? []) blitAcross(walls, FLOWER_BOX, bx, spec.wallRows - 1);
  let doorX = Math.floor(spec.w / 2);
  if (spec.door) {
    doorX = spec.door.x;
    const kind = spec.door.kind ?? 'single';
    const pic =
      kind === 'double'
        ? doubleDoor(frameRamp)
        : kind === 'barn'
          ? barnDoor(RAMPS[spec.wall === 'red-wood' ? 'dark-wood' : 'frame'])
          : door(frameRamp);
    blitAcross(walls, pic, doorX, spec.wallRows - 2);
  }
  if (spec.sign) blitAcross(walls, sign(spec.sign.icon, frameRamp), spec.sign.x, 0);
  if (spec.awning) {
    for (let i = 0; i < spec.awning.w; i++) {
      const col: Col =
        spec.awning.w === 1 ? 'lr' : i === 0 ? 'l' : i === spec.awning.w - 1 ? 'r' : 'm';
      blitAcross(
        walls,
        awning(spec.awning.colors[0], spec.awning.colors[1], col),
        spec.awning.x + i,
        0,
      );
    }
  }
  for (const d of spec.decor ?? []) {
    if (d.what === 'cupola') blitAcross(above, CUPOLA, d.x, d.row - 1 >= 0 ? d.row - 1 : 0);
    else blitAcross(walls, d.what === 'clock' ? CLOCK : PLAQUE, d.x, d.row);
  }
  for (const cx of spec.chimneys ?? []) blitAcross(above, CHIMNEY, cx, 0);
  return { spec, w: spec.w, h: spec.roofRows + spec.wallRows, above, walls, lights, doorX };
}

/** Flatten a composed building into one picture (for previews and tests). */
export function flatten(b: ComposedBuilding): Pixmap {
  const out = blank(b.w * 16, b.h * 16);
  b.above.forEach((row, r) => row.forEach((t, x) => blit(out, t, x * 16, r * 16)));
  b.walls.forEach((row, r) =>
    row.forEach((t, x) => blit(out, t, x * 16, (b.spec.roofRows + r) * 16)),
  );
  return out;
}

// ---- the Year 1 buildings (PROMPT.md §7.5) -------------------------------------------------

export const BUILDINGS: Record<string, BuildingSpec> = {
  'founders-cottage': {
    name: "Founder's Cottage",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'plaster',
    roof: 'red-shingle',
    timber: true,
    door: { x: 2 },
    windows: [
      { x: 0, row: 1 },
      { x: 4, row: 1 },
    ],
    chimneys: [3],
    boxes: [0, 4],
  },
  'town-hall': {
    name: 'Town Hall',
    w: 10,
    roofRows: 3,
    wallRows: 4,
    wall: 'whitewash',
    roof: 'slate',
    door: { x: 4, kind: 'double' },
    windows: [
      { x: 1, row: 1, kind: 'arched' },
      { x: 3, row: 1, kind: 'arched' },
      { x: 6, row: 1, kind: 'arched' },
      { x: 8, row: 1, kind: 'arched' },
      { x: 1, row: 2 },
      { x: 8, row: 2 },
    ],
    decor: [
      { what: 'cupola', x: 4, row: 1 },
      { what: 'clock', x: 4, row: 0 },
      { what: 'plaque', x: 5, row: 0 },
    ],
  },
  'general-store': {
    name: 'Ocampo & Daughter',
    w: 7,
    roofRows: 2,
    wallRows: 3,
    wall: 'planks',
    roof: 'green-shingle',
    door: { x: 1 },
    windows: [
      { x: 3, row: 1, kind: 'shop' },
      { x: 5, row: 1 },
    ],
    awning: { x: 3, w: 3, colors: ['moss', 'bone'] },
    sign: { x: 0, icon: 'coin' },
    chimneys: [5],
  },
  'counting-house': {
    name: 'The Counting House',
    w: 8,
    roofRows: 2,
    wallRows: 5,
    wall: 'plaster',
    roof: 'terracotta',
    timber: true,
    brace: true,
    door: { x: 3, kind: 'double' },
    windows: [
      { x: 0, row: 1 },
      { x: 2, row: 1 },
      { x: 5, row: 1 },
      { x: 7, row: 1 },
      { x: 1, row: 3 },
      { x: 6, row: 3 },
    ],
    sign: { x: 1, icon: 'cup' },
    chimneys: [1, 6],
    boxes: [0, 7],
  },
  clinic: {
    name: 'Clinic',
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'whitewash',
    roof: 'teal-shingle',
    door: { x: 1 },
    windows: [{ x: 3, row: 1 }],
    sign: { x: 3, icon: 'bottle' },
  },
  'trading-firm': {
    name: 'The Trading Firm',
    w: 14,
    roofRows: 3,
    wallRows: 5,
    wall: 'brick',
    roof: 'slate',
    frame: 'iron',
    door: { x: 6, kind: 'double' },
    windows: [
      { x: 1, row: 1, kind: 'tall' },
      { x: 3, row: 1, kind: 'tall' },
      { x: 5, row: 1, kind: 'tall' },
      { x: 8, row: 1, kind: 'tall' },
      { x: 10, row: 1, kind: 'tall' },
      { x: 12, row: 1, kind: 'tall' },
      { x: 1, row: 3, kind: 'arched' },
      { x: 3, row: 3, kind: 'arched' },
      { x: 10, row: 3, kind: 'arched' },
      { x: 12, row: 3, kind: 'arched' },
    ],
    decor: [
      { what: 'clock', x: 6, row: 0 },
      { what: 'plaque', x: 7, row: 0 },
      { what: 'plaque', x: 5, row: 3 },
      { what: 'plaque', x: 8, row: 3 },
    ],
    chimneys: [2, 11],
  },
  'hall-growers': {
    name: "Growers' Hall",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'green-shingle',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'seed' },
    lit: false,
  },
  'hall-anglers': {
    name: "Anglers' Hall",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'teal-shingle',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'fish' },
    lit: false,
  },
  'hall-prospectors': {
    name: "Prospectors' Hall",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'slate',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'pick' },
    lit: false,
  },
  'hall-artisans': {
    name: "Artisans' Hall",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'terracotta',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'hammer' },
    lit: false,
  },
  'hall-stewards': {
    name: "Stewards' Hall",
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'plum-shingle',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'book' },
    lit: false,
  },
  'hall-vault': {
    name: 'Vault of Marks',
    w: 5,
    roofRows: 2,
    wallRows: 3,
    wall: 'stone',
    roof: 'gold-shingle',
    door: { x: 2 },
    windows: [
      { x: 0, row: 1, kind: 'arched' },
      { x: 4, row: 1, kind: 'arched' },
    ],
    sign: { x: 0, icon: 'gem' },
    lit: false,
  },
  barn: {
    name: 'Okonkwo Barn',
    w: 7,
    roofRows: 3,
    wallRows: 3,
    wall: 'red-wood',
    roof: 'dark-wood',
    door: { x: 2, kind: 'barn' },
    windows: [
      { x: 0, row: 1 },
      { x: 6, row: 1 },
    ],
  },
  coop: {
    name: 'Coop',
    w: 4,
    roofRows: 1,
    wallRows: 2,
    wall: 'planks',
    roof: 'red-shingle',
    door: { x: 1 },
    windows: [{ x: 3, row: 0 }],
  },
  'wrens-cottage': {
    name: "Wren's Cottage",
    w: 5,
    roofRows: 2,
    wallRows: 2,
    wall: 'plaster',
    roof: 'thatch',
    door: { x: 2 },
    windows: [
      { x: 0, row: 0 },
      { x: 4, row: 0 },
    ],
    chimneys: [1],
    boxes: [0],
  },
  'fishing-hut': {
    name: 'Fishing Hut',
    w: 3,
    roofRows: 1,
    wallRows: 2,
    wall: 'planks',
    roof: 'thatch',
    door: { x: 1 },
    windows: [{ x: 2, row: 0 }],
  },
};

export function previewBuildings(): Pixmap[] {
  return Object.values(BUILDINGS).map((s) => flatten(compose(s)));
}

export const _b = { px };
