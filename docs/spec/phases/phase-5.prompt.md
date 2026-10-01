# PHASE 5 — WORLD AND FOUNDER (branch: phase/5-world-founder · 1 session · plan first · Opus-class)

ROLE: Senior game engineer on Agent Town. Phase 5 only: the game layer's foundation. No
farming, no Marks, no story beyond six NPCs' daily lines. The gateway and mayor/policy are
deny-listed again from this phase on.

READ: docs/spec/PROMPT.md §3 (the wall in §3.5), §4.4 (Creator layers), §7.3 (time), §7.5
(the map), §8 (the Creator and the states), §9 items 1–2, 5–8, §11 (the cast table, for the
six NPCs), §17 Phase 5, docs/GUARDRAILS.md, .claude/rules/game-packages.md,
docs/spec/phases/phase-5.md.

GOAL: I can make a character — look, persona, origin, home, work — walk them through
Tallyford on the real clock, and come back tomorrow to find them where their schedule says;
that character is already a valid Character Card V2 that Phase 7 will be able to awaken.

BUILD:
1. The dependency wall first: dependency-cruiser rule and `pnpm depcruise` in CI and in the
   PostToolUse hook; packages/game-data (with JSON Schema per file and `pnpm data:lint`),
   packages/game-core (pure rules), packages/save-migrations.
2. The Registry (Character Creator) in Town Hall: six steps from §8 — layered 16×32 sprite
   with a palette-swap pipeline and live four-direction preview, auto-composed 64×64
   portrait, the persona questions mapped to description/personality/scenario/first_mes/
   mes_example, the five origins with their bonuses, home lot, work, JSON review/edit,
   PNG export, SillyTavern card import. Writes extensions.agent_town.kind = resident and
   visual.layers; rejects URLs, tool names and Mayor instructions in persona fields.
3. Movement and interaction (§9.1): tile-locked, 8-direction smoothing, 4 tiles/s (6 on
   paths), WASD/arrows/touch joystick/click-to-walk, Tiled collide layer plus dynamic
   blockers, easystarjs pathing throttled to 500 ms, E/Space interaction, depth sort by feet.
4. WorldClock and DayTick (§7.3, §9.2): the real-clock day, 28-real-day seasons from the
   save's creation date, the seasons.follow_real_calendar flag, the 00:00 tick in one
   transaction with missed-tick replay, the day seed = hash(townSeed, dayIndex).
5. Saves (§9.7): 3 slots, action journal + nightly snapshot, save_version, export/import,
   migration fixtures.
6. Schedules and daily lines for the Mayor, Fennimore, Roz, Marisol, Hollis and Sterling
   (schedules/*.yaml with the condition language; dialogue/*.yaml, ≥ 40 lines each via the
   /add-npc skill; the dialogue linter and schedule validator); the "visit as" picker at the
   cottage bed; residents' schedule templates by origin and job.

CONTRACTS: Vigor is defined but unused this phase (max 270, refill 06:00); town awake
06:00–02:00; everyone teleports to the scheduled spot on tab reopen; a replayed seed renders
the same day; first two resident cottages free; persona fields cannot carry URLs.

TESTS FIRST: (AC1) a Playwright flow creates a character, walks the square, talks to all six
NPCs, sleeps, restarts the server and finds them in the same place; (AC2) a Vitest test runs
DayTick with three missed days and asserts three ticks in order and identical state on a
replay of the same seed; (AC3) CI fails on a deliberate import from packages/game-core into
apps/town-server/gateway, then passes once removed; plus the dialogue linter and schedule
validator over the six NPCs.

ASK ME BEFORE BUILDING: whether seasons.follow_real_calendar should default on or off
(spec default: off, 28-day seasons); whether the first save slot should auto-create on first
run. Everything else: defaults, logged.

DO NOT: import anything from gateway or mayor/policy; give the Creator any field that is
operational (model, endpoint, limits, permissions); write a compressed 20-minute day; build
farming.

DONE WHEN: AC1–AC3 green; VERIFY.md Phase 5 has the create-walk-sleep-restart steps.
Report as usual, plus the list of NPC lines still marked placeholder.
