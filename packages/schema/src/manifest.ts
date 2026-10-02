import { z } from 'zod';

// PROMPT.md §5.1: one Character Card V2 per agent, NPC, resident, the Mayor and the player.
// Everything operational sits under data.extensions.agent_town; unknown keys are never destroyed,
// so every object here is loose (passthrough).

export const AgentKind = z.enum(['agent', 'npc', 'resident', 'mayor', 'player']);
export type AgentKind = z.infer<typeof AgentKind>;

export const Department = z.enum(['front-office', 'middle-office', 'back-office']);
export type Department = z.infer<typeof Department>;

export const AgentId = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{1,62}$/, 'lower-case letters, digits and hyphens');

export const ModelSpec = z
  .object({
    provider: z.string(),
    name: z.string(),
    intelligence_tier: z.enum(['low', 'medium', 'high']).optional(),
    runs_on: z.enum(['hosted', 'local']).optional(),
  })
  .loose();

export const Stake = z
  .object({
    allocation_pct: z.number().min(0).max(100),
    hard_cap_pct: z.number().min(0).max(100),
    currency: z.string().length(3),
  })
  .loose();

// PROMPT.md §6.3 ("every limit set") is a Mayor validation rule for Phase 2; the schema only types them.
export const Limits = z
  .object({
    max_position_pct_of_allocation: z.number().nonnegative().optional(),
    max_daily_loss_pct_of_allocation: z.number().nonnegative().optional(),
    max_drawdown_pct_of_allocation: z.number().nonnegative().optional(),
    max_orders_per_hour: z.number().int().nonnegative().optional(),
    cooldown_after_loss_streak: z
      .object({ losses: z.number().int().positive(), minutes: z.number().int().positive() })
      .optional(),
  })
  .loose();

export const Permissions = z
  .object({
    auto: z.array(z.string()).default([]),
    needs_mayor: z.array(z.string()).default([]),
    needs_user: z.array(z.string()).default([]),
    forbidden: z.array(z.string()).default([]),
  })
  .loose();

export const Reporting = z
  .object({
    heartbeat_sec: z.number().int().positive().default(15),
    status_report: z.string().optional(),
    daily_summary: z.string().optional(),
  })
  .loose();

export const Endpoint = z
  .object({
    protocol: z.enum(['a2a', 'webhook']),
    url: z.url(),
    // "bearer:env:NAME" or "mtls:env:NAME": manifests reference env var names only (§16.5)
    auth: z.string().regex(/^(bearer|mtls):env:[A-Z0-9_]+$/),
  })
  .loose();

export const Metric = z
  .object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['currency', 'percent', 'count', 'number']),
  })
  .loose();

export const Visual = z
  .object({
    portrait: z.string().nullable().optional(),
    sprite: z.string().nullable().optional(),
    desk_style: z.string().optional(),
    palette_accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    layers: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

export const Voice = z
  .object({
    comment_style: z.string().optional(),
    comment_frequency: z.string().optional(),
    catchphrases: z.array(z.string()).default([]),
    tts_voice_id: z.string().nullable().optional(),
  })
  .loose();

// Written by the game on Awaken (§8); never carries an operational value.
export const Lore = z
  .object({
    origin: z.string().nullable().default(null),
    joined: z.string().nullable().default(null),
    skills: z.record(z.string(), z.number()).default({}),
    trust_hearts: z.record(z.string(), z.number()).default({}),
    quests_done: z.array(z.string()).default([]),
    memories: z.array(z.string()).default([]),
  })
  .loose();

export const AgentTownExtension = z
  .object({
    schema_version: z.string(),
    kind: AgentKind,
    id: AgentId,
    task_role: z.string().optional(),
    business: z.string().optional(),
    department: Department.optional(),
    reports_to: z.string().default('mayor'),
    model: ModelSpec.optional(),
    risk_profile: z.string().optional(),
    stake: Stake.optional(),
    limits: Limits.optional(),
    permissions: Permissions.optional(),
    reporting: Reporting.optional(),
    endpoint: Endpoint.optional(),
    metrics: z.array(Metric).optional(),
    visual: Visual.optional(),
    voice: Voice.optional(),
    lore: Lore.optional(),
  })
  .loose();
export type AgentTownExtension = z.infer<typeof AgentTownExtension>;

export const CardData = z
  .object({
    name: z.string().min(1),
    description: z.string().default(''),
    personality: z.string().default(''),
    scenario: z.string().default(''),
    first_mes: z.string().default(''),
    mes_example: z.string().default(''),
    creator_notes: z.string().default(''),
    system_prompt: z.string().default(''),
    post_history_instructions: z.string().default(''),
    alternate_greetings: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    creator: z.string().default(''),
    character_version: z.string().default(''),
    extensions: z.object({ agent_town: AgentTownExtension.optional() }).loose().default({}),
  })
  .loose();

export const CardV2 = z
  .object({
    spec: z.literal('chara_card_v2'),
    spec_version: z.literal('2.0'),
    data: CardData,
  })
  .loose();
export type CardV2 = z.infer<typeof CardV2>;

/** A card is "persona only" when it has no agent_town extension (§5.1): the wizard asks for the rest. */
export function isPersonaOnly(card: CardV2): boolean {
  return card.data.extensions.agent_town === undefined;
}
