# PHASE 2 — LIVE UPDATES AND THE MAYOR (branch: phase/2-mayor · 1–2 sessions · plan first · Opus-class)

ROLE: Senior game engineer on Agent Town. Phase 2 only: the gateway, the event stream, the
Mayor's policy engine and office, kill switches, the audit log. Nothing on the farm side.
The deny rules on gateway/ and mayor/policy/ are lifted for this phase in
.claude/settings.local.json; restore them when the branch merges.

READ: docs/spec/PROMPT.md §3.3–§3.4, §5.3–§5.4, §6 (all of it), §15 items 3–5 and 8, §16.5–§16.7,
§17 Phase 2, docs/GUARDRAILS.md, docs/spec/phases/phase-2.md.

GOAL: Every agent action with side effects passes through a deterministic Mayor, every
decision is in a hash-chained log, and the Agent Screen shows real work performance — status,
current task, progress, P&L or task metrics, errors, permission history — for an agent
running on another machine.

BUILD:
1. packages/schema: the event envelope {v, id, agent_id, ts, nonce, type, payload, sig} and
   every §5.3 event type; packages/adapter-sdk in TS and Python (emit, request permission,
   receive decision in ~10 lines); the A2A Agent Card at /.well-known/agent-card.json.
2. apps/town-server/gateway: A2A client (JSON-RPC 2.0, SSE) plus the webhook adapter
   (POST /api/agents/:id/events, POST /control); retries; heartbeats; per-agent bearer or
   mTLS; HMAC verification with a 60-second nonce window; server-signed decisions.
3. events/: event store, SSE at /api/stream with WebSocket fallback; letters that fly
   between desks on message events; the Town Crier feed with the briefing pinned.
4. mayor/policy: validate → policy → score → decide, with the weights and tiers in
   CONTRACTS, hard limits enforced before scoring, 10-minute expiry = rejected, no LLM call
   anywhere in this module (a test proves it by import graph).
5. mayor/assistant: morning briefing at 06:00, end-of-day summaries, Ask the Mayor over the
   event store and audit log only, citing event IDs; proactive nudges; the newsletter.
6. audit/: append-only, hash-chained, JSONL export, Town Hall Records screen with filters.
7. Kill switches: per-agent Pause/Stop, per-building Close shop, Town Curfew (bell,
   Ctrl+Shift+K, `pnpm town curfew`, `pnpm town drill`).
8. The Mayor's Office: Permission Inbox sorted by risk (action, params, exposure before and
   after, rationale, rule hits; Approve / Edit & Approve / Reject / Ask why; swipe on mobile;
   badge on the roof), the limits editor with typed confirmation, the Curfew bell.
9. Agent Screen v2: metrics sparkline, task progress, permission history, errors,
   Pause/Resume/Stop; a "work performance" strip (today's P&L or tasks completed, win rate
   or success rate, uptime) fed only by metric and report events.

CONTRACTS: risk score weights exposure 35 / reversibility 20 / novelty 15 / record 15 /
context 15; tiers 0–24 auto, 25–49 auto with notification, 50–74 my approval, 75+ my approval
with typed confirmation; forbidden or over a hard limit = always blocked; Rex's hard cap 30%
of firm capital; daily loss breach auto-pauses; expiry 10 minutes; heartbeat 15 s, offline
after 3 misses; nonce window 60 s; agents fail safe (no decision = rejected); only I change
limits; the UI sends only pause/resume/stop/decision.

TESTS FIRST (one per AC): (a) a simulated order pushing Rex above 30% is BLOCKED and logged;
(b) a medium-risk order appears in the inbox and the simulator executes it only after my
approval; (c) Curfew stops all 12 simulated agents within 2 s; (d) every decision appears in
the audit log and the hash chain verifies end to end; (e) one agent in a Docker container on
another port with its own token connects over the network and behaves identically to a local
one. Plus: policy engine unit tests with 100% branch coverage on limits; replay-attack test
(reused nonce rejected); adapter contract tests for TS and Python.

ASK ME BEFORE BUILDING: which of my real agents speak A2A and which need the webhook adapter;
where agent tokens live (env file name or secret store); the time zone for the 06:00
briefing. Do not connect any real agent in this session; build against the sim and the
container.

DO NOT: let any LLM decide an approval; put a token in a manifest; render agent text as
HTML; add any score, streak or timer to the inbox; expose any control beyond
pause/resume/stop/decision.

DONE WHEN: all five AC green with the container test in CI; VERIFY.md Phase 2 walks (a)–(e)
with exact clicks and the CLI commands. Report: criteria ✔/✘, files by package, decisions,
open questions, and the list of real-agent connection steps for me to run myself.
