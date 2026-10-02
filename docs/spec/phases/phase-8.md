# Phase 8 — Mini-games

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-8.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Fishing, the arcade cabinets, Tallyman's Gambit, Market Day, the festival games, the crane.

## Acceptance criteria

- (1) each game runs at 60 fps on the reference laptop, supports keyboard and touch, pauses on blur, and pays only from its reward table
- (2) Market Day has no import from the event store or any price feed, proven by a static-analysis test
- (3) hi-scores persist across saves and survive a migration
