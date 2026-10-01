// PROMPT.md §3: "TS and Python helpers: emit events, request permission, in ~10 lines".
// Phase 0 ships the TypeScript half that the sim and the gateway share: build, sign and verify
// an event envelope (§5.3). HMAC-SHA256 over the canonical JSON of every field but `sig`.
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { AgentEvent, type EventType, type PayloadOf } from '@agent-town/schema';

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export type Unsigned = Omit<AgentEvent, 'sig'>;

export function signEvent(unsigned: Unsigned, secret: string): string {
  const { v, id, agent_id, ts, nonce, type, payload } = unsigned;
  return createHmac('sha256', secret)
    .update(stableStringify({ v, id, agent_id, ts, nonce, type, payload }))
    .digest('hex');
}

export interface CreateOptions {
  now?: Date;
  id?: string;
  nonce?: string;
}

/** Build a signed, schema-valid event. Throws if the payload does not match the type. */
export function createEvent<T extends EventType>(
  agentId: string,
  type: T,
  payload: PayloadOf<T>,
  secret: string,
  opts: CreateOptions = {},
): AgentEvent {
  const unsigned = {
    v: 1 as const,
    id: opts.id ?? randomUUID(),
    agent_id: agentId,
    ts: (opts.now ?? new Date()).toISOString(),
    nonce: opts.nonce ?? randomBytes(12).toString('hex'),
    type,
    payload,
  } as Unsigned;
  const sig = signEvent(unsigned, secret);
  return AgentEvent.parse({ ...unsigned, sig });
}

export interface VerifyOptions {
  now?: Date;
  /** PROMPT.md §16.5: anything outside a 60-second window is rejected. */
  windowSec?: number;
}

export type VerifyResult = { ok: true } | { ok: false; reason: 'schema' | 'signature' | 'stale' };

export function verifyEvent(
  event: unknown,
  secret: string,
  opts: VerifyOptions = {},
): VerifyResult {
  const parsed = AgentEvent.safeParse(event);
  if (!parsed.success) return { ok: false, reason: 'schema' };
  const e = parsed.data;
  const expected = Buffer.from(signEvent(e, secret), 'hex');
  const given = Buffer.from(e.sig, 'hex');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'signature' };
  }
  const now = (opts.now ?? new Date()).getTime();
  const windowMs = (opts.windowSec ?? 60) * 1000;
  if (Math.abs(now - Date.parse(e.ts)) > windowMs) return { ok: false, reason: 'stale' };
  return { ok: true };
}
