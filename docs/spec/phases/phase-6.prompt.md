# PHASE 6 — FARM AND ECONOMY (branch: phase/6-farm-economy · 1 session · plan first · Opus-class)

ROLE: Senior game engineer and the game-designer subagent's lead on Agent Town. Phase 6
only: the farming loop, the in-game currency, and the one-way bridge from real results.

READ: docs/spec/PROMPT.md §6.7 (the bridge rules), §7.4 (Marks), §9.3–§9.4, §10 (loops, Vigor,
skills, crops, animals and artisan goods, tools and buildings, income targets), §19 item 1
(backpack progression), §17 Phase 6, docs/GUARDRAILS.md, docs/spec/phases/phase-6.md.

GOAL: The farm earns Marks on its own, the firm's real results mint Marks through a bridge
that can be set to zero, and the two never touch each other's state.

BUILD:
1. Farming (§9.3): FarmTile state, watering, sprinklers at 06:00, growth at DayTick, season
   death outside the greenhouse, quality from Farming level and fertilizer, regrowers, trees,
   animals and machines on the same daily-state pattern; crops.json with the 22 crops and
   their §10 columns (the /add-crop skill), animals.json, machines.json, recipes.json.
2. Inventory as the backpack progression (Satchel 12 → Pack 24 → Deluxe 36 → Vault 48,
   hotbar 12, stacks to 999), chests, the Ledger Bin sold at 06:00 with quality ×1/1.25/1.5/2,
   shops.yaml (Ocampo & Daughter, Tobiah, Roz, Wren, the Bazaar on Fri and Sun), the
   Carpenter and Smith screens with the §10 tools and buildings tables, tools.json,
   buildings.json.
3. Vigor costs (§10): hoe/water/chop/pick 2 (−0.1 per level), winded at 0, the tavern meal
   (+50, once a day, 60 ₥); Farming, Fishing, Foraging and Prospecting XP with the §10 curve
   and professions (skills.yaml); forage spawns (forage.json) and the Morning Ledger luck.
4. apps/town-server/game/economy and game/bridge: Marks ledger; dividend = clamp(realized
   P&L USD × bridge.rate, 0, cap) at the daily summary; task credits per task_complete with
   marks_per_unit capped per agent per day; rain over the firm on a loss day; config/bridge.yaml
   with every number settable to 0. Bridge reads the event store only, through one function,
   and writes nothing back.
5. pnpm sim:year for real: 365 days headless, 20 seeded runs, the §10 income table printed,
   full log to sim/last-run.log.

CONTRACTS: bridge.rate 1.0 and cap 2,000 ₥/day; task credits cap 500 ₥/agent/day; Ledger Bin
pays at 06:00; Vigor max 270; XP curve 100 · 300 · 600 · 1,000 · 1,600 · 2,500 · 3,800 ·
5,600 · 8,200 · 12,000; every number from packages/game-data, none in scene code; no
Stewardship XP for approving or rejecting anything.

TESTS FIRST: (AC1) plant → water → harvest → Ledger Bin pays at 06:00 with the quality
multiplier, and an out-of-season crop dies at the season change; (AC2) with bridge.rate 0
no Marks are minted from real events, and with the sim's green day the Treasury shows the
dividend while the audit log gains zero entries from the game (assert by counting entries
before and after); (AC3) sim:year hits the §10 targets (Year 1 Spring 4,000–7,000 ₥, Summer
15,000–25,000, Fall 30,000–50,000, Winter 8,000–15,000; Year 2 ≈ 3×) on the median of 20
seeds; plus a migration test from a 36-slot save to a Deluxe Pack.

ASK ME BEFORE BUILDING: the bridge.rate and cap I want for my firm's size (spec defaults
1.0 and 2,000); whether non-trading agents' tasks should mint Marks at all in Year 1.

DO NOT: change a §10 number without asking (propose a diff through the designer subagent);
let any game module import gateway or mayor/policy; show a real USD figure inside the farm
UI; sell legendary or quest items in the Ledger Bin.

DONE WHEN: AC1–AC3 green; the sim's income table is committed under sim/; VERIFY.md Phase 6
includes the bridge.rate 0 check and the green-day dividend check.
