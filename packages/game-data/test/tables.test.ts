import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { crops, time } from '../src/index.ts';
import { renderSchemas, SCHEMAS_DIR } from '../scripts/gen-schemas.ts';

describe('game-data tables', () => {
  it('has the 22 crops of PROMPT.md §10 with unique ids', () => {
    expect(crops).toHaveLength(22);
    expect(new Set(crops.map((c) => c.id)).size).toBe(22);
  });

  it('keeps winter free of outdoor crops (§10)', () => {
    for (const c of crops.filter((x) => x.seasons.includes('winter')))
      expect(c.where).toBe('greenhouse');
  });

  it('runs seasons of 28 real days and wakes 06:00–02:00 (§7.3)', () => {
    expect(time.season_days).toBe(28);
    expect(time.awake).toEqual({ from: '06:00', to: '02:00' });
  });

  it('has committed JSON Schemas that match src/schemas.ts (run pnpm --filter @agent-town/game-data schemas)', () => {
    for (const [rel, text] of Object.entries(renderSchemas())) {
      expect(readFileSync(join(SCHEMAS_DIR, rel), 'utf8'), rel).toBe(text);
    }
  });
});
