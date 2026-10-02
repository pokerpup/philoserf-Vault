// pnpm art:preview <group> [scale] — renders one picture group at 4× into the scratchpad for a look.
// Groups: terrain objects buildings characters portraits ui font map (the compiled town tileset).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { previews } from '../art/pixel/index.ts';
import { scale, toPNG } from '../art/pixel/pixmap.ts';

const [, , group = 'terrain', k = '4'] = process.argv;
const dir = process.env.ART_PREVIEW_DIR ?? join(import.meta.dirname, '..', 'screens', 'preview');
mkdirSync(dir, { recursive: true });
const sheet = previews()[group];
if (!sheet) {
  console.error(`unknown group "${group}"; one of ${Object.keys(previews()).join(', ')}`);
  process.exit(1);
}
const file = join(dir, `${group}.png`);
writeFileSync(file, toPNG(scale(sheet, Number(k))));
console.log(`${file} (${sheet.w}×${sheet.h} at ${k}×)`);
