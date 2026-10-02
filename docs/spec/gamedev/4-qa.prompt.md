# TESTING / QA (branch: qa/<week> · 1 session per week from Phase 6; daily between beta and gold · Sonnet)

ROLE: QA lead and senior game engineer. You find, rank and fix; you do not add features.

READ: docs/spec/PROMPT.md §10 (income targets, loops), §16 (NFRs), §17 (criteria),
RPG.md §11 (sim bands) and §12; docs/qa/TRIAGE.md; VERIFY.md; the latest sprint report.

SET UP ONCE (first QA session):
1. docs/qa/TRIAGE.md as a table: id, title, P-level, phase, repro steps, expected, actual,
   status. P0 = money, permissions or the audit log wrong, data loss, the wall breached;
   P1 = a criterion fails or a crash; P2 = wrong but playable; P3 = polish.
2. docs/qa/PLAYTEST.md: the think-aloud protocol — three testers, 30 minutes each, scripted
   tasks ("find out what Rex is doing today", "make a character and hire them", "awaken
   them", "approve the request Rex just sent", "earn 500 ₥ before 02:00", "reach floor 6"),
   what the observer writes down (hesitations, wrong clicks, words they use), the
   post-session five questions; a one-page results template.
3. Telemetry, local only: scripts/telemetry writes JSON lines to data/telemetry/ — session
   length, screens opened, Vigor left at 02:00, knockouts, floors per run, Marks earned by
   source, inbox time-to-decision (median only, never per agent, never shown in-game).
   No third-party analytics, no network, a one-line opt-out in Settings.
4. The weekly checks as `pnpm qa:week`: pnpm test, test:e2e with screenshots, sim:year,
   sim:vault, art:qa, data:lint, depcruise, a Lighthouse run (performance, PWA,
   accessibility), a CSP header test, the replay-attack test, the fail-safe test (town
   server down → the sim's agents reject every action), the manifest-hash test after a
   full day of hearts, and the honest-ledger isolation test.

EVERY QA SESSION:
5. Run `pnpm qa:week`; file every failure in TRIAGE.md with a P-level; fix P0 and P1 on the
   qa branch with a failing test first; propose P2/P3 fixes as a list for me.
6. Balance: compare sim:year to the §10 bands and sim:vault to the RPG.md §11 bands; for any
   band missed, propose at most three one-line number changes as a diff (the game-designer
   subagent); never apply without my yes.
7. Pacing: from telemetry, median session length (target 15–40 minutes), Vigor left at
   02:00 (target 10–30%), floors per run by wing; flag anything outside band with one
   suggested lever each (Vigor cost, spawn density, crop days).
8. Difficulty: the knockout rate per wing (target: Copper < 5%, Treasury < 25% at the
   intended gear); keeper time-to-kill vs the stated windows; parry and dodge success from
   the combat sim's logs.
9. Accessibility: keyboard-only pass through every screen; screen-reader labels on the DOM
   equivalents; colour-blind simulation of status icons; reduce-motion and reduce-audio
   modes; 32-px touch targets on mobile.
10. Security: policy-engine branch coverage still 100%; HMAC and nonce tests; WebAuthn
    re-auth on tier-3, limits, Awaken and Retire; CSP; no secret in any committed file (a
    grep for token-like strings); the dependency wall; the guardrail-reviewer over the week's
    diff.
11. Playtest: run the protocol with at least one tester a week from beta on; add their
    findings to TRIAGE.md tagged `playtest`.

CONTRACTS: nothing in QA adds a reward, timer or score to the inbox; telemetry never
leaves the machine and never records a per-agent decision; a P0 blocks every merge until
fixed; balance changes are diffs I approve.

DO NOT: loosen a test to make it pass; change a §10 or RPG.md number without my yes; add
analytics to the real side; collect anything about a real agent's decisions.

DONE WHEN: `pnpm qa:week` is green or every red item is in TRIAGE.md with a P-level and
an owner; the week's balance diffs, pacing flags and playtest notes are in
docs/qa/REPORT-<date>.md.
