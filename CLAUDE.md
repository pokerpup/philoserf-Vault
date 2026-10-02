# Agent Town — working agreement for Claude Code

Spec: `docs/spec/PROMPT.md`. Load only the active phase file: `docs/spec/phases/CURRENT`.

## Commands
- `pnpm dev` — client + server with the mock fleet (packages/sim), bridge.rate = 0
- `pnpm test` — Vitest; `pnpm test:e2e` — Playwright (seeded days, screenshots to screens/)
- `pnpm data:lint` — JSON Schema check of packages/game-data
- `pnpm art:qa` — palette, grid and provenance check of art/
- `pnpm sim:year` — 365-day headless economy run; prints the income table, full log to sim/last-run.log
- `pnpm depcruise` — dependency wall: game packages never import gateway or mayor/policy

## Non-negotiables
@docs/GUARDRAILS.md

## How we work
- One phase per session, one branch per phase (`phase/5-world-founder`), PR into main.
- Plan first: no source edits until the plan quotes the phase's acceptance criteria verbatim,
  names the failing test for each, lists files by package, and asks its questions.
- Tests before features; one criterion at a time; commit per criterion with its number.
- Placeholders first: Kenney CC0 tiles and layer-composed portraits; never block on art.
- Real agents are never wired in a game-layer session; use packages/sim.
  Never read `.env*` or `agents/`; fixtures live in packages/sim/fixtures.
- Ask before: changing any number in a §10 table, adding a dependency,
  touching apps/town-server/gateway or mayor/policy, anything that moves money.
- If a check fails twice, stop and report; never loosen the check.

## Conventions
- TypeScript strict, ESLint + Prettier, Zod at every boundary.
- Rules in packages/game-core, tables in packages/game-data; no magic numbers in scenes.
- Every name, line, sprite and cue is original. Stardew Valley is a structural reference
  only; never its names, text, art or music; the word never appears in the product.

## Compact Instructions
Keep: the active phase, acceptance criteria not yet green, decisions made this session,
open questions for me. Drop: file contents already committed, passing test output.
