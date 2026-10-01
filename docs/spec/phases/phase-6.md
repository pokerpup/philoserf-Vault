# Phase 6 — Farm and economy

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-6.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Farming cycles, tools, inventory, chests, the Ledger Bin, shops, animals, machines, Marks, the bridge dividend and task credits, the Carpenter and Smith screens.

## Acceptance criteria

- (1) plant → water → harvest → Ledger Bin pays at 06:00 with quality multipliers, and out-of-season crops die at the season change
- (2) with `bridge.rate: 0` no Marks are minted from real events, and with the simulator's green day the Treasury shows the dividend while the audit log gains no entries from the game
- (3) the 365-day simulation hits the §10 income targets
