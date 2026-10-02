# game/

Game-layer server code (PROMPT.md §3): WorldClock, DayTick, Farm, Inventory, Economy, Schedules,
Dialogue, Quests, Events, Residents and the read-only Bridge. The dependency wall (§3.5) applies:
nothing here imports `gateway/**` or `mayor/policy/**`; `pnpm depcruise` fails if it does.
