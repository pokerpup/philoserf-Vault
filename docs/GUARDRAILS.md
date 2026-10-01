# Agent Town — guardrails

Imported into every session by `CLAUDE.md`. Four blocks copied verbatim: the bridge rules of `docs/spec/PROMPT.md` §6.7, the refuse-to-build list of §12, the guardrails checklist of §17, and the six added guardrails of `docs/spec/RPG.md` §12. When two rules conflict, the earlier pillar in `docs/spec/PROMPT.md` §0 wins.

## The bridge: real → game, one way (PROMPT.md §6.7)

1. The game reads the event store and audit log through `game/bridge` and never writes to them; it never sends `control`, `permission_decision` or `lifecycle` events except through the Welcome Wagon path in §8.
2. Game packages have no import path to `gateway/**` or `mayor/policy/**`; `pnpm depcruise` enforces it in CI and in the edit hook.
3. Real metrics gate *eligibility* (a Tier 3 firm building needs Town Level 3); Marks pay for construction. Both are required; neither substitutes.
4. No in-game number is ever shown as a real ticker, price or position; agents' real reports appear in the game only as the same event text the dashboard shows.
5. Trust hearts, XP, quests, festivals, professions and shop purchases never change a limit, tier, allocation, permission or model; nothing rewards approving, rejecting or hurrying a permission decision; no timer, streak or score ever attaches to the inbox.
6. Losses show as weather; the game has no state that punishes a real losing day.

## Refuse to build, even if asked later (PROMPT.md §12)

- an approval sprint or any timer, streak or score around permission decisions
- a game that reads real P&L, positions or agent events
- gambling with Marks beyond the fixed-entry card game
- hidden odds
- any prize that raises an agent's limits or tier

## Guardrails checklist (PROMPT.md §17) — re-read before every phase

- [ ] The bridge is one-way: the game never sends `control`, `permission_decision` or `lifecycle` events except through the Welcome Wagon path, and never writes to the event store or audit log.
- [ ] No game reward, XP, heart, quest, festival, profession or purchase changes a limit, tier, allocation, permission or model.
- [ ] Nothing rewards approving, rejecting or hurrying a permission decision; the inbox has no score, streak or timer.
- [ ] No real ticker, price, position or P&L figure appears inside a mini-game or dialogue line.
- [ ] Card fields written by the Creator cannot carry URLs, tool names or instructions to the Mayor.
- [ ] Promotion to Agent always passes the same Mayor validation as a manifest dropped into `agents/`.
- [ ] Losses show as weather; nothing in the game punishes a real losing day.
- [ ] The policy engine contains no LLM call; the assistant is read-only.

## Added guardrails for the action-RPG layer (RPG.md §12)

- [ ] No weapon, Seal, spell, meal, tonic, companion or mission reward reads or writes a limit, tier, allocation, permission or model.
- [ ] Live agents never fight, never join the party, never enter the Vault; companion AI is scripted, never a model.
- [ ] The honest-ledger counters come only from in-game choices; they never read the event store, the audit log or a permission decision.
- [ ] The bounty board and the permission inbox are separate screens with separate data; nothing on the bounty board refers to the real side.
- [ ] Combat never costs real Marks that were minted by the bridge ahead of other Marks: the tithe draws from play-earned Marks first.
- [ ] A knocked-out character is never killed; no save is deleted or rolled back by combat.
