---
name: add-crop
description: Add a Tallyford crop (crops.json row, 7 placeholder frames, seed and produce icons), lint it and print its ₥/day against the §6 table. Use when adding a crop to packages/game-data.
disable-model-invocation: true
---

Read docs/spec/12-game-layer.md §6 (crops table, ₥/day definition), §5 (crop frames, naming, pixel QA) and rules/art.md first.
Then, for the crop, season and seller named in the arguments:
1. crops.json: one row with the §6 columns, the seller noted as the table does (e.g. "Bazaar only") and any per-harvest yield; numbers copied from the table row, or stop and ask if the crop is not there. Never change another row.
2. `crop__<id>__s<stage>.png` under art/, per the §5 naming: 7 placeholder frames on palette.gpl colours, every stage visibly different from its neighbour.
3. The seed packet and produce icons under art/ (16×16, one outline weight, §5), named per the §5/§8.4 convention.
4. Compute ₥/day as §6 defines it; check it reproduces Radish 3.5 and Snap Pea 9.3, then print harvests, profit and the result beside the table's value. Several table rows differ; report the gap, do not change the table.
5. Run pnpm data:lint, pnpm art:qa and scripts/banned-words.sh on every file you wrote; fix, do not skip.
Report the row you added, the ₥/day you computed next to the table's, and which frames are still placeholders.
