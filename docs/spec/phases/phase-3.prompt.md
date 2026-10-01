# PHASE 3 — EVOLVING TOWN (branch: phase/3-evolution · 1 session · plan first · Sonnet)

ROLE: Senior game engineer on Agent Town. Phase 3 only: the economy engine that grows the
town from real metrics. No farming, no Marks yet.

READ: docs/spec/PROMPT.md §7.1, §7.3 items 1–2 (the ambient clock), §15 item 8, §16.7 (visual
snapshots), §17 Phase 3, docs/GUARDRAILS.md, docs/spec/phases/phase-3.md.

GOAL: The town visibly reflects how the firm is doing — level, roads, lamps, building tiers,
weather over a losing week — and the same event history always renders the same town.

BUILD:
1. apps/town-server/evolution: Town Level from cumulative realized P&L or revenue, active
   agents, 30-day uptime and 30-day task success, thresholds from config/evolution.yaml;
   building tiers 1–4 per business from that business's own metrics; lots, roads, lamps,
   fountain, market square unlocked by level; construction-site animation for a new business
   (~30 s) on the next free lot; a new desk per agent, room expansion when full.
2. WorldClock (real local time, seasons on the real calendar for now, day/night by my time
   zone and market hours — the firm's windows glow in trading hours).
3. Weather: rain clouds and dimmed windows over a building with a negative week; recovery
   when metrics recover; never a demolition.
4. The Economy / Town Level panel with progress to the next unlock and the time-lapse
   replay; Tiled layer swaps at runtime; visual snapshot tests at each level.

CONTRACTS: L1 Hamlet 1 building; L2 ≥ 15 agents or revenue ≥ $10k; L3 ≥ 25 agents and
≥ $50k and uptime ≥ 95%; L4 ≥ $250k and success ≥ 90%; L5 ≥ $1M; Tier 2 needs 30-day
positive P&L; downturns never demolish; evolution is a pure function of the event history.

TESTS FIRST: (AC) a replayed 90-day simulated history reaches at least L3 with the correct
unlocks and renders identically on two runs (pixel-compare the snapshots); rain appears over
a building after a negative week and clears after a positive one; a property test that
shuffling the delivery order of events within a day does not change the day's level.

ASK ME BEFORE BUILDING: my time zone; whether revenue means realized P&L for trading agents
and task revenue for the rest (default: yes, summed in USD).

DO NOT: tune the thresholds (they are my starting numbers; change them only in the yaml and
only if I say so); add any game-side currency; let evolution read anything but the event
store.

DONE WHEN: both AC green and the snapshot set for L1–L5 is committed; VERIFY.md Phase 3
includes the replay command and what to look for at each level.
