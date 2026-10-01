import { time, type Season } from '@agent-town/game-data';

/** Wall-clock parts in the player's local time zone; the server converts Dates to these. */
export interface LocalTime {
  year: number;
  month: number; // 1–12
  day: number; // 1–31
  hour: number; // 0–23
  minute: number; // 0–59
  weekday: number; // 0 = Sunday
}

export type DayPhase = 'awake' | 'night-watch';

export interface WorldClock {
  /** Real days since Spring 1 (the save's creation date); 0 on day one. */
  dayIndex: number;
  year: number; // in-game year, 1-based
  season: Season;
  seasonDay: number; // 1–28
  phase: DayPhase;
  marketOpen: boolean;
  hhmm: string;
}

const hm = (s: string): number => {
  const [h, m] = s.split(':').map(Number) as [number, number];
  return h * 60 + m;
};

/** Days between two civil dates, ignoring the time of day (a DayTick happens once per local date). */
export function civilDaysBetween(from: LocalTime, to: LocalTime): number {
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86_400_000);
}

/** PROMPT.md §7.3.1: awake 06:00–02:00; 02:00–06:00 only lit windows and the night watch move. */
export function dayPhase(hour: number, minute: number): DayPhase {
  const t = hour * 60 + minute;
  const from = hm(time.awake.from);
  const to = hm(time.awake.to);
  const awake = from <= to ? t >= from && t < to : t >= from || t < to;
  return awake ? 'awake' : 'night-watch';
}

/** The firm's windows glow during market hours (§7.3.1); a display rule, never a trading rule. */
export function isMarketOpen(local: LocalTime): boolean {
  const t = local.hour * 60 + local.minute;
  const { from, to, weekdays } = time.market_hours;
  return weekdays.includes(local.weekday) && t >= hm(from) && t < hm(to);
}

/** §7.3.4: seasons last 28 real days from the save's creation date (Spring 1). */
export function worldClock(now: LocalTime, springOne: LocalTime): WorldClock {
  const dayIndex = Math.max(0, civilDaysBetween(springOne, now));
  const seasonsElapsed = Math.floor(dayIndex / time.season_days);
  const season = time.seasons[seasonsElapsed % time.seasons.length] as Season;
  return {
    dayIndex,
    year: Math.floor(seasonsElapsed / time.seasons.length) + 1,
    season,
    seasonDay: (dayIndex % time.season_days) + 1,
    phase: dayPhase(now.hour, now.minute),
    marketOpen: isMarketOpen(now),
    hhmm: `${String(now.hour).padStart(2, '0')}:${String(now.minute).padStart(2, '0')}`,
  };
}
