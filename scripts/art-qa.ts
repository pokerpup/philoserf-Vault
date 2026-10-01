// pnpm art:qa — PROMPT.md §4.7. Every PNG under art/ and the client's assets must sit on the
// 16-px grid, use only art/palette.gpl colours and carry a provenance entry. Character sheets must
// keep their silhouettes inside each 16×32 cell and have no orphan pixels; portrait strips must
// change at least 12 pixels per expression. Still pending for the art phase: light direction,
// identical crop stages.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PNG } from 'pngjs';
import { readPalette, rgbKey } from './palette.ts';

const ROOT = join(import.meta.dirname, '..');
const SCAN = ['art', join('apps', 'town-client', 'public', 'assets')];
const GRID = 16;
const PORTRAIT = 64;
const MIN_EXPRESSION_DIFF = 12;

function pngs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'raw' || name === 'node_modules') continue; // art/raw is git-ignored source material
    if (statSync(p).isDirectory()) out.push(...pngs(p));
    else if (name.endsWith('.png')) out.push(p);
  }
  return out;
}

const palette = readPalette(join(ROOT, 'art', 'palette.gpl'));
const allowed = new Set([...palette.values()].map(([r, g, b]) => rgbKey(r, g, b)));
const provenanceFile = join(ROOT, 'art', 'provenance.json');
const provenance = new Map(
  (JSON.parse(readFileSync(provenanceFile, 'utf8')) as { file: string; licence: string }[]).map(
    (e) => [e.file, e.licence],
  ),
);

const problems: string[] = [];
let checked = 0;
if (palette.size !== 48) problems.push(`art/palette.gpl: ${palette.size} colours, §4.3 wants 48`);

const opaque = (png: PNG, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < png.width && y < png.height && png.data[(y * png.width + x) * 4 + 3]! > 0;

/** An opaque pixel with no opaque neighbour in the 8-neighbourhood. */
function orphans(png: PNG): number {
  let n = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (!opaque(png, x, y)) continue;
      let alone = true;
      for (let dy = -1; dy <= 1 && alone; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && opaque(png, x + dx, y + dy)) alone = false;
      if (alone) n++;
    }
  }
  return n;
}

/** Character atlases: every 16×32 cell keeps its top, left and right edge columns clear. */
function silhouettesTouchFrame(png: PNG): number {
  let n = 0;
  for (let cy = 0; cy < png.height; cy += 32) {
    for (let cx = 0; cx < png.width; cx += 16) {
      let touches = false;
      for (let y = cy; y < cy + 32 && !touches; y++)
        if (opaque(png, cx, y) || opaque(png, cx + 15, y)) touches = true;
      for (let x = cx; x < cx + 16 && !touches; x++) if (opaque(png, x, cy)) touches = true;
      if (touches) n++;
    }
  }
  return n;
}

function expressionDiffs(png: PNG): number[] {
  const frames = png.width / PORTRAIT;
  const diffs: number[] = [];
  for (let f = 1; f < frames; f++) {
    let d = 0;
    for (let y = 0; y < PORTRAIT; y++) {
      for (let x = 0; x < PORTRAIT; x++) {
        const a = (y * png.width + x) * 4;
        const b = (y * png.width + f * PORTRAIT + x) * 4;
        if (
          png.data[a] !== png.data[b] ||
          png.data[a + 1] !== png.data[b + 1] ||
          png.data[a + 2] !== png.data[b + 2] ||
          png.data[a + 3] !== png.data[b + 3]
        )
          d++;
      }
    }
    diffs.push(d);
  }
  return diffs;
}

for (const file of SCAN.flatMap((d) => pngs(join(ROOT, d)))) {
  const rel = relative(ROOT, file);
  checked++;
  const licence = provenance.get(rel);
  if (licence === undefined) problems.push(`${rel}: no entry in art/provenance.json`);
  const png = PNG.sync.read(readFileSync(file));
  if (png.width % GRID || png.height % GRID)
    problems.push(`${rel}: ${png.width}×${png.height} is off the ${GRID}-px grid`);
  if (licence?.startsWith('CC0')) continue; // third-party placeholders keep their own palette (§4.6)
  const strangers = new Set<string>();
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] === 0) continue;
    const key = rgbKey(png.data[i]!, png.data[i + 1]!, png.data[i + 2]!);
    if (!allowed.has(key)) strangers.add(key);
  }
  if (strangers.size)
    problems.push(
      `${rel}: ${strangers.size} colour(s) outside art/palette.gpl, e.g. rgb(${[...strangers][0]})`,
    );
  if (rel.endsWith('characters.png')) {
    const o = orphans(png);
    if (o) problems.push(`${rel}: ${o} orphan pixel(s)`);
    const s = silhouettesTouchFrame(png);
    if (s) problems.push(`${rel}: ${s} frame(s) with a silhouette touching the cell edge`);
  }
  if (rel.includes('/portraits/')) {
    const o = orphans(png);
    if (o) problems.push(`${rel}: ${o} orphan pixel(s)`);
    expressionDiffs(png).forEach((d, i) => {
      if (d < MIN_EXPRESSION_DIFF)
        problems.push(
          `${rel}: expression ${i + 1} differs from neutral by ${d} px (< ${MIN_EXPRESSION_DIFF})`,
        );
    });
  }
}

if (problems.length) {
  console.error(`art:qa — ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`art:qa — ${checked} image(s) on grid, in palette, with provenance; sheets clean`);
