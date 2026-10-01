# Agent Town

A web app where a firm of AI agents lives in one shared pixel-art town, Tallyford, each agent with its own persona, all reporting to a Mayor who is the safety and risk manager. Around that live dashboard sits a cozy farm-and-town game whose economy grows only from the agents' real work. Built phase by phase with Claude Code.

## Where things are

- `docs/spec/PROMPT.md` is the build spec and the source of truth. `docs/spec/RPG.md` adds the action-RPG and dungeon layer; `docs/spec/GAME-LAYER.md` keeps the game-layer addendum's long-form tables.
- `CLAUDE.md` and `docs/GUARDRAILS.md` are the working agreement every Claude Code session loads. `.claude/` holds the permission settings and hooks, the five subagents, the skills and the path-scoped rules.
- `docs/spec/phases/` has one scope-and-criteria file and one paste-ready session prompt per phase, 0 to 12; `CURRENT` points at the active phase.
- `docs/spec/gamedev/` has the concept, pre-production, production, QA, launch and live-ops prompts; `/design-loop` runs one design question at a time.
- `DECISIONS.md` records every default a session chose; `VERIFY.md` holds the hand-verification steps per phase; `scripts/banned-words.sh` is the originality check.

## How to work

Session 0, this scaffolding, is done. For each phase: `/clear`, create the branch named in the prompt header, paste `docs/spec/phases/phase-N.prompt.md` in plan mode, approve the plan once it quotes every acceptance criterion and names the failing test for each, build one criterion at a time, walk `VERIFY.md` by hand, merge. `docs/spec/phases/README.md` has the details.

## Run it

Node 22 and pnpm 10 (`corepack enable`).

```sh
pnpm install
pnpm dev            # Town Server on :3001, client on :3000, the mock fleet, bridge rate 0
pnpm test           # Vitest
pnpm test:e2e       # Playwright against pnpm dev
pnpm lint && pnpm typecheck && pnpm format:check
pnpm data:lint      # packages/game-data and config/*.yaml against their JSON Schemas
pnpm art:qa         # grid, palette and provenance of every image
pnpm depcruise      # the dependency wall: game code never imports gateway or mayor/policy
pnpm sim            # stream 30 s of mock-fleet events as JSON lines (--seconds, --seed)
pnpm sim:year       # 365-day economy run (stub until Phase 6)
pnpm placeholders   # regenerate the placeholder tileset and map
```

Layout: `apps/town-client` (Phaser 4 + React 19 + Vite), `apps/town-server` (Fastify), `packages/schema` (Zod + generated JSON Schema), `adapter-sdk` (signed events in ten lines), `sim` (the mock fleet and its fixtures), `game-data` (tables), `game-core` (pure rules), `save-migrations`. `PLAN.md` maps the twelve agents to the firm and lists the open questions.

Later phases expand this file: adding an agent in one file, connecting a remote or local agent, the art pipeline, the kill switch, creating, hiring and awakening a resident, the farm loop, the bridge settings and Sim Season.

## Licence

MIT, see `LICENSE`.
