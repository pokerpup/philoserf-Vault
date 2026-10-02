import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BridgeConfig } from '@agent-town/game-data';
import { newSave, type Save } from '@agent-town/save-migrations';
import {
  AgentSummary,
  ClockSummary,
  HEARTBEAT_SEC,
  HealthSummary,
  MISSED_HEARTBEATS_BEFORE_OFFLINE,
  type StreamMessage,
} from '@agent-town/schema';
import { loadFixtures, MockFleet, type RosterEntry } from '@agent-town/sim';
import Fastify, { type FastifyInstance } from 'fastify';
import { parse as parseYaml } from 'yaml';
import { EventHub, sseFrame } from './events/hub.ts';
import { clockSummary } from './game/world-clock.ts';

export const PHASE = 0;
const ROOT = join(import.meta.dirname, '..', '..');

export interface AppOptions {
  fleet?: MockFleet;
  save?: Save;
  bridge?: BridgeConfig;
  now?: () => Date;
}

export interface TownApp {
  app: FastifyInstance;
  fleet: MockFleet;
  hub: EventHub;
  save: Save;
  summaries: () => AgentSummary[];
  clock: () => ClockSummary;
}

/** config/bridge.yaml through its Zod schema; pnpm dev runs with rate 0 (CLAUDE.md). */
export function loadBridgeConfig(file = join(ROOT, 'config', 'bridge.yaml')): BridgeConfig {
  return BridgeConfig.parse(parseYaml(readFileSync(file, 'utf8')));
}

export function isOnline(entry: RosterEntry, now: Date): boolean {
  if (!entry.last_heartbeat) return false;
  const age = now.getTime() - new Date(entry.last_heartbeat).getTime();
  return age < HEARTBEAT_SEC * MISSED_HEARTBEATS_BEFORE_OFFLINE * 1000;
}

export function buildApp(opts: AppOptions = {}): TownApp {
  const now = opts.now ?? (() => new Date());
  // Phase 0: in-memory, sim-only save; Phase 5 persists it (DECISIONS.md).
  const save = opts.save ?? newSave(now(), 42, true);
  const fleet =
    opts.fleet ?? new MockFleet(loadFixtures(), { seed: save.town_seed, startAt: now() });
  const bridge = opts.bridge ?? loadBridgeConfig();
  const hub = new EventHub();
  const app = Fastify({ logger: false });

  const summaries = () =>
    fleet.roster().map((r) => AgentSummary.parse({ ...r, online: isOnline(r, fleet.now) }));
  const clock = () => ClockSummary.parse(clockSummary(now(), save));

  app.get('/api/health', async () =>
    HealthSummary.parse({
      ok: true,
      phase: PHASE,
      agents: fleet.roster().length,
      bridge_rate: bridge.rate,
      fleet: 'sim',
    }),
  );
  app.get('/api/agents', async () => summaries());
  app.get('/api/clock', async () => clock());

  // SSE (§3.2). The client gets a clock and a roster snapshot first, then every agent event.
  app.get('/api/stream', (req, reply) => {
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    });
    res.write(': agent town stream\n\n');
    res.write(sseFrame({ kind: 'clock', clock: clock() }));
    res.write(sseFrame({ kind: 'agents', agents: summaries() }));
    const unsubscribe = hub.subscribe((frame) => res.write(frame));
    const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), HEARTBEAT_SEC * 1000);
    req.raw.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
    });
  });

  return { app, fleet, hub, save, summaries, clock };
}

/** Advance the sim once per real second and fan its events out; snapshots every 5 s, the clock every minute. */
export function startTicking(town: TownApp, tickMs = 1000): () => void {
  let n = 0;
  const timer = setInterval(() => {
    n++;
    for (const event of town.fleet.tick(tickMs))
      town.hub.publish({ kind: 'agent_event', event } satisfies StreamMessage);
    if (n % 5 === 0) town.hub.publish({ kind: 'agents', agents: town.summaries() });
    if (n % 60 === 0) town.hub.publish({ kind: 'clock', clock: town.clock() });
  }, tickMs);
  return () => clearInterval(timer);
}
