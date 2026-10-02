# Phase 2 — Live updates and the Mayor

Source: `docs/spec/PROMPT.md` §17, scope and acceptance criteria copied verbatim (the criteria split at the source's own separators). Session prompt: `docs/spec/phases/phase-2.prompt.md`. Read with `docs/GUARDRAILS.md`.

## Scope

Event schema, gateway (A2A plus the webhook adapter), SSE, live agent cards, flying letters; the policy engine, inbox, kill switches, hash-chained audit log, briefing and Ask the Mayor.

## Acceptance criteria

- (a) a simulated order pushing Rex above 30% of stake is blocked
- (b) a medium-risk order appears in my inbox and executes in the simulator only after I approve
- (c) Curfew stops all 12 agents within 2 seconds
- (d) every decision appears in the audit log with a valid hash chain
- (e) one agent on a second machine (or a container on another port with its own token) connects over the network and behaves identically
