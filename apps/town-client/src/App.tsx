import { PhaserGame } from './PhaserGame.tsx';
import { useTownStream } from './hooks/useTownStream.ts';
import { AgentList } from './panels/AgentList.tsx';
import { ClockBar } from './panels/ClockBar.tsx';

export default function App() {
  const town = useTownStream();
  return (
    <div id="app">
      <ClockBar clock={town.clock} connected={town.connected} />
      <PhaserGame />
      <aside id="agents-panel">
        <h2>The Trading Firm · {town.agents.length} desks</h2>
        <AgentList agents={town.agents} lastLine={town.lastLine} />
      </aside>
    </div>
  );
}
