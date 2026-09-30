# Phase 6 — Farm and economy

Source: `docs/spec/12-game-layer.md` §10, copied verbatim. Read with `docs/GUARDRAILS.md`.

## Scope

Farming cycles, tools, inventory, chests, the Ledger Bin, shops, animals, machines, Marks, the bridge dividend and task credits, the Carpenter and Smith screens.

## Acceptance criteria

1. Plant → water → harvest → Ledger Bin pays at 06:00 with quality multipliers; out-of-season crops die at the season change.
2. With `bridge.rate: 0` no Marks are minted from real events; with the simulator's green day, the Treasury shows the dividend and the audit log shows no new entries from the game.
3. The 365-day headless simulation hits the §6 income targets (median of 20 seeded runs).
