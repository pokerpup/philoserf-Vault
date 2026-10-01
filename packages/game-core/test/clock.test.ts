import { describe, expect, it } from 'vitest';
import {
  civilDaysBetween,
  dayPhase,
  isMarketOpen,
  worldClock,
  type LocalTime,
} from '../src/clock.ts';

const at = (p: Partial<LocalTime>): LocalTime => ({
  year: 2026,
  month: 10,
  day: 1,
  hour: 9,
  minute: 0,
  weekday: 4,
  ...p,
});
const springOne = at({ hour: 0, minute: 0 });

describe('§7.3 WorldClock', () => {
  it('starts on Spring 1, Year 1', () => {
    const c = worldClock(at({ hour: 7 }), springOne);
    expect(c).toMatchObject({
      dayIndex: 0,
      year: 1,
      season: 'spring',
      seasonDay: 1,
      phase: 'awake',
    });
  });

  it('turns the season after 28 real days and the year after 112', () => {
    expect(worldClock(at({ month: 10, day: 29 }), springOne)).toMatchObject({
      dayIndex: 28,
      season: 'summer',
      seasonDay: 1,
    });
    expect(worldClock(at({ month: 11, day: 26 }), springOne)).toMatchObject({
      dayIndex: 56,
      season: 'fall',
      seasonDay: 1,
    });
    expect(worldClock(at({ month: 12, day: 24 }), springOne)).toMatchObject({
      dayIndex: 84,
      season: 'winter',
      seasonDay: 1,
    });
    expect(worldClock(at({ year: 2027, month: 1, day: 21 }), springOne)).toMatchObject({
      dayIndex: 112,
      year: 2,
      season: 'spring',
      seasonDay: 1,
    });
  });

  it('counts civil days, not 24-hour spans', () => {
    expect(civilDaysBetween(at({ hour: 23, minute: 59 }), at({ day: 2, hour: 0, minute: 1 }))).toBe(
      1,
    );
  });

  it('is awake 06:00–02:00 and on night watch 02:00–06:00', () => {
    expect(dayPhase(6, 0)).toBe('awake');
    expect(dayPhase(1, 59)).toBe('awake');
    expect(dayPhase(2, 0)).toBe('night-watch');
    expect(dayPhase(5, 59)).toBe('night-watch');
  });

  it("glows the firm's windows only in market hours on weekdays", () => {
    expect(isMarketOpen(at({ hour: 10, weekday: 3 }))).toBe(true);
    expect(isMarketOpen(at({ hour: 10, weekday: 6 }))).toBe(false);
    expect(isMarketOpen(at({ hour: 16, minute: 0, weekday: 3 }))).toBe(false);
  });
});
