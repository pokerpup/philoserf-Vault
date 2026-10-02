import { describe, expect, it } from 'vitest';
import { verifyEvent } from '@agent-town/adapter-sdk';
import { AGENT_EMITTED_TYPES, AgentEvent, type EventType } from '@agent-town/schema';
import { allCards, loadFixtures, MockFleet, ROLES, simSecret } from '../src/index.ts';

describe('fixtures', () => {
  it('has one valid card per role, in sync with roles.ts', () => {
    const fixtures = loadFixtures();
    expect(fixtures.map((c) => c.data.extensions.agent_town!.id).sort()).toEqual(
      ROLES.map((r) => r.id).sort(),
    );
    expect(JSON.stringify(fixtures)).toBe(
      JSON.stringify(
        allCards().sort((a, b) =>
          a.data.extensions.agent_town!.id.localeCompare(b.data.extensions.agent_town!.id),
        ),
      ),
    );
  });
  it('maps the twelve desks to the three departments', () => {
    const by = (d: string) => ROLES.filter((r) => r.department === d).length;
    expect(by('front-office')).toBe(6);
    expect(by('middle-office')).toBe(3);
    expect(by('back-office')).toBe(3);
  });
});

describe('MockFleet', () => {
  it('emits every agent event type for every role in a 60-second run, each valid and signed', () => {
    const fleet = new MockFleet(loadFixtures(), { seed: 7 });
    const events = fleet.run(60);
    const seen = new Map<string, Set<EventType>>();
    for (const e of events) {
      expect(AgentEvent.safeParse(e).success).toBe(true);
      expect(verifyEvent(e, simSecret(e.agent_id), { now: new Date(e.ts) })).toEqual({ ok: true });
      if (!seen.has(e.agent_id)) seen.set(e.agent_id, new Set());
      seen.get(e.agent_id)!.add(e.type);
    }
    for (const role of ROLES) {
      const types = seen.get(role.id);
      expect(types, role.id).toBeDefined();
      for (const t of AGENT_EMITTED_TYPES)
        expect(types!.has(t), `${role.id} never emitted ${t}`).toBe(true);
    }
    expect(events.some((e) => e.type === 'permission_decision' || e.type === 'game_event')).toBe(
      false,
    );
  });
  it('heartbeats every 15 seconds (PROMPT.md §3.3)', () => {
    const fleet = new MockFleet(loadFixtures(), { seed: 1 });
    const beats = fleet
      .run(60)
      .filter((e) => e.type === 'heartbeat' && e.agent_id === 'stock-trader-01');
    expect(beats.map((b) => Date.parse(b.ts))).toEqual(
      [0, 15, 30, 45].map((s) => Date.parse('2026-10-01T06:00:00.000Z') + s * 1000),
    );
  });
  it('is deterministic for a seed and different across seeds', () => {
    const a = new MockFleet(loadFixtures(), { seed: 3 }).run(30).map((e) => e.id);
    const b = new MockFleet(loadFixtures(), { seed: 3 }).run(30).map((e) => e.id);
    const c = new MockFleet(loadFixtures(), { seed: 4 }).run(30).map((e) => e.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
  it('keeps a roster that reflects the latest status and comment', () => {
    const fleet = new MockFleet(loadFixtures(), { seed: 9 });
    fleet.run(20);
    const rex = fleet.roster().find((r) => r.id === 'stock-trader-01')!;
    expect(rex.state).toBe('working');
    expect(rex.last_heartbeat).not.toBeNull();
    expect(rex.last_comment).toMatch(/\S/);
    expect(rex.last_comment!.split(/\s+/).length).toBeLessThanOrEqual(25);
  });
  it('keeps every thought comment inside the §5.4 style guide (25 words or fewer)', () => {
    for (const r of ROLES)
      for (const c of r.comments) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(25);
  });
});
