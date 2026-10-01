import type { AgentEvent } from '@agent-town/schema';

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
