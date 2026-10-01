# PRODUCTION — SPRINT WRAPPER (run at the start of every production session · plan first)

ROLE: Senior game engineer on Agent Town, starting one production sprint. A sprint = one
session prompt from docs/spec/phases/*.prompt.md, on its own branch, ending in a merge.

READ: docs/spec/phases/CURRENT (the active phase), its *.prompt.md, docs/GUARDRAILS.md,
docs/preprod/SCOPE.md (the cut line), docs/preprod/VERTICAL-SLICE.md until the slice is
done, DECISIONS.md (the last five entries), VERIFY.md (the previous phase's steps).

SPRINT RULES (on top of the session prompt):
1. Order: the vertical slice first (Phases 0, 1, 2, then the thin 5, 6, 7D path), then
   Phases 3, 5, 6, 7A, 7B, 7C, 8, 10 to reach ALPHA, then 4, 7D in full, 9, 11, 12 to reach
   BETA. Stop and ask before any reorder.
2. Start by printing the phase's acceptance criteria and the SCOPE.md rows it covers; any
   row below the cut line that the prompt mentions is stubbed, not built, and logged.
3. Placeholder content is correct until BETA: Kenney tiles, layer portraits, one music
   loop, lorem-free placeholder lines tagged `placeholder` that the dialogue linter counts.
4. Each criterion: failing test → feature → green → commit with the criterion number →
   `pnpm test && pnpm data:lint && pnpm depcruise`; the guardrail-reviewer runs before any
   commit touching game packages or packages/game-data.
5. End the sprint with docs/sprints/<phase>-<date>.md: criteria ✔/✘, what was stubbed, the
   SCOPE.md rows closed, decisions logged, bugs found but not fixed (filed to
   docs/qa/TRIAGE.md with a P-level), and the VERIFY.md steps added.

ALPHA AUDIT (run as its own session when Phases 0–3, 5–8 and 10 are merged):
- Walk docs/spec/PROMPT.md §2 requirement by requirement and RPG.md §1 line by line; for
  each, name the screen and the test that proves a working path exists; placeholder content
  is allowed, a missing path is not. Write docs/milestones/ALPHA.md with a pass/fail per
  requirement and the list of fails as triage items. Alpha passes only when every row passes.

BETA AUDIT (run when Phases 4, 7A–7D, 9, 11 and 12 are merged):
- Count the content against the spec: 16 NPCs with ≥ 40 lines each and six portraits,
  22 crops with 7 frames, 30 fish, 22 enemies and 5 keepers, 60 floors, 16 Entries, 12 status
  effects, 9 uniques, 8 festivals, 10 main missions, 5 companion missions, 5 legendary hunts,
  ~60 music stems, ~250 SFX, every asset with provenance, zero `placeholder` tags left.
  Write docs/milestones/BETA.md with the counts, the shortfalls, and the plan to close them.
  Beta passes when the counts match and art:qa, data:lint and the dialogue linter are clean.

DO NOT: start a phase whose predecessor's VERIFY.md has not been walked by me; build below
the cut line; treat a green test as proof of a requirement without the audit's screen name.

DONE WHEN: the sprint report exists, the branch is merged, CURRENT points at the next phase.
