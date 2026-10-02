import { loadFixtures, MockFleet } from '@agent-town/sim';
import { describe, expect, it } from 'vitest';
import { eventLine } from '../src/hooks/eventLine.ts';

describe('feed lines', () => {
  it('turns every agent-emitted event except heartbeats into one line', () => {
    const events = new MockFleet(loadFixtures(), { seed: 1 }).run(60);
    for (const e of events) {
      const line = eventLine(e);
      if (e.type === 'heartbeat') expect(line).toBeNull();
      else expect(line, e.type).toBeTruthy();
    }
  });
});
