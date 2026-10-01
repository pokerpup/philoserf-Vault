# Verify

One section per phase: every acceptance criterion quoted verbatim, the tests that cover it, and the click-by-click steps a person walks with the app open (PROMPT.md §17 definition of done). `/phase-report` fills a section when a phase's last criterion goes green; a phase is not done until its section has been walked by hand, with the date.

## Phase 0 — Discover and scaffold (no product code)

Criteria from `docs/spec/phases/phase-0.md`. Walked by the session on 2026-10-01 in the cloud container (Chromium 1440×900 and 1920×1080); the owner approved the plan the same day. The hand walk below is still yours to do on your own machine.

### 1. "I approve the plan"

- Covered by: nothing automated. `PLAN.md` was read and approved by the owner on 2026-10-01 ("approve and run"); the §6 defaults stand, and question 5 (the crop table) carries to Phase 6.
- Status: **done**.

### 2. "`pnpm dev` shows the placeholder town"

- Covered by: `e2e/town.spec.ts` (Playwright), `apps/town-client/test/zoom.test.ts`, `apps/town-server/test/app.test.ts`.
- Steps:
  1. `pnpm install`, then `pnpm dev`. Expect the server line `town-server: http://127.0.0.1:3001/api/health · 12 sim agents · bridge rate 0` and Vite on `http://localhost:3000/`.
  2. Open `http://localhost:3000/`. The header reads `Tallyford · Year 1 · Spring 1 · <time> · town awake` (or `night watch` between 02:00 and 06:00) and `stream live` on the right.
  3. The canvas shows grass, a dirt road, the cobbled Town Square with four buildings, and zone labels (`Town Square`, `The Old Exchange`, `The Ford and Docks`); arrow keys pan the camera across the 96×64 map. Right-click → Inspect the canvas: it is 480×270 with a CSS size that is a whole multiple (2× at 1440×900, 3× at 1920×1080) and `image-rendering: pixelated`.
  4. The right panel lists 12 desks grouped Front, Middle, Back Office, each with callsign, name, `working`/`waiting`/`idle` and the newest event line; within a minute every agent has shown a comment in quotes, a progress percentage and a `report (hourly): …` line.
  5. `curl -s localhost:3001/api/health` → `{"ok":true,"phase":0,"agents":12,"bridge_rate":0,"fleet":"sim"}`; `curl -N localhost:3001/api/stream | head -c 600` shows `event: clock`, `event: agents` then `event: agent_event` frames.
  6. `pnpm test:e2e` passes and writes `screens/phase-0-town.png`.

### 3. "every check runs (even if trivially green)"

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

### Graphics (added after the approval, same session)

- Covered by: `art/pixel/test/art.test.ts` (palette, map layers and spawns, water frames, building kit, sprite padding and mirroring, portrait deltas, font), `e2e/town.spec.ts` (12 sprites on the map, pixelated portraits), `pnpm art:qa`.
- Steps:
  1. `pnpm art:build` → `art:build — 493 tiles, 12 people, 28 files …`; `pnpm art:qa` → `sheets clean`.
  2. `pnpm art:preview map 1` and open `screens/preview/map.png`: Firm Hill with the brick Trading Firm, cobbled forecourt and five fenced lots; the square with Town Hall, the Counting House, the store and the clinic around the well; the six charter halls around the Vault arch; the cottage, Ledger Bin, well and tilled plot; the ranch with barn, coop and Wren's cottage; the windmill lot; the fishing hut, two piers, the ferry, the ford, lantern posts; the orchard on the Far Bank; the broken bridge; cliffs and stairs below the Highlands.
  3. `pnpm dev`, open the town: the camera starts on the forecourt; twelve people in different hair, clothes and accessories stroll it, with callsign tags; within a minute speech bubbles appear with comments and emote pops (?, !, zzz, letter, heart, gear) on state changes. Arrow keys, WASD or dragging pan the camera.
  4. Water at the river shimmers (two frames); the panel on the right shows a portrait per agent whose expression follows the state (surprised when waiting, sad when in error); the header and the panel are wood with brass corners.
  5. Between 18:00 and 07:00 local time the town darkens blue-violet and windows, lamps and lanterns glow; 09:30–16:00 New York time on a weekday the firm's windows glow in daylight.
  6. The season follows the clock: `tiles-spring/summer/fall/winter.png` are the same sheet recoloured; a save created today shows spring.

### Open

- Nothing blocks the merge. Carried forward: `PLAN.md` §6 question 1 (where the agent repo lives; Phase 1 needs it to wire a real adapter) and question 5 (retune the §10 crop table or not; Phase 6). The Ember Vine row of §10 does not follow the formula the other 21 crops follow (`packages/game-core/test/economy.test.ts` pins it; Phase 6). The guardrail audit's two findings were fixed before the push.
- Screens (`screens/` is git-ignored): `pnpm test:e2e` writes `screens/phase-0-town.png` (1440×900, 2×). The session also captured a 1920×1080 shot at 3× after a minute of fleet events, with every desk showing a comment line; it was sent in the session chat.

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
