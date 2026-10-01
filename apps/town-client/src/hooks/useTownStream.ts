import {
  StreamMessage,
  type AgentEvent,
  type AgentSummary,
  type ClockSummary,
} from '@agent-town/schema';
import { useEffect, useState } from 'react';

export interface TownStream {
  connected: boolean;
  clock: ClockSummary | null;
  agents: AgentSummary[];
  /** The newest event line per agent: real reports as the same text the dashboard shows (§6.7.4). */
  lastLine: Record<string, string>;
}

/** One line of feed text per event; numbers only from the event itself (§5.4). */
export function eventLine(e: AgentEvent): string | null {
  switch (e.type) {
    case 'status':
      return e.payload.task ? `${e.payload.state} · ${e.payload.task}` : e.payload.state;
    case 'task_progress':
      return `${e.payload.pct}% ${e.payload.note ?? e.payload.task_id}`;
    case 'thought_comment':
      return `“${e.payload.text}”`;
    case 'metric':
      return `${e.payload.key} ${e.payload.value}${e.payload.unit ?? ''}`;
    case 'report':
      return `report (${e.payload.period}): ${e.payload.summary}`;
    case 'permission_request':
      return `asks the Mayor: ${e.payload.action}`;
    case 'message':
      return `letter to ${e.payload.to_agent_id}: ${e.payload.summary}`;
    case 'error':
      return `${e.payload.severity}: ${e.payload.message}`;
    case 'lifecycle':
      return e.payload.event;
    case 'task_complete':
      return `done ${e.payload.task_id} (${e.payload.units} units)`;
    default:
      return null;
  }
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
      if (m.kind === 'clock') setClock(m.clock);
      else if (m.kind === 'agents') setAgents(m.agents);
      else {
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
