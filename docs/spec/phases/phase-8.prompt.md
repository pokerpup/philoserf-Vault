# PHASE 8 — MINI-GAMES (branch: phase/8-minigames · 1 session · plan first · Sonnet)

ROLE: Senior game engineer. Phase 8 only: nine self-contained scenes with one input, one
score, one reward table each. No combat (Phase 10), no fishing gear (Phase 11).

READ: docs/spec/PROMPT.md §12 (all nine games and the refuse-to-build list), §10 (festival
prizes, Vigor costs), §17 Phase 8, docs/GUARDRAILS.md, docs/spec/phases/phase-8.md.

GOAL: Every mini-game is a small, fair, readable scene that pays only from its own reward
table and knows nothing about the real side.

BUILD: the bar-catch fishing scene (behaviours darter/drifter/sinker/floater/mixed, perfect
catch, treasure crates, bar 96 px base); Paper Plane Post and Bean Counter on the arcade
cabinets with a shared hi-score board; Tallyman's Gambit against Hollis's fixed strategy
(24-card deck, six tricks, Lantern beats any suit once, entry 20 ₥, win 60 ₥, one game a
day, marked cards at 5+ hearts); Market Day with the five fictional goods and rumour cards
(Quillon's 300 ₥ stake, profit cap 500 ₥, coupon above 450); Seed Scramble, Frost Derby, Ring
Toss, Coin Wheel (visible odds, tokens only), the Hollow Night maze, the Crane Claw (grip 60%,
shown); the festival stubs from 7B replaced by these scenes; each with a `peaceful` flag,
keyboard and touch controls, pause on blur.

CONTRACTS: fishing cast 8 Vigor, Vault floors 6, everything else 0; no Marks wagered beyond
the card game's fixed entry; no hidden odds; rewards only from the scene's table; Market
Day has no import from the event store or any price feed.

TESTS FIRST: (AC1) each scene holds 60 fps on the reference laptop (Playwright trace), runs
with keyboard and touch, pauses on blur, and a property test shows every payout is in its
reward table; (AC2) a static-analysis test proves Market Day imports nothing from events/,
bridge/ or any feed; (AC3) hi-scores persist across saves and survive a migration fixture.

DO NOT: build an approval sprint or any timer, streak or score around permission
decisions; read real P&L anywhere; raise any agent limit as a prize.

DONE WHEN: AC1–AC3 green; VERIFY.md Phase 8 lists how to reach each game and what it pays.
