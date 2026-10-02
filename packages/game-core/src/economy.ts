import { time, type Crop } from '@agent-town/game-data';

/**
 * Harvests a tile yields when planted on day 1 and left for `seasonDays × seasons` days
 * (PROMPT.md §10: "profit per tile over one 28-day season with replanting"). A regrowing crop
 * is harvested at `days`, then every `regrow` days while the season lasts; a one-shot crop is
 * replanted on the harvest day.
 */
export function harvestsPerSeason(crop: Crop, seasonDays = time.season_days): number {
  const span = seasonDays * crop.seasons.length;
  if (crop.regrow === null) return Math.floor(span / crop.days);
  let n = 0;
  for (let day = crop.days; day < span; day += crop.regrow) n++;
  return n;
}

/** The ₥/day column of §10: profit per tile per day, replanting one-shot crops. */
export function marksPerDay(crop: Crop, seasonDays = time.season_days): number {
  if (crop.regrow === null)
    return (crop.sell_price * crop.per_harvest - crop.seed_price) / crop.days;
  const span = seasonDays * crop.seasons.length;
  return (
    (harvestsPerSeason(crop, seasonDays) * crop.sell_price * crop.per_harvest - crop.seed_price) /
    span
  );
}

/** Ledger Bin price for a quality index 0–3 (§7.4: base × 1 / 1.25 / 1.5 / 2). */
export function ledgerBinPrice(basePrice: number, quality: 0 | 1 | 2 | 3): number {
  return Math.round(basePrice * (time.quality_multipliers[quality] ?? 1));
}
