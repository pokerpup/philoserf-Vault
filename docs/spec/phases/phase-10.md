# Phase 10 — Combat core and the first two wings

Source: `docs/spec/RPG.md` §12, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-10.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

The combat scene and entity systems, the five weapon classes at Copper and Iron, Arms skill, status effects, the knockout rule, Peaceful and Standard, floor generation, Copper Stacks and Iron Archives with their rosters, the Teller and the Underwriter, Hesper and the Armory, backpacks and the tool belt, M1–M6.

## Acceptance criteria

- (1) the headless combat sim clears Copper with a Copper Blade at Arms 1 in 20–30 minutes and the Teller falls in 3–5 minutes
- (2) a knocked-out character wakes at the Chapel at 06:00 with weapons, spells and pages intact and the tithe logged
- (3) the same seed generates the same floor 500 times
- (4) `pnpm depcruise` and the manifest-hash test still pass with gear equipped
