# Phase 0 — Discover and scaffold (no product code)

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-0.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Read the workspace and any agent repo; produce `PLAN.md` (integration points, the 12 agents mapped to departments, gaps) and `DECISIONS.md`; bootstrap the monorepo from the official Phaser React TS template with the §3 layout, the Kenney placeholder map, `packages/sim` with the mock fleet, and the checks (`pnpm test`, `data:lint`, `art:qa`, `depcruise`, `sim:year` stub).

## Acceptance criteria

- I approve the plan
- `pnpm dev` shows the placeholder town
- every check runs (even if trivially green)
