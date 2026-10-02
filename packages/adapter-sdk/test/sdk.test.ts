import { describe, expect, it } from 'vitest';
import { createEvent, stableStringify, verifyEvent } from '../src/index.ts';

const secret = 'dev-secret';
const now = new Date('2026-10-01T12:00:00Z');

describe('adapter-sdk', () => {
  it('creates an event that verifies with the same secret', () => {
    const e = createEvent(
      'stock-trader-01',
      'metric',
      { key: 'pnl_usd', value: 120.5, unit: 'USD' },
      secret,
      { now },
    );
    expect(e.type).toBe('metric');
    expect(verifyEvent(e, secret, { now })).toEqual({ ok: true });
  });
  it('rejects a tampered payload, a wrong secret and a stale timestamp', () => {
    const e = createEvent('stock-trader-01', 'status', { state: 'working' }, secret, { now });
    const tampered = { ...e, payload: { state: 'idle' } };
    expect(verifyEvent(tampered, secret, { now })).toEqual({ ok: false, reason: 'signature' });
    expect(verifyEvent(e, 'other', { now })).toEqual({ ok: false, reason: 'signature' });
    const later = new Date(now.getTime() + 61_000);
    expect(verifyEvent(e, secret, { now: later })).toEqual({ ok: false, reason: 'stale' });
  });
  it('refuses to build an event whose payload does not match its type', () => {
    // @ts-expect-error wrong payload on purpose
    expect(() => createEvent('x', 'metric', { key: 'pnl' }, secret)).toThrow();
  });
  it('canonicalises key order before signing', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: [3, { f: 4, e: 5 }] } })).toBe(
      '{"a":{"c":[3,{"e":5,"f":4}],"d":2},"b":1}',
    );
  });
});
