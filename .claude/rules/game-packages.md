---
paths:
  - "packages/game-*/**"
  - "apps/town-server/game/**"
  - "apps/town-client/src/game/**"
---

# Game packages: the bridge runs one way

`docs/spec/PROMPT.md` §6.7, verbatim. `pnpm depcruise` enforces item 2 in CI and in the PostToolUse hook.

1. The game reads the event store and audit log through `game/bridge` and never writes to them; it never sends `control`, `permission_decision` or `lifecycle` events except through the Welcome Wagon path in §8.
2. Game packages have no import path to `gateway/**` or `mayor/policy/**`; `pnpm depcruise` enforces it in CI and in the edit hook.
3. Real metrics gate *eligibility* (a Tier 3 firm building needs Town Level 3); Marks pay for construction. Both are required; neither substitutes.
4. No in-game number is ever shown as a real ticker, price or position; agents' real reports appear in the game only as the same event text the dashboard shows.
5. Trust hearts, XP, quests, festivals, professions and shop purchases never change a limit, tier, allocation, permission or model; nothing rewards approving, rejecting or hurrying a permission decision; no timer, streak or score ever attaches to the inbox.
6. Losses show as weather; the game has no state that punishes a real losing day.
