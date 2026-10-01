# Verify

One section per phase: every acceptance criterion quoted verbatim, the tests that cover it, and the click-by-click steps a person walks with the app open (PROMPT.md §17 definition of done). `/phase-report` fills a section when a phase's last criterion goes green; a phase is not done until its section has been walked by hand, with the date.

## Phase 0 — Discover and scaffold (no product code)

Criteria from `docs/spec/phases/phase-0.md`. Walked by the session on 2026-10-01 in the cloud container (Chromium 1440×900); not yet walked by hand by the owner.

### "I approve the plan"

- Covered by: nothing automated. Read `PLAN.md`; answer its §6 questions; edit `DECISIONS.md` where a default is wrong.
- Status: **open** until you say so.

### "`pnpm dev` shows the placeholder town"

- Covered by: `e2e/town.spec.ts` (Playwright), `apps/town-client/test/zoom.test.ts`, `apps/town-server/test/app.test.ts`.
- Steps:
  1. `pnpm install`, then `pnpm dev`. Expect the server line `town-server: http://127.0.0.1:3001/api/health · 12 sim agents · bridge rate 0` and Vite on `http://localhost:3000/`.
  2. Open `http://localhost:3000/`. The header reads `Tallyford · Year 1 · Spring 1 · <time> · town awake` (or `night watch` between 02:00 and 06:00) and `stream live` on the right.
  3. The canvas shows grass, a dirt road, the cobbled Town Square with four buildings, and zone labels (`Town Square`, `The Old Exchange`, `The Ford and Docks`); arrow keys pan the camera across the 96×64 map. Right-click → Inspect the canvas: it is 480×270 with a CSS size that is a whole multiple (2× at 1440×900, 3× at 1920×1080) and `image-rendering: pixelated`.
  4. The right panel lists 12 desks grouped Front, Middle, Back Office, each with callsign, name, `working`/`waiting`/`idle` and the newest event line; within a minute every agent has shown a comment in quotes, a progress percentage and a `report (hourly): …` line.
  5. `curl -s localhost:3001/api/health` → `{"ok":true,"phase":0,"agents":12,"bridge_rate":0,"fleet":"sim"}`; `curl -N localhost:3001/api/stream | head -c 600` shows `event: clock`, `event: agents` then `event: agent_event` frames.
  6. `pnpm test:e2e` passes and writes `screens/phase-0-town.png`.

### "every check runs (even if trivially green)"

- Covered by: the commands themselves; `scripts/depcruise-wall.test.ts` proves the wall rule fires.
- Steps, each exits 0:
  1. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.
  2. `pnpm test` → 11 files, 64 tests (sim emits every event type for every role in 60 s; heartbeats at 0/15/30/45 s; envelope sign/verify; §10 crop table; clock seasons; save migrations; API; zoom; dependency wall).
  3. `pnpm data:lint` → `4 file(s) valid` (crops, time, bridge.yaml, evolution.yaml).
  4. `pnpm art:qa` → `1 image(s) on grid, in palette, with provenance`.
  5. `pnpm depcruise` → `no dependency violations found`. To see it fail by hand: add `import '../gateway/x.ts'` to `apps/town-server/game/world-clock.ts` with an empty `apps/town-server/gateway/x.ts`, run again, expect `game-never-imports-gateway-or-mayor-policy`, remove both.
  6. `pnpm sim` → JSON lines on stdout, `sim: 106 events from 12 agents over 30s (seed 42)` on stderr. `pnpm sim -- --seconds 60 --seed 7` changes both.
  7. `pnpm sim:year` → the §10 income table shape with `(not simulated yet)` and `sim/last-run.log`; `pnpm sim:vault` → the RPG.md §11 wing table shape.
  8. `scripts/banned-words.sh packages/game-data art apps/town-client/src packages/sim/src` → no output, exit 0.
- Pending for later phases (listed so the stub is honest): `art:qa` orphan-pixel, silhouette, light-direction, crop-stage and portrait-diff rules (Phase 4); `sim:year` real run (Phase 6); `sim:vault` real run (Phase 10).

## Phase 1 — MVP town

_No criteria verified yet._

## Phase 2 — Live updates and the Mayor

_No criteria verified yet._

## Phase 3 — Evolving town

_No criteria verified yet._

## Phase 4 — Midjourney assets

_No criteria verified yet._

## Phase 5 — World and Founder

_No criteria verified yet._

## Phase 6 — Farm and economy

_No criteria verified yet._

## Phase 7 — Life and story (four sessions: cast and hearts; charter and festivals; the Vault; the pipeline)

_No criteria verified yet._

## Phase 8 — Mini-games

_No criteria verified yet._

## Phase 9 — Audio, audit and polish

_No criteria verified yet._

## Phase 10 — Combat core and the first two wings

_No criteria verified yet._

## Phase 11 — Magic, gear, companions, fishing

_No criteria verified yet._

## Phase 12 — Treasury, Undercount, the Receiver and the Deep Stacks

_No criteria verified yet._
