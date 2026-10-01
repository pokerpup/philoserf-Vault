# Phase 5 — World and Founder

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-5.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

The dependency wall; `packages/game-data`, `game-core`, `save-migrations`; the Character Creator; movement and interaction; `WorldClock` and `DayTick`; save slots with export and import; schedules and daily lines for six NPCs (the Mayor, Fennimore, Roz, Marisol, Hollis, Sterling).

## Acceptance criteria

- (1) a created character walks the square, talks to all six, sleeps, and is in the same place after a server restart
- (2) the 00:00 tick runs once per missed day in order and a replayed seed renders the same day
- (3) CI fails on any import from a game package into `gateway` or `mayor/policy`
