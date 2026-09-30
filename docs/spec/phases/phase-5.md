# Phase 5 — World and Founder

Source: `docs/spec/12-game-layer.md` §10, copied verbatim. Read with `docs/GUARDRAILS.md`.

## Scope

The dependency-cruiser wall; `packages/game-data`, `game-core`, `save-migrations`; the Character Creator; movement and interaction; WorldClock and DayTick; save slots with export/import; schedules and daily lines for six NPCs (Mayor, Fennimore, Roz, Marisol, Hollis, Sterling).

## Acceptance criteria

1. A created character walks the square, talks to all six NPCs, sleeps, and is in the same place after a server restart.
2. The 00:00 tick runs once per missed day after downtime, in order, and a replay of the same seed renders the same day.
3. CI fails on any import from a game package into `gateway` or `mayor/policy`.
