// pnpm art:qa — PROMPT.md §4.7. Phase 0 enforces the checks that need no finished art: every PNG
// under art/ and the placeholder folder sits on the 16-px grid, uses only art/palette.gpl colours and
// has a provenance entry. Orphan pixels, silhouettes, light direction, crop-stage and portrait
// diffs arrive with the art pipeline phase (VERIFY.md lists them as pending).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PNG } from 'pngjs';
import { readPalette, rgbKey } from './palette.ts';

const ROOT = join(import.meta.dirname, '..');
const SCAN = ['art', join('apps', 'town-client', 'public', 'assets', 'placeholder')];
const GRID = 16;

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

for (const file of SCAN.flatMap((d) => pngs(join(ROOT, d)))) {
  const rel = relative(ROOT, file);
  checked++;
  const licence = provenance.get(rel);
  if (licence === undefined) problems.push(`${rel}: no entry in art/provenance.json`);
  const png = PNG.sync.read(readFileSync(file));
  if (png.width % GRID || png.height % GRID)
    problems.push(`${rel}: ${png.width}×${png.height} is off the ${GRID}-px grid`);
  const strangers = new Set<string>();
  if (licence?.startsWith('CC0')) continue; // third-party placeholders keep their own palette (§4.6)
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] === 0) continue;
    const key = rgbKey(png.data[i]!, png.data[i + 1]!, png.data[i + 2]!);
    if (!allowed.has(key)) strangers.add(key);
  }
  if (strangers.size)
    problems.push(
      `${rel}: ${strangers.size} colour(s) outside art/palette.gpl, e.g. rgb(${[...strangers][0]})`,
    );
}

if (problems.length) {
  console.error(`art:qa — ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`art:qa — ${checked} image(s) on grid, in palette, with provenance`);
