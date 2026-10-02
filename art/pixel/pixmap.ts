// A tiny pixel-art compiler: pictures are ASCII rows with a legend, every pixel is a palette colour
// name (optionally "name@alpha" for shadows), and sheets are packed from named pictures.
import { PNG } from 'pngjs';
import { PALETTE, type Ramp, type TileGroup } from './palette.ts';

export type Px = string | null;
export interface Pixmap {
  w: number;
  h: number;
  px: Px[];
}

export function blank(w: number, h: number, fill: Px = null): Pixmap {
  return { w, h, px: new Array<Px>(w * h).fill(fill) };
}

export function clone(p: Pixmap): Pixmap {
  return { w: p.w, h: p.h, px: p.px.slice() };
}

export function get(p: Pixmap, x: number, y: number): Px {
  return x < 0 || y < 0 || x >= p.w || y >= p.h ? null : (p.px[y * p.w + x] ?? null);
}

export function set(p: Pixmap, x: number, y: number, c: Px): void {
  if (x >= 0 && y >= 0 && x < p.w && y < p.h) p.px[y * p.w + x] = c;
}

export type Legend = Record<string, Px>;

/** ASCII rows → Pixmap. '.' is transparent unless the legend says otherwise; rows must be equal length. */
export function px(rows: string, legend: Legend): Pixmap {
  const lines = rows
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const w = lines[0]?.length ?? 0;
  const out = blank(w, lines.length);
  lines.forEach((line, y) => {
    if (line.length !== w) throw new Error(`ragged row ${y}: "${line}" (${line.length} ≠ ${w})`);
    for (let x = 0; x < w; x++) {
      const ch = line[x]!;
      if (ch === '.') {
        out.px[y * w + x] = legend['.'] ?? null;
        continue;
      }
      if (!(ch in legend)) throw new Error(`no legend entry for "${ch}" at ${x},${y}`);
      out.px[y * w + x] = legend[ch]!;
    }
  });
  return out;
}

/** Digits 1–5 in the rows are ramp steps (R1 darkest … R5 lightest), resolved later by applyRamp. */
export function shaded(rows: string, legend: Legend = {}): Pixmap {
  return px(rows, { '1': 'R1', '2': 'R2', '3': 'R3', '4': 'R4', '5': 'R5', ...legend });
}

export function applyRamp(p: Pixmap, ramp: Ramp, prefix = 'R'): Pixmap {
  const map: Record<string, string> = {};
  ramp.forEach((c, i) => (map[`${prefix}${i + 1}`] = c));
  return recolor(p, map);
}

/** Recolour by name; alpha suffixes survive. Unknown names pass through. */
export function recolor(p: Pixmap, map: Record<string, string>): Pixmap {
  const out = clone(p);
  for (let i = 0; i < out.px.length; i++) {
    const c = out.px[i];
    if (c === null || c === undefined) continue;
    const at = c.indexOf('@');
    const name = at < 0 ? c : c.slice(0, at);
    const to = map[name];
    if (to !== undefined) out.px[i] = at < 0 ? to : `${to}${c.slice(at)}`;
  }
  return out;
}

export function blit(dst: Pixmap, src: Pixmap, x0: number, y0: number): Pixmap {
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const c = src.px[y * src.w + x];
      if (c !== null && c !== undefined) set(dst, x0 + x, y0 + y, c);
    }
  }
  return dst;
}

/** Stack pictures (first at the bottom) onto a canvas of the first picture's size. */
export function stack(...layers: (Pixmap | null | undefined)[]): Pixmap {
  const base = layers.find((l): l is Pixmap => !!l);
  if (!base) throw new Error('stack of nothing');
  const out = blank(base.w, base.h);
  for (const l of layers) if (l) blit(out, l, 0, 0);
  return out;
}

export function crop(p: Pixmap, x0: number, y0: number, w: number, h: number): Pixmap {
  const out = blank(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) out.px[y * w + x] = get(p, x0 + x, y0 + y);
  return out;
}

export function flipH(p: Pixmap): Pixmap {
  const out = blank(p.w, p.h);
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) out.px[y * p.w + x] = p.px[y * p.w + (p.w - 1 - x)]!;
  return out;
}

export function flipV(p: Pixmap): Pixmap {
  const out = blank(p.w, p.h);
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) out.px[y * p.w + x] = p.px[(p.h - 1 - y) * p.w + x]!;
  return out;
}

/** Rotate 90° clockwise. */
export function rotCW(p: Pixmap): Pixmap {
  const out = blank(p.h, p.w);
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) set(out, p.h - 1 - y, x, p.px[y * p.w + x]!);
  return out;
}

export function rotCCW(p: Pixmap): Pixmap {
  return rotCW(rotCW(rotCW(p)));
}

export function fillRect(p: Pixmap, x0: number, y0: number, w: number, h: number, c: Px): void {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(p, x, y, c);
}

export function fillEllipse(
  p: Pixmap,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  c: Px,
): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) set(p, x, y, c);
    }
  }
}

export function fillCircle(p: Pixmap, cx: number, cy: number, r: number, c: Px): void {
  fillEllipse(p, cx, cy, r, r, c);
}

/** Opaque pixels that touch transparency (4-neighbourhood). */
export function rim(p: Pixmap): boolean[] {
  const out = new Array<boolean>(p.w * p.h).fill(false);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (get(p, x, y) === null) continue;
      if (
        get(p, x - 1, y) === null ||
        get(p, x + 1, y) === null ||
        get(p, x, y - 1) === null ||
        get(p, x, y + 1) === null
      )
        out[y * p.w + x] = true;
    }
  }
  return out;
}

/** Recolour the silhouette's own edge pixels (an inside outline, GAME-LAYER.md §5 rule 1). */
export function outlineInside(p: Pixmap, c: string, skipBottom = false): Pixmap {
  const out = clone(p);
  const edge = rim(p);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!edge[y * p.w + x]) continue;
      if (
        skipBottom &&
        get(p, x, y + 1) === null &&
        get(p, x - 1, y) !== null &&
        get(p, x + 1, y) !== null
      )
        continue;
      out.px[y * p.w + x] = c;
    }
  }
  return out;
}

/** Nearest-neighbour upscale, for previews. */
export function scale(p: Pixmap, k: number): Pixmap {
  const out = blank(p.w * k, p.h * k);
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++)
      out.px[y * out.w + x] = p.px[Math.floor(y / k) * p.w + Math.floor(x / k)]!;
  return out;
}

export function parsePx(c: string): { name: string; alpha: number } {
  const at = c.indexOf('@');
  return at < 0
    ? { name: c, alpha: 255 }
    : { name: c.slice(0, at), alpha: Number(c.slice(at + 1)) };
}

export function toPNG(p: Pixmap): Buffer {
  const png = new PNG({ width: p.w, height: p.h });
  for (let i = 0; i < p.px.length; i++) {
    const c = p.px[i];
    const o = i * 4;
    if (c === null || c === undefined) {
      png.data[o] = png.data[o + 1] = png.data[o + 2] = png.data[o + 3] = 0;
      continue;
    }
    const { name, alpha } = parsePx(c);
    const rgb = PALETTE[name];
    if (!rgb) throw new Error(`"${name}" is not in art/pixel/palette.ts`);
    png.data[o] = rgb[0];
    png.data[o + 1] = rgb[1];
    png.data[o + 2] = rgb[2];
    png.data[o + 3] = alpha;
  }
  return PNG.sync.write(png);
}

export const TILE = 16;

export interface BigTile {
  w: number; // in tiles
  h: number;
  ids: number[][]; // [row][col] 1-based gids
}

/**
 * A tileset that grows as pictures are asked for. Identical pictures share one tile, so composed
 * building pieces and autotile variants stay deduplicated. Every tile carries a season group.
 */
export class TilesetBuilder {
  readonly tiles: Pixmap[] = [];
  readonly groups: TileGroup[] = [];
  readonly names = new Map<string, number>();
  private readonly byKey = new Map<string, number>();
  private readonly bigs = new Map<string, BigTile>();

  /** Register a 16×16 picture; returns its 1-based gid. */
  tile(p: Pixmap, group: TileGroup = 'static', name?: string): number {
    if (p.w !== TILE || p.h !== TILE)
      throw new Error(`tile must be 16×16, got ${p.w}×${p.h}${name ? ` (${name})` : ''}`);
    const key = `${group}|${p.px.map((c) => c ?? '').join(',')}`;
    let gid = this.byKey.get(key);
    if (gid === undefined) {
      this.tiles.push(clone(p));
      this.groups.push(group);
      gid = this.tiles.length;
      this.byKey.set(key, gid);
    }
    if (name) this.names.set(name, gid);
    return gid;
  }

  /** Slice a multiple-of-16 picture into tiles; blank tiles become gid 0 (empty). */
  big(name: string, p: Pixmap, group: TileGroup = 'static'): BigTile {
    if (p.w % TILE || p.h % TILE) throw new Error(`${name}: ${p.w}×${p.h} is not a multiple of 16`);
    const w = p.w / TILE;
    const h = p.h / TILE;
    const ids: number[][] = [];
    for (let ty = 0; ty < h; ty++) {
      const row: number[] = [];
      for (let tx = 0; tx < w; tx++) {
        const t = crop(p, tx * TILE, ty * TILE, TILE, TILE);
        row.push(t.px.every((c) => c === null) ? 0 : this.tile(t, group));
      }
      ids.push(row);
    }
    const bt = { w, h, ids };
    this.bigs.set(name, bt);
    return bt;
  }

  bigNamed(name: string): BigTile {
    const b = this.bigs.get(name);
    if (!b) throw new Error(`no big tile "${name}"`);
    return b;
  }

  gid(name: string): number {
    const g = this.names.get(name);
    if (g === undefined) throw new Error(`no tile "${name}"`);
    return g;
  }

  get columns(): number {
    return 32;
  }

  get rows(): number {
    return Math.ceil(this.tiles.length / this.columns);
  }

  /** Render the sheet, with a per-group recolour (season swaps). */
  render(swaps?: Record<TileGroup, Record<string, string>>): Pixmap {
    const out = blank(this.columns * TILE, Math.max(1, this.rows) * TILE);
    this.tiles.forEach((t, i) => {
      const p = swaps ? recolor(t, swaps[this.groups[i]!]) : t;
      blit(out, p, (i % this.columns) * TILE, Math.floor(i / this.columns) * TILE);
    });
    return out;
  }
}

export interface AtlasFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A sprite atlas packed in shelves; emits Phaser's JSON-hash format. */
export class AtlasBuilder {
  private readonly frames: { name: string; p: Pixmap }[] = [];
  constructor(private readonly width = 512) {}

  add(name: string, p: Pixmap): void {
    if (this.frames.some((f) => f.name === name)) throw new Error(`duplicate frame ${name}`);
    this.frames.push({ name, p });
  }

  render(): { sheet: Pixmap; frames: Record<string, AtlasFrame> } {
    const placed: Record<string, AtlasFrame> = {};
    let x = 0;
    let y = 0;
    let shelf = 0;
    for (const f of this.frames) {
      if (x + f.p.w > this.width) {
        x = 0;
        y += shelf;
        shelf = 0;
      }
      placed[f.name] = { x, y, w: f.p.w, h: f.p.h };
      x += f.p.w;
      shelf = Math.max(shelf, f.p.h);
    }
    const sheet = blank(this.width, y + shelf);
    for (const f of this.frames) {
      const r = placed[f.name]!;
      blit(sheet, f.p, r.x, r.y);
    }
    return { sheet, frames: placed };
  }

  static phaserJson(frames: Record<string, AtlasFrame>, image: string, sheet: Pixmap): string {
    const out: Record<string, unknown> = {};
    for (const [name, r] of Object.entries(frames)) {
      out[name] = {
        frame: { x: r.x, y: r.y, w: r.w, h: r.h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: r.w, h: r.h },
        sourceSize: { w: r.w, h: r.h },
      };
    }
    return JSON.stringify({
      frames: out,
      meta: { app: 'agent-town art:build', image, size: { w: sheet.w, h: sheet.h }, scale: '1' },
    });
  }
}
