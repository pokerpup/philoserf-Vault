import type { ClockSummary } from '@agent-town/schema';

const SEASON_LABEL: Record<ClockSummary['season'], string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export function ClockBar({ clock, connected }: { clock: ClockSummary | null; connected: boolean }) {
  return (
    <header id="clock" className="plank">
      <strong>Tallyford</strong>
      {clock ? (
        <>
          <span>
            Year {clock.year} · {SEASON_LABEL[clock.season]} {clock.season_day}
          </span>
          <span>{clock.hhmm}</span>
          <span>{clock.phase === 'awake' ? 'town awake' : 'night watch'}</span>
          <span>{clock.market_open ? 'the firm’s windows glow' : 'the firm is quiet'}</span>
        </>
      ) : (
        <span>waiting for the Town Server…</span>
      )}
      <span className="live" data-on={connected}>
        {connected ? 'stream live' : 'stream offline'}
      </span>
    </header>
  );
}
