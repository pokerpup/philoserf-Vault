import { z } from 'zod';

// PROMPT.md §5.3: every event carries v, id, agent_id, ts, nonce, type, payload, sig.

export const AgentState = z.enum(['idle', 'working', 'waiting', 'blocked', 'offline', 'error']);
export type AgentState = z.infer<typeof AgentState>;

export const payloads = {
  heartbeat: z.object({}).loose(),
  status: z.object({ state: AgentState, task: z.string().max(200).optional() }),
  task_progress: z.object({
    task_id: z.string(),
    pct: z.number().min(0).max(100),
    note: z.string().max(200).optional(),
  }),
  thought_comment: z.object({ text: z.string().max(400), tone: z.string().optional() }),
  metric: z.object({ key: z.string(), value: z.number(), unit: z.string().optional() }),
  report: z.object({
    period: z.string(),
    summary: z.string().max(2000),
    metrics: z.record(z.string(), z.number()).optional(),
  }),
  permission_request: z.object({
    action: z.string(),
    params: z.record(z.string(), z.unknown()),
    est_exposure: z.number().optional(),
    rationale: z.string().max(1000),
    reversible: z.boolean(),
  }),
  // Mayor → agent
  permission_decision: z.object({
    request_id: z.string(),
    decision: z.enum(['approved', 'rejected', 'expired', 'blocked']),
    by: z.enum(['policy', 'mayor', 'user']),
    reason: z.string().optional(),
  }),
  message: z.object({ to_agent_id: z.string(), summary: z.string().max(200) }),
  error: z.object({
    code: z.string(),
    message: z.string().max(1000),
    severity: z.enum(['info', 'warn', 'error', 'fatal']),
  }),
  lifecycle: z.object({ event: z.enum(['joined', 'updated', 'retired']) }),
  task_complete: z.object({ task_id: z.string(), units: z.number().nonnegative() }),
  // game → stream, nothing else (§5.3, §6.7)
  game_event: z.object({ kind: z.string(), subject: z.string(), summary: z.string().max(200) }),
} as const;

export const EventType = z.enum(
  Object.keys(payloads) as [keyof typeof payloads, ...(keyof typeof payloads)[]],
);
export type EventType = z.infer<typeof EventType>;

/** The types an agent (or the sim standing in for one) emits itself. */
export const AGENT_EMITTED_TYPES: readonly EventType[] = [
  'heartbeat',
  'status',
  'task_progress',
  'thought_comment',
  'metric',
  'report',
  'permission_request',
  'message',
  'error',
  'lifecycle',
  'task_complete',
];

const base = {
  v: z.literal(1),
  id: z.uuid(),
  agent_id: z.string().min(1),
  ts: z.iso.datetime(),
  nonce: z.string().min(8),
  sig: z.string().min(1),
};

function envelope<T extends EventType>(type: T) {
  return z.object({ ...base, type: z.literal(type), payload: payloads[type] });
}

export const AgentEvent = z.discriminatedUnion('type', [
  envelope('heartbeat'),
  envelope('status'),
  envelope('task_progress'),
  envelope('thought_comment'),
  envelope('metric'),
  envelope('report'),
  envelope('permission_request'),
  envelope('permission_decision'),
  envelope('message'),
  envelope('error'),
  envelope('lifecycle'),
  envelope('task_complete'),
  envelope('game_event'),
]);
export type AgentEvent = z.infer<typeof AgentEvent>;
export type EventOf<T extends EventType> = Extract<AgentEvent, { type: T }>;
export type PayloadOf<T extends EventType> = z.infer<(typeof payloads)[T]>;

/** The envelope without a type-specific payload check: what the gateway validates first. */
export const EventEnvelope = z.object({
  ...base,
  type: EventType,
  payload: z.record(z.string(), z.unknown()),
});
export type EventEnvelope = z.infer<typeof EventEnvelope>;

/** PROMPT.md §3.3: offline after 3 missed 15-second heartbeats. */
export const HEARTBEAT_SEC = 15;
export const MISSED_HEARTBEATS_BEFORE_OFFLINE = 3;
