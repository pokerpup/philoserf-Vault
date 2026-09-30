# Phase 8 — Mini-games

Source: `docs/spec/12-game-layer.md` §10, copied verbatim. Read with `docs/GUARDRAILS.md`.

## Scope

Fishing, the arcade cabinets, Tallyman's Gambit, Market Day, the festival games, the crane.

## Acceptance criteria

1. Each game runs at 60 fps on the reference laptop, supports keyboard and touch, pauses on blur, and pays only from its reward table.
2. Market Day has no import from the event store or any price feed; a static-analysis test proves it.
3. Hi-scores persist across saves and survive a migration.
