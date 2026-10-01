import type { AgentSummary } from '@agent-town/schema';

const DEPT_ORDER: Record<AgentSummary['department'], number> = {
  'front-office': 0,
  'middle-office': 1,
  'back-office': 2,
};
const DEPT_LABEL: Record<AgentSummary['department'], string> = {
  'front-office': 'Front Office',
  'middle-office': 'Middle Office',
  'back-office': 'Back Office',
};

/** Phase 0: the sim's 12 agents in a plain DOM list; sprites and desks come in Phase 1. */
export function AgentList({
  agents,
  lastLine,
}: {
  agents: AgentSummary[];
  lastLine: Record<string, string>;
}) {
  const sorted = [...agents].sort(
    (a, b) => DEPT_ORDER[a.department] - DEPT_ORDER[b.department] || a.name.localeCompare(b.name),
  );
  return (
    <ul id="agents">
      {sorted.map((a) => (
        <li key={a.id} data-agent-id={a.id} data-state={a.state} data-online={a.online}>
          <div className="who">
            <span className="callsign">{a.callsign}</span>
            <span className="name">{a.name}</span>
            <span className="dept">{DEPT_LABEL[a.department]}</span>
          </div>
          <span className="state">{a.online ? a.state : 'offline'}</span>
          <span className="line">{lastLine[a.id] ?? a.task_role}</span>
        </li>
      ))}
    </ul>
  );
}
