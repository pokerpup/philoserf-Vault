# Phase 1 — MVP town

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-1.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Phaser town, the Trading Firm with three department rooms, the 12 simulated agents walking and working with bubbles, the manifest registry with hot reload, Rex's card loading.

## Acceptance criteria

- dropping `agents/stock-trader-01.card.json` creates his desk, card, portrait slot and reporting line within 5 seconds with no code change
- deleting it retires him gracefully
