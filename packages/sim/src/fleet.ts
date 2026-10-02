import { createEvent } from '@agent-town/adapter-sdk';
import {
  AGENT_EMITTED_TYPES,
  type AgentEvent,
  type AgentState,
  type CardV2,
  type EventType,
} from '@agent-town/schema';
import { Rng } from './random.ts';
import { ROLE_BY_ID, ROLES, simSecret, type Role } from './roles.ts';

export interface FleetOptions {
  seed?: number;
  /** Virtual start time; the fleet never reads the wall clock. */
  startAt?: Date;
  heartbeatSec?: number;
}

export interface RosterEntry {
  id: string;
  name: string;
  callsign: string;
  department: Role['department'];
  task_role: string;
  state: AgentState;
  task: string | null;
  last_heartbeat: string | null;
  last_comment: string | null;
  metric: { key: string; value: number; unit: string } | null;
}

interface AgentRuntime {
  role: Role;
  secret: string;
  rng: Rng;
  offsetSec: number;
  taskNo: number;
  entry: RosterEntry;
}

/**
 * The mock fleet (PROMPT.md §3 packages/sim): twelve agents that emit every §5.3 event type an
 * agent emits, on a seeded, virtual clock. Each agent walks a 60-second script offset by its
 * index, plus a heartbeat every 15 seconds, so a 60-second run covers every type for every role.
 */
export class MockFleet {
  private readonly agents: AgentRuntime[] = [];
  private readonly heartbeatMs: number;
  private elapsedMs = 0;
  private readonly startAt: Date;

  constructor(cards: CardV2[], opts: FleetOptions = {}) {
    const seed = opts.seed ?? 42;
    this.startAt = opts.startAt ?? new Date('2026-10-01T06:00:00.000Z');
    this.heartbeatMs = (opts.heartbeatSec ?? 15) * 1000;
    cards.forEach((card, i) => {
      const ext = card.data.extensions.agent_town;
      if (!ext) throw new Error(`card ${card.data.name} has no agent_town extension`);
      const role = ROLE_BY_ID.get(ext.id);
      if (!role) throw new Error(`no sim role for ${ext.id}`);
      this.agents.push({
        role,
        secret: simSecret(role.id),
        rng: new Rng(seed * 1000 + i),
        offsetSec: i % 5, // stagger the scripts so the feed is not a wall of identical ticks
        taskNo: 0,
        entry: {
          id: role.id,
          name: card.data.name,
          callsign: role.callsign,
          department: role.department,
          task_role: role.task_role,
          state: 'offline',
          task: null,
          last_heartbeat: null,
          last_comment: null,
          metric: null,
        },
      });
    });
  }

  get now(): Date {
    return new Date(this.startAt.getTime() + this.elapsedMs);
  }

  roster(): RosterEntry[] {
    return this.agents.map((a) => ({ ...a.entry }));
  }

  /** Advance the virtual clock by `ms` (whole seconds are evaluated) and return the events emitted. */
  tick(ms: number): AgentEvent[] {
    const out: AgentEvent[] = [];
    const from = this.elapsedMs;
    const to = from + ms;
    for (let t = Math.ceil(from / 1000) * 1000; t < to; t += 1000) {
      if (t < from) continue;
      for (const a of this.agents) out.push(...this.second(a, t / 1000));
    }
    this.elapsedMs = to;
    return out;
  }

  run(seconds: number): AgentEvent[] {
    return this.tick(seconds * 1000);
  }

  private second(a: AgentRuntime, sec: number): AgentEvent[] {
    const events: AgentEvent[] = [];
    const at = new Date(this.startAt.getTime() + sec * 1000);
    const emit = <T extends EventType>(type: T, payload: Parameters<typeof createEvent<T>>[2]) => {
      const e = createEvent(a.role.id, type, payload, a.secret, {
        now: at,
        id: a.rng.uuid(),
        nonce: a.rng.hex(12),
      });
      events.push(e);
      this.apply(a, e);
    };
    if (sec === 0) emit('lifecycle', { event: 'joined' });
    if ((sec * 1000) % this.heartbeatMs === 0) emit('heartbeat', {});
    // the 60-second script, shifted by the agent's offset
    const s = (((sec - a.offsetSec) % 60) + 60) % 60;
    if (sec < a.offsetSec) return events;
    const r = a.role;
    switch (s) {
      case 1: {
        a.taskNo += 1;
        emit('status', {
          state: 'working',
          task: r.tasks[a.taskNo % 3 === 1 ? 1 : 0]!.replace('#{n}', String(a.taskNo)),
        });
        break;
      }
      case 6:
        emit('task_progress', {
          task_id: `${r.callsign.toLowerCase()}-${a.taskNo}`,
          pct: a.rng.int(15, 40),
          note: 'under way',
        });
        break;
      case 11:
        emit('thought_comment', { text: a.rng.pick(r.comments), tone: 'smart-quip' });
        break;
      case 16:
        emit('metric', {
          key: r.metric.key,
          value: a.rng.int(r.metric.min, r.metric.max),
          unit: r.metric.unit,
        });
        break;
      case 21:
        emit('task_progress', {
          task_id: `${r.callsign.toLowerCase()}-${a.taskNo}`,
          pct: a.rng.int(55, 85),
        });
        break;
      case 26: {
        const peers = ROLES.filter((p) => p.id !== r.id);
        emit('message', {
          to_agent_id: a.rng.pick(peers).id,
          summary: `${r.callsign}: ${r.tasks[0]} done; your turn.`,
        });
        break;
      }
      case 31:
        emit('status', { state: 'waiting', task: 'Awaiting the Mayor' });
        emit('permission_request', {
          action: r.permission.action,
          params: { task_id: `${r.callsign.toLowerCase()}-${a.taskNo}` },
          est_exposure: r.trades ? a.rng.int(500, 5000) : 0,
          rationale: r.permission.rationale,
          reversible: r.permission.reversible,
        });
        break;
      case 41:
        emit('status', { state: 'working', task: r.tasks[2] });
        emit('task_complete', { task_id: `${r.callsign.toLowerCase()}-${a.taskNo}`, units: 1 });
        break;
      case 46:
        emit('error', {
          code: r.error.code,
          message: r.error.message,
          severity: a.rng.pick(['info', 'warn', 'warn', 'error']),
        });
        emit('status', { state: 'error', task: r.error.code });
        break;
      case 51:
        emit('status', { state: 'working', task: r.tasks[2] });
        emit('report', {
          period: 'hourly',
          summary: r.report,
          metrics: { [r.metric.key]: a.rng.int(r.metric.min, r.metric.max) },
        });
        break;
      case 56:
        emit('status', { state: 'idle' });
        break;
      default:
        break;
    }
    return events;
  }

  private apply(a: AgentRuntime, e: AgentEvent): void {
    switch (e.type) {
      case 'heartbeat':
        a.entry.last_heartbeat = e.ts;
        if (a.entry.state === 'offline') a.entry.state = 'idle';
        break;
      case 'status':
        a.entry.state = e.payload.state;
        a.entry.task = e.payload.task ?? null;
        break;
      case 'thought_comment':
        a.entry.last_comment = e.payload.text;
        break;
      case 'metric':
        a.entry.metric = { key: e.payload.key, value: e.payload.value, unit: e.payload.unit ?? '' };
        break;
      case 'lifecycle':
        if (e.payload.event === 'retired') a.entry.state = 'offline';
        break;
      default:
        break;
    }
  }
}

export { AGENT_EMITTED_TYPES };
