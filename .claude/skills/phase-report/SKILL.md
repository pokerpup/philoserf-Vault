---
name: phase-report
description: Write the active phase's acceptance criteria into VERIFY.md as click-by-click steps with the tests that cover each, and list what is still open for the merge. Use when the last criterion of a phase has gone green and the PR is next.
disable-model-invocation: true
---

Read the active phase file first: docs/spec/phases/CURRENT, or the docs/spec/phases/phase-N.md named in the arguments. Then docs/spec/12-game-layer.md §10 (definition of done: VERIFY.md lists every acceptance criterion with exact steps) and docs/GUARDRAILS.md.
Then, for that phase, without starting the app and without editing source, tests or data:
1. Quote every acceptance criterion verbatim, numbered as in the phase file; never paraphrase, merge or drop one.
2. For each criterion, name the test(s) that cover it and the command that runs them: Vitest files in packages/game-core and packages/save-migrations (pnpm test), Playwright specs (pnpm test:e2e), the checks pnpm data:lint, pnpm depcruise, pnpm art:qa and pnpm sim:year. Commits carry the criterion number, so git log --oneline maps tests to criteria. No test found means the criterion is open.
3. Run pnpm test && pnpm data:lint && pnpm depcruise once; expected: all green. Record the result per criterion from the summary lines only; never paste a whole log. A red check is neither fixed here nor skipped: it goes to Open with its failing line.
4. Write the manual steps per criterion as a numbered list a person follows with the app open: the start command (pnpm dev: mock fleet from packages/sim, bridge.rate 0, a fixed townSeed and dayIndex so the walk repeats), the screen or scene, what to click or press, what to look for, the expected result. Where a screenshot is the evidence, name the screens/<scene>-<clock>.png the e2e run saves. Never a real agent, .env* or a card in agents/.
5. Status per criterion: done only when its tests are green and the steps in 4 can be walked by hand. A criterion that cannot be verified by hand is open, not done; so is one whose test is red or missing.
6. Update VERIFY.md at the repo root: one `## Phase N — <title>` section per phase, title from the phase file's first line. Replace this phase's section, or append it if there is none; leave every other phase's section exactly as it is.
7. End the section with an Open list: each criterion not done with its reason, every question the spec left unresolved this phase, and the guardrail-reviewer's FAIL lines if it ran and did not PASS.
Report one line per criterion (number, tests, checks, status) and the Open list, not the VERIFY.md text.
