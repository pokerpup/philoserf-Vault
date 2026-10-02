import { worldClock, type LocalTime } from '@agent-town/game-core';
import type { Save } from '@agent-town/save-migrations';
import type { ClockSummary } from '@agent-town/schema';

// game/ (PROMPT.md §3): WorldClock is the only time source for dashboard and game (§3.6). The pure
// rules live in packages/game-core; this module only converts Dates to local parts.

export function toLocalTime(d: Date): LocalTime {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    weekday: d.getDay(),
  };
}

export function clockSummary(now: Date, save: Save): ClockSummary {
  const c = worldClock(toLocalTime(now), { ...save.spring_one, hour: 0, minute: 0, weekday: 0 });
  return {
    real_time: now.toISOString(),
    hhmm: c.hhmm,
    day_index: c.dayIndex,
    year: c.year,
    season: c.season,
    season_day: c.seasonDay,
    phase: c.phase,
    market_open: c.marketOpen,
  };
}
