# LAUNCH — GOLD MASTER AND SOFT LAUNCH (branch: release/1.0 · 2 sessions · plan first · Opus-class)

ROLE: Release engineer and senior game engineer. You package, verify, document and rehearse;
you add no features and change no balance.

READ: docs/spec/PROMPT.md §16 (all NFRs), §17 definition of done and guardrails;
docs/milestones/BETA.md; docs/qa/TRIAGE.md (must show zero open P0/P1); VERIFY.md whole;
docs/GUARDRAILS.md.

SESSION 1 — GOLD BUILD
1. Packaging: a production build of apps/town-client (PWA manifest, service worker, push
   notifications for approvals, integer-zoom check in the built bundle); apps/town-server
   with Postgres via Drizzle migrations; docker-compose.yml (server, Postgres, a static
   client served behind an HTTPS reverse proxy with the strict CSP); `.env.example` with
   every variable named and no values; a `pnpm release` that builds, tags v1.0.0 and writes
   CHANGELOG.md from the sprint reports.
2. Certification equivalents, all written to docs/release/GOLD-CHECKLIST.md with results:
   Lighthouse ≥ 90 on performance, PWA and accessibility; 60 fps with 50 agents and 200
   events/min on the reference laptop; client memory < 300 MB; event-to-screen < 500 ms;
   WebAuthn login and re-auth; CSP and CSRF tests; HMAC/nonce replay test; fail-safe test
   (server down → every action rejected); backup and restore of the event store and a save;
   `pnpm town drill` (curfew) passes with the client closed; missed-DayTick replay after a
   simulated 3-day outage.
3. Licence and originality audit: every asset, font and cue in assets/manifest.assets.json
   has a source, date and licence; scripts/banned-words.sh is clean over the whole repo and
   the built bundle; the word "Stardew" appears nowhere in the product; third_party/
   licences present; a one-page docs/release/LICENCES.md.
4. Documentation: README (add an agent in one file; connect a remote or local agent; the
   art pipeline; the kill switch; create, hire and awaken a resident; the farm loop; bridge
   settings; Sim Season; backup and restore); docs/release/RUNBOOK.md (start, stop, upgrade,
   roll back, rotate a token, respond to a stuck permission, respond to a curfew); VERIFY.md
   walked end to end by me with the date recorded.
5. Marketing kit (original, no reference-game names): docs/release/PRESS.md with the pitch
   sentence, 150-word description, ten screenshots captured by /screen-check (square at
   18:00, the Agent Screen live, the Awakening, the Mayor's inbox, a Vault floor, the Fair),
   a 45-second trailer storyboard as a shot list, and the one-line "what is real" disclaimer.

SESSION 2 — SOFT LAUNCH
6. Deploy with bridge.rate 0 and the mock fleet only; run 14 real days; the weekly QA
   prompt runs twice; telemetry reviewed once; any P0/P1 blocks the next step.
7. Connect real agents one at a time through the Welcome Wagon, each with its limits set,
   each watched for one full trading day before the next; the Mayor's drill run after the
   third; bridge.rate raised from 0 only after all are green for a week.
8. Tag v1.0.0, write docs/release/LAUNCH-NOTES.md: what shipped, what is cut (from SCOPE.md),
   known issues (P2/P3), the first patch date.

CONTRACTS: no feature or balance change on the release branch; secrets only in the
environment, never in a file; the real side is connected only by me, by hand, through the UI.

DO NOT: connect a real agent during Session 1; raise bridge.rate before the soft launch
is clean; ship a build whose VERIFY.md walk is older than the last commit.

DONE WHEN: GOLD-CHECKLIST.md is all pass with dates; the soft launch log shows 14 clean
days; LAUNCH-NOTES.md exists; the tracker's Gold row is Done.
