import { z } from 'zod';

export const Season = z.enum(['spring', 'summer', 'fall', 'winter']);
export type Season = z.infer<typeof Season>;

const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case id');
const Clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM');

export const Crop = z.object({
  id: Id,
  name: z.string().min(1).max(40),
  seasons: z.array(Season).min(1),
  where: z.enum(['outdoor', 'greenhouse']),
  source: z.enum(['shop', 'seed-fair', 'bazaar', 'vault']),
  seed_price: z.number().int().nonnegative(),
  sell_price: z.number().int().positive(),
  days: z.number().int().positive(),
  regrow: z.number().int().positive().nullable(),
  per_harvest: z.number().int().positive(),
  by_product: Id.optional(),
  /** The ₥/day column of PROMPT.md §10, kept so the economy test can diff the formula against the spec. */
  target_marks_per_day: z.number().nonnegative(),
});
export type Crop = z.infer<typeof Crop>;

export const CropsFile = z.object({ $comment: z.string().optional(), crops: z.array(Crop).min(1) });

export const TimeFile = z.object({
  $comment: z.string().optional(),
  season_days: z.number().int().positive(),
  seasons: z.array(Season).length(4),
  awake: z.object({ from: Clock, to: Clock }),
  day_tick: Clock,
  vigor_refill: Clock,
  ledger_bin_payout: Clock,
  market_hours: z.object({
    from: Clock,
    to: Clock,
    weekdays: z.array(z.number().int().min(0).max(6)).min(1),
    timezone: z.string(),
  }),
  quality_multipliers: z.array(z.number().positive()).length(4),
});
export type TimeFile = z.infer<typeof TimeFile>;

// config/bridge.yaml — PROMPT.md §7.4. Every number here is a cap on Marks, never on anything real.
export const BridgeConfig = z.object({
  rate: z.number().min(0),
  dividend_cap_per_day: z.number().int().min(0),
  task_credit_cap_per_agent_per_day: z.number().int().min(0),
  loss_day_mints: z.literal(0),
});
export type BridgeConfig = z.infer<typeof BridgeConfig>;

// config/evolution.yaml — PROMPT.md §7.1. Real metrics gate eligibility; Marks pay for construction (§6.7.3).
export const EvolutionConfig = z.object({
  town_levels: z
    .array(
      z.object({
        level: z.number().int().min(1).max(5),
        name: z.string(),
        min_agents: z.number().int().nonnegative().optional(),
        min_revenue_usd: z.number().nonnegative().optional(),
        min_uptime_pct: z.number().min(0).max(100).optional(),
        min_success_pct: z.number().min(0).max(100).optional(),
        /** "any" = one of the thresholds is enough (L2); "all" = every listed threshold (L3+). */
        require: z.enum(['any', 'all']),
      }),
    )
    .length(5),
  building_tiers: z.object({ tier2_needs_positive_pnl_days: z.number().int().positive() }),
  downturn: z.object({
    demolish: z.literal(false),
    soup_after_losing_days: z.number().int().positive(),
  }),
});
export type EvolutionConfig = z.infer<typeof EvolutionConfig>;

/** data file (relative to packages/game-data) → schema; config files live under config/ at the repo root. */
export const DATA_SCHEMAS = {
  'crops.json': CropsFile,
  'time.json': TimeFile,
} as const;
export const CONFIG_SCHEMAS = {
  'bridge.yaml': BridgeConfig,
  'evolution.yaml': EvolutionConfig,
} as const;
