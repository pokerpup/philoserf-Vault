import { StreamMessage, type AgentSummary, type ClockSummary } from '@agent-town/schema';
import { useEffect, useState } from 'react';
import { publishAgents, publishClock, publishEvent } from '../game/state.ts';
import { eventLine } from './eventLine.ts';

export { eventLine };

export interface TownStream {
  connected: boolean;
  clock: ClockSummary | null;
  agents: AgentSummary[];
  /** The newest event line per agent: real reports as the same text the dashboard shows (§6.7.4). */
  lastLine: Record<string, string>;
}

export function useTownStream(url = '/api/stream'): TownStream {
  const [connected, setConnected] = useState(false);
  const [clock, setClock] = useState<ClockSummary | null>(null);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [lastLine, setLastLine] = useState<Record<string, string>>({});

  useEffect(() => {
    const es = new EventSource(url);
    const handle = (raw: MessageEvent<string>) => {
      const parsed = StreamMessage.safeParse(JSON.parse(raw.data));
      if (!parsed.success) return;
      const m = parsed.data;
      if (m.kind === 'clock') {
        setClock(m.clock);
        publishClock(m.clock);
      } else if (m.kind === 'agents') {
        setAgents(m.agents);
        publishAgents(m.agents);
      } else {
        publishEvent(m.event);
        const line = eventLine(m.event);
        if (line) setLastLine((prev) => ({ ...prev, [m.event.agent_id]: line }));
      }
    };
    for (const kind of ['clock', 'agents', 'agent_event'])
      es.addEventListener(kind, handle as EventListener);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [url]);

  return { connected, clock, agents, lastLine };
}
