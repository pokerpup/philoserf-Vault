// Regenerates schemas/*.schema.json from src/schemas.ts; pnpm data:lint validates with these so the
// PostToolUse hook needs no TypeScript. A test keeps the committed copies in sync.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { CONFIG_SCHEMAS, DATA_SCHEMAS } from '../src/schemas.ts';

export const SCHEMAS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'schemas');

export function renderSchemas(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [file, schema] of Object.entries(DATA_SCHEMAS)) {
    out[`${file.replace(/\.json$/, '')}.schema.json`] =
      JSON.stringify(z.toJSONSchema(schema, { target: 'draft-7' }), null, 2) + '\n';
  }
  for (const [file, schema] of Object.entries(CONFIG_SCHEMAS)) {
    out[`config/${file.replace(/\.yaml$/, '')}.schema.json`] =
      JSON.stringify(z.toJSONSchema(schema, { target: 'draft-7' }), null, 2) + '\n';
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [rel, text] of Object.entries(renderSchemas())) {
    const path = join(SCHEMAS_DIR, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    console.log(`wrote packages/game-data/schemas/${rel}`);
  }
}
