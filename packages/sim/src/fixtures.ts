import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CardV2 } from '@agent-town/schema';

export const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

/** The sim's cards (CLAUDE.md: fixtures live in packages/sim/fixtures, never in agents/). */
export function loadFixtures(dir = FIXTURES_DIR): CardV2[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.card.json'))
    .sort()
    .map((f) => CardV2.parse(JSON.parse(readFileSync(join(dir, f), 'utf8'))));
}
