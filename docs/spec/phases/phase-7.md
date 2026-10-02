# Phase 7 — Life and story (four sessions: cast and hearts; charter and festivals; the Vault; the pipeline)

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-7a.prompt.md … phase-7d.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Full cast of 16, Trust hearts and gifts, heart events in Ink, the quest engine with Noticeboard and Charter Commissions, the six halls and the Meridian path, all eight festivals, the Vault Below and Deep Stacks, the Resident → Employee → Agent pipeline with the Awakening.

## Acceptance criteria

- (1) every NPC has ≥ 40 daily lines and passes the linter, every schedule passes the validator
- (2) gifts follow the heart table, and a test asserts an agent's manifest hash is unchanged after reaching 10 hearts
- (3) a resident hired and then awakened appears in `agents/` as a valid card with a `lore` block, passes Mayor validation, and its desk turns live; retiring removes the endpoint and keeps the lore
- (4) the Mill Lot becomes Meridian Depot on Fall 21, Year 1 if unbought, and both endings play from a saved game

## Sessions

Four sessions, one branch each, in this order:

- `phase-7a.prompt.md` — cast and hearts
- `phase-7b.prompt.md` — charter and festivals
- `phase-7c.prompt.md` — the Vault
- `phase-7d.prompt.md` — the pipeline
