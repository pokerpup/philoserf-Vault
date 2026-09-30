# Agent Town — guardrails

Imported into every session by `CLAUDE.md`. Three blocks copied verbatim from `docs/spec/12-game-layer.md`: the §1 bridge rules, the §7 anti-patterns and the §10 guardrails checklist. If any two rules conflict, the five design pillars in §1 of that file decide.

## Bridge rules the code must enforce (§1)

See §2 of `docs/spec/12-game-layer.md` for the numbers and §10 for the checks.

1. The game reads the existing event store and audit log; it never writes to them and never sends `control` or `permission_decision` events.
2. Game-layer packages have no import path to `apps/town-server/gateway` or `mayor/policy`. A dependency-cruiser rule fails CI if one appears.
3. Real metrics gate *eligibility* (a Tier 3 firm building needs Town Level 3); Marks pay for construction. Both are required; neither substitutes for the other.
4. No in-game number is ever shown as a real ticker, price or position. Agents' real reports appear in the game only as the same event text the dashboard already shows.

## Anti-patterns the coding agent must refuse to build even if asked later (§7)

- an "approval sprint" or any timer, streak or score around permission decisions
- a mini-game that reads real P&L, positions or agent events
- gambling with Marks beyond the fixed-entry card game
- a loot mechanic whose odds are hidden
- anything that raises an agent's limits or tier as a prize

## Guardrails checklist (§10) — re-read before every phase

- [ ] The bridge is one-way; the game never sends `control`, `permission_decision`, `lifecycle` (except through the Welcome Wagon path) or any event the dashboard did not already send.
- [ ] No game reward, XP, heart, quest, festival or profession changes a limit, tier, allocation, permission or model.
- [ ] Nothing in the game rewards approving, rejecting or hurrying a permission decision.
- [ ] No real ticker, price, position or P&L number appears inside a mini-game or dialogue line.
- [ ] Persona fields written by the Creator cannot carry URLs, tool names or instructions to the Mayor.
- [ ] Promotion to Agent always passes the same Mayor validation as a manifest dropped into `/agents/`.
- [ ] Losses show as weather; the game has no state that punishes a real losing day.
