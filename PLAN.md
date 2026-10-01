# PLAN — Agent Town, Phase 0 → Phase 4

Written by the Phase 0 session (`docs/spec/phases/phase-0.prompt.md`, BUILD item 1). Acceptance criterion one of Phase 0 is "I approve the plan": nothing below is settled until you do.

## 1. What exists after Phase 0

- A pnpm monorepo with the PROMPT.md §3 layout: `apps/town-client` (Phaser 4.2 + React 19 + Vite), `apps/town-server` (Node 22 + Fastify 5), `packages/schema`, `adapter-sdk`, `sim`, `game-data`, `game-core`, `save-migrations`.
- `pnpm dev` boots the Town Server on 3001 and the client on 3000. The client shows the Year 1 placeholder map (PROMPT.md §7.5 zones, generated flat-colour tiles) at an integer zoom and the sim's 12 agents in a plain DOM list fed over SSE. No sprites, no Mayor, no events persisted.
- `packages/sim` is a seeded mock fleet of the 12 roles emitting every §5.3 agent event type on a virtual clock, with heartbeats every 15 s. Its fixtures are committed Character Card V2 files under `packages/sim/fixtures/`.
- Every check runs: `pnpm test` (64 tests), `test:e2e`, `lint`, `typecheck`, `format:check`, `data:lint`, `art:qa`, `depcruise`, `sim`, `sim:year` (stub), `sim:vault` (stub).

## 2. Integration with your agent repo

No agent repo exists in this workspace, so the plan below is written against the §5 contracts alone and must be checked against the real code once you point at it (**open question 1**). The rule is adapters, never rewrites: nothing in your agents changes except that each one gains a thin emitter.

| Integration point | Where it lives | What your side provides |
| --- | --- | --- |
| Manifest | one `*.card.json` per agent in `agents/` (git-ignored, never read by Claude Code) | the Card V2 fields in PROMPT.md §5.1–§5.2; `packages/schema/json/card-v2.schema.json` validates it |
| Events | `POST /api/agents/:id/events` (Phase 1) | signed envelopes from `packages/adapter-sdk` (`createEvent`, ~10 lines) or an A2A SSE stream |
| Heartbeats | the gateway (Phase 1) | one `heartbeat` every 15 s; offline after 3 missed |
| Permissions | `permission_request` → Mayor policy (Phase 2) → `permission_decision` back over `/control` | the sensitive-tool wrapper calls `interrupt()` and resumes on the decision (§3.4, LangGraph) |
| Secrets | `auth: bearer:env:NAME` in the manifest | the token in your environment, never in a file the game reads |
| Daily summary | `report` event with `period: daily` | realized P&L **as text in the summary**; the bridge reads the structured `metrics` only when `bridge.rate > 0` (Phase 5), and `pnpm dev` keeps it at 0 |

## 3. The 12 agents mapped to the Trading Firm

The sim's roster, also the proposed mapping for the real roster. Ids follow the §5.2 pattern `<role>-01`; names, lines and catchphrases are original and live in `packages/sim/src/roles.ts`.

| Department | Callsign | Sim id | Sim name | Trades? | Mints Marks from |
| --- | --- | --- | --- | --- | --- |
| Front office | PM | `portfolio-manager-01` | Dalia Marchbanks | sign-off only | dividend (shared) |
| Front office | QUANT | `quant-researcher-01` | Teodor Vask | no | task credits |
| Front office | ANL-FUND | `fundamentals-analyst-01` | Imani Rhodes | no | task credits |
| Front office | ANL-NEWS | `news-analyst-01` | Casper Nyberg | no | task credits |
| Front office | ANL-TECH | `technical-analyst-01` | Yuki Haldane | no | task credits |
| Front office | TRADER | `stock-trader-01` | Rex Tickerly (§5.2 example) | yes | dividend |
| Middle office | RISK | `risk-manager-01` | Ingrid Solvay | no | task credits |
| Middle office | COMPLY | `compliance-officer-01` | Thaddeus Okoro | no | task credits |
| Middle office | DATA | `data-engineer-01` | Amara Desai | no | task credits |
| Back office | ENG | `software-engineer-01` | Benedikt Hale | no | task credits |
| Back office | OPS | `operations-clerk-01` | Rosa Delacroix | no | task credits |
| Back office | ACCT | `accountant-01` | Harold Pembury | no | task credits |

If your real roster differs (two traders, no data engineer, a second compliance seat), the sim roles are the template: one entry in `roles.ts` per real agent, `pnpm sim:fixtures`, and the tests cover the new role automatically.

## 4. Gaps

1. **No agent repo in the workspace.** Section 2 is unverified against real code.
2. **Kenney Tiny Town is not downloaded.** The container had no download access, so the placeholder map uses a generated 16-tile set recorded in `art/provenance.json`; `assets/third_party/README.md` has the three-step swap.
3. **Persistence is in memory.** Drizzle + SQLite are deferred until Phase 1 needs an event store; the save envelope (`packages/save-migrations` v1) exists so the schema has a home.
4. **`sim:year` and `sim:vault` are stubs** printing the §10 and RPG.md §11 table shapes; the economy lands in Phase 6, the Vault in Phase 10.
5. **Ember Vine.** The §10 ₥/day column for Ember Vine (19.6) does not follow the formula every other crop follows (`packages/game-core/test/economy.test.ts` pins the discrepancy). A designer call for Phase 6.
6. **The §10 crop table is structurally close to the reference game's.** The guardrail audit noted that several rows (seed, sell, days, regrow) line up with that game's crop table one for one under original names. The working agreement allows structure and forbids names, text, art and music, so this is yours to judge; no number was changed. If you want distance, the Phase 6 designer session retunes the table against the §10 income targets.
7. **`apps/town-server/gateway/` and `mayor/policy/`** are not created: both are deny-listed for edits in game sessions, so their own phase sessions create them with your go-ahead.

## 5. Order of work, Phases 1–4

1. **Phase 1 — MVP town** (`phase/1-mvp-town`). Gateway: `POST /api/agents/:id/events` with signature and nonce checks, heartbeat tracking, the registry's file watcher on `agents/`; event store (Drizzle, SQLite); the Trading Firm interior with one desk per agent, 16×32 placeholder sprites, status badges and comment bubbles; the dashboard card. DONE WHEN a card dropped into `agents/` appears at a desk within a few seconds.
2. **Phase 2 — Live updates and the Mayor** (`phase/2-mayor`). `mayor/policy/`: the deterministic risk score (§6.2), hard limits (§6.3), kill switches (§6.4); the permission inbox with no game reward; the hash-chained audit log (§6.5); `mayor/assistant/` briefings read-only. Playwright: a request arrives, the decision reaches the sim agent over `/control`.
3. **Phase 3 — Evolving town** (`phase/3-evolution`). `evolution/`: Town Level from `config/evolution.yaml`, building tiers, weather for losing weeks (never demolition), the construction animation for a new agent, the time-lapse replay. Tested on recorded sim histories.
4. **Phase 4 — Midjourney assets** (`phase/4-art`). `pnpm art:process`, prompt packs from the cards, the full §4.7 `art:qa` (orphan pixels, silhouettes, light direction, portrait diffs), the first real atlases replacing the generated placeholders.

## 6. Open questions for you

1. Does your agent repo exist, and where? Should this repo add it as a workspace package, a git submodule, or only talk to it over HTTP?
2. Fastify was chosen over Hono (reason in `DECISIONS.md`). Keep it?
3. Ports 3000 (client) and 3001 (server) are reserved. Keep them?
4. Is the department mapping in §3 right for your real roster?
5. Keep the §10 crop numbers as they are, or retune them away from the reference game's table in Phase 6?
