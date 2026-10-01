# Agent Town — Master Build Prompt (v2, ready to code)

This is the finished prompt: it merges the original §1–§11 prompt, the game-layer addendum and the Claude Code operating rules into one file. Export this tab as Markdown, save it as `docs/spec/PROMPT.md` in an empty repo, run `claude` there, and say: *"Read docs/spec/PROMPT.md and do Session 0."* Nothing else needs pasting.

## 0. Role, mission and working rules

You are a senior full-stack game and UI engineer working in Claude Code. Build **Agent Town**: a web app where all of my AI agents live in one shared, Stardew Valley–style pixel-art town called **Tallyford**, each with its own persona, all reporting to a **Mayor** who is my safety and risk manager and assistant — and, around that live dashboard, a cozy farm-and-town game (farming, fishing, neighbours, a story, mini-games) whose economy grows only from the agents' real work. The agents themselves are built separately by me; you build the town, the Mayor, the agent-connection layer, the game layer and the art pipeline.

My original words, which remain the source of truth for the dashboard: *"make a prompt to create a UI for multiple AI agents for different profitable tasks to live in that I am creating separately. I want all these agents to live in the same town UI, each with their own persona, and report to the mayor. i want the UI to look like Stardew Valley and evolve as the economy grows and more ai agents get added. i want the UI to show me updates on each agent, as well as run permissions through the mayor, who acts as a safety and risk manager and assistant use my Midjourney account that is opened in my browser to create the town and character portraits for the UI. I want this to be able to plug and play with each agent just by adding agent details such as stock trader, risk-moderate intelligence model handling 30% of stake persona, smart, cocky but relatable, and always has a smart comment to make."*

**Working rules (binding for every session):**

1. **Session 0 first.** Before any product code, create the repo scaffolding in §18 from this file (CLAUDE.md, `.claude/settings.json`, the subagents, the skills, `docs/GUARDRAILS.md`, the per-phase files), show me the tree, and stop. I restart the session so the scaffolding loads.
2. **Explore, then integrate.** If a repo for my agent system exists, read it and integrate through adapters, never rewrites. Summarise what you found and your plan, then wait for my OK.
3. **One phase per session, plan first.** Enter plan mode; produce a plan that quotes every acceptance criterion of the phase verbatim, names the failing test you will write first for each, lists files by package, and asks your questions instead of guessing. Edit nothing until I approve.
4. **Tests before features, one criterion at a time.** Run `pnpm test`, `pnpm data:lint` and `pnpm depcruise` after each criterion; commit per criterion with the criterion number. If a check fails twice, stop and report; never loosen a check.
5. **Never touch money while building.** No real trades, transfers or paid external calls. Use `packages/sim` and `bridge.rate: 0`. Real agents are wired only in a dashboard phase I explicitly enable, never in a game-layer phase.
6. **Ask only when it is irreversible or needs credentials.** Otherwise pick sensible defaults and record them in `DECISIONS.md`. Always ask before: changing any number in a §10 table, adding a dependency, touching `apps/town-server/gateway` or `mayor/policy`, anything that moves money.
7. **Placeholders first.** Kenney CC0 tiles and layer-composed portraits until the art pipeline delivers; never block a phase on art.
8. **Original everything.** Stardew Valley is the structural reference only. Never copy, trace, imitate or name its sprites, tiles, fonts, portraits, characters, text, music or logos; the word "Stardew" never appears in the product.

**Five design pillars (when two rules conflict, the earlier pillar wins):**

1. **The firm is the engine, the game is the lens.** Only real agent results (P&L, completed tasks) grow the town's economy and level. The game adds a life the player enjoys on a flat trading day.
2. **The bridge runs one way.** Real → game only. Nothing in the game touches real money, stake, limits, permissions, models or the Mayor's policy engine. Hearts, skills, quests and prizes unlock cosmetics, lore and information — never autonomy. Approving or rejecting a permission request earns nothing in the game.
3. **Cozy first.** No death, no punishing fail states, no timers that can be missed forever. A losing week is rain over the firm, not a game over.
4. **Every person in town is one card.** Player, residents, NPCs, the Mayor and live agents all use Character Card V2 JSON. A resident the player created becomes a real agent without rewriting anything.
5. **The Mayor is code, not a character.** Policy enforcement is deterministic; an LLM only explains decisions and writes summaries.

## 1. Context

1. I am building a multi-agent AI trading firm with Claude Code. It has 12 agents: front office (traders, quantitative researchers, financial analysts, portfolio managers), middle office (risk managers, compliance officers, data engineers), back office (software engineers, operations and settlements clerks, accounting and finance).
2. The Trading Firm is the first building in town, on Firm Hill, with its three departments as rooms. Each later profitable-task business becomes a new building on a new lot.
3. Agents are visibly working at desks, and messages visibly travel between them (paper-plane or letter sprites along paths, speech bubbles). The old dark "mission control" look is replaced by the cozy pixel-art look.
4. Everything runs online first; later some agents run local models on other computers. The UI reaches agents only over a network protocol (HTTP + SSE/WebSocket), never in-process. Every agent is a remote service with its own URL and credentials.
5. My personas are SillyTavern Character Card V2 JSON. Agent, NPC, resident and Mayor definitions all use that format (§5).
6. The player of the game layer is me, as "the Founder", checking in on the town once a day; the game runs on the real clock (§7), not a compressed day.

## 2. Product requirements (all must be met)

**Dashboard (the firm):**

1. One shared town, top-down 3/4 pixel art in a warm cozy style with seasons, weather and a day/night cycle. Style reference only; 100% original assets.
2. Each agent has a persona (name, look, voice, catchphrases), a portrait with expressions, a walking sprite, a desk, and a status card.
3. All agents report to the Mayor: a visible reporting line in the org view, scheduled reports flowing to Town Hall.
4. The town evolves as the economy grows and as agents are added (§7).
5. Live updates per agent: status, current task, latest comment, progress, metrics (P&L or revenue), errors, permission requests.
6. Every agent action with side effects goes through the Mayor (§6). Nothing bypasses it.
7. Plug-and-play: one manifest file (or the Add-Agent form) creates the agent's desk or building, portrait slot, sprite, status card, reporting line, permissions profile and event subscription with no code change.
8. Town and portraits are generated with my Midjourney account through the pipeline in §14, with placeholders until the art exists.

**Game layer (Tallyford):**

1. A Founder's Cottage and farm plot, farming cycles, fishing, foraging, the Vault Below, animals and artisan machines, an inventory, shops, the Ledger Bin — the Stardew-shaped loop tuned to one real day per game day (§10).
2. Sixteen original NPCs with schedules, Trust hearts, gifts, heart events and personal quests; a three-act story with two endings; eight festivals; nine mini-games (§11–§12).
3. A Character Creator that produces a V2 card, and the Resident → Employee → Agent pipeline that turns a created character into a real agent through the same Mayor validation as a dropped-in manifest (§8).
4. An in-game currency, Marks, minted partly from the agents' real results through a one-way bridge, spent only on in-game things (§7).
5. A Town Charter (six halls of the Old Exchange) versus a Meridian Holdings buyout as the long-term goal, and a Founder's Audit at Year 3 that scores stewardship alongside wealth (§10).
6. Original music and sound with adaptive layering tied to Town Level (§13).

## 3. Architecture and stack

Monorepo (pnpm workspaces), TypeScript strict everywhere, Zod at every boundary, ESLint + Prettier, Vitest, Playwright.

```text
apps/town-client        Phaser 4 (4.2.x) + React 19 + Vite + TS, from phaserjs/template-react-ts
  src/scenes/           Boot, Town, Interior, Farm layer, Fishing, Vault, Arcade, Festival
  src/game/             game-layer client code (walled off from dashboard control, see §6.7)
  src/panels/           React HUD: cards, inbox, feeds, forms, Creator, Journal, Charter, Shop
apps/town-server        Node 22 + Fastify (or Hono) + Zod + Drizzle (SQLite dev, Postgres hosted)
  gateway/              A2A client, webhook adapter, heartbeats, per-agent auth
  mayor/policy/         deterministic policy engine (no LLM inside)
  mayor/assistant/      briefings, Ask the Mayor, newsletter (LLM allowed, read-only)
  registry/             manifest registry, file watcher, Welcome Wagon validation
  events/               event store, SSE (/api/stream), WebSocket fallback
  audit/                hash-chained audit log, JSONL export
  evolution/            Town Level, tiers, weather (from real metrics)
  game/                 WorldClock, DayTick, Farm, Inventory, Economy, Schedules, Dialogue, Quests, Events, Residents, Bridge (read-only)
packages/schema         Zod schemas + generated JSON Schema for manifests and events
packages/adapter-sdk    TS and Python helpers: emit events, request permission, in ~10 lines
packages/sim            mock fleet for all 12 roles + NPC/resident behaviours; fixtures
packages/game-data      every table and content file (§9 inventory), JSON Schema per file
packages/game-core      pure rules, no I/O, 100% unit-tested
packages/save-migrations forward-only save migrations + historical fixtures
agents/                 real cards (git-ignored, never read by Claude Code)
art/                    batches, inbox, raw (git-ignored), palette.gpl, processed atlases
config/                 mayor.policy.yaml, evolution.yaml, bridge.yaml
docs/                   spec, GUARDRAILS.md, phases/, DECISIONS.md, VERIFY.md
```

1. **Client.** Phaser renders the town; React renders panels. Use the template's EventBus for the React↔Phaser bridge, Zustand for client state, TanStack Query for REST. Maps are authored in Tiled (JSON export, embedded tilesets); the evolution engine swaps layers and objects at runtime.
2. **Server.** Modules above. Persistence via Drizzle with one schema for SQLite and Postgres. Streams to the client over SSE with a WebSocket fallback.
3. **Agent protocol (A2A v1.0 conventions).** Each agent exposes, or is wrapped by an adapter that exposes, an Agent Card at `/.well-known/agent-card.json`, JSON-RPC 2.0 over HTTPS, and an SSE stream for task and status events. Task states: submitted, working, input\_required, auth\_required, completed, failed, canceled, rejected. Agents that cannot speak A2A use the webhook contract in §5.4. The gateway handles retries, heartbeats (offline after 3 missed 15-second heartbeats) and per-agent auth (bearer token or mTLS).
4. **Human-in-the-loop.** The Mayor is a standalone service that works with any agent framework. For LangGraph agents, document how the sensitive-tool wrapper calls `interrupt()` and resumes with `Command(resume=decision)` when the decision arrives through the gateway.
5. **The dependency wall.** `apps/town-server/game/**`, `packages/game-*/**` and `apps/town-client/src/game/**` have no import path to `gateway/**` or `mayor/policy/**`. A dependency-cruiser rule (`pnpm depcruise`) fails CI and the PostToolUse hook if one appears. Game code reads the event store and audit log through the Bridge module only, and never writes to them.
6. **Two clocks, one server.** `WorldClock` (real local time, seasons, day index) is the only time source for both the dashboard and the game; `DayTick` at 00:00 local is the only place game state advances without the player (§7, §9).

## 4. Rendering rules and art bible essentials

1. Base tile 16×16; internal resolution 480×270 (16:9) scaled by integer factors only (2×, 3×, 4×), letterboxed. Never fractional zoom on the town layer.
2. Phaser config `render: { pixelArt: true }` (no antialias, roundPixels on), camera `roundPixels = true`, `Scale.FIT` with an integer-zoom override, nearest-neighbour filtering on every texture; CSS `image-rendering: pixelated` on the canvas and every sprite or portrait image, shown at integer multiples.
3. Characters are 16×32 (two tiles tall); portraits 64×64 with six expressions (neutral, happy, sad, annoyed, surprised, smug); one shared 48-colour warm palette in `art/palette.gpl` (portraits use a 32-colour subset each); 1-px selective dark outlines; light from the upper left; seasons are palette swaps plus a few replacement tiles; night is one blue-violet overlay at 55% plus warm light masks.
4. Creator layers (body ×6 skin ramps, hair ×24, eyes ×8, top ×16, bottom ×10, shoes ×6, accessory ×14) share one 16×32 frame grid and a feet anchor, drawn in a neutral ramp that a Phaser 4 palette-swap pipeline recolours at runtime, so a new resident needs no new sheet. Animation sets: walk 4×4 dir, idle 2, sit/work 2 + type-burst, tool swings 4×4 dir (hoe, can, axe, pick, rod), carry 4, emote pops (heart, !, ?, zzz, gear, letter), rest 2; agents add phone, eureka, stretch; the Mayor adds stamp, bell, glasses.
5. UI is wood-panel with brass corners and 3-slice frames; a 5×7 pixel font for HUD numbers; a licensed pixel font (OFL or CC0, licence stored) for body text at 2× minimum; a readable non-pixel font toggle.
6. Placeholders until the pipeline delivers: Kenney Tiny Town and Tiny series (CC0), licences stored in `assets/third_party`. Every asset carries provenance (source, prompt, date, licence).
7. `pnpm art:qa` fails on off-grid pixels, colours outside the palette, orphan pixels, silhouettes touching the frame, inconsistent light direction, identical crop stages, portrait expressions under 12 pixels different from neutral, or missing provenance.

## 5. Data contracts

### 5.1 The manifest

One file per agent in `agents/<agent-id>.card.json`, hot-reloaded by a watcher and also creatable from the Welcome Wagon form. It is a valid SillyTavern Character Card V2 (`spec: "chara_card_v2"`, `spec_version: "2.0"`) with all operational fields under `data.extensions.agent_town`. Unknown keys are never destroyed, so the card round-trips through SillyTavern. A plain V2 card with no extension is imported as "persona only" and the wizard asks for the operational fields. Import and export V2 PNG cards (JSON in the PNG `chara` tEXt chunk). NPCs and residents use the same format with `extensions.agent_town.kind` set to `npc` or `resident` and no endpoint.

**Field mapping (V2 → Agent Town):** `name` → display name, nameplate, sprite label · `description` → bio and the Midjourney appearance seed · `personality` → persona traits for the comment generator · `scenario` → role context in the inspector · `first_mes` → greeting bubble on spawn or click · `mes_example` → style examples for comments · `system_prompt` → forwarded to the agent, never altered by the UI · `post_history_instructions`, `alternate_greetings`, `tags`, `creator`, `character_version`, `creator_notes` → stored and shown · `extensions.agent_town` → everything operational.

### 5.2 Worked example: my exact example agent

```json
{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "Rex Tickerly",
    "description": "Stock trader at the Trading Firm, Front Office. Sharp dresser in a mustard vest with rolled sleeves, slicked hair, a headset, and a coffee mug that says 'BUY THE DIP'. Always has three charts open.",
    "personality": "smart, cocky but relatable, and always has a smart comment to make; confident but owns his losses; competitive with the quants; loyal to the Mayor's rules even when he grumbles about them",
    "scenario": "Rex trades US equities for the firm using a risk-moderate strategy and manages 30% of the firm's stake. He reports every trade idea to the Mayor for approval above his limits.",
    "first_mes": "Morning, boss. Markets open in 20 — I've already found two setups and one excuse for the quants. Want the short version or the smug version?",
    "mes_example": "<START>\n{{user}}: How's the book?\n{{char}}: Up 0.8% — which, for the record, is 0.8% more than the quants predicted. Humble? Me? Always.\n<START>\n{{user}}: You took a loss.\n{{char}}: Small one, within limits, stop hit exactly where I planned it. Even my losses are well-organized.",
    "creator_notes": "Example plug-and-play agent.",
    "system_prompt": "",
    "post_history_instructions": "",
    "alternate_greetings": ["Bell's about to ring. Let's make the Mayor proud and the risk desk nervous."],
    "tags": ["trading-firm", "front-office", "trader"],
    "creator": "me",
    "character_version": "1.0",
    "extensions": {
      "agent_town": {
        "schema_version": "1.1",
        "kind": "agent",
        "id": "stock-trader-01",
        "task_role": "stock trader",
        "business": "trading-firm",
        "department": "front-office",
        "reports_to": "mayor",
        "model": { "provider": "anthropic", "name": "<set by agent owner>", "intelligence_tier": "high", "runs_on": "hosted" },
        "risk_profile": "risk-moderate",
        "stake": { "allocation_pct": 30, "hard_cap_pct": 30, "currency": "USD" },
        "limits": {
          "max_position_pct_of_allocation": 10,
          "max_daily_loss_pct_of_allocation": 2,
          "max_drawdown_pct_of_allocation": 8,
          "max_orders_per_hour": 20,
          "cooldown_after_loss_streak": { "losses": 3, "minutes": 60 }
        },
        "permissions": {
          "auto": ["read_market_data", "post_comment", "submit_report"],
          "needs_mayor": ["place_order", "modify_order", "cancel_order"],
          "needs_user": ["increase_allocation", "trade_new_asset_class", "use_leverage", "trade_outside_market_hours"],
          "forbidden": ["withdraw_funds", "change_own_limits", "disable_logging", "contact_external_parties"]
        },
        "reporting": { "heartbeat_sec": 15, "status_report": "hourly", "daily_summary": "16:30 America/New_York" },
        "endpoint": { "protocol": "a2a", "url": "https://agents.example.com/stock-trader-01", "auth": "bearer:env:AGENT_STOCK_TRADER_01_TOKEN" },
        "metrics": [{ "key": "pnl_usd", "label": "P&L", "type": "currency" }, { "key": "win_rate", "label": "Win rate", "type": "percent" }],
        "visual": { "portrait": "assets/portraits/stock-trader-01.png", "sprite": "assets/sprites/stock-trader-01.png", "desk_style": "trading-desk-3-monitors", "palette_accent": "#D9A441", "layers": null },
        "voice": { "comment_style": "smart-quip", "comment_frequency": "on_events_and_every_20_min_max", "catchphrases": ["Even my losses are well-organized.", "The chart doesn't lie. People do."], "tts_voice_id": null },
        "lore": { "origin": null, "joined": null, "skills": {}, "trust_hearts": {}, "quests_done": [], "memories": [] }
      }
    }
  }
}
```

The `lore` block is written by the game when a resident is awakened (§8) and is exposed by the adapter SDK as optional persona context; it never carries an operational value. `visual.layers` holds the Creator's sprite recipe for player-made characters.

### 5.3 Event envelope and types

Agents POST signed JSON events to `POST /api/agents/:id/events` (or stream them over A2A) and expose `POST /control` (pause | resume | stop | decision):

```json
{ "v": 1, "id": "uuid", "agent_id": "...", "ts": "ISO-8601", "nonce": "...", "type": "...", "payload": {}, "sig": "HMAC-SHA256" }
```

Event types (Zod-validated): `heartbeat` · `status {state: idle|working|waiting|blocked|offline|error, task}` · `task_progress {task_id, pct, note}` · `thought_comment {text, tone}` · `metric {key, value, unit}` · `report {period, summary, metrics}` · `permission_request {action, params, est_exposure, rationale, reversible}` · `permission_decision` (Mayor → agent) · `message {to_agent_id, summary}` (drives the flying letters) · `error {code, message, severity}` · `lifecycle {joined|updated|retired}` · `task_complete {task_id, units}` (task agents; mints Marks per §7). The game emits `game_event {kind, subject, summary}` on the same stream so town life shows in the feed; it emits nothing else.

### 5.4 Smart-comment style guide

1. One or two sentences, 25 words or fewer; bubbles wrap at 60 characters per line.
2. Formula: a true observation from the latest event, plus a self-aware twist, plus an optional friendly jab at another department.
3. Cocky but relatable: brag about the process, not the luck; own losses with humour; never belittle me or the Mayor.
4. No trade advice, no invented numbers (quote only numbers in the event), no profanity, no financial advice to me anywhere in the game.
5. Rate-limit per `voice.comment_frequency`; the UI shows only the newest comment and keeps the rest in the agent's feed.
6. Generate comments on the agent side when possible. If an agent sends none, the Town Server may generate a flavour line from `personality` + `mes_example`, tagged `flavor` in a lighter bubble, never mixed with real reports. NPC and resident lines come from `dialogue/*.yaml` and are always flavour.

## 6. The Mayor — safety and risk manager, assistant, and the wall between real and game

The Mayor is a service with a persona. Policy enforcement is deterministic code in `mayor/policy/` with weights in `config/mayor.policy.yaml`; an LLM in `mayor/assistant/` may only explain decisions and write summaries, and never decides whether something is allowed.

### 6.1 Permission flow

Agent proposes → Mayor validates the schema → checks policy → scores risk → decides: **AUTO-APPROVE** (tier 0–1), **QUEUE FOR ME** (tier 2–3; tap-to-approve with approve / approve-with-edits / reject / ask-why), or **BLOCK** (forbidden or over a hard limit). Every step is written to the audit log and the decision is sent back to the agent. Unanswered requests expire after 10 minutes and count as rejected. Agents must not act before they receive `permission_decision`.

### 6.2 Risk score (0–100, deterministic)

| Factor | Weight |
| --- | --- |
| Exposure after the action as % of the agent's allocation | 35 |
| Reversibility | 20 |
| Novelty: first time this action or asset | 15 |
| Recent record: loss streak, error rate, drawdown | 15 |
| Context flags: after hours, high volatility, stale data | 15 |

Tiers: 0–24 auto; 25–49 auto with notification; 50–74 needs my approval; 75+ needs my approval plus a typed confirmation. Forbidden actions and hard-limit breaches are always blocked regardless of score.

### 6.3 Hard limits (enforced before scoring)

1. Total exposure never exceeds `stake.hard_cap_pct` of firm capital (Rex: 30%). The sum of all allocations must be ≤ 100%; onboarding is rejected otherwise.
2. A breached daily loss limit auto-pauses the agent for the rest of the session and alerts me.
3. Loss-streak cool-down and order-rate limits per the manifest.
4. Only I can change limits, from the Mayor's office UI, with typed confirmation. Agents never change their own limits; nothing in the game changes any limit (§6.7).

### 6.4 Kill switches

Per-agent Pause/Stop on every card; per-building "Close shop"; a global **Town Curfew** (the red bell in the Mayor's office, `Ctrl+Shift+K`) that stops every agent, rejects all pending requests and freezes new proposals until I lift it. Kill switches work with the client closed: `pnpm town curfew` from the CLI. `pnpm town drill` runs the weekly test.

### 6.5 Audit log

Append-only table plus JSONL export, hash-chained (each entry stores the previous entry's hash). Records who, what, params, score, rule hits, decision, decider (auto / me), latency, outcome, plus `lifecycle` events (including Awakening and Retire from §8) and art actions. Viewable and filterable in Town Hall Records.

### 6.6 Assistant behaviours

1. Morning briefing at 06:00: overnight events, pending approvals, each agent's plan, risk headroom per agent, the farm's day beside the firm's day.
2. End-of-day summary per agent and per building; the season-end letter compares the firm's real month with the farm's season.
3. "Ask the Mayor": answers questions about the town from the event store and audit log only, citing event IDs.
4. Proactive nudges ("Rex is at 1.8% of his 2% daily loss limit").
5. Weekly town newsletter, in persona, on economic growth and unlocked upgrades.
6. Persona (shipped in `packages/game-data/characters/mayor.card.json`): Beatrix Ashgrove, 58, round spectacles, green waistcoat, pocket watch, a stamp used for punctuation; dry warmth; "Noted." to bad news and "Stamped." to good; jokes about herself, never about a blocked action; cites event IDs like scripture.

### 6.7 The bridge: real → game, one way

1. The game reads the event store and audit log through `game/bridge` and never writes to them; it never sends `control`, `permission_decision` or `lifecycle` events except through the Welcome Wagon path in §8.
2. Game packages have no import path to `gateway/**` or `mayor/policy/**`; `pnpm depcruise` enforces it in CI and in the edit hook.
3. Real metrics gate *eligibility* (a Tier 3 firm building needs Town Level 3); Marks pay for construction. Both are required; neither substitutes.
4. No in-game number is ever shown as a real ticker, price or position; agents' real reports appear in the game only as the same event text the dashboard shows.
5. Trust hearts, XP, quests, festivals, professions and shop purchases never change a limit, tier, allocation, permission or model; nothing rewards approving, rejecting or hurrying a permission decision; no timer, streak or score ever attaches to the inbox.
6. Losses show as weather; the game has no state that punishes a real losing day.

## 7. Town evolution, the world of Tallyford, time and Marks

### 7.1 Evolution from real metrics (`config/evolution.yaml`)

1. **Town Level** = f(cumulative realized P&L or revenue, active agents, 30-day uptime, 30-day task success). Starting thresholds: L1 Hamlet (1 building) · L2 Village (≥ 15 agents or revenue ≥ $10k) · L3 Town (≥ 25 agents and revenue ≥ $50k and uptime ≥ 95%) · L4 Market Town (revenue ≥ $250k and success ≥ 90%) · L5 City (revenue ≥ $1M). These are my starting numbers, not benchmarks; tune them to real capital.
2. Each level unlocks lots, paved roads (dirt → cobble → brick), lamps, the fountain, the market square, festival decorations, and one more music stem (§13).
3. **Building tiers** 1–4 per business from that business's own metrics: Tier 2 needs 30-day positive P\&L; Tier 3 adds a floor or wing; Tier 4 adds a signature decoration. Marks pay the Carpenter for the build once the gate is met.
4. Adding an agent always adds visible change: a new desk in its department, an expanded room when full, and for a new business a construction site that becomes the finished building in about 30 seconds of animation on the next free lot.
5. Downturns never demolish: rain clouds over a building with a negative week, dimmed windows, recovery when metrics recover. Ten losing days in a season only brings Nana O with soup.
6. Evolution is replayable: the same event history renders the same town; include a time-lapse replay.

### 7.2 The town and its story premise

Tallyford is a river town at an old trading ford. Twenty years ago the Ledger Bank collapsed, the Old Exchange closed, and the town shrank. Meridian Holdings wants the empty lots; I, the Founder, arrive with the keys to my late great-aunt Marguerite Tally's cottage and her line, *"Count what matters, and the town will count on you."* The firm on the hill is the honest work that rebuilds the town. Full story in §11.

### 7.3 Time runs on the real clock

1. **Ambient clock** = real local time: day/night, NPC schedules, shop hours and agent positions follow it. The town is awake 06:00–02:00; 02:00–06:00 only lit windows and the night watch move. The firm's windows glow during market hours.
2. **DayTick** at 00:00 local, in one transaction: crop growth, forage and ore respawn, animal produce, luck reroll (`seed = hash(townSeed, dayIndex)`), Noticeboard regeneration, Ledger Bin payout scheduled for 06:00, Trust decay, save snapshot. Missed ticks replay in order on start; a replayed seed renders the same day.
3. **Vigor** refills to max at 06:00: one budget per real day, so a session is a 15–40 minute check-in and the town keeps living.
4. **Seasons** last 28 real days from the save's creation date (Spring 1); four seasons = a 112-day year. `seasons.follow_real_calendar: true` maps them to real seasons instead.
5. **Sim Season** (Phase 9): a sandbox on the mock fleet with a 20-minute compressed day, for testing and session-style play. Real agents never run in it; its saves are marked `sim: true` and never mint bridge Marks.

### 7.4 Marks (₥), the in-game currency (`config/bridge.yaml`)

| Source | Rule | Default cap |
| --- | --- | --- |
| Dividend (real) | At the daily summary, Treasury mints ₥ = clamp(realized P&L in USD × `bridge.rate`, 0, cap). Loss days mint 0 and start rain over the firm | rate 1.0, cap 2,000 ₥/day |
| Task credits (real) | Non-trading agents mint `marks_per_unit` per `task_complete` event from their manifest `metrics` | 500 ₥/agent/day |
| Ledger Bin | Crops, fish, forage, ore and artisan goods sell at 06:00 at base × quality (1 / 1.25 / 1.5 / 2) | none |
| Play | Quests, festivals, mini-games, Market Day | per activity (§10, §12) |

Setting every bridge number to 0 runs the game with no real link at all. Marks buy seeds, tools, buildings, decor and charter progress and nothing outside the game.

### 7.5 The Year 1 map (96×64 tiles, Tiled)

| Zone | Contents | Unlock |
| --- | --- | --- |
| Riverside Plot | Founder's Cottage, 12×12 farmable area (grows to 24×20), Ledger Bin, well | Start |
| Town Square | Town Hall (Mayor's office, Records), Ocampo & Daughter general store, The Counting House tavern (arcade upstairs), clinic | Start |
| Firm Hill | The Trading Firm and 5 empty business lots | Start; lots by Town Level |
| The Old Exchange | Six charter halls, Vault entrance in the cellar | Start; doors open by quest |
| The Ford and Docks | Fishing, Ansel's ferry, Drifting Bazaar berth, Lantern Drift site | Start |
| Okonkwo Ranch | Animals, feed, Wren's cottage | Start |
| The Mill Lot | Contested; becomes Meridian Depot if not bought by Fall 20, Year 1 | 15,000 ₥ |
| Far Bank | Second fishing zone, orchard land | Anglers' Hall reward |
| The Highlands | Overlook, second farm plot, Lantern Fruit tree | Vault of Marks reward |

## 8. The character pipeline: Resident → Employee → Agent

A player-made character starts as a scripted resident, can be hired into a business as a simulated employee, and can be awakened into a real agent by adding a model endpoint — one Character Card V2 file through all three states.

**The Creator ("the Registry", inside Town Hall)** is a six-step React wizard that writes one card and one sprite recipe: (1) Look — layered 16×32 sprite with live four-direction preview, auto-composed 64×64 portrait placeholder; (2) Persona — the V2 fields asked as questions: name and nickname; description in three sentences (who, how they look, one telling habit); five traits and one flaw; scenario; first message; three example exchanges; three catchphrases; voice style (dry, warm, cocky, precise, gentle); (3) Origin — Ledger Clerk (+1 Stewardship, quest *The Missing Column*), Orchard Kid (+1 Farming, *Grandma's Grafts*), River Rat (+1 Fishing, *The Ford at Midnight*), City Analyst (+1 Stewardship, +200 ₥, *Second Opinion*), Vault Runner (+1 Prospecting, *Floor Thirteen*); (4) Home — a cottage lot, first two free, then 4,000 ₥; (5) Work — none, or apprentice at a business; (6) Review — full JSON shown and editable; export PNG card; import an existing SillyTavern card instead.

1. **Resident.** Scripted, no model. Walks a schedule template by origin and job, speaks generated daily lines built from the card's personality and examples (all tagged `flavor`), accepts gifts, gains Trust hearts, does assigned chores for small Marks. The player can "visit as" any resident from the cottage bed.
2. **Employee ("Hire").** Assigned to a business from the Carpenter's desk-placement screen: a desk, a place in the org chart under the Mayor, played by `packages/sim`, shown in grey as **Simulated**. Nothing reaches the gateway.
3. **Agent ("Awaken").** The Welcome Wagon opens pre-filled with the card and asks only for the operational fields (task role, model and endpoint, risk profile, stake or task allocation, limits, permissions). Validation runs §6.3 (allocation total ≤ 100%, every limit set, endpoint reachable, signed Agent Card). The Awakening scene plays (§11), the card is written to `agents/<id>.card.json`, the desk turns live. Promotion costs 0 ₥ and is never gated by play.
4. **Lore continuity.** On promotion the game fills `extensions.agent_town.lore` (origin, joined day, skills, trust hearts, quests done, memories) and the adapter SDK exposes it as optional persona context; the UI never edits `system_prompt`.
5. **Retire.** An agent returns to Resident from its card: endpoint and operational fields removed, lore kept, character goes home; an audit `lifecycle` event with the same typed confirmation as a limit change.
6. **Safety.** Game state never writes an operational field; persona fields cannot contain URLs, tool names or instructions to the Mayor (rejected at validation); schedules, hearts and skills affect nothing beyond `lore`; promotion always passes Mayor validation exactly as a dropped-in manifest does.

## 9. Game systems (programmer)

1. **Movement and interaction.** Tile-locked with 8-direction smoothing at 4 tiles/s (6 on paths); WASD/arrows, touch joystick, click-to-walk; collision from the Tiled `collide` layer plus dynamic blockers; A\* (`easystarjs`) for NPCs and agents, recomputed at most every 500 ms per character; interaction = facing tile + E/Space, hold-to-repeat for watering; depth-sort by feet-y; one `Phaser.GameObjects.Layer` per zone; interiors are Tiled maps in `InteriorScene`.
2. **World clock and day tick.** `WorldClock` publishes `{realTime, dayIndex, season, seasonDay, year, phase}` every 60 s over SSE. `DayTick` per §7.3; every random draw uses the day seed.
3. **Farming cycles.** `FarmTile {x, y, state: untilled|tilled|planted, cropId, stage, daysInStage, watered, fertilizer, quality_seed}`; growth advances at the tick only if watered (sprinklers set it at 06:00); out-of-season crops die at the season change except in the greenhouse; harvest rolls quality from Farming level and fertilizer and resets regrowers; trees, animals and machines use the same daily-state pattern (`Machine {recipeId, insertedAt, readyAt}`).
4. **Inventory and shops.** 36 slots (12 hotbar), stacks to 999, `items.json` definitions, `Container` entities for chests, the Ledger Bin as a container sold at 06:00, `shops.yaml` for stock, prices and restocks. All inventory ops are server calls; the client predicts and reconciles.
5. **NPC schedules.** `schedules/<id>.yaml`: season and weekday keyed `time → {map, x, y, facing, anim}` with condition overrides (`rain`, `festival:<id>`, `hearts>=6`, `quest:<id>:done`, `town_level>=3`). Agents derive schedules from live status: working → desk, waiting → Town Hall bench, idle → tavern or plaza, offline → home, error → clinic. On tab reopen everyone teleports to where the schedule says.
6. **Dialogue, quests, events.** Daily lines in `dialogue/<id>.yaml` with the same condition language and `{{player}}`, `{{season}}`, `{{last_green_week}}` templating; heart events and story scenes in Ink (`inkjs`); quests in `quests/*.yaml` (type, giver, steps, conditions, rewards) with an `observe` step type that completes from a bridge fact; a cutscene DSL with `walk`, `say`, `emote`, `wait`, `camera`, `give`, `fade`. Every gift, talk and quest completion emits `game_event`.
7. **Saves.** Server-authoritative, up to 3 slots. Tables: `player`, `residents`, `farm_tiles`, `containers`, `machines`, `animals`, `npc_state`, `quests`, `charter`, `world`, `achievements`, `arcade_scores`. A `game_actions` journal plus a nightly snapshot; recovery replays the journal; `save_version` with forward-only migrations in `packages/save-migrations` and a fixture test per historical version; `pnpm town export --slot 1` writes one JSON file.
8. **Data file inventory (`packages/game-data`, each with a JSON Schema and `pnpm data:lint`):** `crops.json`, `items.json`, `fish.json`, `forage.json`, `ores.json`, `recipes.json`, `machines.json`, `animals.json`, `tools.json`, `buildings.json`, `shops.yaml`, `charter.yaml`, `festivals.yaml`, `luck.yaml`, `skills.yaml`, `origins.yaml`, `characters/*.card.json`, `schedules/*.yaml`, `dialogue/*.yaml`, `events/*.ink`, `quests/*.yaml`, `music.yaml`, `sfx.yaml`, plus `config/bridge.yaml` and `config/evolution.yaml`.
9. **Performance and tests.** Chunked `DynamicTilemapLayer` (32×32 chunks), one batched sprite per crop tile, throttled pathing, one day/night overlay plus light masks. Tests: `game-core` unit tests for every rule table; a 365-day headless simulation asserting the §10 income targets; a schedule validator (every waypoint reachable, no overlaps); a dialogue linter (unreachable nodes, missing portraits, banned words); save-migration fixtures; the dependency-cruiser rule; Playwright flows for create → hire → awaken and plant → water → harvest → Ledger Bin, with seeded days and screenshots of every scene.

## 10. Game design tables

Every number here is a starting value in `packages/game-data`; the 365-day simulation must hit the income targets at the end of this section before tuning is called done.

**Daily loop (real 06:00–02:00):** 06:00 Vigor refill, Ledger Bin payout, the Morning Ledger sets luck, the Mayor's briefing pins to the Town Crier → chores (water, harvest, feed, collect; 2 Vigor per tile or action) → town (agent updates, the permission inbox with no game reward, talk, gifts, a Noticeboard quest) → one main activity (fish, Vault, Highlands forage, arcade, a Charter Commission step) → evening (tavern meal restores 50 Vigor once a day for 60 ₥, sell in the Ledger Bin, plan tomorrow). **Seasonal loop (28 days):** buy seeds day 1, plant days 1–3, one or two festivals, the Drifting Bazaar every Friday and Sunday, the Mayor's season-end letter. **Yearly loop:** Year 1 learn the town and open the Old Exchange; Year 2 restore or sell the charter; Year 3 Spring 1 the Founder's Audit; then the Deep Stacks, the Town Ledger and Prestige.

**Vigor.** Max 270 (+34 per Lantern Fruit, 7 in the game). Costs: hoe, water, chop, pick 2 each (−0.1 per level of the matching skill); rod cast 8; each Vault floor 6; arcade, festivals, Market Day 0. At 0 the character is *winded*: walk and talk only until 06:00. No pass-out penalty, no lost Marks.

**Skills.** Five skills, levels 1–10, cumulative XP 100 · 300 · 600 · 1,000 · 1,600 · 2,500 · 3,800 · 5,600 · 8,200 · 12,000; a profession at 5 and a specialisation at 10.

| Skill | XP from | Level 5 | Level 10 |
| --- | --- | --- | --- |
| Farming | Harvests, animal produce, machines | Grower (+10% crop value) / Keeper (animal goods +20%) | Distiller (artisan +40%) or Greenhand (crops 10% faster) / Shepherd (produce daily) or Creamery (dairy +30%) |
| Fishing | Catches, treasure | Angler (+25% price) / Tackler (bar 20% larger) | Pelagic (+50% price) or Treasure Hunter (treasure ×2) / Steady Hand (escape 30% slower) or Netter (fish traps) |
| Foraging | Forage, wood, Highlands finds | Gatherer (20% double forage) / Woodsman (+25% wood) | Botanist (forage always gold) or Tracker (forage on minimap) / Lumberjack (hardwood from any tree) or Charcoal (coal from wood) |
| Prospecting | Ore, gems, floors, ledger pages | Miner (+1 ore per node) / Geologist (gems in pairs) | Delver (ladders +15%) or Assayer (ore +25%) / Gemcutter (gems +30%) or Archivist (pages ×2) |
| Stewardship | Reading briefings (10/day), agent quests, onboarding (200), curfew drill (100/week), audit export (25/week), festival stall, Market Day | Clerk (briefing shows each agent's next-24h plan) / Auditor (Records gets filters and charts) | Chancellor (weekly forecast; second Ledger payout at 18:00) or Registrar (chores +50%) / Quartermaster (desk decor −25%) or Curator (office decor unlocks) |

No Stewardship XP is ever granted for approving or rejecting a request; no profession changes a limit, tier or permission.

**Crops** (Ledger Bin base price; ₥/day = profit per tile over one 28-day season with replanting; quality ×1 / ×1.25 / ×1.5 / ×2; winter has no outdoor crops):

| Season | Crop | Seed ₥ | Sell ₥ | Days | Regrow | ₥/day |
| --- | --- | --- | --- | --- | --- | --- |
| Spring | Radish | 18 | 32 | 4 | — | 3.5 |
| Spring | Garlic | 40 | 60 | 4 | — | 5.0 |
| Spring | Leek | 60 | 105 | 6 | — | 7.5 |
| Spring | Cabbage | 75 | 160 | 11 | — | 7.7 |
| Spring | Snap Pea | 55 | 45 | 9 | 3 | 9.3 |
| Spring | Cloudberry (Seed Fair only) | 100 | 115 | 8 | 4 | 17.0 |
| Spring | Ruby Chard (Bazaar only) | 110 | 260 | 12 | — | 12.5 |
| Summer | Chili | 40 | 42 | 5 | 3 | 10.6 |
| Summer | Tomatillo | 55 | 65 | 10 | 4 | 9.6 |
| Summer | Honeydew | 85 | 240 | 12 | — | 12.9 |
| Summer | Bilberry (3 per harvest) | 80 | 55 | 12 | 4 | 20.7 |
| Summer–Fall | Sweetcorn | 140 | 55 | 13 | 4 | 8.3 |
| Summer–Fall | Sunflower (seeds by-product) | 30 | 80 | 8 | — | 6.3 |
| Summer | Sunfruit (Bazaar only) | 380 | 720 | 13 | — | 26.2 |
| Fall | Aubergine | 22 | 62 | 5 | 5 | 10.3 |
| Fall | Fennel | 45 | 120 | 8 | — | 9.4 |
| Fall | Sweet Potato | 60 | 150 | 9 | — | 10.0 |
| Fall | Grape | 65 | 85 | 10 | 3 | 15.9 |
| Fall | Pumpkin | 95 | 300 | 13 | — | 15.8 |
| Fall | Bog Cranberry (2 per harvest) | 230 | 80 | 7 | 5 | 20.4 |
| Winter / greenhouse | Frostroot (Bazaar only) | 90 | 210 | 10 | — | 12.0 |
| Greenhouse | Ember Vine (Vault reward) | 600 | 550 | 28 | 7 | 19.6 |

**Animals and artisan goods.** Hen 400 ₥ (Coop; egg 50/day) · Cow 1,500 ₥ (Barn; milk 125/day) · Goat 2,000 ₥ (Barn; goat milk 225 every 2 days) · Sheep 4,000 ₥ (Big Barn; wool 340 every 3 days) · Keg: fruit → wine 3× base in 7 days, vegetable → juice 2.25× in 4 days · Preserves Crock: jam or pickles 2× base + 50 in 3 days · Cheese Press: cheese 230 ₥ (goat 400) in 4 hours · Oil Press: oil 100 ₥ in 6 hours · Loom: cloth 470 ₥ in 4 hours · Bee Hut: honey 100 ₥ (+50 with flowers) in 4 days.

**Fish and ore.** Thirty fish across the Ford, Far Bank, Highlands lake and Vault pool keyed to season, weather and time, difficulty 15–100, 30–400 ₥ (Ford Minnow 15/30 ₥; Copper Perch 30/55; Ledger Carp, Far Bank, rain, 40/70; Amber Bream, sunny summer, 35/90; Night Eel, summer night, 65/180; Frost Trout, Frost Derby, 55/150; Ghost Pike, Vault pool, winter, 80/400) plus five legendaries at difficulty 100 and 3,000–8,000 ₥, one catch each, the first being *The Auditor* at the Ford after 01:00 on a luck day. Ore: Copper (floors 1–10, 12 ₥), Iron (11–20, 24), Gold (21–30, 60), Sterling (Deep Stacks, 150); gems Quartz 25, Amber 80, Garnet 120, Aquamarine 180, Moonstone 300; one Old Ledger page every 3 floors; 5 ore + 1 coal → 1 bar.

**Tools and buildings.**

| Purchase | Cost | Materials | Effect / gate |
| --- | --- | --- | --- |
| Copper / Iron / Gold / Sterling tools | 2,000 / 5,000 / 10,000 / 25,000 ₥ | 5 bars of the tier | 3-tile line / 5-tile line / 3×3 / 6×3 or 5×5; Sterling needs the Prospectors' Hall |
| Cottage upgrade 1 / 2 | 10,000 / 50,000 ₥ | 450 wood / 150 hardwood | Kitchen and cooking / second floor and aging cellar (casks ×2 over 28 days) |
| Coop / Big Coop | 4,000 / 10,000 ₥ | 300 wood, 100 stone | 4 / 8 hens |
| Barn / Big Barn | 6,000 / 12,000 ₥ | 350 wood, 150 stone | 4 / 8 animals; sheep need Big Barn |
| Silo / Well / Fish Pond | 100 / 1,000 / 5,000 ₥ | stone, copper | Hay, water, roe |
| Resident cottage | 4,000 ₥ | 200 wood | Home for a created character (first two free) |
| The Mill Lot | 15,000 ₥ | — | Blocks Meridian Depot if bought by Fall 20, Year 1 |
| Business building Tier 1 / 2 / 3 / 4 | 5,000 / 25,000 / 100,000 / 250,000 ₥ | wood, stone, bars | Plus the §7.1 real gate |
| Desk and office decor | 500–5,000 ₥ | — | Cosmetic; unlocked by hearts with the agent |

**The Town Charter — six halls of the Old Exchange** (a ledger completes by placing the listed items, or in the Stewards' Hall by facts from the audit log; each completed hall plays a Tallies scene):

| Hall | Ledgers | Reward |
| --- | --- | --- |
| Growers' | Spring ×4, Summer ×4, Fall ×4 crops, one gold-quality of each, 5 artisan goods | Greenhouse |
| Anglers' | River fish ×4, night fish ×3, rain fish ×3, a Frost Derby trout | Ferry to the Far Bank; the Bazaar docks weekly |
| Prospectors' | 20 copper, 20 iron, 10 gold, 5 gems, 3 Old Ledger pages | Vault elevator every 5 floors; Sterling tools |
| Artisans' | Jam, wine, cheese, cloth, honey, one cooked dish per season | Market Square stalls; Nell's bakery opens |
| Stewards' | Onboard an agent; read 20 briefings; run 4 curfew drills; export the audit log 4 weeks running; every manifest has all limits set | Bell tower (curfew bell town-wide); the Tallies' lanterns light the streets |
| Vault of Marks | 2,500 / 5,000 / 10,000 / 25,000 ₥ | Tram to the Highlands; the Founder's Statue |

All six → *Charter Restored*. The **Meridian path**: a Membership (8,000 ₥) buys each reward instead — Greenhouse 35,000, Ferry 20,000, Elevator 15,000, Stalls 30,000, Bell tower 10,000, Tram 40,000 ₥ — for the grey-blue *Meridian Town* ending.

**Festivals.** Spring 12 Seed Fair (Seed Scramble; Cloudberry seeds) · Spring 24 Blossom Waltz (dance with a 4-heart friend) · Summer 11 Founders' Picnic (Communal Stew judged by the Mayor and Sterling) · Summer 28 Lantern Drift (lanterns at the Ford; the Tallies appear if the ledger is honest) · Fall 16 Tallyford Fair (Market Stall display, Ring Toss, Coin Wheel, fortune teller; first Lantern Fruit) · Fall 27 Hollow Night (hedge maze, spooky Vault floor) · Winter 8 Frost Derby (ice fishing, 3 minutes) · Winter 25 Ledger's Eve (secret gifts; the Mayor's year-in-review with the firm's real year beside the farm's).

**Trust hearts.** 0–10, 250 points each; talk +20/day; gifts 2/week (loved +80, liked +45, neutral +20, disliked −20, hated −40, ×8 on a birthday); −2/day unspoken-to until 10 hearts. Gates: 2 backstory and loved-gift hint; 4 custom greeting; 6 heart event; 8 personal quest; 10 portrait frame, dedicated lines, a recipe. For agents the same gates unlock lore, greeting lines, a read-only office-hours chat and a personal quest — never a limit or permission. Friendship only; no romance system.

**Luck.** The Morning Ledger headline maps to −0.10 … +0.10: double-forage chance, gem and treasure chance, ore per node, Tallies sightings. Never anything on the real side.

**The Founder's Audit (Year 3, Spring 1, 21 points):** lifetime Marks 25k/50k/100k/200k → 1–4; all six halls 3 (Meridian complete 2); 5 / 10 characters at 8+ hearts → 1 / 2; skill levels 30 / 50 → 1 / 2; Cottage upgrade 2 → 1; every Firm Hill lot built → 1; agents onboarded 12 / 20 → 1 / 2; Vault floor 30 → 1; Mill Lot owned → 1; all eight festivals in one year → 1; 3+ Lantern Fruit → 1. Lanterns lit: 1 (≤ 6), 2 (7–11), 3 (12–17), 4 (18–21); four lanterns grant a Lantern Fruit, the Founder's Statue and Prestige (a second town on a new map with the same agents).

**The Town Ledger (100%):** every crop and artisan good shipped, every fish, every recipe, every skill maxed, 10 hearts with everyone, Vault 30 and Deep Stacks 50, charter or Meridian complete, every festival, every building, all 7 Lantern Fruit, every agent from the original roster of 12 onboarded. Reward: the Town Clock and a gold nameplate on the cottage.

**Income targets (median of 20 seeded runs, no bridge Marks):** Year 1 Spring 4,000–7,000 ₥, Summer 15,000–25,000, Fall 30,000–50,000, Winter 8,000–15,000; Year 2 three times Year 1; Charter Restored reachable by Year 2 Fall; three lanterns for a player who does every festival and half the Vault.

## 11. Story and content (writer)

Tallyford's story is about a town that once counted everything except what mattered, and a Founder who rebuilds it by keeping an honest ledger. All names, characters and lines are original; write every NPC in one voice; tone dry, warm, specific.

**Backstory.** Merchants once crossed the ford and clerks tallied goods on the Exchange steps with bead-strings — the Tallies are those bead-strings' spirits, or so Nana O says. Twenty years ago the Ledger Bank, run out of the Exchange, collapsed; the board blamed a clerk, Marguerite Tally, and the town emptied. Marguerite spent the rest of her life proving the books were cooked from above; the proof is in the Deep Stacks, one Old Ledger page at a time. She died last winter and left the Founder the cottage.

**The cast** (birthday, home, hook, loved gifts):

| Character | Role, age | Hook | Loves | Birthday |
| --- | --- | --- | --- | --- |
| Beatrix Ashgrove | Mayor, 58 | See §6.6 | Strong black tea, fennel soup | Fall 3 |
| Fennimore Quist | Town Clerk, 44 | Runs Records; fussy, exact, secretly the funniest person in town | Ink, Old Ledger pages | Winter 19 |
| Rosalind "Roz" Bellweather | Carpenter, 39 | Blunt, sawdust everywhere, builds every upgrade; Pip's mother | Maple syrup, hardwood | Spring 6 |
| Pip Bellweather | Kid, 8 | Draws the agents as superheroes; the *Pip's Comics* quests | Radishes, crayons | Spring 15 |
| Tobiah Kettle | Smith, 51 | Talks to the forge more than to people; upgrades tools | Geodes, coal | Summer 17 |
| Marisol Ocampo | General store, 47 | Warm, informed, keeps the town's news; refuses Meridian's stock deal | Chili jam | Spring 20 |
| Nell Ocampo | Arcade keeper, 17 | Wants the city; bakes when nobody watches; opens the bakery after the Artisans' Hall | Arcade tokens, cinnamon rolls | Fall 9 |
| Ansel Brook | Fisherman, ferryman, 66 | Superstitious about *The Auditor*; runs the ferry after the Anglers' Hall | Smoked eel | Summer 2 |
| Dr. Ines Varga | Clinic and vet, 42 | Dry, precise; treats hens and, in the town's joke, erroring agents | Honey, bilberries | Winter 4 |
| Hollis Penrose | Tavern keeper, 60 | Ex-trader ruined in the collapse; mentors Stewardship; sees himself in the firm's traders | Sweet potato pie, a good story | Winter 25 |
| Sterling Vance | Meridian rep, 35 | Slick, tidy, believes efficiency saves towns; grew up in one Meridian "saved" | Espresso; dislikes handmade gifts until 6 hearts | Spring 28 |
| Wren Okonkwo | Rancher, 29 | Sings to animals; twin lambs; sells feed and animals | Goat cheese, sunflowers | Summer 23 |
| Bram Okonkwo | Courier, 31 | Carries the letters between buildings; off shift, the letters fly themselves | Sweetcorn | Fall 1 |
| Nana Oyelaran ("Nana O") | Elder, 81 | Marguerite's friend and the last Exchange clerk; keeper of the Tallies' lore; charter quests | Leek soup, old coins | Fall 21 |
| Constable Ada Ferrers | Night watch, 33 | Only person awake 02:00–06:00; the agents' night shift is her company | Coffee, Night Eel | Winter 12 |
| Madame Quillon | Bazaar merchant | Visits Fri and Sun; rare seeds; runs Market Day; knows more about Marguerite than she says | Moonstone | none |
| The Tallies (Bead, Knot, Notch, Tick) | Spirits | Non-speaking; chime; visible only while the ledger is honest | Lantern light | — |

**Heart arcs** (five beats at 2/4/6/8/10; write these three in full, the rest to the same shape): *Hollis* — a drink and the year the bank fell; the framed trade ticket he never filed; a Ledger's Eve memory watching the firm's windows; quest *The Sure Thing* (the ticket's twin in the Deep Stacks proves he was not the reckless one); he hands over the card table and the marked cards start appearing. *Sterling* — the polished pitch; a slip about his hometown; rain, tavern, the school Meridian's rescue closed; quest *Two Ledgers* (he asks to read the audit log the way the Mayor does); on the Charter path he resigns and stays as the Exchange's book-keeper, on the Meridian path he stays regional manager and the friendship survives, colder. *Nana O* — she teaches the player to see a Tally; Marguerite's second letter; the Exchange steps at dawn; quest *The Last Column* (Marguerite's final page from Deep Stacks 40); she becomes the fourth voice of the Founder's Audit. Live agents get an 8-heart personal quest generated from their card: the giver line from `mes_example`, the objective a town task, never a real action (Rex's shipped example is *The Chart That Lied*: bring him the Ghost Pike).

**Plot.** Act I, *Keys to the Cottage* (Year 1 Spring): arrival, the Mayor's tour, the firm introduced as "the people who moved in before you", Sterling's first offer for the Mill Lot, Nana O opens the Exchange's front hall, the first Tally appears at the first honest harvest, Hollis's warning about fast money. Act II, *The Counting* (Summer Year 1 to Fall Year 2): halls restore one by one, the Mill Lot deadline, agents' personal quests at 8 hearts, the Deep Stacks pages reveal the board's cover-up, Sterling's arc turns, the festivals carry the mood. Act III, *The Reckoning* (Fall Year 2 to Spring Year 3): *Charter Restored* (the Exchange reopens, the Tallies' festival, Meridian leaves) or *Meridian Town* (efficient, grey-blue, quieter, Nana O's last scene on the steps); the Founder's Audit at dawn, delivered by the Mayor, Hollis and Nana O; then the Deep Stacks, the Town Ledger and Prestige.

**Story beats triggered by the bridge (deterministic, never risk-inducing):** first green week → Hollis raises a glass, the Tallies chime once · first blocked action → the Mayor walks the player through Records · first permission left to expire → Bram returns an unopened letter, Fennimore files it as "unanswered, which is an answer" · first curfew drill → Ada shows the bell rope · Town Level 3 → Sterling's counter-offer, Mill Lot price +20% · ten losing days in a season → Nana O brings soup, nothing else · an agent onboarded → the Awakening, and Pip draws them that night.

**Quests.** Three tiers: daily Noticeboard (fetch, catch, deliver; seeded by date), NPC story quests (per heart event), Charter Commissions (multi-step). Sixty planned; samples: *The Missing Column* (Fennimore's misfiled page → 300 ₥, 1 Stewardship level) · *Pip's Comics #1* (three agent portraits → drawing as decor, 2 hearts) · *Soup for the Night Shift* (Leek soup to the firm after 22:00 → coffee recipe, hearts) · *The Ferryman's Bet* (catch a Night Eel before Ansel does → bait recipe) · *Roz's Rush Order* (200 wood by Friday → 1,000 ₥, upgrade coupon) · *The Stock Deal* (10 Ruby Chard seeds for Marisol → store discount, 3 hearts) · *Two Ledgers* · *The Last Column*.

**Dialogue rules.** Lines ≤ 90 characters, ≤ 3 boxes per exchange; each NPC ≥ 40 daily lines across season × time × weather × hearts plus 6 reactive lines to town state; rain over the firm is mentioned gently and once, never as blame or advice; no financial advice, no real tickers, no shaming of any permission decision, no line that treats approval as brave or rejection as cowardly; NPC lines from `dialogue/*.yaml`, agents from their own events, generated lines tagged `flavor`; kids and Nell written age-appropriately, friendship only, no romance system; humour from specificity, never from mocking the player.

**Persona template (the Creator's questions):** name and what people call them; where they were before Tallyford; the thing they are good at and the thing they pretend to be good at; what they do when a plan fails; who they would sit with at the tavern; three sayings; how they greet the Mayor → `description`, `personality`, `scenario`, `first_mes`, three `mes_example` exchanges.

**The Awakening (Town Hall, 20 seconds):** the resident stands before the Mayor's desk; the Mayor reads the card's name and role aloud and asks "Do you understand that every action goes through this office?"; the resident answers with their `first_mes`; the stamp comes down; the desk lights turn on across town; Pip cheers from the doorway; the audit log records `lifecycle: joined`; the Tallies chime if the ledger is honest.

## 12. Mini-games

Nine, each its own Phaser scene with one input, one score and one reward table; each has a `peaceful` flag, keyboard and touch controls, and pauses on tab blur. None touches the real side; none is about approvals.

1. **Fishing** (any water; 8 Vigor per cast; Fishing XP). Cast, 1–10 s wait, 4-second bite window; a green bar rises while held and falls under gravity; the fish icon moves by behaviour — darter, drifter, sinker, floater, mixed above difficulty 70; the meter fills inside the bar and drains outside; a perfect catch gives +1 quality and double XP; treasure crates at 15% (×2 with the profession); bar 96 px base, +16 per rod tier, +20% Tackler; legendaries add a second icon for the last 20%.
2. **The Vault Below** (Old Exchange cellar; 6 Vigor per floor; Prospecting XP). 30 floors in three biomes of ten (Copper Stacks, Iron Archives, Gilded Reading Room), one hidden ladder per floor, a shaft at 5%, the elevator every 5 floors after the Prospectors' Hall. Peaceful mode: hazards only (collapsing shelves, blinding dust, gusts). Standard mode: auto-swing combat with 3 hearts against Dust Wisps, Ink Slimes and Moth Swarms; losing all hearts sends the character home minus 10% of carried ore, never Marks. The Deep Stacks below floor 30 are endless, with Sterling ore, Moonstones and a lore page every 5 floors.
3. **Paper Plane Post** (arcade, one button). An endless side-scroller: a paper plane carrying a letter between desks, dodging mugs, chairs and ticket stacks; +8% speed every 10 desks; shared hi-score board; top-3 earns 5 arcade tokens.
4. **Bean Counter** (arcade, left/right + drop). Abacus beads fall in three colours; a column that totals exactly 10 clears; overflow locks; a 50-bead chain awards the *Golden Abacus* decor.
5. **Tallyman's Gambit** (tavern). Two-player trick-taking against Hollis on a 24-card deck (Coins, Ledgers, Keys, Lanterns, ranks 1–6), six tricks, a Lantern beats any suit once per hand, four tricks win; entry 20 ₥, win 60 ₥, one game a day; at 5+ hearts a win has a 10% chance of a marked card (12 collectibles, one lore line each); Hollis is a fixed strategy, not a model.
6. **Market Day** (Bazaar, Fri and Sun; Stewardship XP). Five rounds of trading fictional goods — Saffron, Amber, Salt, Silk, Ink — with a rumour card each round, on 300 ₥ of Quillon's stake; keep profit up to 500 ₥ and a coupon above 450; losses cost nothing. The code must never use real market data, tickers or the firm's numbers.
7. **Festival games.** Seed Scramble (60 s, 12 hidden packets, ten wins the hat), Frost Derby (3 minutes, fixed 60-px bar, three prize tiers), Ring Toss (timing bar, 3 throws per token), Coin Wheel (visible odds, fair tokens only, no Marks wagered), Market Stall display (scored on variety and quality), Hollow Night maze.
8. **Crane Claw** (arcade corner). Four-second drop over decor items; grip strength fixed at 60% and shown on screen.
9. **Cooking** is recipe-based, no mini-game; the Fair's bakery contest uses the Market Stall scoring.

**Refuse to build, even if asked later:** an approval sprint or any timer, streak or score around permission decisions; a game that reads real P&L, positions or agent events; gambling with Marks beyond the fixed-entry card game; hidden odds; any prize that raises an agent's limits or tier.

## 13. Audio (composer / sound designer)

1. **Direction.** Warm acoustic folk with soft chiptune on top — nylon guitar, felt piano, marimba, flute, a light square-wave lead — at 88–108 BPM; major and mixolydian by day, dorian at night; no tritone stings anywhere. Motifs: a four-note "tally" motif (up, up, down, hold) quoted by every seasonal arrangement; the Mayor's clock-tick and single bell; Meridian's cold minor staccato strings and clean electric piano that creeps in with its buildings and leaves with them; the Tallies' glockenspiel and whole-tone sparkles only when on screen; the firm's brushed drums, ticking hi-hats and muted trumpet as a jazz variation of the town theme.
2. **Music map (\~60 stems).** Town day ×4 seasons (2:30–3:30, five stems each) and night ×4 (2:00); the farm at morning (solo guitar); Town Hall; The Counting House (diegetic band, stops at closing); store, smithy, clinic, ranch (1:15 each); the firm's three floors plus a night-shift version; five business shells (the firm arrangement with new leads); the Vault's three biomes (marimba, low pads; Deep Stacks ambience only); a hall-restored stinger that grows with each hall; two arcade loops; a fishing tension stem; Market Day (accordion); eight festival reworks; story one-shots (arrival, first Tally, Mill Lot lost, both endings, the Audit); stingers for permission request (a two-note "hm?", never an alarm), stamp, blocked, curfew (bell then two seconds of silence), level up, heart up, quest done, Awakening.
3. **Adaptive rules.** Vertical: Town Level 1–5 unmutes one stem per level (L1 solo guitar → L5 full ensemble). Horizontal: cue changes only at bar boundaries with a 2-bar crossfade; time-of-day crossfades over 60 s. Rain adds a low-pass filter and a rain bed; a losing week mutes the chip lead and adds a pad — quieter, never darker. Mayor stingers duck music −8 dB for 1.5 s. Music never rises in intensity to signal a real permission request.
4. **SFX (\~250, in `sfx.yaml`).** Footsteps ×6 surfaces; farming (hoe, pour, seed, harvest pop, 06:00 growth chime, sprinkler); fishing (cast, bob, splash, reel strain, catch jingle, crate); Vault (pick, crack, ore ping, ladder, shelf collapse, wisp puff); animals and machines; UI (hover, click, wood-slide, page, coin count, ₥ tally, error thunk); Town Hall (stamp, bell rope, gavel, ledger close, curfew); agents (typing loop, phone, eureka, letter whoosh, lamp); weather and ambience (rain ×3, wind, snow, river, crowds, lantern hiss); emotes and story (heart pop, bubbles, Tallies chime, Awakening stamp with reverb).
5. **Implementation.** Phaser 4 sound manager over Web Audio; OGG with M4A fallback; sample-accurate loop points in `music.yaml`; stems scheduled on one `AudioContext` clock so layers stay phase-locked; buses Music / SFX / UI plus master with sliders; autoplay unlock on first tap; optional pause on blur; −16 LUFS music, −20 LUFS effects, true peak −1 dB; ≈ 25 MB music and 6 MB SFX streamed per zone; CC0 or own recordings, provenance recorded, generated audio only with a commercial licence beside the file.
6. **Voice barks (optional).** Greeting, harvest, win, loss and curfew lines per persona via TTS with `voice.tts_voice_id`, a town-wide mute, always a subtitle; never a bark for a permission decision.
7. **Accessibility.** Captions for every bark and story cue; a visual twin for every audio alert (the bell rope swings, the stamp card flashes); a reduce-audio mode without stingers; no cue below 200 Hz carries information alone.

## 14. Art pipeline (Midjourney + post-processing)

### 14.1 Facts to respect (checked 2026; re-check the Version chart before large batches)

1. Midjourney V8.2 is the default version (July 24, 2026) and its Edit Model replaces Omni Reference, Character Reference and Retexture. On V8.x use `--edit` (up to 4 reference images); `--oref` works only on `--v 7`. `--sref` (URLs or style codes), `--sw` (0–1000), `--raw`, `--stylize`, `--no`, `--ar`, `--seed` and `--tile` work on V8.2; `--tile` is not compatible with `--edit`; moodboards cannot be combined with `--sw`.
2. Midjourney's Terms of Service (effective May 27, 2026) forbid automated tools to access, interact with or generate through the service, and accounts may be blocked. Path B below is therefore opt-in and risk-acknowledged; Path A is the default. Companies over $1M revenue need a Pro or Mega plan to own assets.

### 14.2 Style lock

1. The first batch is the **Style Bible**: four prompts for a master style frame (the town square at golden hour). I pick one; its URL becomes the global `--sref` for every later prompt and its seed is recorded.
2. Build `art/palette.gpl` (48 colours) from the chosen frame; every asset is remapped to it.
3. Character consistency: front-facing portrait first, then alternate expressions through `--edit` (V8.2) or `--oref <url> --ow 100` (V7).

### 14.3 Prompt templates (fill `{slots}` from cards; no artist or game names in prompts)

- **Tileset:** "top-down 3/4 view pixel art tileset sheet for a cozy farming-village game, 16x16 pixel grid, grass, dirt path, cobblestone, wooden fence, flowers, water edge, limited warm palette, crisp hard pixels, no anti-aliasing, flat even lighting, orthographic, plain background --ar 1:1 --raw --stylize 50 --sref {STYLE\_URL} --sw 200"
- **Seamless ground:** "{material} ground texture, pixel art, 16x16 grid, top-down, limited warm palette --tile --raw --sref {STYLE\_URL}"
- **Building:** "single {building\_type} building for a {business} in a cozy pixel-art village, top-down 3/4 view, {distinct\_features}, wooden sign with no text, isolated on flat magenta #FF00FF background, 16x16 pixel grid scale, crisp pixels, limited palette --ar 1:1 --raw --stylize 50 --no text, letters, shadows on background --sref {STYLE\_URL}" — Trading Firm: "two-story timber-and-brick trading house with a ticker board awning and a bell"; Old Exchange: "grand stone exchange hall with six arched doors and a clock"; Meridian variants in grey-blue.
- **Interior:** "top-down pixel art interior of a {room} room, wooden floor, {furniture}, cozy lamps, 16x16 grid, limited palette, orthographic --ar 16:9 --raw --sref {STYLE\_URL}"
- **Portrait:** "pixel art character portrait, bust shot, facing viewer, {appearance from description}, expression {expression}, 16-bit era RPG dialogue portrait, clean dark outline, limited warm palette, flat magenta #FF00FF background, crisp pixels --ar 1:1 --raw --stylize 75 --sref {STYLE\_URL} --sw 250" — six expressions per named character.
- **Walk-sprite reference:** "pixel art game character sprite sheet reference, {appearance}, front, back, left, right standing poses, small proportions, flat magenta background --ar 16:9 --raw --sref {STYLE\_URL}" — reference only; final walk cycles come from the Creator's layer kit or a CC0 base.
- **Mayor:** the portrait template plus "kindly but sharp town mayor, round spectacles, green waistcoat, pocket watch, holding a stamp".

### 14.4 Path A — manual prompt pack (default)

1. Generate `art/batches/<batch-id>/prompts.md`: numbered copy-ready prompts with target filenames.
2. Create `art/inbox/<batch-id>/`; I save chosen images there as `{kind}__{id}__{variant}.png` with kind ∈ tileset | ground | building | interior | portrait | sprite-ref | mayor | crop | ui | fx (for example `portrait__stock-trader-01__smug.png`, `building__trading-firm__t1.png`).
3. A watcher runs 14.6 automatically and hot-swaps placeholders.

### 14.5 Path B — browser agent in my open Midjourney session (opt-in only)

Off by default; enabling requires `ART_BROWSER_MODE=on` and the typed in-app acknowledgment "I understand Midjourney's ToS prohibits automated tools and my account could be banned." Uses Claude Code's Chrome integration (Claude in Chrome at v1.0.41 or later, in the tab group it opens) in my already-logged-in tab; pauses at any login or CAPTCHA; never asks for or stores my password. Per-batch approval: show the exact prompts, count and estimated GPU use, wait for "approve batch \<id>", at most 8 prompts per batch, one batch at a time, human-paced, no parallel tabs, no loops, no scraping. I select the keepers; only those are downloaded into the inbox; everything is logged as art actions in the audit log. Any warning, rate limit or UI change → stop and fall back to Path A.

### 14.6 Post-processing (`pnpm art:process`)

1. Key out flat #FF00FF; otherwise rembg, then threshold alpha to 0/255.
2. Grid recovery: detect the implied pixel grid and downscale to true resolution with proper-pixel-art or Retro Diffusion's Pixel Art Fixer, never naive resizing. Targets: tiles 16×16, buildings multiples of 16, portraits 64×64, characters 16×32, crops 16×16 per stage.
3. Palette lock to `palette.gpl`, no dithering unless enabled; report assets whose colour error is too high.
4. Cleanup: 1-px outline consistency, no orphan pixels, 1-px transparent padding; then the `pnpm art:qa` checks from §4.
5. Pack Phaser atlases per category and 4-direction × 4-frame walk sheets; write `assets/manifest.assets.json`; keep originals in `art/raw` (git-ignored); record provenance for every asset.

### 14.7 Asset scope (Year 1)

\~600 ground tiles (5 surfaces × 4 seasons, 47-tile autotile blobs, water edges, farm states) · \~300 nature (4 tree species × 4 seasons × 3 stages, stumps, bushes, rocks and ore nodes, flowers, 24 forage) · 22 crops × 7 frames · 14 buildings × up to 4 tiers as a modular kit · 26 interiors · \~250 props · 16 NPCs + 12 agents + the Creator layers · 28 portraits × 6 expressions · \~220 item and UI icons · \~40 UI frames · \~30 weather and FX · 4 mini-game kits. Concepts and portraits come from Midjourney; every final asset is finished in Aseprite on the palette; maps in Tiled; naming `char__<id>__<set>_<dir>.png`, `crop__<id>__s<stage>.png`, `bld__<id>__t<tier>__<part>.png`, `ui__<name>.png`, `fx__<name>.png`.

## 15. UI screens and interactions

1. **Town Map (Phaser).** Buildings on lots; agents walking between desk, Town Hall and plaza on schedules driven by real status; letters fly along roads for `message` events; bubbles show the newest `thought_comment`; status icons over heads (working ⚙, waiting ⏳, blocked ⛔, error ❗, offline 💤) as shape plus colour. Click a building to enter; drag or WASD to pan; minimap. The Founder walks the same map; residents and NPCs walk their schedules.
2. **Building Interior.** Departments as rooms; desks show live activity (typing, glowing monitors, stacking papers with progress); hover shows a mini-card, click opens the Agent Card; Simulated employees in grey.
3. **Agent Card / Inspector (wood-panel drawer).** Portrait with an expression from recent events, name, role, model tier, risk profile, stake bar used vs allocated; metrics sparkline, current task and progress, latest comments, permission history, persona fields, `lore` and Trust hearts; Pause / Resume / Stop; Retire (typed confirmation).
4. **Mayor's Office (Town Hall).** Permission Inbox sorted by risk with action, params, exposure before and after, plain-English rationale and rule hits; Approve / Edit & Approve / Reject / Ask why, swipe gestures on mobile, badge count on the roof; the Curfew bell; the limits editor; Town Hall Records (audit log). No score, streak, timer or reward of any kind on this screen.
5. **Town Crier.** Filterable stream of reports, summaries, errors, milestones and `game_event`s, with the daily briefing pinned.
6. **Welcome Wagon (Add Agent).** Paste or upload a V2 card (JSON or PNG) or fill the form; validate schema and allocation totals; preview desk and placeholder portrait; "Generate art" queues portrait and sprite prompts into the next batch; confirm → move-in animation and the Mayor's welcome notice. The same screen opens pre-filled from a resident's card for Awaken.
7. **The Registry (Character Creator)** in Town Hall (§8), and the cottage bed's "visit as" picker.
8. **Economy / Town Level panel.** Level, progress to the next unlock, Treasury in USD and Marks side by side (clearly labelled which is real), time-lapse replay.
9. **Game panels.** Inventory and hotbar, Journal (quests, hearts, the Founder's Audit progress, the Town Ledger), Charter (six halls with their ledgers), Shop and Carpenter screens, the Farm overview, the Noticeboard, the Morning Ledger, Settings (audio buses, accessibility, Sim Season).
10. **Global HUD.** Clock and season, Vigor bar, Marks, Treasury, pending-approval count, connection status, Curfew state.

## 16. Non-functional requirements

1. **Performance.** 60 fps on a mid-range laptop with 50 agents, 200 events per minute and the full Year 1 map; frame time under 16 ms; client memory under 300 MB; event-to-screen latency under 500 ms; batched bubble updates; pooled sprites and letters; chunked farm layer.
2. **Pixel-perfect.** Integer scaling only, no blurry textures, no sub-pixel jitter while the camera moves (§4).
3. **Responsive.** Desktop: map plus side panels. Tablet and mobile (≥ 360 px): full-screen map with bottom-sheet panels, the Permission Inbox as the primary mobile screen, a touch joystick for the Founder. Installable PWA with push notifications for approvals.
4. **Accessibility.** Every map interaction has a DOM equivalent (list views of agents, buildings, quests, inventory); keyboard navigation and visible focus; an ARIA live region for new approvals; colour-blind-safe status icons; reduced-motion mode; text 16 px or larger in panels; the readable-font toggle enlarges touch targets to 32 px; captions and visual twins for audio (§13).
5. **Security of the permission channel.** Single-user login with passkey/WebAuthn plus a session; re-authentication for tier-3 approvals, limit changes, Awaken and Retire. HTTPS everywhere; per-agent scoped tokens rotated through the env or a secret store and never in manifests (manifests reference env var names only); HMAC-signed events with nonce and timestamp, anything outside a 60-second window rejected; server-signed decisions that agents verify before acting; CSRF protection and a strict CSP. All agent-supplied and player-written text is untrusted: rendered as text only and never fed to the policy engine as instructions — this covers comments, cards, dialogue and quest text alike. Least agency: the UI can only send pause / resume / stop / decision to agents.
6. **Reliability.** If the Town Server is down, agents fail safe (no decision = rejected). Event store and save backups. Missed DayTicks replay in order. `pnpm town drill` tests the kill switch weekly.
7. **Testing.** Policy engine unit tests with 100% branch coverage on limits; adapter contract tests; `game-core` unit tests for every rule table; the 365-day headless simulation; the schedule validator and dialogue linter; save-migration fixtures; the dependency-cruiser wall; Playwright end-to-end tests for add-agent, approve, create → hire → awaken, and plant → water → harvest → Ledger Bin, with seeded days and screenshots; visual snapshots of the town at each Town Level.

## 17. Delivery plan

Ten phases, one per session (Phase 7 in four sessions), each on its own branch and PR, each with acceptance criteria I can verify by hand. No phase starts until the previous one's criteria are green and `VERIFY.md` has been walked.

**Phase 0 — Discover and scaffold (no product code).** Read the workspace and any agent repo; produce `PLAN.md` (integration points, the 12 agents mapped to departments, gaps) and `DECISIONS.md`; bootstrap the monorepo from the official Phaser React TS template with the §3 layout, the Kenney placeholder map, `packages/sim` with the mock fleet, and the checks (`pnpm test`, `data:lint`, `art:qa`, `depcruise`, `sim:year` stub). AC: I approve the plan; `pnpm dev` shows the placeholder town; every check runs (even if trivially green).

**Phase 1 — MVP town.** Phaser town, the Trading Firm with three department rooms, the 12 simulated agents walking and working with bubbles, the manifest registry with hot reload, Rex's card loading. AC: dropping `agents/stock-trader-01.card.json` creates his desk, card, portrait slot and reporting line within 5 seconds with no code change; deleting it retires him gracefully.

**Phase 2 — Live updates and the Mayor.** Event schema, gateway (A2A plus the webhook adapter), SSE, live agent cards, flying letters; the policy engine, inbox, kill switches, hash-chained audit log, briefing and Ask the Mayor. AC: (a) a simulated order pushing Rex above 30% of stake is blocked; (b) a medium-risk order appears in my inbox and executes in the simulator only after I approve; (c) Curfew stops all 12 agents within 2 seconds; (d) every decision appears in the audit log with a valid hash chain; (e) one agent on a second machine (or a container on another port with its own token) connects over the network and behaves identically.

**Phase 3 — Evolving town.** Economy engine, Town Levels, building tiers, lots, roads, seasons on the real calendar, day/night, weather, time-lapse. AC: a replayed 90-day simulated history reaches at least L3 with the correct unlocks and renders identically on two runs; rain appears over a building with a negative week and clears on recovery.

**Phase 4 — Midjourney assets.** Style Bible batch, per-building and per-character batches (Path A; Path B only if I opt in), the processing pipeline, hot-swapping of placeholders. AC: every processed asset passes `pnpm art:qa`; the dashboard shows no placeholder art for the firm and its agents; provenance is complete.

**Phase 5 — World and Founder.** The dependency wall; `packages/game-data`, `game-core`, `save-migrations`; the Character Creator; movement and interaction; `WorldClock` and `DayTick`; save slots with export and import; schedules and daily lines for six NPCs (the Mayor, Fennimore, Roz, Marisol, Hollis, Sterling). AC: (1) a created character walks the square, talks to all six, sleeps, and is in the same place after a server restart; (2) the 00:00 tick runs once per missed day in order and a replayed seed renders the same day; (3) CI fails on any import from a game package into `gateway` or `mayor/policy`.

**Phase 6 — Farm and economy.** Farming cycles, tools, inventory, chests, the Ledger Bin, shops, animals, machines, Marks, the bridge dividend and task credits, the Carpenter and Smith screens. AC: (1) plant → water → harvest → Ledger Bin pays at 06:00 with quality multipliers, and out-of-season crops die at the season change; (2) with `bridge.rate: 0` no Marks are minted from real events, and with the simulator's green day the Treasury shows the dividend while the audit log gains no entries from the game; (3) the 365-day simulation hits the §10 income targets.

**Phase 7 — Life and story (four sessions: cast and hearts; charter and festivals; the Vault; the pipeline).** Full cast of 16, Trust hearts and gifts, heart events in Ink, the quest engine with Noticeboard and Charter Commissions, the six halls and the Meridian path, all eight festivals, the Vault Below and Deep Stacks, the Resident → Employee → Agent pipeline with the Awakening. AC: (1) every NPC has ≥ 40 daily lines and passes the linter, every schedule passes the validator; (2) gifts follow the heart table, and a test asserts an agent's manifest hash is unchanged after reaching 10 hearts; (3) a resident hired and then awakened appears in `agents/` as a valid card with a `lore` block, passes Mayor validation, and its desk turns live; retiring removes the endpoint and keeps the lore; (4) the Mill Lot becomes Meridian Depot on Fall 21, Year 1 if unbought, and both endings play from a saved game.

**Phase 8 — Mini-games.** Fishing, the arcade cabinets, Tallyman's Gambit, Market Day, the festival games, the crane. AC: (1) each game runs at 60 fps on the reference laptop, supports keyboard and touch, pauses on blur, and pays only from its reward table; (2) Market Day has no import from the event store or any price feed, proven by a static-analysis test; (3) hi-scores persist across saves and survive a migration.

**Phase 9 — Audio, audit and polish.** Music stems and adaptive layering, SFX, optional voice barks, captions, the Founder's Audit, the Town Ledger, Prestige, Sim Season, accessibility settings. AC: (1) Town Level 1–5 unmutes stems as specified, and a losing week changes the mix as specified and nothing else; (2) the Founder's Audit scores a fixture save correctly for each lantern tier; (3) Sim Season runs a 20-minute day on the mock fleet and never mints bridge Marks.

**Definition of done.**

- [ ] `pnpm dev` starts everything; `pnpm test`, `pnpm test:e2e`, `pnpm data:lint`, `pnpm art:qa` and `pnpm depcruise` are green.
- [ ] README covers: add an agent in one file; connect a remote or local agent; the art pipeline; the kill switch; create a character, hire and awaken a resident; the farm loop; the bridge settings; Sim Season.
- [ ] `VERIFY.md` lists every acceptance criterion above with exact click-by-click steps.
- [ ] No copyrighted game assets, names, text or music anywhere; provenance and licences recorded for every asset, font and cue.

**Guardrails checklist (re-read before every phase).**

- [ ] The bridge is one-way: the game never sends `control`, `permission_decision` or `lifecycle` events except through the Welcome Wagon path, and never writes to the event store or audit log.
- [ ] No game reward, XP, heart, quest, festival, profession or purchase changes a limit, tier, allocation, permission or model.
- [ ] Nothing rewards approving, rejecting or hurrying a permission decision; the inbox has no score, streak or timer.
- [ ] No real ticker, price, position or P&L figure appears inside a mini-game or dialogue line.
- [ ] Card fields written by the Creator cannot carry URLs, tool names or instructions to the Mayor.
- [ ] Promotion to Agent always passes the same Mayor validation as a manifest dropped into `agents/`.
- [ ] Losses show as weather; nothing in the game punishes a real losing day.
- [ ] The policy engine contains no LLM call; the assistant is read-only.

## 18. Session 0 — the scaffolding to create before Phase 0

In Session 0, create exactly these files from this prompt, show me the tree, and stop. Then I restart the session so they load.

1. `docs/spec/PROMPT.md` — this file, unchanged.
2. `docs/GUARDRAILS.md` — §6.7, the "refuse to build" list from §12, and the guardrails checklist from §17, verbatim.
3. `docs/spec/phases/phase-0.md` … `phase-9.md` — each phase's scope and acceptance criteria from §17, verbatim, one file each; `docs/spec/phases/CURRENT` as a symlink to the active phase file (I move it).
4. `scripts/banned-words.txt` — the reference game's character, place, item, festival and building names plus a few signature phrases; `scripts/banned-words.sh`, a grep over it that exits 2 on a hit.
5. `.claude/rules/game-packages.md` (paths `packages/game-*/**`, `apps/town-server/game/**`, `apps/town-client/src/game/**`: §6.7 verbatim), `.claude/rules/content.md` (paths `packages/game-data/**`: the §11 dialogue rules and the originality rule), `.claude/rules/art.md` (paths `art/**`: §4 and §14.6).
6. `CLAUDE.md`, `.claude/settings.json`, the five subagents and the five skills below.

**`CLAUDE.md`:**

```markdown
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
```

**`.claude/settings.json`:**

```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)", "Read(./agents/**)", "Edit(./agents/**)",
      "Edit(./apps/town-server/gateway/**)", "Edit(./apps/town-server/mayor/policy/**)",
      "Bash(curl *)", "Bash(wget *)", "Bash(rm -rf *)"
    ],
    "ask": [
      "Bash(git push *)", "Bash(pnpm add *)", "Bash(pnpm remove *)",
      "Edit(./config/bridge.yaml)", "Edit(./config/evolution.yaml)", "Edit(./config/mayor.policy.yaml)"
    ],
    "allow": [
      "Bash(pnpm test*)", "Bash(pnpm data:lint)", "Bash(pnpm art:qa)", "Bash(pnpm depcruise)",
      "Bash(pnpm sim:year)", "Bash(pnpm lint*)", "Bash(git status*)", "Bash(git diff*)",
      "Bash(git log*)", "Bash(git add *)", "Bash(git commit *)"
    ]
  },
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "cat docs/spec/phases/CURRENT 2>/dev/null" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [ { "type": "command",
        "command": "f=$(jq -r '.tool_input.file_path'); case \"$f\" in *packages/game-data/*) pnpm -s data:lint && scripts/banned-words.sh \"$f\" ;; *packages/game-*|*apps/town-server/game/*|*apps/town-client/src/game/*) pnpm -s depcruise ;; *art/*) pnpm -s art:qa ;; esac" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command",
        "command": "if [ \"$(jq -r .stop_hook_active)\" = true ]; then exit 0; fi; pnpm -s test --changed >/tmp/t.log 2>&1 || { tail -40 /tmp/t.log >&2; exit 2; }" } ] }
    ]
  }
}
```

The two `Edit` denies on `gateway` and `mayor/policy` move to `.claude/settings.local.json` for Phases 1–3, which must edit them, and return for Phases 5–9.

**Subagents in `.claude/agents/`** (Markdown with YAML frontmatter: `name`, `description`, `tools`, `model`; the system prompt below the frontmatter names the role's section of this file, the files it owns, the linter it must run before finishing, and "return a summary of what changed and what is unresolved, not the file contents"):

| File | Description | Tools | Model |
| --- | --- | --- | --- |
| `game-designer.md` | Use for any change to a balance table in packages/game-data and for running or reading `pnpm sim:year`; proposes number changes as a diff and never applies one without approval | Read, Grep, Glob, Edit, Write, Bash | Sonnet |
| `writer.md` | Use for dialogue, quests, heart events, cutscenes and cards under packages/game-data; follows §11 and the banned-names list; runs `pnpm data:lint` after every file | Read, Grep, Glob, Edit, Write, Bash | Sonnet |
| `pixel-artist.md` | Use for anything under art/ and §14: prompt packs, inbox processing, atlas packing, `pnpm art:qa`, placeholders; never edits source outside art/ and the asset manifests | Read, Grep, Glob, Edit, Write, Bash | Sonnet |
| `composer.md` | Use for music.yaml, sfx.yaml, the audio bus config and loop metadata; never edits scenes | Read, Grep, Glob, Edit, Write, Bash | Sonnet |
| `guardrail-reviewer.md` | Use before any commit touching game packages or packages/game-data and before every phase merge; read-only; returns PASS or a FAIL list with file:line | Read, Grep, Glob, Bash | Opus-class |

The reviewer's system prompt checks, in order, citing file:line: (1) bridge direction — `pnpm depcruise` clean, no game code emitting control, permission\_decision or lifecycle except the Welcome Wagon path; (2) trust is not permission — nothing in hearts, XP, quests, festivals, professions or shops reads or writes a limit, tier, allocation, permission or model field; (3) no approval rewards — no timers, scores, streaks or XP tied to permission requests or decisions; (4) no real data in games — no import from the event store, a price feed or agent metrics in mini-game scenes or dialogue; (5) originality — the banned-names check over packages/game-data and art/; (6) secrets — no read of `.env*` or `agents/` outside fixtures. Output PASS, or FAIL with one line per finding. It never edits files and never suggests features.

**Skills in `.claude/skills/<name>/SKILL.md`** (frontmatter `name`, `description`, `disable-model-invocation: true`): `add-npc` (scaffold card, schedule from the role template, a 40-line dialogue matrix stub by season × time × weather × hearts, six portrait placeholders, a quest stub; lint and banned-names check) · `add-crop` (the `crops.json` row with the §10 columns, 7-frame placeholder sprites, seed and produce icons; prints the computed ₥/day) · `season-sim` (run `pnpm sim:year`, diff against the §10 targets, propose at most three one-line number changes as a diff, never apply) · `phase-report` (write the finished criteria into `VERIFY.md` as click-by-click steps and list what is open) · `screen-check` (start the dev server, drive Playwright to a scene and clock, save a PNG, read it back against the §4 style rules).

When these exist, say: *"Session 0 done. Restart me, then run Phase 0 in plan mode."*

## 19. Action RPG and dungeon layer (Phases 10–12)

The action-RPG expansion is part of this prompt: export the *Action RPG & dungeon expansion* tab as `docs/spec/RPG.md`, treat it as §19 in full, and apply these overrides to the sections above.

1. **Supersedes:** §12.2 (the Vault Below becomes 60 floors in five wings with a keeper every 12 floors, the elevator every 6, and the endless Deep Stacks; a `peaceful` mode keeps every drop as puzzle rooms); §9.4 (inventory becomes the backpack progression 12 → 24 → 36 → 48 plus a tool belt; migrations carry an existing 36-slot inventory into a Deluxe Pack); §10 skills (add **Arms** and **Ledgercraft** with their professions; Stewardship unchanged); the fishing paragraph of §12 (rods, tackle, bait, the marsh and Vault pools, the fish pond, traps, five legendary hunts).
2. **Adds:** the combat system (eight-direction action, one attack, a dodge or block, a spell slot, charged class moves, telegraphs on every enemy attack, hit-stop, the knockout rule with a tithe and no death); Ledgercraft magic (four schools, 16 Entries, Ink); 12 data-driven status effects; five weapon classes × five tiers, armor, Seals, charms, soles, tempering and nine named uniques; Tonics and meal buffs; four new townsfolk (Hesper Lund, Brother Osric Penny, Juniper Kettle, Tallow) and five keepers written as characters; a party of the Founder plus two companions (created residents, Juniper, Ada), never a live agent; ten main-story missions, five companion missions, daily bounties and ten secret interactions with special rewards; a third ending, *The Books Balanced*.
3. **Data files added** to `packages/game-data`: `weapons.json`, `armor.json`, `seals.json`, `spells.json`, `status.json`, `enemies.json`, `bosses/*.yaml`, `dungeon.yaml`, `loot.yaml`, `missions/*.yaml`, `bounties.yaml`, `tonics.json`, `rods.json`, `tackle.json`, `legends.yaml`, and the nine new character cards. Every one gets a JSON Schema and `pnpm data:lint` coverage.
4. **Phases 10–12** (one session each; Phase 12 may take two) with the acceptance criteria in RPG.md §12: Phase 10 combat core, Copper and Iron wings, the Teller and the Underwriter, backpacks and the tool belt, M1–M6; Phase 11 Ledgercraft, the Gilded Reading Room and the Broker, gear and tempering, companions, the fishing expansion, C1–C5, M7; Phase 12 the Treasury, the Undercount, the Comptroller and the Receiver, the honest-ledger counters, the three endings, Hard Audit, the Deep Stacks, M8–M10, bounties and secrets.
5. **Guardrails added** (append to `docs/GUARDRAILS.md` and the reviewer's checklist): no weapon, Seal, spell, meal, tonic, companion or mission reward reads or writes a limit, tier, allocation, permission or model; live agents never fight, never join the party, never enter the Vault; companion AI is scripted, never a model; the honest-ledger counters come only from in-game choices and never read the event store, the audit log or a permission decision; the bounty board and the permission inbox are separate screens with separate data; a knocked-out character is never killed and no save is deleted or rolled back by combat; magic refuses to cast in safe zones.
6. **Session 0 additions:** `docs/spec/phases/phase-10.md` … `phase-12.md` cut from RPG.md §12; the `game-designer` subagent also owns the weapon, enemy and loot tables; the `writer` subagent also owns `missions/` and the keepers' lines; the headless combat simulation joins `pnpm sim:year` as `pnpm sim:vault`.
