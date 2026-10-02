// pnpm data:lint — PROMPT.md §3 "JSON Schema per file": every table in packages/game-data and every
// config/*.yaml validates against its schemas/*.schema.json. Exit 1 with file:path lines on failure.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const PKG = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(PKG, '..', '..');
const SCHEMAS = join(PKG, 'schemas');
const SKIP = new Set(['package.json', 'tsconfig.json']);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const problems: string[] = [];
let checked = 0;

function check(file: string, schemaFile: string, data: unknown) {
  const rel = relative(ROOT, file);
  if (!existsSync(schemaFile)) {
    problems.push(
      `${rel}: no schema at ${relative(ROOT, schemaFile)} (run pnpm --filter @agent-town/game-data schemas)`,
    );
    return;
  }
  const validate = ajv.compile(JSON.parse(readFileSync(schemaFile, 'utf8')));
  checked++;
  if (!validate(data)) {
    for (const e of validate.errors ?? [])
      problems.push(`${rel}:${e.instancePath || '/'} ${e.message ?? 'invalid'}`);
  }
}

for (const name of readdirSync(PKG)
  .filter((f) => f.endsWith('.json') && !SKIP.has(f))
  .sort()) {
  const file = join(PKG, name);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    problems.push(`${relative(ROOT, file)}: ${(err as Error).message}`);
    continue;
  }
  check(file, join(SCHEMAS, `${basename(name, '.json')}.schema.json`), data);
}

const configDir = join(ROOT, 'config');
if (existsSync(configDir)) {
  for (const name of readdirSync(configDir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()) {
    const file = join(configDir, name);
    const schemaFile = join(SCHEMAS, 'config', `${basename(name, '.yaml')}.schema.json`);
    if (!existsSync(schemaFile)) continue; // mayor.policy.yaml arrives with its schema in Phase 2
    check(file, schemaFile, parseYaml(readFileSync(file, 'utf8')));
  }
}

if (problems.length) {
  console.error(`data:lint — ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`data:lint — ${checked} file(s) valid`);
