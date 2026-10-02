# PHASE 12 — THE RECEIVER (branch: phase/12-receiver · 2 sessions · plan first · Opus-class · reviewer before every commit)

ROLE: Senior game engineer. Phase 12 only: wings four and five, the Comptroller and the
Receiver, the honest-ledger counters and the Tallies' shield, the third ending, Hard Audit,
the Deep Stacks, Mister Ink and Marguerite's Trout, M8–M10, bounties, the secret interactions.

READ: docs/spec/RPG.md §2 (the Undercount, the three endings), §3 (the Comptroller and the
Receiver), §4.5 (Treasury and Undercount rosters), §7 (Marguerite's Quill, Moonsilver Line,
The Receiver's Hat), §9 (Mister Ink, Marguerite's Trout), §10 (M8–M10, bounties, the secret
table), §11, §12 Phase 12 and the guardrails; docs/spec/PROMPT.md §11 (Act III) and §19.

BUILD: the Treasury and Undercount rosters, bosses/comptroller.yaml (recount windows) and
bosses/receiver.yaml (collect, foreclose, call the debt; immune to all but Audited; the
Tallies' shield at 20 honest-ledger ticks); honest_ledger counters from the listed in-game
choices only; the three endings as Ink scenes keyed to charter state + Receiver state (The
Books Balanced, Settled Out of Court, Charter Restored) with the dawn scene on the steps;
Hard Audit (+40% HP, statuses ×1.5, extra phase, cosmetic title, no extra Marks); the Deep
Stacks with 8% scaling per 10 floors, Moonsilver and Moonstones, a lore page every 5 floors,
Mister Ink's shortcut to floor 65; the Ink Leviathan hybrid fight; legends Mister Ink and
Marguerite's Trout (fed-Tallies condition); missions m8–m10; bounties.yaml on Hesper's
board (two per day, seeded); the ten secret interactions with their rewards; the Sealed Books
tab in Town Hall Records; The Receiver's Hat with its daily honest-ledger tick.

CONTRACTS: the Receiver is immune to everything but Audited; the Tallies' shield requires 20
ticks, the extra Marguerite scene 40; keepers resist Stamped after the third application;
Hard Audit grants no Marks Standard does not; the bounty board and the permission inbox
share no data; honest-ledger counters never read the event store, the audit log or a
permission decision.

TESTS FIRST: (AC1) all three endings play from fixture saves; (AC2) a replay of a full
real-side day of permission events (approve, reject, expire, curfew) changes no honest-ledger
counter; (AC3) pnpm sim:vault reaches Deep Stacks floor 100 with Moonsilver gear; (AC4) a
365-day Hard Audit run earns the same Marks as Standard within tolerance; plus the
Receiver's immunity and shield tests, and a static test that bounties.yaml references no
real-side type.

ASK ME: whether The Books Balanced should also require the Founder's Audit at 3+ lanterns
(default: no, charter + Receiver only); whether Hard Audit is visible before the first
Receiver kill (default: no).

DO NOT: let the honest ledger see a permission decision; add a leaderboard that leaves the
machine; reward Hard Audit with Marks; put any approval control near the Receiver fight.

DONE WHEN: AC1–AC4 green and the reviewer PASSes; VERIFY.md Phase 12 explains how to reach
each ending and the shield; the full guardrails checklist is re-run and pasted into the
report.
