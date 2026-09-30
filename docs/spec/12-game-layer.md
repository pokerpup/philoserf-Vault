# Agent Town — Game Layer Design Spec (Addendum to the Claude Code Prompt)

Sep 30, 2026 · @Mavrick

## 1. Read me first

This addendum turns Agent Town from a dashboard into a playable, cozy farm-and-town game around the live agents. Paste it after §11 of the Agent Town prompt as §12; everything in §1–§11 (stack, Mayor, manifests, art pipeline, phases 0–4) still stands, and this text only adds to it. It is written from five studio roles — programmer, pixel artist, game designer, writer, composer/sound designer — so each role's section can be handed to a sub-agent on its own.

**Five design pillars (the coding agent follows these when any two rules conflict):**

1. **The firm is the engine, the game is the lens.** Only real agent work (P&L, completed tasks) grows the town's economy and level. The game layer adds a life the player can enjoy on a flat trading day: farming, fishing, neighbours, a story.
2. **The bridge runs one way.** Real → game only. Nothing in the game can touch real money, stake, limits, permissions or the Mayor's policy engine. Trust hearts, skills, quests and festival prizes unlock cosmetics, lore and information — never autonomy. Approving or rejecting a permission request earns nothing in the game.
3. **Cozy first.** No death, no punishing fail states, no timers you can miss forever. A losing week is rain over the firm, not a game over.
4. **Every person in town is one card.** Player, residents, NPCs, the Mayor and live agents all use Character Card V2 JSON (§5.1). A resident the player created can become a real agent without rewriting anything.
5. **Original everything.** Stardew Valley is the structural reference — its systems, pacing and economy shape. Names, characters, dialogue, art and music in Tallyford are original. Never copy or imitate its sprites, text, music, or character names.

**Reference map — which source-game system each Tallyford system is modelled on:**

| Source system (Stardew Valley) | Tallyford equivalent | What changes |
| --- | --- | --- |
| Gold (g) | Marks (₥) | Minted partly from real agent results (§2) |
| Shipping bin, paid overnight | Ledger Bin, paid at 06:00 | Also receives agents' "shipped" task credits |
| Community Center bundles vs JojaMart buyout | Old Exchange charter halls vs Meridian Holdings buyout | One hall rewards safety hygiene, not risk |
| Junimos (helper spirits) | Tallies (abacus-bead spirits) | Appear only while the town's ledger is honest (§8) |
| Energy, 06:00–02:00 day | Vigor, 06:00–02:00 on the real clock | One Vigor budget per real day |
| Friendship hearts | Trust hearts (0–10, 250 points each) | Hearts with agents unlock lore, never permissions |
| Five skills, professions at 5 and 10 | Farming, Fishing, Foraging, Prospecting, Stewardship | Stewardship = managing the firm well and safely |
| Grandpa's evaluation, year 3 | The Founder's Audit, Year 3, Spring 1 | Scores stewardship alongside wealth |
| Perfection tracker | The Town Ledger (100%) | Includes onboarding every planned agent |
| The Mines / Skull Cavern | The Vault Below (30 floors) / the Deep Stacks | Peaceful mode available; lore pages instead of loot only |
| Traveling Cart | The Drifting Bazaar (Fri and Sun) | Sells rare seeds and Market Day access |
| Stardrop (+max energy) | Lantern Fruit (+34 max Vigor, 7 in the game) | Same shape |
| Help Wanted board / Special Orders | Noticeboard / Charter Commissions | Daily seeded quests / multi-step commissions |
| Fortune teller luck | The Morning Ledger newspaper | Daily luck −0.10…+0.10 |
| Nine festivals | Eight Tallyford festivals | Dates in §6 |

**Bridge rules the code must enforce (see §2 for the numbers and §10 for the checks):**

1. The game reads the existing event store and audit log; it never writes to them and never sends `control` or `permission_decision` events.
2. Game-layer packages have no import path to `apps/town-server/gateway` or `mayor/policy`. A dependency-cruiser rule fails CI if one appears.
3. Real metrics gate *eligibility* (a Tier 3 firm building needs Town Level 3); Marks pay for construction. Both are required; neither substitutes for the other.
4. No in-game number is ever shown as a real ticker, price or position. Agents' real reports appear in the game only as the same event text the dashboard already shows.

## 2. World overview: Tallyford

Tallyford is a river town at an old trading ford, and the player is its new Founder. Twenty years ago the Ledger Bank collapsed, the Old Exchange closed, and the town shrank to a square, a farm plot and a few stubborn shops. Meridian Holdings wants the empty lots; the player wants to prove a town can be rebuilt by honest work — the firm on the hill is that work.

**Time runs on the real clock.** The live agents cannot be fast-forwarded, so the town does not have a 20-minute day. Instead:

1. **Ambient clock** = real local time. Day/night, NPC schedules, shop hours and agent positions follow it. The town is awake 06:00–02:00; between 02:00 and 06:00 only agents' lit windows and the night watch move.
2. **Day tick** at 00:00 local: crops grow, forage respawns, luck rerolls, the Noticeboard refreshes, save snapshot.
3. **Vigor** refills to max at 06:00. One Vigor budget per real day (§6) makes Agent Town a game you check in on daily — a session of 15–40 minutes, then the town keeps living.
4. **Seasons** last 28 real days from the town's founding date (Spring 1 = the day the save is created); four seasons = one 112-day year. A config flag `seasons.follow_real_calendar` maps them to real seasons instead.
5. **Sim Season (optional, Phase 9):** a sandbox mode that runs the mock agent fleet on a 20-minute compressed day for testing and for players who want a session-style game. Real agents never run in this mode.

**Marks (₥) — the town currency.** Marks buy seeds, tools, buildings, decor and charter progress. They come from four sources, in this priority order for tuning:

| Source | Rule | Default cap |
| --- | --- | --- |
| Dividend (real bridge) | At the Mayor's daily summary time, Treasury mints ₥ = clamp(realized P&L in USD × `bridge.rate`, 0, cap). Loss days mint 0 and start rain over the firm | rate 1.0, cap 2,000 ₥/day |
| Task credits (real bridge) | Non-trading agents mint `marks_per_unit` per completed task from their manifest `metrics` | 500 ₥/agent/day |
| Ledger Bin | Crops, fish, forage, ore and artisan goods sell at 06:00 at base × quality (1 / 1.25 / 1.5 / 2) | none |
| Play | Quests, festivals, mini-games, Market Day | per activity (§6, §7) |

All bridge numbers live in `/config/bridge.yaml` and can be set to 0 to run the game layer with no real link at all.

**Zones and buildings (Year 1 map, 96×64 tiles):**

| Zone | Contents | Unlock |
| --- | --- | --- |
| Riverside Plot | Founder's Cottage, 12×12 farmable area (grows to 24×20), Ledger Bin, well | Start |
| Town Square | Town Hall (Mayor's office, Records), Ocampo & Daughter general store, The Counting House tavern (arcade upstairs), clinic | Start |
| Firm Hill | The Trading Firm building (§1) and 5 empty business lots | Start; lots open by Town Level |
| The Old Exchange | Six charter halls (§6), Vault entrance in the cellar | Start (locked doors open by quest) |
| The Ford and Docks | Fishing, Ansel's ferry, Drifting Bazaar berth, Lantern Drift site | Start |
| Okonkwo Ranch | Animals, feed, Wren's cottage | Start |
| The Mill Lot | Contested lot; becomes Meridian Depot if not bought by Fall 20, Year 1 | Buy for 15,000 ₥ |
| Far Bank | Second fishing zone, orchard land | Anglers' Hall reward |
| The Highlands | Overlook, second farm plot, Lantern Fruit tree | Vault of Marks reward |

Existing rules from §7 still drive lots, roads and building tiers; this map only says where they sit.

## 3. Character creation and the Resident → Employee → Agent pipeline

A player-made character starts as a scripted resident, can be hired into a business as a simulated employee, and can be awakened into a real agent by adding a model endpoint — the same Character Card V2 file travels through all three states. This is the RPG spine of the game: the town is populated by people the player designed, and the best of them go to work for real.

[Diagram in the source doc, not exported: character pipeline · 4 states, 3 gates, 1 way back]

Hire and Awaken are the two gates the player passes; Awaken is the only one that runs Mayor validation, and Retire is the only way back.

**The Character Creator ("the Registry", inside Town Hall).** A six-step React wizard that writes one card and one sprite recipe:

1. **Look** — layered 16×32 sprite: body (6 skin tones), hair (24 styles, any palette), eyes, top, bottom, shoes, accessory (hat, glasses, headset, apron). Live preview walking in all four directions. A 64×64 portrait is auto-composed from the same layers as an instant placeholder; a Midjourney portrait can replace it later through the §8 batch.
2. **Persona** — the V2 fields, asked as questions: name and nickname; description (three sentences: who they are, how they look, one telling habit); personality as five traits plus one flaw; scenario ("what are they doing in Tallyford?"); first message; three example exchanges; three catchphrases; voice style (dry, warm, cocky, precise, gentle).
3. **Origin** — one of five, each with a starting bonus and a personal quest: Ledger Clerk (+1 Stewardship, quest "The Missing Column"), Orchard Kid (+1 Farming, "Grandma's Grafts"), River Rat (+1 Fishing, "The Ford at Midnight"), City Analyst (+1 Stewardship, +200 ₥, "Second Opinion"), Vault Runner (+1 Prospecting, "Floor Thirteen").
4. **Home** — a cottage lot (first two are free; more cost 4,000 ₥ through the Carpenter).
5. **Work** — none (they live in town), or apprentice at a business (a desk, no autonomy).
6. **Review** — the card JSON is shown in full; the player can edit it by hand, export the PNG card, or import an existing SillyTavern card here instead of using the wizard.

**State 1 — Resident.** Scripted, no model. Walks a schedule template chosen by origin and job, talks from a generated daily-line set built from the card's personality and example dialogue (every generated line is tagged `flavor`, see §5.5), accepts gifts, gains Trust hearts, and can carry player-assigned chores (water the plot, deliver an item) for small Marks. The player can switch control to any resident from the cottage bed ("visit as"), which is how the player lives in town as more than one person.

**State 2 — Employee ("Hire").** The player assigns the resident to a business at the Carpenter's desk-placement screen. The character gets a desk, appears in the org chart under the Mayor, and is played by `packages/sim` with the manifest fields still empty. The dashboard shows the desk as **Simulated** in grey; nothing they do reaches the real gateway. Purpose: stage the office, test schedules and comment tone before a real agent exists.

**State 3 — Agent ("Awaken").** The Welcome Wagon (§9.6) opens pre-filled with the card and asks only for the operational fields: task role, model and endpoint, risk profile, stake or task allocation, limits and permissions. Validation runs the §6.3 rules (allocation total ≤ 100%, every limit set, endpoint reachable, signed Agent Card). The Mayor's Awakening ceremony plays (§8), the card is written to `/agents/<id>.card.json`, and the desk turns live. Cost in-game: 0 ₥ — promotion is never gated by play.

**Continuity of lore.** On promotion the game writes `extensions.agent_town.lore`:

```json
"lore": {
  "origin": "City Analyst",
  "joined": "Year 1, Spring 9",
  "skills": { "stewardship": 4, "fishing": 2 },
  "trust_hearts": { "hollis": 6, "mayor": 4, "pip": 8 },
  "quests_done": ["Second Opinion", "Frost Derby 2nd place"],
  "memories": ["Lost the Fall fair to Nell's jam and took it well"]
}
```

The adapter SDK exposes `lore` and `creator_notes` to the agent builder as optional persona context; the UI still never edits `system_prompt`. This is how a resident the player has known for a season keeps the same voice when a real model takes over.

**Retire.** An agent can be retired back to Resident from its card. The endpoint and operational fields are removed, the lore block stays, and the character goes home. Retiring is an audit-log event and requires the same typed confirmation as a limit change.

**Rules that keep the pipeline safe.** Game state never writes any operational field; the wizard's persona fields cannot contain URLs or tool names (rejected at validation); a resident's schedule, hearts or skills have no effect on the manifest beyond the `lore` block; promotion always goes through Mayor validation, exactly as a manifest dropped into `/agents/` does.

## 4. Game Developer / Programmer

The game layer is a second set of server modules and Phaser scenes beside the existing dashboard code, sharing its database, event stream and React shell; the server is authoritative for every game rule, and the client only renders and asks. Add three packages: `packages/game-data` (all JSON/YAML tables below), `packages/game-core` (pure TypeScript rules, no I/O, 100% unit-testable), and `packages/save-migrations`.

[Diagram in the source doc, not exported: game-layer architecture · client, server modules, storage, and the wall before the gateway]

Bridge is the only game module that touches dashboard data, and it only reads; Residents hands a validated card to the manifest registry, which is the one path into the real side; the red wall between the game modules and the gateway is the dependency-cruiser rule from §1.

**Movement and interaction.** The Founder (or the resident being visited) moves on the 16×16 grid with WASD/arrows, a touch joystick on mobile, and click-to-walk. Movement is tile-locked with 8-direction smoothing at 4 tiles/s (6 on paths); collision comes from a Tiled `collide` layer plus dynamic blockers (residents, animals, placed objects). NPCs and agents path with A\* (`easystarjs`) over the same grid, recomputed at most every 500 ms per character. Interaction = the tile the character faces plus E/Space; hold-to-repeat for watering. Depth-sort sprites by feet-y; use one `Phaser.GameObjects.Layer` per zone. Interiors are separate Tiled maps loaded into the existing `InteriorScene`.

**World clock and day tick (server).** `WorldClock` publishes `{realTime, dayIndex, season, seasonDay, year, phase}` every 60 s over the existing SSE stream. `DayTick` runs at 00:00 local inside one transaction: crop growth, forage and ore respawn, animal produce, luck reroll (`seed = hash(townSeed, dayIndex)`), Noticeboard regen, Ledger Bin payout scheduled for 06:00, decay of Trust, save snapshot. A missed tick (server down at midnight) is replayed on start, once per missed day, in order. Everything random uses the day seed so a replay renders the same day twice.

**Farming cycles.** A `FarmTile` row per farmable tile: `{x, y, state: untilled|tilled|planted, cropId, stage, daysInStage, watered, fertilizer, quality_seed}`. Growth advances at the day tick only if `watered` was true; sprinklers set `watered` at 06:00. Out-of-season crops die at the season change (except in the greenhouse). Harvest rolls quality from Farming level and fertilizer, yields per the crop table (§6), and resets regrowing crops to their regrow stage. Trees, animals and artisan machines follow the same daily-state pattern (`Machine {recipeId, insertedAt, readyAt}`).

**Inventory and items.** 36 slots (12 on the hotbar), stacks to 999, item definitions in `items.json` (`id, name, category, basePrice, edible?, vigor, sellable, stackable, icon`). Chests are `Container` entities with 36 slots. The Ledger Bin is a container whose contents are sold at 06:00. Shops are data (`shops.yaml`: stock per season, prices, restock rules). All inventory ops are server calls that return the new state; the client predicts and reconciles.

**NPC schedule engine.** One YAML per character (`schedules/<id>.yaml`): keyed by season and weekday with `time → {map, x, y, facing, anim}` waypoints, overridable by conditions (`rain`, `festival:<id>`, `hearts>=6`, `quest:<id>:done`, `town_level>=3`). Agents get schedules derived from live status: `working` → desk, `waiting` → Town Hall lobby bench, `idle` → tavern or plaza, `offline` → home, `error` → clinic (a joke the player will get). On tab reopen, characters teleport to where their schedule says they are now.

**Dialogue, quests, events.** Daily lines live in `dialogue/<id>.yaml` with the same condition language and `{{player}}`, `{{season}}`, `{{last_green_week}}` templating; heart events and story scenes are written in Ink (`inkjs`) for real branching. Quests are data (`quests/*.yaml`: type, giver, steps, conditions, rewards); a step type `observe` completes from a bridge fact ("the firm had a green week") without asking the player to do anything risky. Cutscenes use a tiny YAML DSL: `walk`, `say`, `emote`, `wait`, `camera`, `give`, `fade`. Every gift, talk and quest completion emits a `game_event` on the stream so the dashboard feed can show town life beside agent updates.

**Save files.** Server-authoritative, one `town` per save slot, up to 3 slots. Tables: `player`, `residents`, `farm_tiles`, `containers`, `machines`, `animals`, `npc_state` (hearts, gifts this week, last talked), `quests`, `charter`, `world` (dayIndex, season, weather, luck, townSeed), `achievements`, `arcade_scores`. Writes are a journal of game actions (`game_actions`) plus a nightly snapshot; recovery replays the journal after the last snapshot. `save_version` on every snapshot with forward-only migrations in `packages/save-migrations`; a migration test loads every historical fixture. Export/import as one JSON file (`pnpm town export --slot 1`). Sim Season saves are marked `sim: true` and never mint bridge Marks.

**Data file inventory (create all of these in `packages/game-data`):** `crops.json`, `items.json`, `fish.json`, `forage.json`, `ores.json`, `recipes.json` (cooking and crafting), `machines.json`, `animals.json`, `tools.json`, `buildings.json` (costs and tiers), `shops.yaml`, `charter.yaml`, `festivals.yaml`, `luck.yaml`, `skills.yaml` (XP curves, professions), `origins.yaml`, `schedules/*.yaml`, `dialogue/*.yaml`, `events/*.ink`, `quests/*.yaml`, `music.yaml`, `sfx.yaml`, `bridge.yaml`, `evolution.yaml` (from §7). Every file has a JSON Schema and a `pnpm data:lint` step.

**Performance and correctness.** The farm layer is a chunked `DynamicTilemapLayer` (32×32 chunks) and crops are one batched sprite per tile; NPC pathing is throttled; the day/night tint is one overlay plus light masks. Tests: `game-core` unit tests for every rule table; a 365-day headless simulation that asserts economy targets (§6); schedule validator (every waypoint reachable, no overlaps); dialogue linter (unreachable nodes, missing portraits, banned words); save-migration fixtures; the dependency-cruiser rule from §1; Playwright end-to-end tests for create-character → hire → awaken and for plant → water → harvest → Ledger Bin.

## 5. Pixel Artist

The art bible is 16×16 tiles, 16×32 characters, 64×64 portraits, one shared 48-colour warm palette, and a modular building kit — so the town can grow by adding pieces, not by redrawing. Two changes to §8.6: character sprites are 16×32 (not 16×24) so people stand two tiles tall against the buildings, and the master palette is 48 colours (not 32) because crops, seasons and the Vault need more hue range; portraits keep their own 32-colour subset per character.

**Style rules.**

1. Top-down 3/4 view, light from the upper left, one shade of shadow, selective 1-px dark outlines (outline the silhouette, not every interior edge).
2. Palette ramps of 4–5 steps per hue, hue-shifted toward orange in highlights and blue in shadows; no pure black or white.
3. Readability at 1× first: every character must be recognisable by silhouette and two colours; every crop stage must differ at a glance.
4. Seasons are palette swaps plus a few replacement tiles (leaves, snow caps), not new sets. Night is a single blue-violet overlay at 55% plus warm light masks.
5. UI is wood-panel with brass corners, 3-slice frames, and a 5×7 pixel font for HUD numbers; body text uses the licensed pixel font from §4.5 at 2× minimum.

**Character layering (feeds the Creator in §3).** All layers share one 16×32 frame grid and one anchor at the feet, drawn in a neutral grey ramp that a Phaser 4 palette-swap pipeline recolours at runtime, so a new resident needs no new sheet:

| Layer | Variants | Notes |
| --- | --- | --- |
| Body | 6 skin ramps, 2 builds | Includes hands for tool poses |
| Hair | 24 styles | Any ramp; hats hide the top 6 rows |
| Eyes | 8 | Two colours each |
| Top / bottom / shoes | 16 / 10 / 6 | Business-specific uniforms as presets |
| Accessory | 14 | Headset, glasses, apron, cord glasses, scarf, hat ×5, mug, clipboard |
| Portrait auto-compose | 1 per layer set | 64×64 bust composed from layer heads; replaced by a Midjourney portrait when one exists |

**Animation sets (frames per direction, 4 directions unless noted).**

| Set | Frames | Who |
| --- | --- | --- |
| Walk | 4 | Everyone |
| Idle breathe | 2 (one direction) | Everyone |
| Sit / work at desk | 2 loop + 1 type-burst | Agents, employees |
| Tool swing (hoe, can, axe, pick, rod cast) | 4 each | Founder, residents |
| Carry item | 4 walk | Founder, residents |
| Emote pops (heart, !, ?, zzz, gear, letter) | 3 each, drawn once | Everyone |
| Rest / sleep | 2 | Everyone |
| Agent extras: phone call, eureka, stretch | 4 / 3 / 3 | Agents only |
| Mayor: stamp, ring bell, adjust glasses | 4 / 4 / 2 | Mayor |

**Asset scope and budget (Year 1 content).**

| Category | Count | Detail |
| --- | --- | --- |
| Ground tiles | \~600 | 5 surfaces × 4 seasons, autotile sets (47-tile blob per surface), water edges, farm tilled/watered/fertilized |
| Nature | \~300 | 4 tree species × 4 seasons × 3 growth stages, stumps, 12 bushes, 20 rocks and ore nodes, 30 flowers, 24 forage items |
| Crops | 22 crops × 7 frames | 5 growth stages, ready, regrow or dead; plus seed packet and produce icons |
| Buildings (exterior) | 14 base × up to 4 tiers | Modular kit: base, roof, awning, second floor, sign, tier decorations; Meridian variants in grey-blue |
| Interiors | 26 maps | 3 firm departments, 5 business shells, Town Hall (3 rooms), tavern + arcade, store, smithy, clinic, ranch barn, 6 cottages, Old Exchange halls ×6, Vault floor kits ×3 |
| Props | \~250 | Desks (6 styles), monitors, ticker board, lamps, benches, fountain, stalls, crates, machines (keg, crock, press), animals (hen, goat, cow, sheep, cat, dog) |
| Characters | 16 NPCs + 12 agents + Creator layers | Full animation sets above |
| Portraits | 28 named characters × 6 expressions | Neutral, happy, sad, annoyed, surprised, smug |
| Items and UI icons | \~220 | 16×16, one outline weight |
| UI frames and widgets | \~40 | Panels, buttons, hearts, skill icons, Vigor bar, ₥ chip, stamp, letter, bell |
| Weather and FX | \~30 | Rain, snow, petals, leaves, fog, sparkles (Tallies), construction dust, lantern glow |
| Mini-game art | 4 kits | Fishing bar UI, arcade cabinet screens (8-colour sub-palettes), card faces (24), Market Day stall |

**Workflow.** Concepts, portraits and building silhouettes come from the §8 Midjourney batches; every final asset is finished by hand in Aseprite on the palette file (`palette.gpl` is the single source of truth). Maps are built in Tiled with autotile rules exported to JSON; atlases are packed by `pnpm art:process` (§8.6) per category. Naming extends §8.4: `char__<id>__<set>_<dir>.png`, `crop__<id>__s<stage>.png`, `bld__<id>__t<tier>__<part>.png`, `ui__<name>.png`, `fx__<name>.png`.

**Pixel QA checklist (`pnpm art:qa` fails on any of these):** off-grid pixels; colours outside the palette; orphan single pixels; silhouettes that touch the frame edge; inconsistent light direction (checked by shadow side); a crop stage identical to its neighbour; a portrait expression under 12 pixels different from neutral; any asset missing provenance.

**Accessibility.** Status over heads is shape plus colour; a high-contrast UI skin swaps wood panels for flat dark; the readable-font toggle (§10.4) also enlarges hit targets to 32 px on touch.

## 6. Game Designer

The loop is Stardew-shaped and tuned for one real day per game day: a 15–40 minute check-in that starts with the Mayor's briefing and ends at the Ledger Bin, a 28-day season that asks for a planting plan and a festival, and a Year 3 audit that scores stewardship as much as wealth. Every number below is a starting value in `packages/game-data`; the 365-day headless simulation (§4) must hit the income targets at the end of this section before any tuning is called done.

**Daily loop (real 06:00–02:00).**

1. 06:00 — Vigor refills, Ledger Bin pays out, the Morning Ledger sets today's luck, the Mayor's briefing is pinned to the Town Crier.
2. Chores — water and harvest, feed animals, collect from machines (each 2 Vigor per tile or action).
3. Town — read agent updates, clear the permission inbox (no game reward), talk to neighbours, give up to 2 gifts per person per week, take a Noticeboard quest.
4. Choice — one main activity: fish, descend the Vault, forage the Highlands, an arcade run, or a Charter Commission step.
5. Evening — visit the tavern (meal restores 50 Vigor, once a day, 60 ₥), sell in the Ledger Bin, plan tomorrow.

**Seasonal loop (28 days):** Day 1 buy the season's seeds; Days 1–3 plant; one or two festivals; the Drifting Bazaar every Friday and Sunday; season-end review letter from the Mayor with the firm's real month beside the farm's.

**Yearly loop:** Year 1 = learn the town and open the Old Exchange; Year 2 = restore or sell the charter; Year 3, Spring 1 = the Founder's Audit; after that, the Deep Stacks, the Town Ledger and Prestige.

**Vigor.** Max 270 (+34 per Lantern Fruit, 7 in the game). Costs: hoe, water, chop, pick 2 each (−0.1 per level of the matching skill); rod cast 8; each Vault floor 6; arcade, festivals, Market Day 0. At 0 Vigor the character is *winded*: walking and talking only until 06:00. No pass-out penalty and no lost Marks.

**Skills and professions.** Five skills, levels 1–10, cumulative XP 100 · 300 · 600 · 1,000 · 1,600 · 2,500 · 3,800 · 5,600 · 8,200 · 12,000. A profession choice at 5 and a specialisation at 10:

| Skill | XP from | Level 5 choice | Level 10 specialisation |
| --- | --- | --- | --- |
| Farming | Harvests, animal produce, machines | Grower (+10% crop value) / Keeper (animal goods +20%) | Distiller (artisan +40%) or Greenhand (crops grow 10% faster) / Shepherd (produce daily) or Creamery (dairy +30%) |
| Fishing | Catches, treasure | Angler (+25% price) / Tackler (catch bar 20% larger) | Pelagic (+50% price) or Treasure Hunter (treasure ×2) / Steady Hand (fish escape 30% slower) or Netter (fish traps) |
| Foraging | Forage, wood, Highlands finds | Gatherer (20% double forage) / Woodsman (+25% wood) | Botanist (forage always gold) or Tracker (forage shown on minimap) / Lumberjack (hardwood from any tree) or Charcoal (coal from wood) |
| Prospecting | Ore, gems, floors, ledger pages | Miner (+1 ore per node) / Geologist (gems in pairs) | Delver (ladders +15%) or Assayer (ore value +25%) / Gemcutter (gems +30%) or Archivist (ledger pages ×2) |
| Stewardship | Reading briefings (10/day), agent quests, onboarding (200), curfew drill (100/week), audit export (25/week), festival stall, Market Day | Clerk (briefing shows each agent's next-24h plan) / Auditor (Records gets filters and charts) | Chancellor (weekly forecast newsletter; second Ledger payout at 18:00) or Registrar (residents' chores earn +50%) / Quartermaster (desk decor −25%) or Curator (office decor unlocks) |

No Stewardship XP is ever granted for approving or rejecting a request, and no profession changes a limit, tier or permission.

**Crops (Ledger Bin base prices; ₥/day = profit per tile over one 28-day season with replanting).**

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
| Summer–Fall | Sunflower (seeds as by-product) | 30 | 80 | 8 | — | 6.3 |
| Summer | Sunfruit (Bazaar only) | 380 | 720 | 13 | — | 26.2 |
| Fall | Aubergine | 22 | 62 | 5 | 5 | 10.3 |
| Fall | Fennel | 45 | 120 | 8 | — | 9.4 |
| Fall | Sweet Potato | 60 | 150 | 9 | — | 10.0 |
| Fall | Grape | 65 | 85 | 10 | 3 | 15.9 |
| Fall | Pumpkin | 95 | 300 | 13 | — | 15.8 |
| Fall | Bog Cranberry (2 per harvest) | 230 | 80 | 7 | 5 | 20.4 |
| Winter / greenhouse | Frostroot (Bazaar only) | 90 | 210 | 10 | — | 12.0 |
| Greenhouse | Ember Vine (Vault reward) | 600 | 550 | 28 | 7 | 19.6 (year-round) |

Quality multiplies sell price ×1 / ×1.25 / ×1.5 / ×2. Winter has no outdoor crops; winter forage and the greenhouse carry the season.

**Animals and artisan goods.**

| Item | Source | Cost or input | Output | Time |
| --- | --- | --- | --- | --- |
| Hen | Ranch, needs Coop | 400 ₥ | Egg 50 ₥/day | daily |
| Cow | Ranch, needs Barn | 1,500 ₥ | Milk 125 ₥/day | daily |
| Goat | Ranch, needs Barn | 2,000 ₥ | Goat milk 225 ₥ | every 2 days |
| Sheep | Ranch, needs Big Barn | 4,000 ₥ | Wool 340 ₥ | every 3 days |
| Keg | Crafted | fruit / vegetable | Wine 3× base / juice 2.25× | 7 days / 4 days |
| Preserves Crock | Crafted | fruit / vegetable | Jam or pickles 2× base + 50 | 3 days |
| Cheese Press | Crafted | milk | Cheese 230 ₥ (goat 400) | 4 hours |
| Oil Press | Crafted | sunflower seeds | Oil 100 ₥ | 6 hours |
| Loom | Crafted | wool | Cloth 470 ₥ | 4 hours |
| Bee Hut | Crafted | flowers nearby | Honey 100 ₥ (+50 with flowers) | 4 days |

**Fish.** 30 species across the Ford, Far Bank, Highlands lake and Vault pool, keyed to season, weather and time, difficulty 15–100, sell 30–400 ₥, plus 5 legendary fish (difficulty 100, 3,000–8,000 ₥, one catch each — the first is *The Auditor*, a catfish at the Ford after 01:00 on a luck day). Examples: Ford Minnow (any, 15, 30 ₥), Copper Perch (spring–fall, 30, 55 ₥), Ledger Carp (Far Bank, rain, 40, 70 ₥), Amber Bream (docks, sunny summer, 35, 90 ₥), Night Eel (Ford, summer night, 65, 180 ₥), Frost Trout (Frost Derby, 55, 150 ₥), Ghost Pike (Vault pool, winter, 80, 400 ₥).

**Ore and the Vault.** Copper (floors 1–10, 12 ₥), Iron (11–20, 24 ₥), Gold (21–30, 60 ₥), Sterling (Deep Stacks, 150 ₥); gems Quartz 25, Amber 80, Garnet 120, Aquamarine 180, Moonstone 300 ₥; one *Old Ledger page* (lore, §8) every 3 floors. Furnace: 5 ore + 1 coal → 1 bar.

**Tools (the Smith) and buildings (the Carpenter).**

| Purchase | Cost | Materials | Effect / gate |
| --- | --- | --- | --- |
| Copper tools | 2,000 ₥ each | 5 copper bars | Water/hoe a 3-tile line |
| Iron tools | 5,000 ₥ | 5 iron bars | 5-tile line, hardwood chopping |
| Gold tools | 10,000 ₥ | 5 gold bars | 3×3 area |
| Sterling tools | 25,000 ₥ | 5 sterling bars | 6×3 line or 5×5 area; needs Prospectors' Hall |
| Cottage upgrade 1 | 10,000 ₥ | 450 wood | Kitchen: cooking recipes |
| Cottage upgrade 2 | 50,000 ₥ | 150 hardwood | Second floor, aging cellar (casks ×2 value over 28 days) |
| Coop / Big Coop | 4,000 / 10,000 ₥ | 300 wood, 100 stone | 4 / 8 hens |
| Barn / Big Barn | 6,000 / 12,000 ₥ | 350 wood, 150 stone | 4 / 8 animals; sheep need Big Barn |
| Silo, Well, Fish Pond | 100 / 1,000 / 5,000 ₥ | stone, copper | Hay storage, water, fish roe |
| Resident cottage | 4,000 ₥ | 200 wood | A home for a created character (first two free) |
| The Mill Lot | 15,000 ₥ | — | Blocks Meridian Depot if bought by Fall 20, Year 1 |
| Business building Tier 1 / 2 / 3 / 4 | 5,000 / 25,000 / 100,000 / 250,000 ₥ | wood, stone, bars | Also needs the §7 real gate (Town Level and 30-day results) |
| Desk and office decor | 500–5,000 ₥ | — | Cosmetic; lit by hearts with the agent |

**The Town Charter — the Old Exchange's six halls.** Each hall holds 3–5 ledgers; a ledger is completed by placing the listed items (or, in the Stewards' Hall, by facts from the audit log). Completing a hall plays a Tallies scene and grants the reward.

| Hall | Ledgers (examples) | Reward |
| --- | --- | --- |
| Growers' Hall | Spring crops ×4, Summer crops ×4, Fall crops ×4, one gold-quality of each, 5 artisan goods | Greenhouse (any crop, any season) |
| Anglers' Hall | River fish ×4, night fish ×3, rain fish ×3, a Frost Derby trout | Ferry to the Far Bank; Drifting Bazaar docks weekly |
| Prospectors' Hall | 20 copper, 20 iron, 10 gold, 5 gems, 3 Old Ledger pages | Vault elevator (every 5 floors); Sterling tools at the Smith |
| Artisans' Hall | Jam, wine, cheese, cloth, honey, a cooked dish of each season | Market Square stalls (festival stall unlock); Nell opens the bakery |
| Stewards' Hall | Onboard an agent; read 20 briefings; run 4 curfew drills; export the audit log 4 weeks running; every agent manifest has all limits set | Town Hall bell tower (curfew bell rings town-wide); the Tallies' lanterns light the streets at night |
| Vault of Marks | 2,500 ₥, 5,000 ₥, 10,000 ₥, 25,000 ₥ | Tram to the Highlands; the Founder's Statue |

All six halls → *Charter Restored*: Meridian leaves, the Old Exchange reopens as a grand market hall, the Tallies hold a festival. **The Meridian path:** a Meridian Membership (8,000 ₥) lets the player buy each reward instead — Greenhouse 35,000, Ferry 20,000, Elevator 15,000, Stalls 30,000, Bell tower 10,000, Tram 40,000 ₥. Both paths reach the same features; Meridian Town has grey-blue buildings, no Tallies, and a different ending (§8).

**Festival calendar (28-day seasons).**

| Date | Festival | Activity | Prizes |
| --- | --- | --- | --- |
| Spring 12 | Seed Fair | Seed Scramble (find 12 hidden seed packets in 60 s); Cloudberry seeds on sale | Cloudberry seeds, straw hat, +1 heart with all attendees |
| Spring 24 | Blossom Waltz | Ask a 4-heart friend to dance; flower crown crafting | Blossom recipe, decor |
| Summer 11 | Founders' Picnic | Communal Stew judged by the Mayor and Sterling; bring one ingredient | Rare seeds, a Meridian sneer or a Mayor's toast |
| Summer 28 | Lantern Drift | Float paper lanterns at the Ford; the Tallies appear if the town's ledger is honest | Lantern decor, Tallies sighting |
| Fall 16 | Tallyford Fair | Market Stall display (scored on variety and quality), Ring Toss, Coin Wheel arcade, fortune teller | Fair tokens for a rare item, Lantern Fruit (first win) |
| Fall 27 | Hollow Night | Hedge maze with a spooky Vault floor at the end | Costume, Ghost Pike bait |
| Winter 8 | Frost Derby | Ice fishing contest, 3 minutes, most fish | Frost Trout, heavy coat, Anglers' ledger item |
| Winter 25 | Ledger's Eve | Secret gift exchange; the Mayor's year-in-review with the firm's real year beside the farm's | Gift, hearts, the Founder's letter |

**Trust hearts.** 0–10, 250 points each. Talk +20/day; gifts 2/week — loved +80, liked +45, neutral +20, disliked −20, hated −40, ×8 on a birthday; −2/day when not spoken to, until 10 hearts. Gates: 2 → backstory page and a loved-gift hint; 4 → custom greeting; 6 → heart event; 8 → the character's personal quest; 10 → portrait frame, a dedicated line set, and a recipe (NPCs). For live agents the same gates unlock lore, greeting lines, an office-hours chat (read-only, flavour) and a personal quest — never a limit or permission.

**Luck.** The Morning Ledger headline maps to today's luck (−0.10 … +0.10): double-forage chance, gem and treasure chance, ore per node, and how often Tallies show themselves. Luck never affects anything on the real side.

**NPC schedule examples (weekday, spring, no rain).**

| Time | Roz (Carpenter) | Hollis (tavern) | Sterling (Meridian) |
| --- | --- | --- | --- |
| 06:00 | Workshop | Cottage | Meridian office (Mill Lot or Town Square rental) |
| 09:00 | Counter, open for orders | Counting House kitchen | Town Hall lobby, waiting for the Mayor |
| 12:00 | Lunch on the Firm Hill bench | Bar open | Lunch at the tavern, alone |
| 15:00 | Job site (whatever is being built) | Bar | Firm Hill, counting windows |
| 18:00 | Tavern | Bar | Tavern, corner table |
| 21:00 | Home | Closes 00:00, then home | Home |

Rain: Roz stays in the workshop, Sterling stays in his office, Hollis opens early. Festivals override everything.

**The Founder's Audit (Year 3, Spring 1, 21 points).**

| Criterion | Points |
| --- | --- |
| Lifetime Marks earned: 25k / 50k / 100k / 200k | 1 / 2 / 3 / 4 |
| Charter halls: all six (or Meridian complete) | 3 (or 2) |
| Trust: 5 characters at 8+ hearts / 10 characters | 1 / 2 |
| Skill levels total: 30 / 50 | 1 / 2 |
| Cottage upgrade 2; every Firm Hill lot built | 1; 1 |
| Agents onboarded: 12 / 20 | 1 / 2 |
| Vault floor 30 reached | 1 |
| The Mill Lot owned | 1 |
| All eight festivals attended in one year | 1 |
| Lantern Fruit collected: 3+ | 1 |

Lanterns lit at the Exchange steps: 1 (≤6 points), 2 (7–11), 3 (12–17), 4 (18–21). Four lanterns grant a Lantern Fruit, the Founder's Statue and Prestige (found a second town on a new map with the same agents).

**The Town Ledger (100%):** ship every crop and artisan good, catch every fish, cook every recipe, max every skill, 10 hearts with every character, reach Vault floor 30 and Deep Stacks 50, complete the charter or Meridian path, attend every festival, own every building, collect all 7 Lantern Fruit, onboard every agent on the firm's original roster of 12. Reward: the Town Clock on the square, and a gold nameplate on the Founder's Cottage.

**Income targets the simulation must hit (median of 20 seeded runs, no bridge Marks):** Year 1 Spring 4,000–7,000 ₥, Summer 15,000–25,000 ₥, Fall 30,000–50,000 ₥, Winter 8,000–15,000 ₥; Year 2 three times Year 1; Charter Restored reachable by Year 2 Fall with normal play; Founder's Audit at 3 lanterns for a player who does every festival and half the Vault.

## 7. Mini-games

Nine mini-games, each its own Phaser scene with one input, one score and one reward table; none of them touches the real side, and none of them is about approvals. Every game has a `peaceful` flag, keyboard and touch controls, and a pause on tab blur.

| Game | Where | Input | Rewards | Vigor | Skill XP |
| --- | --- | --- | --- | --- | --- |
| Fishing | Any water | Hold to raise the catch bar | Fish, treasure crates | 8 per cast | Fishing |
| The Vault Below | Old Exchange cellar | Walk, swing, ladder | Ore, gems, Old Ledger pages | 6 per floor | Prospecting |
| Paper Plane Post | Arcade cabinet 1 | One button (flap) | Arcade tokens, hi-score board | 0 | — |
| Bean Counter | Arcade cabinet 2 | Left/right, drop | Arcade tokens | 0 | — |
| Tallyman's Gambit | Tavern back table | Pick a card | Marks, marked-card collectibles | 0 | Stewardship (small) |
| Market Day | Drifting Bazaar (Fri, Sun) | Buy/sell over 5 rounds | Marks (capped), Bazaar coupons | 0 | Stewardship |
| Seed Scramble | Seed Fair | Walk and grab | Cloudberry seeds, hat | 0 | Foraging |
| Frost Derby | Winter 8 | Fishing, timed | Frost Trout, coat | 0 | Fishing |
| Ring Toss and Coin Wheel | Tallyford Fair | Timing / stop the wheel | Fair tokens | 0 | — |
| Crane Claw | Arcade corner | Move, drop | Decor items | 0 | — |

**Fishing.** Cast, wait 1–10 s (shorter with bait), then a 4-second bite window. In the catch minigame a green bar rises while the button is held and falls under gravity; the fish icon moves by behaviour — *darter* (sudden jumps), *drifter* (slow sine), *sinker* (pulls down), *floater* (pulls up), *mixed* above difficulty 70. The catch meter fills while the fish is inside the bar and drains outside it; a perfect catch (never left the bar) gives +1 quality and double XP. Treasure crates appear at 15% (×2 with the profession) and must be held alongside the fish. Bar size: 96 px base, +16 per rod tier, +20% Tackler. Fish difficulty scales the icon's speed; legendary fish add a second, faster icon for the last 20%.

**The Vault Below.** 30 floors in three biomes of 10 (Copper Stacks, Iron Archives, Gilded Reading Room), a ladder hidden under one rock per floor, a shaft (skip 3–8 floors) at 5%, and the elevator every 5 floors after the Prospectors' Hall. Peaceful mode: hazards only — collapsing shelves, dust clouds that blind for 2 s, gusts that push. Standard mode adds light combat with auto-swing and 3 hearts: Dust Wisps (1 hit), Ink Slimes (2 hits, leave puddles), Moth Swarms (dodge). Losing all hearts sends the character home with 10% of carried ore lost, never Marks. The Deep Stacks open below floor 30: endless, Sterling ore, Moonstones, and a lore page every 5 floors that tells the Ledger Bank story (§8).

**Paper Plane Post (arcade).** An endless side-scroller across the trading floor: the player is a paper plane carrying a letter between desks, one button to flap, dodging coffee mugs, spinning chairs and stacks of tickets. Score = desks passed; every 10 desks the floor speeds up by 8%. Hi-score board is shared across the town's saves; a top-3 score earns 5 arcade tokens (tokens buy decor from Nell's counter).

**Bean Counter (arcade).** Abacus beads fall in three colours; slide the falling bead left or right so a column totals exactly 10, which clears it. Columns that overflow lock. Speed rises every 20 clears. Score = beads cleared; a 50-bead chain awards the *Golden Abacus* decor.

**Tallyman's Gambit (tavern).** A two-player trick-taking micro-game against Hollis on a 24-card deck (four suits — Coins, Ledgers, Keys, Lanterns — ranks 1–6). Six tricks; a Lantern beats any suit once per hand; the player wins the hand by taking 4 tricks. Entry 20 ₥, win 60 ₥, one game per day; a win at 5-hearts-plus with Hollis has a 10% chance of a marked card (12 collectibles, one hidden lore line each). Hollis's AI is a fixed strategy, not a model.

**Market Day.** When the Bazaar docks, Madame Quillon runs a five-round trading game in fictional goods — Saffron, Amber, Salt, Silk, Ink — with prices moved by a rumour card each round. Start with 300 ₥ of stake from Quillon (not the player's Marks); keep any profit up to 500 ₥ and a Bazaar coupon (10% off rare seeds) for finishing above 450. Losses cost nothing. This is a puzzle about reading rumours; the code must never use real market data, tickers or the firm's numbers.

**Seed Scramble.** Sixty seconds; 12 seed packets are hidden around the square using the day seed; residents and NPC kids compete. Ten or more packets wins the straw hat.

**Frost Derby.** Three minutes of ice fishing on the frozen Ford with a fixed 60-px bar; each catch scores by difficulty; three prize tiers. Ties go to the earliest last catch.

**Ring Toss and Coin Wheel.** Ring Toss is a timing bar with a moving sweet spot (3 throws per token). Coin Wheel is a stop-the-wheel game with visible odds, paid only in fair tokens; no Marks are wagered, and tokens have no cash value.

**Crane Claw.** A four-second timed drop over a pit of decor items; the claw's grip strength is fixed at 60% and shown on screen so it never feels rigged.

**Anti-patterns the coding agent must refuse to build even if asked later:** an "approval sprint" or any timer, streak or score around permission decisions; a mini-game that reads real P&L, positions or agent events; gambling with Marks beyond the fixed-entry card game; a loot mechanic whose odds are hidden; anything that raises an agent's limits or tier as a prize.

## 8. Writer

Tallyford's story is about a town that once counted everything except what mattered, and a Founder who rebuilds it by keeping an honest ledger — which is also, quietly, the story of running an AI firm well. All characters, names and lines below are original; write every NPC in one voice each, and keep the tone dry, warm and specific.

**Backstory.** The Old Exchange was Tallyford's heart: merchants crossed the ford, and clerks tallied goods on the Exchange steps with bead-strings — the Tallies are those bead-strings' spirits, or so Nana O says. Twenty years ago the Ledger Bank, run out of the Exchange, collapsed; the board blamed a clerk, Marguerite Tally, and the town emptied. Marguerite spent the rest of her life proving the books had been cooked from above. She died last winter and left her great-niece or great-nephew — the player — the Founder's Cottage and one line: *"Count what matters, and the town will count on you."* The proof she found is in the Deep Stacks, one Old Ledger page at a time.

**The Mayor, Beatrix Ashgrove (58).** Round spectacles, green waistcoat, pocket watch, a stamp she uses for punctuation. Dry warmth; rules are how she is kind; says "Noted." to bad news and "Stamped." to good. Believes a town is a ledger of promises. Her persona card is shipped in the repo with these example lines: *"Rex wants to double his position. I want a lot of things. Neither of us is getting them before lunch."* — *"You can build fast or you can build here. I only stamp one of those."* She never jokes about a blocked action, only about herself. The Mayor is the only character who reads the audit log aloud, and she cites event IDs like scripture.

**The cast.**

| Character | Role, age | Home | Hook | Loves | Birthday |
| --- | --- | --- | --- | --- | --- |
| Fennimore Quist | Town Clerk, 44 | Town Hall attic | Runs Records; fussy, exact, secretly the funniest person in town | Ink, Old Ledger pages | Winter 19 |
| Rosalind "Roz" Bellweather | Carpenter, 39 | Workshop, Town Square | Blunt, sawdust everywhere, builds every upgrade; single mother of Pip | Maple syrup, hardwood | Spring 6 |
| Pip Bellweather | Kid, 8 | With Roz | Draws the agents as superheroes; runs the *Pip's Comics* quests | Radishes, crayons | Spring 15 |
| Tobiah Kettle | Smith, 51 | Smithy | Speaks more to the forge than to people; upgrades tools | Geodes, coal | Summer 17 |
| Marisol Ocampo | General store, 47 | Above the store | Warm, informed, keeps the town's news; refuses Meridian's stock deal | Chili jam | Spring 20 |
| Nell Ocampo | Arcade keeper, 17 | Above the store | Wants the city; bakes when nobody watches; opens the bakery after the Artisans' Hall | Arcade tokens, cinnamon rolls | Fall 9 |
| Ansel Brook | Fisherman, ferryman, 66 | Dock hut | Superstitious about *The Auditor*; runs the ferry after the Anglers' Hall | Smoked eel | Summer 2 |
| Dr. Ines Varga | Clinic and vet, 42 | Clinic | Dry, precise; treats hens and, in the joke the town shares, erroring agents | Honey, bilberries | Winter 4 |
| Hollis Penrose | Tavern keeper, 60 | The Counting House | Ex-trader ruined in the collapse; mentors Stewardship; sees himself in the firm's traders | Sweet potato pie, a good story | Winter 25 |
| Sterling Vance | Meridian Holdings rep, 35 | Rented office | Slick, tidy, believes efficiency saves towns; grew up in one Meridian "saved" | Espresso; dislikes handmade gifts until 6 hearts | Spring 28 |
| Wren Okonkwo | Rancher, 29 | Ranch cottage | Sings to animals; twin lambs; sells feed and animals | Goat cheese, sunflowers | Summer 23 |
| Bram Okonkwo | Courier, 31 | Ranch cottage | Carries the letters between buildings on foot; when he is off shift the letters fly themselves | Sweetcorn | Fall 1 |
| Nana Oyelaran ("Nana O") | Elder, 81 | Cottage by the Exchange | Marguerite's friend and the last Exchange clerk; keeper of the Tallies' lore; gives charter quests | Leek soup, old coins | Fall 21 |
| Constable Ada Ferrers | Night watch, 33 | Town Hall side room | The only person awake 02:00–06:00; the agents' night shift is her company | Coffee, Night Eel | Winter 12 |
| Madame Quillon | Bazaar merchant | Visits Fri and Sun | Enigmatic; rare seeds; runs Market Day; knows more about Marguerite than she says | Moonstone | none |
| The Tallies (Bead, Knot, Notch, Tick) | Spirits | The Exchange | Non-speaking; chime; visible only while the town's ledger is honest | Lantern light | — |

**Three heart-event arcs written in full (the rest follow the same five-beat shape).**

1. **Hollis (2/4/6/8/10):** 2 — he pours the player a drink and names the year the bank fell; 4 — he shows the framed trade ticket he never filed; 6 — a Ledger's Eve memory: he watches the firm's windows and admits the traders scare him and he is proud of them; 8 — quest *The Sure Thing*: find the ticket's twin in the Deep Stacks, which proves he was not the reckless one; 10 — he retires the ticket, hands the player the Counting House card table, and the marked cards start appearing.
2. **Sterling (2/4/6/8/10):** 2 — the pitch, polished; 4 — a slip: his hometown's name; 6 — rain, tavern, he admits Meridian's "rescue" closed the school he learned to read in; 8 — quest *Two Ledgers*: he asks the player to show him the audit log, and reads it the way the Mayor does; 10 — on the Charter path he resigns and stays as the Exchange's book-keeper; on the Meridian path he stays regional manager and the friendship survives, colder.
3. **Nana O (2/4/6/8/10):** 2 — she teaches the player to see a Tally; 4 — Marguerite's second letter; 6 — the Exchange steps at dawn and the beads that still count; 8 — quest *The Last Column*: recover Marguerite's final page from Deep Stacks 40; 10 — the Founder's Audit gains a fourth voice, hers.

Live agents get an 8-heart personal quest generated from their card: the quest giver line comes from `mes_example`, the objective is a town task (a fish, a dish, a Vault page), never a real action. Rex's shipped example is *The Chart That Lied*: bring him the Ghost Pike and he tells the story of the one setup he did not take.

**Story plot.**

1. **Act I — Keys to the Cottage (Year 1, Spring).** Arrival; the Mayor's tour; the firm on the hill introduced as "the people who moved in before you"; Sterling's first offer for the Mill Lot; Nana O opens the Old Exchange's front hall and the first Tally shows itself when the player ships their first harvest honestly; Hollis's warning about fast money.
2. **Act II — The Counting (Summer Year 1 to Fall Year 2).** Charter halls restore one by one, each with a Tallies scene; the Mill Lot deadline (Fall 20) decides whether Meridian Depot rises; agents' personal quests open at 8 hearts; the Deep Stacks pages reveal the collapse was the board's doing; Sterling's arc turns; the Blossom Waltz, Lantern Drift and Fair carry the town's mood.
3. **Act III — The Reckoning (Fall Year 2 to Spring Year 3).** Either *Charter Restored* (the Exchange reopens, the Tallies' festival, Meridian leaves, Sterling stays) or *Meridian Town* (efficient, grey-blue, quieter, Nana O's last scene on the steps); then the Founder's Audit at dawn on Spring 1, delivered by the Mayor, Hollis and Nana O; afterwards the Deep Stacks, the Town Ledger and Prestige.

**Story beats triggered by the real bridge (deterministic, never risk-inducing).**

| Trigger | Scene |
| --- | --- |
| First green week | Hollis raises a glass at the tavern; the Tallies chime once |
| First blocked action | The Mayor walks the player through the Records room: "This is what a town looks like when it keeps its promises." |
| First permission left to expire | Bram delivers an unopened letter back; Fennimore files it as "unanswered, which is an answer" |
| First curfew drill run | Ada shows the player the bell rope; the Stewards' Hall ledger ticks |
| Town Level 3 | Sterling's counter-offer arrives by courier, and the Mill Lot price rises 20% |
| Ten losing days in a season | Nana O brings soup to the firm; nothing else changes (no lecture, no penalty) |
| An agent onboarded | The Awakening (below); Pip draws them the same night |

**Quest catalogue (samples of the 60 planned).**

| Quest | Giver | Steps | Reward |
| --- | --- | --- | --- |
| The Missing Column | Origin: Ledger Clerk | Find Fennimore's misfiled page in Records; deliver it | 300 ₥, 1 Stewardship level |
| Pip's Comics #1 | Pip | Bring three portraits of agents (screenshots from the dashboard) | Pip's drawing as decor, 2 hearts |
| Soup for the Night Shift | Ada | Cook Leek soup; deliver to the firm after 22:00 | Coffee recipe, hearts with Ada and the agents |
| The Ferryman's Bet | Ansel | Catch a Night Eel before Ansel does (timed week) | Bait recipe, ferry discount |
| Roz's Rush Order | Roz | 200 wood by Friday | 1,000 ₥, cottage upgrade coupon |
| The Stock Deal | Marisol | Buy 10 Ruby Chard seeds from the Bazaar so she can undercut Meridian | Store discount, 3 hearts |
| Two Ledgers | Sterling (8 hearts) | Export the audit log; bring it to him | Meridian coupon or Sterling's resignation letter, per path |
| The Last Column | Nana O (8 hearts) | Reach Deep Stacks 40; recover Marguerite's page | The fourth Audit voice, a Lantern Fruit |

**Dialogue style guide.**

1. Each line ≤ 90 characters, ≤ 3 boxes per exchange; one idea per box.
2. Every NPC has ≥ 40 daily lines across season × time × weather × hearts, plus 6 reactive lines to town state (level, rain over the firm, a festival tomorrow).
3. Rain over the firm is mentioned gently and once ("Rough week up the hill?"), never as blame or advice.
4. No financial advice, no real tickers, no shaming the player for any permission decision, no line that treats an approval as brave or a rejection as cowardly.
5. Agents' lines and NPC lines never mix: NPCs speak from `dialogue/*.yaml`; agents speak from their own events (§5.5); generated lines carry the `flavor` tag and a lighter bubble.
6. Kids and Nell are written age-appropriately; the whole game is friendship-only, with no romance system.
7. Humour comes from specificity (Fennimore alphabetises the gossip), never from mocking the player.

**Persona template for player-made characters (the Creator's questions).** Name and what people call them; where they were before Tallyford; the thing they are good at and the thing they pretend to be good at; what they do when a plan fails; who in town they would sit with at the tavern; three sayings; how they greet the Mayor. The wizard turns the answers into `description`, `personality`, `scenario`, `first_mes` and three `mes_example` exchanges, and shows the JSON for editing.

**The Awakening (Town Hall, on promotion to Agent).** A 20-second scene: the resident stands before the Mayor's desk; the Mayor reads the card's name and role aloud, asks "Do you understand that every action goes through this office?", the resident answers with their `first_mes`, the stamp comes down, the desk lights turn on across town, Pip cheers from the doorway. The audit log records it as `lifecycle: joined`, and the Tallies chime if the ledger is honest.

## 9. Composer / Sound Designer

The score is warm acoustic folk with soft chiptune on top — nylon guitar, felt piano, marimba, flute, a light square-wave lead — at 88–108 BPM, built as stems so the town's music grows with its level and never turns anxious. Sound is Phaser 4 Web Audio, three buses, and about 60 music stems and 250 effects; every alert has a visual twin so nothing in the game depends on hearing it.

**Direction and motifs.**

1. *Tallyford theme*: a four-note "tally" motif (up, up, down, hold) that every seasonal arrangement quotes.
2. *Mayor*: a clock-tick pulse and a single bell; her scenes use it under dialogue.
3. *Meridian*: cold minor, staccato strings, clean electric piano; it creeps into the town mix as Meridian buildings appear and leaves when they do.
4. *Tallies*: glockenspiel and whole-tone sparkles, triggered only when they are on screen.
5. *The firm*: brushed drums, ticking hi-hats, muted trumpet — a jazz variation of the town theme inside the Trading Firm.
6. Modes: major and mixolydian by day, dorian at night; no tritone stings anywhere in the game.

**Music map (loops unless marked).**

| Cue | Where | Length | Notes |
| --- | --- | --- | --- |
| Town: Spring / Summer / Fall / Winter (day) | Outdoors | 2:30–3:30 each | Full stem sets (§ adaptive layering) |
| Town: night ×4 | Outdoors after 20:00 | 2:00 each | Fewer stems, dorian |
| Founder's farm, morning | Riverside Plot 06:00–10:00 | 2:00 | Solo guitar |
| Town Hall | Interior | 1:45 | Mayor motif, quiet |
| The Counting House | Tavern | 2:30 | Diegetic band; stops when Hollis closes |
| Ocampo & Daughter, Smithy, Clinic, Ranch | Interiors | 1:15 each | Small ensemble |
| Trading Firm floors ×3 | Interiors | 2:00 each | Jazz variation; night-shift version |
| Other business shells ×5 | Interiors | 1:30 each | Reuse the firm arrangement with new lead instruments |
| The Vault: Copper / Iron / Gilded | Floors 1–30 | 2:30 each | Marimba, low pads; Deep Stacks is ambience only |
| The Old Exchange, hall restored | Charter scenes | 0:45 stinger | Tallies motif, grows with each hall |
| Arcade cabinets ×2 | Mini-games | 1:00 each | 8-bit, fast |
| Fishing tension layer | Overlay | stem | Fades in during the catch |
| Market Day | Bazaar | 1:45 | Accordion, playful |
| Festivals ×8 | Festival days | 1:30 each | Reworks of the season theme |
| Story cues: arrival, first Tally, Mill Lot lost, Charter Restored, Meridian Town, Founder's Audit | Scenes | 0:20–1:30 one-shots | Endings share the theme in two arrangements |
| Stingers: permission request, stamp, blocked, curfew, level up, heart up, quest done, Awakening | UI events | 1–4 s | See rules below |

**Adaptive layering.** Vertical: each outdoor theme has five stems — guitar, piano, percussion, flute/marimba, chip lead — and Town Level 1–5 unmutes one more (L1 solo guitar, L5 full ensemble). Horizontal: cues change only at bar boundaries with a 2-bar crossfade; time-of-day crossfades over 60 s. Weather: rain adds a low-pass filter and a rain bed; a losing week over the firm mutes the chip lead and adds a pad — quieter, never darker. Ducking: any Mayor stinger ducks music −8 dB for 1.5 s. The music never rises in intensity to signal a real permission request; the stinger alone does that, and it is a two-note "hm?" not an alarm.

**SFX list (groups; \~250 files).**

| Group | Examples |
| --- | --- |
| Footsteps ×6 surfaces | Grass, dirt, cobble, wood, water edge, snow |
| Farming | Hoe, water pour, seed drop, harvest pop, growth chime at 06:00, sprinkler |
| Fishing | Cast, bob, splash, reel strain, catch jingle, crate open |
| Vault | Pick strike, rock crack, ore ping, ladder creak, shelf collapse, wisp puff |
| Animals and machines | Hen, cow, goat, sheep, keg bubble, crock seal, press clank, loom tick |
| UI | Hover, click, wood-slide panel, page turn, coin count, ₥ tally, error thunk |
| Mayor and Town Hall | Stamp, bell rope, gavel, ledger close, curfew bell then two seconds of silence |
| Agents | Typing loop, phone pick-up, eureka chime, letter whoosh, desk lamp on |
| Weather and ambience | Rain ×3 intensities, wind, snow crunch, river, tavern crowd, festival crowd, lantern hiss |
| Emotes and story | Heart pop, question bubble, exclaim, zzz, Tallies chime, Awakening stamp with reverb |

**Implementation.** Phaser 4 sound manager over Web Audio; music as OGG with M4A fallback for Safari, sample-accurate loop points in `music.yaml`; stems scheduled on one `AudioContext` clock so layers stay phase-locked; buses Music / SFX / UI plus master, with sliders in Settings; autoplay unlock on the first tap (mobile); pause music on tab blur (option); loudness −16 LUFS for music, −20 LUFS for effects, true peak −1 dB. Budget: music ≈ 25 MB, SFX ≈ 6 MB, streamed per zone. Tools: any DAW for the score; a tracker (Famitracker, Bosca Ceoil) for the chip leads; effects from CC0 libraries or own recordings, listed in the provenance file; generated music or effects only with a commercial licence recorded next to the file.

**Voice barks (optional).** Short lines per persona — greeting, harvest, win, loss, curfew — rendered by TTS with a per-agent voice ID in `voice`, a town-wide mute, and always a subtitle. No bark for permission decisions.

**Accessibility.** Subtitles and captions for every bark and story cue; a visual cue for every audio alert (the bell rope swings, the stamp card flashes); a reduce-audio mode that removes stingers; separate sliders; no cue below 200 Hz carries information on its own.

## 10. Build roadmap addendum (Phases 5–9)

The game layer ships in five phases after the original Phases 0–4, each with acceptance criteria the player can check by hand; nothing in Phases 5–9 changes the Mayor, the gateway or the manifest contract, and the dependency wall from §1 is the first thing Phase 5 builds.

[Diagram in the source doc, not exported: build roadmap · Phases 5 to 9 with the gate each must pass]

The shaded band is the original prompt's work; each diamond is the test named under it, and no phase starts until the one before it passes.

**Phase 5 — World and Founder.** The dependency-cruiser wall; `packages/game-data`, `game-core`, `save-migrations`; the Character Creator; movement and interaction; WorldClock and DayTick; save slots with export/import; schedules and daily lines for six NPCs (Mayor, Fennimore, Roz, Marisol, Hollis, Sterling).

1. A created character walks the square, talks to all six NPCs, sleeps, and is in the same place after a server restart.
2. The 00:00 tick runs once per missed day after downtime, in order, and a replay of the same seed renders the same day.
3. CI fails on any import from a game package into `gateway` or `mayor/policy`.

**Phase 6 — Farm and economy.** Farming cycles, tools, inventory, chests, the Ledger Bin, shops, animals, machines, Marks, the bridge dividend and task credits, the Carpenter and Smith screens.

1. Plant → water → harvest → Ledger Bin pays at 06:00 with quality multipliers; out-of-season crops die at the season change.
2. With `bridge.rate: 0` no Marks are minted from real events; with the simulator's green day, the Treasury shows the dividend and the audit log shows no new entries from the game.
3. The 365-day headless simulation hits the §6 income targets (median of 20 seeded runs).

**Phase 7 — Life and story.** Full cast of 16, Trust hearts and gifts, heart events in Ink, the quest engine with the Noticeboard and Charter Commissions, the six charter halls and the Meridian path, all eight festivals, the Vault Below and Deep Stacks, the Resident → Employee → Agent pipeline with the Awakening.

1. Every NPC has ≥ 40 daily lines and passes the dialogue linter; every schedule passes the validator.
2. Gifts follow the heart table; hearts with an agent change only cosmetics, greeting lines and quests — a test asserts the agent's manifest hash is unchanged after reaching 10 hearts.
3. A resident hired and then awakened appears in `/agents/` as a valid card with a `lore` block, passes Mayor validation, and its desk turns live; retiring it removes the endpoint and keeps the lore.
4. The Mill Lot becomes Meridian Depot on Fall 21, Year 1 if unbought, and both charter endings play from a saved game.

**Phase 8 — Mini-games.** Fishing, the arcade cabinets, Tallyman's Gambit, Market Day, the festival games, the crane.

1. Each game runs at 60 fps on the reference laptop, supports keyboard and touch, pauses on blur, and pays only from its reward table.
2. Market Day has no import from the event store or any price feed; a static-analysis test proves it.
3. Hi-scores persist across saves and survive a migration.

**Phase 9 — Audio, audit and polish.** Music stems and adaptive layering, SFX, voice barks, subtitles, the Founder's Audit, the Town Ledger, Prestige, Sim Season, the accessibility settings.

1. Town Level 1–5 unmutes stems as specified; a losing week changes the mix as specified and nothing else.
2. The Founder's Audit scores a fixture save correctly for each lantern tier.
3. Sim Season runs a 20-minute day on the mock fleet and never mints bridge Marks.

**Definition of done (added to the original).**

- [ ] `pnpm dev` starts the town with the game layer on; `pnpm test`, `pnpm data:lint` and `pnpm art:qa` are green.
- [ ] README covers: create a character, hire and awaken a resident, the farm loop, the bridge settings, Sim Season.
- [ ] VERIFY.md lists every acceptance criterion above with exact steps.
- [ ] No copyrighted game assets, names, text or music anywhere in the repo; provenance recorded for every asset and cue.

**Guardrails checklist (the coding agent re-reads this before every phase).**

- [ ] The bridge is one-way; the game never sends `control`, `permission_decision`, `lifecycle` (except through the Welcome Wagon path) or any event the dashboard did not already send.
- [ ] No game reward, XP, heart, quest, festival or profession changes a limit, tier, allocation, permission or model.
- [ ] Nothing in the game rewards approving, rejecting or hurrying a permission decision.
- [ ] No real ticker, price, position or P&L number appears inside a mini-game or dialogue line.
- [ ] Persona fields written by the Creator cannot carry URLs, tool names or instructions to the Mayor.
- [ ] Promotion to Agent always passes the same Mayor validation as a manifest dropped into `/agents/`.
- [ ] Losses show as weather; the game has no state that punishes a real losing day.

How to run this through Claude Code: Claude Code playbook
