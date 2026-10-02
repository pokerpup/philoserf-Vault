import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRENT_SAVE_VERSION, migrate, newSave, STEPS } from '../src/index.ts';

const fixture = (name: string) =>
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'fixtures', name), 'utf8'));

describe('save migrations', () => {
  it('loads every historical fixture up to the current version', () => {
    const save = migrate(fixture('v1.save.json'));
    expect(save.v).toBe(CURRENT_SAVE_VERSION);
    expect(save.town_seed).toBe(42);
  });

  it('refuses a save from the future', () => {
    expect(() => migrate({ v: CURRENT_SAVE_VERSION + 1 })).toThrow(/newer/);
  });

  it('only steps forward', () => {
    for (const s of STEPS) expect(s.to).toBe(s.from + 1);
  });

  it('creates a save whose Spring 1 is the creation date', () => {
    const s = newSave(new Date(2026, 9, 1, 6, 0, 0), 7);
    expect(s.spring_one).toEqual({ year: 2026, month: 10, day: 1 });
    expect(s.sim).toBe(false);
  });
});
