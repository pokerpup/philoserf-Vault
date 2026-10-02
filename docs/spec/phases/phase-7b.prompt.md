# PHASE 7B — CHARTER AND FESTIVALS (branch: phase/7b-charter · 1 session · plan first · Sonnet)

ROLE: Senior game engineer. 7B only: the Old Exchange's six halls, the Meridian path, the
Mill Lot deadline, the eight festivals (the festival mini-games themselves come in Phase 8
as scenes; here they are stubs that award the stated prizes).

READ: docs/spec/PROMPT.md §7.5 (the Mill Lot), §10 (the Town Charter, the Meridian path, the
festival calendar), §11 (Act II and III beats), §17 Phase 7 AC4, docs/spec/phases/phase-7.md.

BUILD: charter.yaml with the six halls and their ledgers (the Stewards' Hall ledgers read
audit facts — onboard an agent, 20 briefings read, 4 drills, 4 weekly exports, all limits set —
through the bridge's read-only function); hall rewards (Greenhouse, Ferry + Bazaar dock,
elevator + Sterling tools, stalls + bakery, bell tower + Tallies' lanterns, tram + statue);
the Meridian Membership (8,000 ₥) and its priced rewards; festivals.yaml with the eight dates,
attendance hearts and prizes; the Mill Lot (15,000 ₥; Meridian Depot on Fall 21, Year 1 if
unbought); the two endings as Ink scenes; the season-end letter.

CONTRACTS: Spring 12 Seed Fair, Spring 24 Blossom Waltz, Summer 11 Founders' Picnic,
Summer 28 Lantern Drift, Fall 16 Tallyford Fair, Fall 27 Hollow Night, Winter 8 Frost Derby,
Winter 25 Ledger's Eve; Meridian prices Greenhouse 35,000, Ferry 20,000, Elevator 15,000,
Stalls 30,000, Bell tower 10,000, Tram 40,000 ₥.

TESTS FIRST: (AC4) from a saved game the Mill Lot becomes Meridian Depot on Fall 21, Year 1
when unbought, and both endings play from their fixture saves; a test that the Stewards'
Hall ledgers tick only from audit facts and never from a permission decision's content; a
calendar test that every festival fires on its date in a 112-day run.

DO NOT: reward any approval; let a hall read anything but the listed audit facts; add a
festival mini-game scene (Phase 8).

DONE WHEN: AC4 green; VERIFY.md Phase 7B explains how to reach each ending from a fixture.
