# PHASE 0 — DISCOVER AND BOOTSTRAP (branch: phase/0-bootstrap · 1 session · plan first · Opus-class)

ROLE: Senior game engineer on Agent Town. This session covers Phase 0 only: no Mayor, no
events, no farming, no art pipeline beyond placeholders.

READ: docs/spec/PROMPT.md §0–§4, §17 Phase 0, docs/GUARDRAILS.md, docs/spec/phases/phase-0.md.
Then explore the workspace: if a repo for my agent system exists, read it.

GOAL: A running placeholder town and a plan that maps my 12 real agents to the Trading
Firm's three departments, so Phase 1 can make a dropped-in card appear at a desk.

BUILD:
1. PLAN.md — integration points with my agent repo (adapters, never rewrites), the 12
   agents mapped to front/middle/back office, gaps, and the order of work for Phases 1–4.
2. DECISIONS.md — every default you pick (Fastify vs Hono, SQLite file path, port numbers,
   Tiled vs LDtk, pixel fonts and their licences) with one line of reasoning each.
3. The monorepo from phaserjs/template-react-ts with the §3 layout: apps/town-client,
   apps/town-server, packages/schema, adapter-sdk, sim, game-data, game-core,
   save-migrations; pnpm workspaces; TypeScript strict; ESLint + Prettier; Vitest; Playwright.
4. The §4 rendering rules in the Phaser config (pixelArt, roundPixels, integer zoom,
   480×270, Scale.FIT with integer override) and a Kenney Tiny Town placeholder map with
   LICENSE files in assets/third_party.
5. packages/sim: a mock fleet that emits realistic events for all 12 roles (the §5.3 event
   types), driven by a seed, with a `pnpm sim` command.
6. The checks, each runnable even if trivially green: pnpm test, pnpm test:e2e, pnpm
   data:lint, pnpm art:qa, pnpm depcruise (rule from §3.5), pnpm sim:year (stub printing
   the §10 income table shape), pnpm sim:vault (stub), pnpm lint.

CONTRACTS: base tile 16×16; characters 16×32; portraits 64×64; internal resolution 480×270;
agents offline after 3 missed 15-second heartbeats (the sim must emit heartbeats on that
cadence); every event carries v, id, agent_id, ts, nonce, type, payload, sig.

TESTS FIRST: a Vitest test that the sim emits every event type for every role in a 60-second
run; a Playwright test that `pnpm dev` renders the placeholder map at an integer zoom with
image-rendering: pixelated on the canvas; a depcruise test with one deliberate bad import
that fails, then is removed.

ASK ME BEFORE BUILDING: whether my agent repo exists and where; Fastify or Hono; whether to
reserve ports 3000/3001 or others. Pick defaults for everything else and log them.

DO NOT: wire any real agent, read .env* or agents/, draw original art, install anything
that needs a paid account.

DONE WHEN: I approve PLAN.md; `pnpm dev` shows the placeholder town with the sim's 12
agents listed in a plain DOM list (no sprites yet); every check runs. Report: criteria
✔/✘, files created by package, decisions logged, open questions, and the VERIFY.md steps
you wrote for Phase 0.
