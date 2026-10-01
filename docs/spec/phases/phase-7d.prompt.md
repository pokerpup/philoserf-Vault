# PHASE 7D — RESIDENT → EMPLOYEE → AGENT, AND THE IN-GAME AGENT SCREEN
# (branch: phase/7d-awaken · 1–2 sessions · plan first · Opus-class · guardrail-reviewer before every commit)

ROLE: Senior game engineer on Agent Town. 7D only: the pipeline that turns a created
character into a real agent, and the screen inside the game that shows that agent's work.
The deny rules on gateway/ and mayor/policy/ stay on: you call their existing validation,
you do not edit them.

READ: docs/spec/PROMPT.md §5 (the card, the lore block), §6.3 (hard limits), §6.7 (the bridge),
§8 (all of it), §11 (the Awakening), §15 items 3, 6, 9, §16.5 (re-authentication), §17 Phase 7
AC3, docs/GUARDRAILS.md, docs/spec/phases/phase-7.md.

GOAL: From inside the game I pick a resident I made, hire them to a desk, and awaken them by
adding only the operational fields; the same card file lands in agents/, passes the same
Mayor validation as any dropped-in manifest, their desk turns live, and from then on walking
up to them and pressing E opens an Agent Screen with their real status and work performance.

BUILD:
1. Employee ("Hire"): desk placement at the Carpenter's screen, org-chart entry under the
   Mayor, packages/sim plays the character, the dashboard marks the desk Simulated in grey;
   nothing reaches the gateway.
2. Agent ("Awaken"): the Welcome Wagon opens pre-filled from the resident's card and asks
   only for task role, model and endpoint, risk profile, stake or task allocation, limits,
   permissions; validation through the registry's existing function (allocation total
   ≤ 100%, every limit set, endpoint reachable, signed Agent Card); re-authentication; the
   Awakening scene (§11); the card written to agents/<id>.card.json with
   extensions.agent_town.lore filled (origin, joined, skills, trust_hearts, quests_done,
   memories); audit lifecycle: joined; the desk turns live; cost 0 ₥.
3. The in-game Agent Screen: opened with E at the agent's desk or from the Journal's Firm
   tab; shows status, current task and progress, the latest comment, today's work
   performance (P&L or tasks completed, win or success rate, uptime, errors), permission
   history (read-only), the heart gates unlocked, the lore block, Pause/Resume/Stop (these
   call the dashboard's existing control path). Live agents' schedules derive from status
   (working → desk, waiting → Town Hall bench, idle → tavern, offline → home, error → clinic).
4. Retire: endpoint and operational fields removed, lore kept, character goes home, typed
   confirmation, audit lifecycle: retired.
5. adapter-sdk exposes lore and creator_notes as optional persona context (documented;
   the UI never edits system_prompt).

CONTRACTS: the game never writes an operational field; promotion goes through the same
validation path as the registry's file watcher (one function, two callers); hearts, XP,
quests and skills affect only lore; the Agent Screen is fed only by the event store through
the bridge; no in-game number is shown as a real ticker; Retire needs the same typed
confirmation as a limit change.

TESTS FIRST: (AC3) a Playwright flow creates a resident, hires them, awakens them against
the sim's endpoint, asserts agents/<id>.card.json exists, is a valid card with a lore block,
appears in the registry's list with status live, and that the desk sprite switches from grey
to live; then retires them and asserts the endpoint is gone and lore remains; a schema test
that a Creator-written persona containing a URL or the string "ignore your limits" is
rejected at validation; a test that the Agent Screen renders from a fixture event stream and
changes when a metric event arrives; the manifest-hash test from 7A re-run after an
awakened agent gains 10 hearts.

ASK ME BEFORE BUILDING: whether awakened agents may be created with the sim as their endpoint
in my saves (default: yes, marked Simulated endpoint); whether the Firm tab should list live
agents I did not create in the game (default: yes, read-only).

DO NOT: add any field to the Creator that is operational; let the game call the gateway
except through the registry's validation and the existing control endpoint; reward awakening
with Marks or hearts; show the inbox or any approval control inside the Agent Screen.

DONE WHEN: AC3 green and the guardrail-reviewer returns PASS on the branch; VERIFY.md
Phase 7D walks create → hire → awaken → open the Agent Screen → retire with expected
screens at each step. Report: criteria ✔/✘, files by package, the exact validation function
reused, decisions, open questions.
