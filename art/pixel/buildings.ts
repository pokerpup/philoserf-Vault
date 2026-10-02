// The modular building kit (GAME-LAYER.md §5): roof, wall, window, door, chimney, sign and awning
// pieces drawn in a neutral ramp and recoloured per material, plus a composer that lays a whole
// building out from a short spec. Every §7.5 building is a spec, not a drawing.
import { RAMPS, type Ramp, type RampName } from './palette.ts';
import { applyRamp, blank, blit, clone, px, set, shaded, type Pixmap } from './pixmap.ts';
import { CLOCK, CUPOLA, FLOWER_BOX, PLAQUE, WALL_LANTERN } from './objects.ts';

// ---- roofs ---------------------------------------------------------------------------------

/**
 * One shingle pixel for an absolute roof position: bands of four rows, every other band offset by
 * half a shingle, each shingle with a lit top edge, a rounded shaded foot and a seam, and a little
 * tone variation so the roof is never a flat pattern.
 */
function shingle(absX: number, absY: number): string {
  const band = Math.floor(absY / 4);
  const r = absY % 4;
  const off = (band % 2) * 4;
  const i = (absX + off) % 8;
  const id = Math.floor((absX + off) / 8);
  const tone = hash(id, band) % 11;
  const body = tone === 0 ? 'R4' : tone === 1 ? 'R2' : 'R3';
  if (r === 0) return i === 1 || i === 2 ? 'R5' : i === 7 ? 'R2' : 'R4';
  if (r === 3) return i === 7 ? 'R1' : 'R2';
  if (i === 7) return 'R2';
  if (r === 2 && (i === 0 || i === 6)) return 'R2';
  return body;
}

export type Col = 'l' | 'm' | 'r' | 'lr';
export type RoofPart = 'ridge' | 'mid' | 'eave';
export type Overhang = 'none' | 'left' | 'right';

/**
 * A roof tile. `over` draws the half-tile overhang past the wall on that side: the roof's own
 * edge with its outline, over nothing. Eave tiles end in a lit fascia board and its underside.
 */
export function roofPiece(
  part: RoofPart,
  absRow: number,
  ramp: Ramp,
  over: Overhang = 'none',
  fascia: Ramp = RAMPS.frame,
): Pixmap {
  const p = blank(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (over === 'left' && x < 8) continue;
      if (over === 'right' && x >= 8) continue;
      let c: string;
      const absY = absRow * 16 + y;
      if (part === 'ridge' && y === 0) c = 'R1';
      else if (part === 'ridge' && y === 1) c = 'R5';
      else if (part === 'ridge' && y === 2) c = 'R4';
      else if (part === 'eave' && y === 13) c = 'R2';
      else if (part === 'eave' && y === 14) c = 'F4';
      else if (part === 'eave' && y === 15) c = 'F2';
      else c = shingle(x, absY);
      if (over === 'left' && x === 8) c = y >= 14 ? 'F1' : 'R1';
      if (over === 'right' && x === 7) c = y >= 14 ? 'F1' : 'R1';
      set(p, x, y, c);
    }
  }
  return applyRamp(applyRamp(p, ramp), fascia, 'F');
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
      const id = Math.floor((absX + off) / 8);
      if (r === 3 || i === 7) return 'R2';
      const tone = hash(id, band) % 9;
      if (r === 0 && i === 0) return 'R4';
      if (r === 0) return tone === 0 ? 'R3' : 'R4';
      return tone === 0 ? 'R2' : tone === 1 ? 'R4' : 'R3';
    }
    case 'stone': {
      const band = Math.floor(absY / 5);
      const r = absY % 5;
      const off = (band % 2) * 3;
      const i = (absX + off) % 7;
      const id = Math.floor((absX + off) / 7);
      if (r === 4 || i === 6) return 'R2';
      const tone = hash(id, band) % 5;
      if (r === 0 && i === 0) return 'R5';
      if (r === 3 || i === 5) return tone === 0 ? 'R2' : 'R3';
      return tone === 0 ? 'R3' : 'R4';
    }
    case 'planks':
    case 'red-wood': {
      const r = absY % 4;
      const band = Math.floor(absY / 4);
      const seam = ((band % 3) * 5 + 4) % 16;
      if (r === 3) return 'R2';
      if (r === 0) return 'R5';
      if (absX % 16 === seam) return 'R2';
      if (hash(absX, band) % 61 === 0) return 'R2'; // a knot
      return 'R4';
    }
    default: {
      // plaster and whitewash: a sparse, quiet grain
      const h = hash(absX, absY);
      return material === 'whitewash'
        ? h % 89 === 0
          ? 'R3'
          : 'R4'
        : h % 41 === 0
          ? 'R5'
          : h % 59 === 0
            ? 'R3'
            : 'R4';
    }
  }
}

/**
 * A wall tile: the material's texture, an eave shadow under the roof, a corner board on the
 * building's outer columns, a baseboard and a stone footing on the bottom row.
 */
export function wallPiece(
  material: WallMaterial,
  part: WallPart,
  col: Col,
  absCol: number,
  absRow: number,
  frame: Ramp = RAMPS.frame,
): Pixmap {
  const p = blank(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let c = wallTexture(material, absCol * 16 + x, absRow * 16 + y);
      if (part === 'top' && y < 2) c = 'R2';
      else if (part === 'top' && y === 2) c = c === 'R5' || c === 'R4' ? 'R3' : c;
      if (part === 'bot' && y === 12) c = 'F2';
      if (part === 'bot' && y >= 13) c = 'FOOT';
      if (col === 'l' || col === 'lr') {
        if (x === 0) c = 'F1';
        else if (x === 1) c = y === 12 && part === 'bot' ? 'F2' : 'F4';
      }
      if (col === 'r' || col === 'lr') {
        if (x === 15) c = 'F1';
        else if (x === 14) c = y === 12 && part === 'bot' ? 'F2' : 'F3';
      }
      set(p, x, y, c);
    }
  }
  const out = applyRamp(applyRamp(p, RAMPS[material]), frame, 'F');
  for (let y = 13; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (out.px[y * 16 + x] !== 'FOOT') continue;
      const absX = absCol * 16 + x;
      out.px[y * 16 + x] =
        y === 15
          ? 'slate-dark'
          : y === 13
            ? absX % 6 === 0
              ? 'stone'
              : 'stone-light'
            : absX % 6 === 5
              ? 'slate'
              : (Math.floor(absX / 6) + absRow) % 2
                ? 'stone'
                : 'stone-light';
    }
  }
  return out;
}

/** Timber framing laid over plaster: beams with a lit and a shaded edge, braces on alternate tiles. */
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
  if (col === 'm') beamV(7);
  if (part === 'top')
    for (let x = 0; x < 16; x++) {
      set(p, x, 3, 'R4');
      set(p, x, 4, 'R2');
    }
  if (part === 'bot')
    for (let x = 0; x < 16; x++) {
      set(p, x, 10, 'R4');
      set(p, x, 11, 'R2');
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
  k: 'mist',
  h: 'river',
  x: 'cream',
  '0': 'ink',
  g: 'gold',
  p: 'peach',
  q: 'ember',
  s: 'ink@70',
  '.': null,
};

/**
 * A four-pane window: lintel, frame, chunky mullions with a lit and a shaded side, each pane lit
 * at its top-left, a sill that casts a shadow on the wall. Homes get a valance and a curtain fold.
 */
export function windowPiece(
  kind: 'small' | 'arched' = 'small',
  ramp: Ramp = RAMPS.frame,
  curtains = false,
): Pixmap {
  const rows =
    kind === 'arched'
      ? `
      ................
      .....144441.....
      ...1144444411...
      ..14433333344 1.
      ..13kjjj42jjj31.
      ..13jjji42iiih1.
      ..13jjii42iiih1.
      ..1344444444441.
      ..1322222222221.
      ..13jjii42iiih1.
      ..13jiii42iiih1.
      ..13iiih42hhhh1.
      ..13333333333331
      .55555555555555.
      ssssssssssssssss
      ................`
      : `
      ................
      .44444444444444.
      .11111111111111.
      ..13333333333331
      ..13kjjj42jjjk31
      ..13jjji42iiih31
      ..13jjii42iiih31
      ..13444444444431
      ..13222222222231
      ..13jjii42iiih31
      ..13jiii42iiih31
      ..13iiih42hhhh31
      ..13333333333331
      .55555555555555.
      ssssssssssssssss
      ................`;
  let fixed = rows.replace(/ 1\./g, '41.').replace(/^ {6}/gm, '');
  if (curtains)
    fixed = fixed
      .replace('13kjjj42jjjk31', '13pppp42pppp31')
      .replace('13jjji42iiih31', '13qjji42iiiq31');
  return applyRamp(shaded(fixed, GLASS), ramp);
}

/** A tall arched window for the Firm, 16×32: three rows of panes. */
export function tallWindow(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................
    .....144441.....
    ...1144444411...
    ..1443333334441.
    ..13kjjj42jjjh31
    ..13jjji42iiih31
    ..13jjii42iiih31
    ..13444444444431
    ..13222222222231
    ..13jjii42iiih31
    ..13jiii42iiih31
    ..13iiih42hhhh31
    ..13444444444431
    ..13222222222231
    ..13jjii42iiih31
    ..13jiii42iiih31
    ..13iiih42hhhh31
    ..13444444444431
    ..13222222222231
    ..13jjii42iiih31
    ..13jiii42iiih31
    ..13iiih42hhhh31
    ..13333333333331
    .55555555555555.
    ssssssssssssssss
    ................
    ................
    ................
    ................
    ................
    ................
    ................`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

/** A shop window, 32×16: one wide display pane in a heavy frame, a sill with its shadow. */
export function shopWindow(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................................
    .444444444444444444444444444444.
    .111111111111111111111111111111.
    ..13333333333333333333333333331.
    ..13kjjjjjjjjjj42jjjjjjjjjjjk31.
    ..13jjjjjjjjjjj42jjjjjjjjjjjh31.
    ..13jjjjjjjjiii42iiiiiiiiiiih31.
    ..13jjjjjiiiiii42iiiiiiiiiiih31.
    ..13iiiiiiiiiii42iiiiiiiiiiih31.
    ..13iiiiiiiiiih42hhhhhhhhhhhh31.
    ..13iiiiiiiiiih42hhhhhhhhhhhh31.
    ..13333333333333333333333333331.
    .555555555555555555555555555555.
    ssssssssssssssssssssssssssssssss
    ................................
    ................................`;
  return applyRamp(shaded(rows, GLASS), ramp);
}

/** A panelled door, 16×32: lintel board, jambs, a small pane up top, a brass knob, a kick plate. */
export function door(ramp: Ramp = RAMPS.frame, pane = false): Pixmap {
  const rows = `
    ................
    ................
    ................
    ................
    ................
    ................
    ................
    ..444444444444..
    ..111111111111..
    ..1433333333421.
    ..1433333333421.
    ..143WWWWWWW421.
    ..143W33333W421.
    ..143W33333W421.
    ..143W33333W421.
    ..143WWWWWWW421.
    ..1433333333421.
    ..143WWWWWWW421.
    ..143W33333W421.
    ..143W33333W421.
    ..143W33333W421.
    ..143W33333W421.
    ..143W3333gW421.
    ..143W33333W421.
    ..143W33333W421.
    ..143W33333W421.
    ..143WWWWWWW421.
    ..1433333333421.
    ..1422222222221.
    ..1222222222221.
    ..111111111111..
    ..555555555555..`;
  const fixed = pane
    ? rows
        .replace(
          '..143W33333W421.\n    ..143W33333W421.\n    ..143W33333W421.\n    ..143WWWWWWW421.\n    ..1433333333421.',
          '..143Wjjjj iW421.\n    ..143Wjjiih W421.\n    ..143Wiiihh W421.\n    ..143WWWWWWW421.\n    ..1433333333421.',
        )
        .replace(/ /g, '')
    : rows;
  return applyRamp(shaded(fixed.replace(/W/g, '2'), GLASS), ramp);
}

export function doubleDoor(ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ................................
    ................................
    ................................
    ................................
    ................................
    ..4444444444444444444444444444..
    ..1111111111111111111111111111..
    ..14333333333321123333333333421.
    ..14333333333321123333333333421.
    ..143WWWWWWWW321123WWWWWWWW3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143WWWWWWWW321123WWWWWWWW3421.
    ..14333333333321123333333333421.
    ..143WWWWWWWW321123WWWWWWWW3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143W33333gW321123Wg33333W3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143W333333W321123W333333W3421.
    ..143WWWWWWWW321123WWWWWWWW3421.
    ..14333333333321123333333333421.
    ..14222222222221122222222222421.
    ..12222222222221122222222222221.
    ..1111111111111111111111111111..
    ..5555555555555555555555555555..
    ................................
    ................................`;
  return applyRamp(shaded(rows.replace(/W/g, '2'), GLASS), ramp);
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
    ..4444444444444444444444444444..
    ..1111111111111111111111111111..
    ..14333333333333333333333333421.
    ..13533333333333333333333335321.
    ..13353333333333333333333353321.
    ..13335333333333333333333533321.
    ..13333533333333333333335333321.
    ..13333353333333333333353333321.
    ..13333335333333333333533333321.
    ..13333333533333333335333333321.
    ..13333333353333333353333333321.
    ..13333333335333333533333333321.
    ..13333333333533335333333333321.
    ..13333333333353353333333333321.
    ..13333333333335533333333333321.
    ..13333333333353353333333333321.
    ..13333333333533335333333333321.
    ..13333333335333333533333333321.
    ..13333333333333333333333333321.
    ..13333333333333333333333333321.
    ..12222222222222222222222222221.
    ..1111111111111111111111111111..
    ..5555555555555555555555555555..
    ................................
    ................................`;
  return applyRamp(shaded(rows), ramp);
}

export const CHIMNEY: Pixmap = px(
  `
  .....000000.....
  ....44444444....
  ....4nnnnnn3....
  .....nmnnnm.....
  .....nnmnnn.....
  .....mnnnmn.....
  .....nnmnnn.....
  .....nmnnnm.....
  .....nnmnnn.....
  .....mnnnmn.....
  .....nnmnnn.....
  .....nmnnnm.....
  .....nnmnnn.....
  .....mnnnmn.....
  .....nnmnnn.....
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

/** A hanging shop sign on an iron bracket with a 6×6 icon. */
export function sign(icon: string, ramp: Ramp = RAMPS.frame): Pixmap {
  const rows = `
    ......0.........
    ......00000.....
    ..........0.....
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
    ................`;
  const board = applyRamp(shaded(rows, { '0': 'slate-dark' }), ramp);
  const glyph = px(ICONS[icon] ?? ICONS.coin!, { '0': 'ink', g: 'gold', v: 'lantern' });
  return blit(board, glyph, 5, 6);
}

/** A striped awning, 16×16, scalloped, with its shadow on the wall below. */
export function awning(a: string, b: string, col: Col): Pixmap {
  const p = blank(16, 16);
  for (let y = 3; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      const stripe = Math.floor(x / 4) % 2 === 0 ? a : b;
      set(p, x, y, y === 3 ? 'bark-dark' : y === 4 ? (stripe === a ? b : a) : stripe);
    }
  }
  for (let x = 0; x < 16; x++) {
    if (x % 4 === 1 || x % 4 === 2) set(p, x, 10, Math.floor(x / 4) % 2 === 0 ? a : b);
    set(p, x, 11, 'ink@70');
    set(p, x, 12, 'ink@35');
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
  door?: { x: number; kind?: 'single' | 'double' | 'barn'; pane?: boolean };
  windows?: WindowSpec[];
  /** Homes: a valance and a curtain fold in every small window. */
  curtains?: boolean;
  chimneys?: number[];
  sign?: { x: number; icon: string };
  awning?: { x: number; w: number; colors: [string, string] };
  boxes?: number[];
  decor?: { what: 'clock' | 'plaque' | 'cupola'; x: number; row: number }[];
  /** Windows glow at night and lanterns flank the door; false for a derelict or an empty hall. */
  lit?: boolean;
}

export interface ComposedBuilding {
  spec: BuildingSpec;
  w: number;
  h: number;
  /** Roof rows, drawn above characters; one tile wider than the walls on each side (the overhang). */
  above: Pixmap[][];
  /** Tile offset of `above` relative to the walls' left edge. */
  aboveOffsetX: number;
  /** Wall rows, drawn behind characters. */
  walls: Pixmap[][];
  /** Pixel centres (relative to the walls' top-left) of windows and door lanterns, for night light masks. */
  lights: { x: number; y: number; kind: 'window' | 'lantern' }[];
  /** Pixel centres of chimney tops, relative to the walls' top-left, for smoke. */
  smoke: { x: number; y: number }[];
  /** Tile x of the door's left tile (relative). */
  doorX: number;
  doorWidth: number;
}

function cellCol(x: number, w: number): Col {
  if (w === 1) return 'lr';
  return x === 0 ? 'l' : x === w - 1 ? 'r' : 'm';
}

/** Blit a tall picture across a stack of tiles starting at (tx, row). */
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
    const part: RoofPart =
      spec.roofRows === 1 ? 'eave' : r === 0 ? 'ridge' : r === spec.roofRows - 1 ? 'eave' : 'mid';
    const row: Pixmap[] = [roofPiece(part, r, roofRamp, 'left', frameRamp)];
    for (let x = 0; x < spec.w; x++) row.push(roofPiece(part, r, roofRamp, 'none', frameRamp));
    row.push(roofPiece(part, r, roofRamp, 'right', frameRamp));
    above.push(row);
  }
  const walls: Pixmap[][] = [];
  for (let r = 0; r < spec.wallRows; r++) {
    const part: WallPart =
      spec.wallRows === 1 ? 'bot' : r === 0 ? 'top' : r === spec.wallRows - 1 ? 'bot' : 'mid';
    const row: Pixmap[] = [];
    for (let x = 0; x < spec.w; x++) {
      const col = cellCol(x, spec.w);
      const base = clone(wallPiece(spec.wall, part, col, x, r, frameRamp));
      if (spec.timber)
        blit(base, timberFrame(part, col, !!spec.brace && x % 2 === 1, frameRamp), 0, 0);
      row.push(base);
    }
    walls.push(row);
  }
  const lights: ComposedBuilding['lights'] = [];
  const taken = new Set<string>();
  for (const w of spec.windows ?? []) {
    const kind = w.kind ?? 'small';
    const pic =
      kind === 'tall'
        ? tallWindow(frameRamp)
        : kind === 'shop'
          ? shopWindow(frameRamp)
          : windowPiece(kind, frameRamp, !!spec.curtains && kind === 'small');
    blitAcross(walls, pic, w.x, w.row);
    for (let i = 0; i < pic.w / 16; i++)
      for (let j = 0; j < pic.h / 16; j++) taken.add(`${w.x + i},${w.row + j}`);
    if (spec.lit !== false)
      lights.push({
        x: w.x * 16 + pic.w / 2,
        y: w.row * 16 + (kind === 'tall' ? 12 : 8),
        kind: 'window',
      });
  }
  for (const bx of spec.boxes ?? []) blitAcross(walls, FLOWER_BOX, bx, spec.wallRows - 1);
  let doorX = Math.floor(spec.w / 2);
  let doorWidth = 1;
  if (spec.door) {
    doorX = spec.door.x;
    const kind = spec.door.kind ?? 'single';
    doorWidth = kind === 'single' ? 1 : 2;
    const pic =
      kind === 'double'
        ? doubleDoor(frameRamp)
        : kind === 'barn'
          ? barnDoor(RAMPS[spec.wall === 'red-wood' ? 'dark-wood' : 'frame'])
          : door(frameRamp, !!spec.door.pane);
    blitAcross(walls, pic, doorX, spec.wallRows - 2);
    for (let i = 0; i < doorWidth; i++) {
      taken.add(`${doorX + i},${spec.wallRows - 2}`);
      taken.add(`${doorX + i},${spec.wallRows - 1}`);
    }
    if (spec.lit !== false && kind !== 'barn') {
      for (const lx of [doorX - 1, doorX + doorWidth]) {
        const row = spec.wallRows - 2;
        if (lx < 0 || lx >= spec.w || taken.has(`${lx},${row}`)) continue;
        blitAcross(walls, WALL_LANTERN, lx, row);
        lights.push({ x: lx * 16 + 7, y: row * 16 + 7, kind: 'lantern' });
      }
    }
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
    if (d.what === 'cupola') blitAcross(above, CUPOLA, d.x + 1, Math.max(0, d.row - 1));
    else blitAcross(walls, d.what === 'clock' ? CLOCK : PLAQUE, d.x, d.row);
  }
  const smoke: { x: number; y: number }[] = [];
  for (const cx of spec.chimneys ?? []) {
    blitAcross(above, CHIMNEY, cx + 1, 0);
    smoke.push({ x: cx * 16 + 8, y: -spec.roofRows * 16 + 1 });
  }
  return {
    spec,
    w: spec.w,
    h: spec.roofRows + spec.wallRows,
    above,
    aboveOffsetX: -1,
    walls,
    lights,
    smoke,
    doorX,
    doorWidth,
  };
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
    door: { x: 1, pane: true },
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
    curtains: true,
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
