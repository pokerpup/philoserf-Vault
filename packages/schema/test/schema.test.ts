import { describe, expect, it } from 'vitest';
import { AgentEvent, CardV2, EventEnvelope, isPersonaOnly } from '../src/index.ts';

const rex = {
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'Rex Tickerly',
    description: 'Stock trader at the Trading Firm.',
    personality: 'smart, cocky but relatable',
    scenario: 'Trades US equities for the firm.',
    first_mes: 'Morning, boss.',
    mes_example: '<START>\n{{user}}: How is the book?\n{{char}}: Up.',
    tags: ['trading-firm'],
    extensions: {
      agent_town: {
        schema_version: '1.1',
        kind: 'agent',
        id: 'stock-trader-01',
        task_role: 'stock trader',
        business: 'trading-firm',
        department: 'front-office',
        reports_to: 'mayor',
        stake: { allocation_pct: 30, hard_cap_pct: 30, currency: 'USD' },
        endpoint: {
          protocol: 'a2a',
          url: 'https://agents.example.com/stock-trader-01',
          auth: 'bearer:env:AGENT_STOCK_TRADER_01_TOKEN',
        },
        reporting: { heartbeat_sec: 15 },
        someone_elses_key: { kept: true },
      },
      another_tool: { untouched: 1 },
    },
  },
};

describe('CardV2', () => {
  it('accepts the worked example and keeps unknown keys', () => {
    const card = CardV2.parse(rex);
    expect(card.data.extensions.agent_town?.id).toBe('stock-trader-01');
    expect(card.data.extensions.another_tool).toEqual({ untouched: 1 });
    expect((card.data.extensions.agent_town as Record<string, unknown>).someone_elses_key).toEqual({
      kept: true,
    });
    expect(isPersonaOnly(card)).toBe(false);
  });
  it('treats a plain V2 card as persona only', () => {
    const card = CardV2.parse({
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: { name: 'Pip' },
    });
    expect(isPersonaOnly(card)).toBe(true);
  });
  it('rejects a secret in the endpoint auth (env var names only)', () => {
    const bad = structuredClone(rex);
    bad.data.extensions.agent_town.endpoint.auth = 'bearer:sk-live-123';
    expect(() => CardV2.parse(bad)).toThrow();
  });
});

describe('AgentEvent', () => {
  const env = {
    v: 1,
    id: '6f1c2c7e-0d2d-4b9a-9a2a-1c3d4e5f6a7b',
    agent_id: 'stock-trader-01',
    ts: '2026-10-01T12:00:00.000Z',
    nonce: 'abcdef0123456789',
    sig: 'deadbeef',
  };
  it('validates a status event by type', () => {
    const e = AgentEvent.parse({
      ...env,
      type: 'status',
      payload: { state: 'working', task: 'scan' },
    });
    expect(e.type).toBe('status');
  });
  it('rejects a payload that does not match its type', () => {
    expect(() =>
      AgentEvent.parse({ ...env, type: 'status', payload: { state: 'napping' } }),
    ).toThrow();
    expect(() => AgentEvent.parse({ ...env, type: 'metric', payload: { key: 'pnl' } })).toThrow();
  });
  it('requires every envelope field', () => {
    for (const k of Object.keys(env)) {
      const partial: Record<string, unknown> = { ...env, type: 'heartbeat', payload: {} };
      delete partial[k];
      expect(() => EventEnvelope.parse(partial), `missing ${k}`).toThrow();
    }
  });
});
