import type { AgentEvent, AgentSummary, ClockSummary } from '@agent-town/schema';
import { EventBus } from './EventBus.ts';

// The React stream hook publishes here; scenes subscribe through the EventBus and read the
// latest snapshot on create. Game code only ever reads what the dashboard already shows (§6.7.4).
export const townState: { clock: ClockSummary | null; agents: AgentSummary[] } = {
  clock: null,
  agents: [],
};

export function publishClock(clock: ClockSummary): void {
  townState.clock = clock;
  EventBus.emit('clock', clock);
}

export function publishAgents(agents: AgentSummary[]): void {
  townState.agents = agents;
  EventBus.emit('agents', agents);
}

export function publishEvent(event: AgentEvent): void {
  EventBus.emit('agent_event', event);
}

/** Night darkness 0–0.55 for a HH:MM clock (§4.3, config.NIGHT). */
export function darknessAt(
  hhmm: string,
  night: { max: number; duskFrom: number; duskTo: number; dawnFrom: number; dawnTo: number },
): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const t = h * 60 + m;
  if (t >= night.duskTo || t < night.dawnFrom) return night.max;
  if (t >= night.duskFrom)
    return (night.max * (t - night.duskFrom)) / (night.duskTo - night.duskFrom);
  if (t < night.dawnTo)
    return night.max * (1 - (t - night.dawnFrom) / (night.dawnTo - night.dawnFrom));
  return 0;
}

/** Word-wrap a comment for a speech bubble (§5.4: bubbles wrap; the newest comment only). */
export function wrapBubble(text: string, lineChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > lineChars && line) {
      lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1]!.slice(0, lineChars - 1) + '…';
    return cut;
  }
  return lines;
}
