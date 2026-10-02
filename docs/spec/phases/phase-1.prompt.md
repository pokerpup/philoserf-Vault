# PHASE 1 — MVP TOWN (branch: phase/1-mvp-town · 1 session · plan first · Sonnet)

ROLE: Senior game engineer on Agent Town. Phase 1 only: the town renders, simulated agents
work at desks, and one dropped-in card becomes a person. No Mayor, no live network, no farm.

READ: docs/spec/PROMPT.md §1–§5 (the manifest and Rex's card in §5.2 are the contract),
§15 items 1–3 and 6, §17 Phase 1, docs/GUARDRAILS.md, docs/spec/phases/phase-1.md.

GOAL: The plug-and-play promise in its first form — a Character Card V2 file dropped into
agents/ creates a desk, a sprite, a portrait slot, a reporting line to the Mayor's office and
an Agent Screen, with no code change — so the same path can later be driven from inside the
game when a resident is awakened.

BUILD:
1. packages/schema: Zod schema for the V2 card with extensions.agent_town (schema_version
   1.1, kind agent|npc|resident, every field in §5.2), JSON Schema export, PNG card import
   and export (JSON in the `chara` tEXt chunk), "persona only" import when the extension is
   missing.
2. apps/town-server/registry: file watcher on agents/, hot reload within 5 s, graceful retire
   on delete (sprite walks out, desk dims, card archived), Welcome Wagon validation stub.
3. apps/town-client: TownScene with the Tiled map, the Trading Firm building with three
   department rooms as interiors, 12 simulated agents from packages/sim walking desk ↔
   Town Hall ↔ plaza on status-driven schedules, speech bubbles for thought_comment, status
   icons over heads (shape + colour), click a building to enter, WASD/drag pan, minimap.
4. The Agent Screen v1 (React drawer, wood panel): portrait placeholder with an expression
   from the latest event, name, role, department, model tier, risk profile, stake bar used vs
   allocated, status, current task, latest comment, the V2 persona fields, an org line to the
   Mayor. Opens from a desk click in the interior and from a DOM list for accessibility.
5. The flavour-line generator (§5.4 rule 6) for agents that send no comment, tagged
   `flavor` with a lighter bubble, rate-limited per voice.comment_frequency.

CONTRACTS: hot reload ≤ 5 s; the sum of allocation_pct over all cards ≤ 100% or the card is
rejected with a visible reason; bubbles ≤ 60 characters per line, comments ≤ 25 words;
system_prompt is stored and never shown as editable; the registry never reads .env*.

TESTS FIRST: (AC) a Vitest test drops agents/stock-trader-01.card.json into a temp registry
and asserts desk, card, portrait slot and reporting line exist within 5 s; deleting it
archives the card and emits lifecycle:retired; a schema test rejects a card whose allocation
pushes the total over 100%; a PNG round-trip test; a Playwright test that clicking Rex's desk
opens the Agent Screen showing his name, role and latest comment.

ASK ME BEFORE BUILDING: nothing, unless the template's EventBus cannot carry the
reload events; log defaults in DECISIONS.md.

DO NOT: open a network connection to any agent, implement permissions, add any screen that
is not in the build list, draw original art (Kenney placeholders only).

DONE WHEN: all AC green; VERIFY.md Phase 1 has the drop-the-file and delete-the-file steps
with expected on-screen results. Report: criteria ✔/✘, files by package, decisions,
open questions.
