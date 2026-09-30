# Phase 7 — Life and story

Source: `docs/spec/12-game-layer.md` §10, copied verbatim. Read with `docs/GUARDRAILS.md`.

## Scope

Full cast of 16, Trust hearts and gifts, heart events in Ink, the quest engine with the Noticeboard and Charter Commissions, the six charter halls and the Meridian path, all eight festivals, the Vault Below and Deep Stacks, the Resident → Employee → Agent pipeline with the Awakening.

## Acceptance criteria

1. Every NPC has ≥ 40 daily lines and passes the dialogue linter; every schedule passes the validator.
2. Gifts follow the heart table; hearts with an agent change only cosmetics, greeting lines and quests — a test asserts the agent's manifest hash is unchanged after reaching 10 hearts.
3. A resident hired and then awakened appears in `/agents/` as a valid card with a `lore` block, passes Mayor validation, and its desk turns live; retiring it removes the endpoint and keeps the lore.
4. The Mill Lot becomes Meridian Depot on Fall 21, Year 1 if unbought, and both charter endings play from a saved game.

**Session split (playbook §2):** Phase 7 is big enough to split into four sessions: cast and hearts; charter and festivals; the Vault; the Resident → Agent pipeline.
