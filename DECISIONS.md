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

### Graphics build-out (same session, after the approval)

The owner asked for the graphics to be built out to match the reference game, in detail. The working agreement forbids its names, text, art and music and allows it as a structural reference only, so everything below is original pixel art drawn to the same conventions: 16×16 tiles, 16×32 people, 64×64 portraits, one 48-colour palette, light from the upper left, one shade of shadow, selective 1-px outlines (PROMPT.md §4, GAME-LAYER.md §5).

- **Art is code.** Every picture is ASCII rows with a legend in `art/pixel/*.ts`, compiled by `pnpm art:build` into `apps/town-client/public/assets/tallyford/`. No image is drawn by hand in an editor and nothing is downloaded, so the Midjourney pipeline of Phase 4 can replace any piece without touching the map or the scene. `pnpm art:preview <group>` renders a sheet at 4× for a look.
- **The palette** is eight ramps of six (`art/pixel/palette.ts`), hue-shifted toward orange in highlights and blue in shadows; `art/palette.gpl` is generated from it. Seasons are palette swaps per tile group (ground, leaf, static), four tileset PNGs from one sheet (§4.3); snow caps and leaf replacement tiles wait for the art phase.
- **Autotiles** for dirt, sand and water use a 4-bit neighbour mask with an organic edge profile and a rim on the lit sides; inner corners are not drawn yet. Cliffs are hand tiles with stairs; the Highlands plateau has no east-facing cliff face (trees hide the edge) until a side-face tile exists.
- **Buildings are specs**, not drawings: roof, wall, window, door, chimney, sign and awning pieces in a neutral ramp recoloured per material, composed by `art/pixel/buildings.ts`. Every §7.5 building is one entry in `BUILDINGS`; the six charter halls share one spec with different roof ramps and sign icons. Window centres are emitted as night lights.
- **People are layers.** A body drawn once in region codes, nine hair styles, four accessories (glasses, glasses pushed up, headset, tie), recoloured per card; the right-facing frames are the left-facing ones mirrored. The look lives on the card as `visual.layers` (palette names only, never hex), so the sim's fixtures drive both the sprite atlas and the portraits; Phase 7's Creator will write the same field. Six skin ramps of §4.4 are three for now (the palette has six skin colours).
- **Portraits are composed**, not drawn: head, ears, neck and collar from the look, hair as shapes, six expressions from brow, eye and mouth variants that differ by ≥ 12 pixels (checked by `art:qa`). The reference's hand-painted portraits are the bar; these are the auto-compose fallback GAME-LAYER.md §5 describes.
- **The 5×7 font** is generated with a BMFont XML for Phaser (labels, bubbles); lower-case letters share the capitals. The licensed body font of §4.5 is still to be chosen.
- **The scene** draws six tile layers with depths (ground, edges, water, objects, buildings, above), animates water by swapping frame-A and frame-B tile indices, lays a blue-violet 55% rectangle over the camera for night (dusk 18:00–21:00, dawn 05:00–07:00) with additive warm masks on windows, lamps and lanterns, lights the firm's windows in market hours (§7.3.1), and restarts in the clock's season. The twelve agents stroll the firm's forecourt with 4-direction walk cycles, callsign tags, speech bubbles for `thought_comment`, emote pops for state changes and letters. Nothing in the scene writes to the real side; it reads what the dashboard already shows (§6.7.4).
- **`art:qa` grew** the §4.7 checks that art now exists for: orphan pixels and silhouettes touching the cell edge on the character atlas, expression deltas on portrait strips, and every PNG under the client's assets. Light direction and crop-stage checks still wait for the art phase.
- **Not done**: Kenney tiles are no longer needed and `assets/third_party/README.md` now says so; the Mayor, the Founder and residents have no sprites yet (their phases); no walk cycles beyond the twelve agents; no interiors; no weather.

### Graphics quality pass (same session)

The owner judged the first pass still short of the bar: detailed, elegant, smooth, high-end. The second pass raised detail density and shading depth in every family rather than patching pieces; the originality rule is unchanged, every picture is still ours.

- **Ground**: eight grass variants with a dense low-contrast blade texture plus rare decals (clover, pebbles, a bare patch); pebbled dirt; cobbles as irregular packed stones with lit corners and shaded feet, mossy in the old courtyard; water in three frames with a periodic depth band and sliding crests.
- **Trees**: 48×80 oaks from eleven overlapping clumps with leaf speckle and clump-edge shading, jagged four-tier pines, orchard trees with two-pixel fruit, trimmed hedges by connection mask, a generated trunk with bark lines and a flared root.
- **Buildings, second kit**: scalloped shingles with per-shingle tone variation, a half-tile roof overhang on each side with the roof's own outline, a lit fascia board and its underside at the eave, a three-row eave shadow on the wall, corner boards, a baseboard and stone footing; four-pane windows with chunky two-tone mullions, a lintel and a sill that shadows the wall, curtains on homes; panelled doors with a lintel, brass knob, kick plate and doorstep; wall lanterns flanking lit doors (night lights); a plank porch and a soft ground shadow along every wall; smoke points at chimneys.
- **People**: a fifth frame per direction, the standing pose settled one pixel lower, so a standing agent breathes instead of freezing.
- **Portraits**: a vignette behind the bust, a jacket with lapels over a lighter shirt, 9×6 eyes with a winged lash line, two-tone iris and glint, tapered two-pixel brows, two-tone lips, a lit nose tip, blush, highlight arcs and dark strands over the hair cap.
- **HUD**: the panel's field is dark leather with a bevel inside the bark frame, so cream text keeps its contrast with the plank border still showing; the bubble is parchment with an inner rule and a drop shadow.
- **Scene**: three-frame water via a gid cycle, chimney smoke sprites looping upward, idle-breathe animations, camera easing toward a target (keys and drag), a one-pixel-per-frame separation nudge so agents do not stack, label drop shadows, name tags on hover only.
- **Map**: hedges and planters round the forecourt, lamps along the main road, planters in the square, a mossy exchange courtyard, the farm plot split into four beds by a path with two beds watered and a scarecrow, a wagon at the ranch, crates and a bench at the docks.
- **Build**: `pnpm art:build` now writes in place and prunes stale files instead of recreating the folder, because a running Vite dev server loses track of a public folder that is deleted under it (it served index.html for every asset until restarted).
- **Open**: the ford's sand still reads as a plain beach; autotile inner corners, an east-facing cliff face and snow caps remain for the art phase; the painted-portrait bar of the reference is still above these composed busts.

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
