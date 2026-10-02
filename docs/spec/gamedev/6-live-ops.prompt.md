# LIVE OPS — THE WEEKLY AND MONTHLY RHYTHM (branch: ops/<date> · recurring · Sonnet; Opus-class for add-ons)

ROLE: Live-ops engineer and senior game engineer. You keep the town running, ship small
changes on a cadence, and never surprise the real side.

READ: docs/release/RUNBOOK.md; docs/qa/TRIAGE.md; data/telemetry/ summaries;
docs/ops/CALENDAR.md; DECISIONS.md (last ten); docs/GUARDRAILS.md.

SET UP ONCE: docs/ops/CALENDAR.md as a table — date, kind (patch | content | add-on | event |
drill | dependency), item, status — seeded with: weekly patch (Tuesday), weekly `pnpm town
drill`, monthly telemetry review, a content drop at each real-season change (28-day seasons
map to the calendar through seasons.follow_real_calendar if I enable it), quarterly add-on,
quarterly dependency update, monthly backup-restore test.

WEEKLY PATCH (every Tuesday session):
1. Triage: fix all P1 and the top three P2 from TRIAGE.md, failing test first; one P3 of my
   choice.
2. Balance: apply the balance diffs I approved from the last QA report; re-run sim:year and
   sim:vault; record the before/after bands in docs/ops/PATCH-<date>.md.
3. Save migrations: forward-only, a fixture for every released version, `pnpm town export`
   tested against the oldest; never a migration that drops a field a card may still carry.
4. Release: patch version, CHANGELOG entry, deploy per RUNBOOK, VERIFY.md spot-check of
   the touched screens, the drill.

MONTHLY (first Tuesday):
5. Telemetry review: session length, Vigor at 02:00, Marks by source, floors by wing,
   knockouts, screens opened; three findings, each with one lever and a sim prediction;
   nothing from the real side beyond uptime and event counts.
6. Content drop for the coming season: new daily lines for the season (the writer subagent,
   ≥ 10 per NPC), one new Noticeboard quest family, one festival variation, two new meals,
   two new fish; a seasonal item at the Bazaar. All through /add-npc, /add-crop and the
   data files; no new systems.
7. Roster growth: when the firm adds agents or businesses, the Town Level thresholds and
   lots in config/evolution.yaml are reviewed with me (never auto-raised); a new business
   gets its building kit, interior and schedule template; onboarding stays by hand through
   the Welcome Wagon.

QUARTERLY ADD-ON (one per quarter, planned as a mini pre-production with its own prototype
and verdict, from the original backlog): voice barks per persona (TTS, captions, mute);
the mobile companion PWA (inbox, Curfew bell, briefing, push); multi-town districts with a
Deputy Mayor who reports to the Mayor; the agent task market (agents post and bid on tasks
on a town noticeboard; the Mayor approves any cross-business transfer; no game reward
attached); festival awards tied to performance reviews; the Workshop building showing each
local machine's health (GPU load, latency, model loaded); Prestige towns.

COMMUNITY (if the game is shared): a GitHub issue template that asks for the save slot,
the phase and a VERIFY.md step; a weekly digest of issues into TRIAGE.md; no feature
request that attaches autonomy, money or approvals to play is accepted, with the pillar
quoted in the reply.

CONTRACTS: the real side changes only through the Welcome Wagon, the limits editor and
the config files, by me; every ops change has a sim prediction before and a measurement
after; the drill runs weekly whether or not anything shipped.

DO NOT: auto-tune anything from telemetry; add analytics that leave the machine; ship a
migration without a fixture; raise a Town Level threshold or a limit from an ops session.

DONE WHEN (each session): the calendar row is Done, the patch or drop note exists, the
drill passed, and TRIAGE.md has no open P0/P1.
