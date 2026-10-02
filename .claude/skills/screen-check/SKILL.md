---
name: screen-check
description: Start the dev server, drive Playwright to a scene and clock, save the PNG and read it back against the §4 style rules (silhouettes, palette, light direction, cut-off labels). Use when checking a scene or HUD change by eye before calling it done.
disable-model-invocation: true
---

Read docs/spec/PROMPT.md §4 (rendering rules, pixel QA), §7.3 (the real clock) and §7.5 (the Year 1 map), docs/spec/GAME-LAYER.md §5 (style rules) and .claude/rules/art.md first.
Then, for the scene (a §7.5 zone or an interior) and the clock (HH:MM) given in the arguments:

1. Start pnpm dev: the mock fleet from packages/sim with bridge.rate 0, never real agents; do not touch config/bridge.yaml.
2. Drive the scene through the e2e suite (pnpm test:e2e) with the seeded day (townSeed, dayIndex) and the fixed viewport, so the shot is reproducible. Set the clock to the one given (the ambient clock (§7.3) is real time, so the suite sets it; never wait for it), then save screens/<scene>-<clock>.png.
3. Read the PNG and describe what is on screen before judging anything: which zone or interior, which characters and where they stand, the tint, every HUD panel and its labels. Never declare a scene done without this description.
4. Judge the §4 and GAME-LAYER.md §5 style rules against what you described, one line each:
   - every character readable by silhouette and two colours at 1×;
   - colours only from the 48-colour palette (palette.gpl); no pure black or white;
   - light from the upper left (check the shadow side), one shade of shadow, selective 1-px dark outlines;
   - when the scene is at night (day/night follows the §7.3 ambient clock; the spec fixes no hour), night is one blue-violet overlay at 55% plus warm light masks, nothing else tinted;
   - no HUD label or 5×7 number cut off by a panel edge or the viewport.
5. Run pnpm art:qa on art/ for the palette, grid and light-direction checks the eye cannot make; report each failure by file, do not skip.
6. Stop the dev server. If pnpm dev or pnpm test:e2e fails twice, stop and report; never loosen a check.

Report the image description, then one line per rule (pass, or fail with what you saw) and the PNG path.
