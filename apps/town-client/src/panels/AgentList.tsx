import type { AgentSummary } from '@agent-town/schema';
import { ASSETS } from '../game/config.ts';

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
/** Portrait strip order from art/pixel/portraits.ts: neutral, happy, sad, annoyed, surprised, smug. */
const EXPRESSION_INDEX: Record<AgentSummary['state'], number> = {
  working: 0,
  idle: 0,
  waiting: 4,
  blocked: 3,
  error: 2,
  offline: 2,
};

/** The firm's desks: portrait, callsign, state and the newest feed line, in a plain DOM list. */
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
      {sorted.map((a) => {
        const expr = a.online ? EXPRESSION_INDEX[a.state] : 2;
        return (
          <li key={a.id} data-agent-id={a.id} data-state={a.state} data-online={a.online}>
            <div
              className="portrait"
              role="img"
              aria-label={a.name}
              style={{
                backgroundImage: `url(${ASSETS}/portraits/${a.id}.png)`,
                backgroundPosition: `-${expr * 64}px 0`,
              }}
            />
            <div>
              <div className="who">
                <span className="callsign">{a.callsign}</span>
                <span className="name">{a.name}</span>
                <span className="dept">{DEPT_LABEL[a.department]}</span>
              </div>
              <span className="state">{a.online ? a.state : 'offline'}</span>
              <span className="line">{lastLine[a.id] ?? a.task_role}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
