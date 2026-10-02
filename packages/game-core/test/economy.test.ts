import { crops } from '@agent-town/game-data';
import { describe, expect, it } from 'vitest';
import { harvestsPerSeason, ledgerBinPrice, marksPerDay } from '../src/economy.ts';

// PROMPT.md §10 prints ₥/day to one decimal; the formula must land on the same digit for every crop
// except Ember Vine, whose printed 19.6 equals sell ÷ 28 and ignores its 600 ₥ seed and regrowth.
// Open question for the designer (see DECISIONS.md); the test pins the mismatch so a fix shows up.
const KNOWN_MISMATCH = new Set(['ember-vine']);

describe('§10 crop economics', () => {
  for (const crop of crops) {
    const label = `${crop.name}: ${crop.target_marks_per_day} ₥/day`;
    if (KNOWN_MISMATCH.has(crop.id)) {
      it(`${label} (spec column does not follow the formula yet)`, () => {
        expect(marksPerDay(crop)).not.toBeCloseTo(crop.target_marks_per_day, 1);
      });
    } else {
      it(label, () => {
        expect(marksPerDay(crop)).toBeCloseTo(crop.target_marks_per_day, 1);
      });
    }
  }

  it('counts regrow harvests inside the season only', () => {
    const snapPea = crops.find((c) => c.id === 'snap-pea')!;
    expect(harvestsPerSeason(snapPea)).toBe(7); // days 9, 12, 15, 18, 21, 24, 27
    const sweetcorn = crops.find((c) => c.id === 'sweetcorn')!;
    expect(harvestsPerSeason(sweetcorn)).toBe(11); // two seasons, 56 days
  });

  it('prices quality at ×1 / ×1.25 / ×1.5 / ×2 (§7.4)', () => {
    expect([0, 1, 2, 3].map((q) => ledgerBinPrice(100, q as 0 | 1 | 2 | 3))).toEqual([
      100, 125, 150, 200,
    ]);
  });
});
