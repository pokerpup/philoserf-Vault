import { StreamMessage } from '@agent-town/schema';

// events/ (PROMPT.md §3): event store + SSE. Phase 0 ships the SSE fan-out only; the persistent
// store and the WebSocket fallback arrive with the gateway in Phase 1.

export type Subscriber = (frame: string) => void;

/** Formats one SSE frame; every message is Zod-checked on the way out. */
export function sseFrame(message: StreamMessage): string {
  const m = StreamMessage.parse(message);
  return `event: ${m.kind}\ndata: ${JSON.stringify(m)}\n\n`;
}

export class EventHub {
  private readonly subs = new Set<Subscriber>();

  subscribe(fn: Subscriber): () => void {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  publish(message: StreamMessage): void {
    const frame = sseFrame(message);
    for (const fn of this.subs) fn(frame);
  }

  get size(): number {
    return this.subs.size;
  }
}
