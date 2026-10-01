# Session prompts

One paste-ready prompt per Claude Code session for the whole build — a Stardew-shaped town where a character you made can be awakened into a real AI agent and watched from an in-game Agent Screen — written from the data in the other four tabs. Each is saved here as `phase-N.prompt.md` (Session 0 as `session-0.prompt.md`); the prompt tells the session what to read, build, test, ask and refuse.

Source: the *Claude Code prompts by phase* tab of the design doc, verbatim. The matching scope-and-criteria file is `phase-N.md`; `CURRENT` is a symlink to the active one.

## How these prompts are engineered

Every prompt below has the same eight parts, in the same order, because a coding agent does its best work when the role, the scope, the inputs, the contract, the tests, the questions, the refusals and the stop condition are all explicit before it writes a line.

1. **Role and scope lock** — one phase, one branch, one session; everything outside the phase is named as out of scope so the agent does not wander into it.
2. **Read list** — the exact sections of `docs/spec/PROMPT.md` (and `RPG.md` from Phase 10) that hold the phase's data, so the agent reads the spec instead of inventing numbers.
3. **Goal in one paragraph** — tied to the product goal: a town game whose characters can become real agents you watch from an in-game Agent Screen.
4. **Build list** — the modules, files and screens, by package, so the plan has a shape to fill.
5. **Contracts** — the specific numbers, schemas and rules copied from the spec that the code must honour (weights, caps, field names, timings).
6. **Tests first** — each acceptance criterion mapped to the failing test the agent writes before the feature.
7. **Ask me / Do not** — the decisions reserved for you, and the phase's own anti-patterns, stated as negatives because a coding agent obeys a refusal more reliably than a preference.
8. **Done when** — the stop condition and the report format, so the session ends with something you can verify by hand instead of a summary.

**How to run one.** `/clear` → `git switch -c <branch from the prompt header>` → `claude` → `Shift+Tab` to Plan → paste the prompt → read the plan against parts 5–7 → approve → Accept edits → "Go, one criterion at a time" → verify `VERIFY.md` by hand → merge. The header of each prompt names the branch, the session count and the model to plan with (Opus-class where the phase touches the Mayor, the bridge, the pipeline or combat; Sonnet elsewhere). Subagents, hooks and skills from the playbook tab are assumed to exist after Session 0.

## The prompts

| File | Prompt |
| --- | --- |
| `session-0.prompt.md` | SESSION 0 — SCAFFOLD (branch: main · 1 session · plan not required · Sonnet is fine) |
| `phase-0.prompt.md` | PHASE 0 — DISCOVER AND BOOTSTRAP (branch: phase/0-bootstrap · 1 session · plan first · Opus-class) |
| `phase-1.prompt.md` | PHASE 1 — MVP TOWN (branch: phase/1-mvp-town · 1 session · plan first · Sonnet) |
| `phase-2.prompt.md` | PHASE 2 — LIVE UPDATES AND THE MAYOR (branch: phase/2-mayor · 1–2 sessions · plan first · Opus-class) |
| `phase-3.prompt.md` | PHASE 3 — EVOLVING TOWN (branch: phase/3-evolution · 1 session · plan first · Sonnet) |
| `phase-4.prompt.md` | PHASE 4 — ART PIPELINE (branch: phase/4-art · 1 session plus my batches · plan first · Sonnet) |
| `phase-5.prompt.md` | PHASE 5 — WORLD AND FOUNDER (branch: phase/5-world-founder · 1 session · plan first · Opus-class) |
| `phase-6.prompt.md` | PHASE 6 — FARM AND ECONOMY (branch: phase/6-farm-economy · 1 session · plan first · Opus-class) |
| `phase-7a.prompt.md` | PHASE 7A — CAST AND HEARTS (branch: phase/7a-cast · 1 session · plan first · Sonnet, writer subagent) |
| `phase-7b.prompt.md` | PHASE 7B — CHARTER AND FESTIVALS (branch: phase/7b-charter · 1 session · plan first · Sonnet) |
| `phase-7c.prompt.md` | PHASE 7C — THE VAULT SHELL (branch: phase/7c-vault-shell · 1 session · plan first · Sonnet) |
| `phase-7d.prompt.md` | PHASE 7D — RESIDENT → EMPLOYEE → AGENT, AND THE IN-GAME AGENT SCREEN (branch: phase/7d-awaken · 1–2 sessions · plan first · Opus-class · guardrail-reviewer before every commit) |
| `phase-8.prompt.md` | PHASE 8 — MINI-GAMES (branch: phase/8-minigames · 1 session · plan first · Sonnet) |
| `phase-9.prompt.md` | PHASE 9 — AUDIO, AUDIT AND POLISH (branch: phase/9-polish · 1 session · plan first · Sonnet, composer subagent) |
| `phase-10.prompt.md` | PHASE 10 — COMBAT CORE (branch: phase/10-combat · 1–2 sessions · plan first · Opus-class · reviewer before every commit) |
| `phase-11.prompt.md` | PHASE 11 — MAGIC, GEAR, COMPANIONS, FISHING (branch: phase/11-ledgercraft · 1–2 sessions · plan first · Opus-class) |
| `phase-12.prompt.md` | PHASE 12 — THE RECEIVER (branch: phase/12-receiver · 2 sessions · plan first · Opus-class · reviewer before every commit) |

## Notes from the source on individual phases

### Phase 7 — life and story (four sessions)

Phase 7 is four sessions on four branches; the fourth is the one the whole project is for — a resident you made becomes a real agent and the game shows you their work.
