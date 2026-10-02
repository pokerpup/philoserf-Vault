import { loadFixtures, MockFleet } from '@agent-town/sim';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp, isOnline, type TownApp } from '../app.ts';
import { sseFrame } from '../events/hub.ts';

const T0 = new Date('2026-10-01T09:30:00.000Z');

describe('town-server API', () => {
  let town: TownApp;
  beforeAll(async () => {
    const fleet = new MockFleet(loadFixtures(), { seed: 42, startAt: T0 });
    town = buildApp({
      fleet,
      now: () => new Date(T0.getTime() + fleet.now.getTime() - T0.getTime()),
    });
    fleet.tick(2000); // second 0 and 1: lifecycle, heartbeat, first status
    await town.app.ready();
  });
  afterAll(() => town.app.close());

  it('reports health with the sim fleet and bridge rate 0', async () => {
    const res = await town.app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      ok: true,
      phase: 0,
      agents: 12,
      bridge_rate: 0,
      fleet: 'sim',
    });
  });

  it('lists the 12 sim agents, online, with their departments', async () => {
    const res = await town.app.inject({ method: 'GET', url: '/api/agents' });
    const agents = res.json() as { id: string; online: boolean; department: string }[];
    expect(agents).toHaveLength(12);
    expect(agents.every((a) => a.online)).toBe(true);
    expect(new Set(agents.map((a) => a.department))).toEqual(
      new Set(['front-office', 'middle-office', 'back-office']),
    );
  });

  it('serves the world clock shape', async () => {
    const res = await town.app.inject({ method: 'GET', url: '/api/clock' });
    expect(res.json()).toMatchObject({ day_index: 0, year: 1, season: 'spring', season_day: 1 });
  });

  it('marks an agent offline after 3 missed 15-second heartbeats', () => {
    const [entry] = town.fleet.roster();
    expect(isOnline(entry!, new Date(T0.getTime() + 44_000))).toBe(true);
    expect(isOnline(entry!, new Date(T0.getTime() + 46_000))).toBe(false);
  });

  it('formats SSE frames with the kind as the event name', () => {
    const frame = sseFrame({ kind: 'clock', clock: town.clock() });
    expect(frame.startsWith('event: clock\ndata: {')).toBe(true);
    expect(frame.endsWith('\n\n')).toBe(true);
  });
});
