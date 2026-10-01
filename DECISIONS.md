# Decisions

Every default a session chose and why (PROMPT.md §0, working rule 6), newest entries at the end of each section. Prototype and design-loop verdicts go here too, in the shape the stage prompts give.

## Session 0 — 2026-10-01

- The repo moved from the v1 layout (playbook tab: `00-prompt.md`, `12-game-layer.md`, phases 0–9) to the layout `docs/spec/PROMPT.md` §18 and §19.6 specify, plus the session prompts from the _Claude Code prompts by phase_ tab and the stage prompts from the _prompts by game-dev phase_ tab. The game-layer addendum stays as `docs/spec/GAME-LAYER.md` for its long-form tables (cast with homes, the music map and SFX groups, sheet naming, the pixel QA checklist); where it and `PROMPT.md` differ, `PROMPT.md` wins, and `RPG.md` §1 overrides both on the points it lists.
- Bare § references inside `GAME-LAYER.md` use the v1 prompt's numbering (art pipeline §8 → `PROMPT.md` §14, non-functional requirements §10 → §16, the event model §5.5 → §5.4); they were left verbatim.
- Acceptance criteria in the phase files are copied verbatim and split into bullets at the source's own `;` separators and `(n)` markers; nothing is reworded.
- `scripts/banned-words.txt` lists the reference game's distinctive proper nouns and phrases. Left out on purpose: its character names that are also ordinary English words or very common first names (Alex, Sam, Emily, George, Penny, Robin, Sandy, Leo, Lewis, Clint, Kent, Pam, Vincent, Gus), so an original line about a bird or a coin does not trip the check.
- `.claude/settings.json` departs from `PROMPT.md` §18 in two rules: `Read(./agents/**)` and `Edit(./agents/**)` became `Read(/agents/**)` and `Edit(/agents/**)`, anchored to the project root, because a `./path` deny rule matches every directory named `agents` and blocked `.claude/agents/` itself. The real-card directory stays denied. Update §18 of the design doc to match.
- The four content subagents are in `.claude/agents/` beside the reviewer, written from §18 with the §19.6 additions.
- `RPG.md` §1 and §8 and `PROMPT.md` §19.1 call the 36-slot backpack the **Ledger Pack**; the exported tabs say "Deluxe Pack", a reference-game name that is on the banned list. Update the design doc to match.
- `README.md` is an Agent Town stub until Phase 0 writes the full one; `.github/settings.yml`, the Obsidian template's repository settings (`is_template: true`), was deleted. `.obsidian/` and `LICENSE` stay.
- `/design-loop` takes its question from the skill arguments; one line at the top of the skill says so, the rest is the tab's prompt verbatim.

## Phase 0 — Discover and scaffold (no product code)

Session date 2026-10-01. The three BUILD questions ("ask me before building") were answered with defaults because the session ran unattended; they are open questions in `PLAN.md` §6.

- **No agent repo found** in the workspace; `PLAN.md` §2 is written against the §5 contracts and marked unverified.
- **Fastify 5** over Hono: `reply.hijack()` gives a plain Node response for SSE, the plugin model fits the §3 server modules, and the §3 text names it first. Hono stays possible behind the same `buildApp()` boundary.
- **Ports 3000 (client) and 3001 (server)**, loopback only; Vite proxies `/api` so the browser sees one origin and `EventSource` needs no CORS. Override with `TOWN_SERVER_PORT` / `TOWN_SERVER_HOST`.
- **Server modules sit directly under `apps/town-server/`** (`game/`, `events/`, `registry/`, …) with no `src/`, exactly as §3 draws them, so the settings deny rules, the PostToolUse hook and the dependency-cruiser rule all name the same paths. `gateway/` and `mayor/policy/` are not created in Phase 0: they are deny-listed for edits in game sessions, so Phase 1 and Phase 2 create them.
- **Phaser scale: `Scale.NONE` plus an explicit integer `zoom`**, recomputed on resize (`integerZoom()` in `apps/town-client/src/game/zoom.ts`). `Scale.FIT` picks a fractional factor and fights a later `setZoom`, so the integer is given to the manager directly; the letterbox is the parent's CSS centring. This is the §4.2 "FIT with an integer override" in effect.
- **Tiled JSON** over LDtk: Phaser loads it natively (`tilemapTiledJSON`), the spec names it, and the generator writes it without a tool. Map `apps/town-client/public/assets/placeholder/town.json`, 96×64, layers `ground`, `buildings`, object layer `zones` carrying the §7.5 names and unlock text.
- **Generated placeholder tileset** instead of Kenney Tiny Town: the container denies downloads (`curl`/`wget`), so `scripts/gen-placeholders.ts` draws 16 flat-colour tiles from `art/palette.gpl`. It is a stand-in, recorded in `art/provenance.json`, not original art; `assets/third_party/README.md` has the swap.
- **`art/palette.gpl` is provisional**: 48 warm colours chosen so `art:qa` can enforce the palette rule from day one. The art phase replaces the values, not the rule.
- **Persistence deferred**: no Drizzle/SQLite in Phase 0 (nothing to store). The save envelope is `packages/save-migrations` v1 (`created_at`, `spring_one`, `town_seed`, `sim`); the dev server holds a `sim: true` save in memory with seed 42.
- **TypeScript 5.9**, not 7.0: typescript-eslint 8.x does not support TS 7 yet. **Vitest 5**, **Playwright 1.63**, **Zod 4** (`z.toJSONSchema` generates the committed JSON Schemas), **ESLint 10** flat config, **Prettier 3** (`singleQuote`, `printWidth` 100), **dependency-cruiser 18**.
- **Dependencies added** (CLAUDE.md asks before adding; listed for your review): phaser, react, react-dom, vite, @vitejs/plugin-react, fastify, zod, yaml, ajv, ajv-formats, vitest, @playwright/test, typescript, typescript-eslint, eslint, @eslint/js, eslint-plugin-react-hooks, globals, prettier, dependency-cruiser, tsx, concurrently, pngjs, @types/node, @types/react, @types/react-dom, @types/pngjs. All MIT or Apache-2.0; nothing needs an account.
- **Prettier is never run on prose or on verbatim files**: `.prettierignore` lists `*.md`, `docs/spec/**`, `.claude/**` and the generated JSON. Code is formatted; `pnpm format:check` is green.
- **Fixtures are committed** (`packages/sim/fixtures/*.card.json`, from `pnpm sim:fixtures`) so `pnpm dev` and the tests need no generation step; a test keeps them in sync with `roles.ts`.
- **JSON Schemas are generated from Zod** (`packages/schema/json/`, `packages/game-data/schemas/`) and committed; `pnpm data:lint` validates with Ajv so the PostToolUse hook needs no TypeScript. Tests fail if a committed schema drifts from its Zod source.
- **Market hours** (`packages/game-data/time.json`): 09:30–16:00 America/New_York, weekdays, as the "firm's windows glow" window of §7.3.1. A display rule only; nothing real reads it.
- **Ember Vine**: the §10 ₥/day column (19.6) equals 550 ÷ 28 and ignores the 600 ₥ seed and regrowth; every other crop matches the formula in `packages/game-core/src/economy.ts` to one decimal. The test pins the mismatch; the designer decides in Phase 6.
- **`config/bridge.yaml` and `config/evolution.yaml`** were created from §7.4 and §7.1 verbatim with `rate: 0`. Both are on the settings "ask" list; they carry the spec's own numbers and nothing else, and are flagged here for your sign-off.
- **Guardrail audit fixes** (the `guardrail-reviewer` subagent, run before the Phase 0 push): the wall rule is now `reachable: true`, so an import *path* through `events/` or another package fails like a direct import, with a transitive case in the test; `apps/town-client/vite.config.ts` sets `envDir: false` so Vite never loads a `.env*` file from the client folder.
- **The depcruise proof** is a Vitest test (`scripts/depcruise-wall.test.ts`) that builds a throwaway tree with one bad import from `game-core` into `mayor/policy` and one from `apps/town-server/game` into `gateway`, asserts the rule fires, removes them, asserts clean. The repo never carries the bad import.
- **Plan approved 2026-10-01** ("approve and run"): Fastify, ports 3000/3001 and the roster mapping are settled; the agent-repo location is asked again at the start of Phase 1; the crop-table question waits for Phase 6. `docs/spec/phases/CURRENT` now points at `phase-1.md` so the next session's start hook loads the right phase.

## Phase 1 — MVP town

_Nothing yet._

## Phase 2 — Live updates and the Mayor

_Nothing yet._

## Phase 3 — Evolving town

_Nothing yet._

## Phase 4 — Midjourney assets

_Nothing yet._

## Phase 5 — World and Founder

_Nothing yet._

## Phase 6 — Farm and economy

_Nothing yet._

## Phase 7 — Life and story (four sessions: cast and hearts; charter and festivals; the Vault; the pipeline)

_Nothing yet._

## Phase 8 — Mini-games

_Nothing yet._

## Phase 9 — Audio, audit and polish

_Nothing yet._

## Phase 10 — Combat core and the first two wings

_Nothing yet._

## Phase 11 — Magic, gear, companions, fishing

_Nothing yet._

## Phase 12 — Treasury, Undercount, the Receiver and the Deep Stacks

_Nothing yet._
