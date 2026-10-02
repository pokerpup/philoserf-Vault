import { z } from 'zod';
import { AgentEvent, AgentState } from './events.ts';
import { Department } from './manifest.ts';

// What the Town Server sends the client over /api/* and /api/stream (PROMPT.md §3.2, §15). Game
// numbers and real numbers never share a field: an agent's real reports travel only as event text.

export const AgentSummary = z.object({
  id: z.string(),
  name: z.string(),
  callsign: z.string(),
  department: Department,
  task_role: z.string(),
  state: AgentState,
  task: z.string().nullable(),
  /** false after 3 missed 15-second heartbeats (§3.3). */
  online: z.boolean(),
  last_heartbeat: z.string().nullable(),
  last_comment: z.string().nullable(),
  metric: z.object({ key: z.string(), value: z.number(), unit: z.string() }).nullable(),
});
export type AgentSummary = z.infer<typeof AgentSummary>;

export const ClockSummary = z.object({
  real_time: z.iso.datetime({ offset: true }),
  hhmm: z.string().regex(/^\d{2}:\d{2}$/),
  day_index: z.number().int().nonnegative(),
  year: z.number().int().positive(),
  season: z.enum(['spring', 'summer', 'fall', 'winter']),
  season_day: z.number().int().min(1),
  phase: z.enum(['awake', 'night-watch']),
  market_open: z.boolean(),
});
export type ClockSummary = z.infer<typeof ClockSummary>;

export const HealthSummary = z.object({
  ok: z.literal(true),
  phase: z.number().int().nonnegative(),
  agents: z.number().int().nonnegative(),
  /** config/bridge.yaml rate; 0 means no real link (§7.4). */
  bridge_rate: z.number().min(0),
  fleet: z.enum(['sim']),
});
export type HealthSummary = z.infer<typeof HealthSummary>;

/** One SSE frame: `event: <kind>` with the whole object as `data`. */
export const StreamMessage = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('clock'), clock: ClockSummary }),
  z.object({ kind: z.literal('agents'), agents: z.array(AgentSummary) }),
  z.object({ kind: z.literal('agent_event'), event: AgentEvent }),
]);
export type StreamMessage = z.infer<typeof StreamMessage>;
