---
name: season-sim
description: Run pnpm sim:year, diff the result against the §10 income targets, and propose at most three one-line balance changes as a diff that is never applied. Use when re-balancing a season table in packages/game-data or before calling Phase 6 tuning done.
disable-model-invocation: true
---

Read docs/spec/PROMPT.md §10 (the balance tables; the income targets at the end of the section) first.
Then:
1. Run pnpm sim:year. It writes the full log to sim/last-run.log and prints a 20-line table; read the table, then `tail -40 sim/last-run.log` for detail. Never cat the log.
2. The targets assume the median of 20 seeded runs with no bridge Marks (mock fleet from packages/sim, bridge.rate 0). If the run shows anything else, stop and report; do not tune against it.
3. Build the table, one row per target, columns target / result / verdict: Year 1 Spring 4,000–7,000 ₥, Summer 15,000–25,000 ₥, Fall 30,000–50,000 ₥, Winter 8,000–15,000 ₥; Year 2 three times each Year 1 range; Charter Restored reachable by Year 2 Fall; Founder's Audit 3 lanterns for a player who does every festival and half the Vault.
4. For each row outside its range, find the table that drives it in packages/game-data (crops.json, animals.json, machines.json, fish.json, ores.json, tools.json, buildings.json, shops.yaml, charter.yaml) and pick the one number that moves it the least. Never bridge.yaml or evolution.yaml: the targets exclude bridge Marks.
5. Write at most three one-line changes as a unified diff against those files, each followed by one line of reason: the row it moves, from what to what, and which season it lifts or lowers. Keep every key the JSON Schema requires so pnpm data:lint stays green when the diff is applied.
6. Do not apply the diff, do not edit any file, do not re-run the sim with it. CLAUDE.md says ask before changing any §10 number; the diff is the ask.
7. If pnpm sim:year fails twice, stop and report the tail of sim/last-run.log; never loosen a target.
Report the table, the diff with its reasons, and which rows the diff leaves unaddressed.
