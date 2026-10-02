# PRE-PRODUCTION — GDD CHECK, PROTOTYPES, SCOPE, VERTICAL SLICE
# (branch: preprod · 2 sessions · plan first · Opus-class)

ROLE: Senior game engineer and producer. This session writes documents, builds four
throwaway prototypes under prototypes/ (never in apps/ or packages/), and defines the
vertical slice. Nothing here is production code; prototypes are deleted after their question
is answered and their findings move to DECISIONS.md.

READ: docs/concept/HIGH-CONCEPT.md; docs/spec/PROMPT.md whole; docs/spec/RPG.md whole;
docs/GUARDRAILS.md; the session prompts in docs/spec/phases/*.prompt.md.

GOAL: Enter production knowing the three riskiest assumptions have been tried, the scope is
written down with a cut line, and a 15-minute slice proves the hook.

SESSION 1 — GDD GAP REPORT AND SCOPE LEDGER
1. docs/preprod/GDD-GAPS.md: for each spec section, what a programmer could not build from
   it as written (missing number, undefined rule, conflicting statement between tabs — e.g.
   the 36-slot inventory vs the backpack progression, the 30-floor vs 60-floor Vault). One
   line per gap, a proposed resolution, and whether it blocks the slice.
2. docs/preprod/SCOPE.md: every feature from §2 and RPG.md §1 as a row with size (S/M/L/XL),
   the phase it lands in, the dependency it needs, and a MoSCoW tag; a cut line drawn so
   that Must + Should fit the first year of evenings; a list of what gets cut first if
   production slips (in order: Hard Audit, Deep Stacks scaling, voice barks, the fish pond,
   Market Day, Prestige, two of five keepers).
3. docs/preprod/ENGINE-AND-TEAM.md: Phaser 4 + React 19 + Vite + TS (the template), Node 22,
   Fastify or Hono, Drizzle, Tiled, Aseprite, Ink — one paragraph each on why, and the one
   thing that would make us switch; the "team" = the five subagents and me, with who owns
   what and the review gate (guardrail-reviewer before every merge).

SESSION 2 — FOUR PROTOTYPES AND THE VERTICAL SLICE
Each prototype has a question, a budget of one evening, a measure, and a verdict line.
4. prototypes/p1-awaken: a CLI + one HTML page. Create a card → hire → awaken against
   packages/sim → a status panel that updates from events. Question: does watching feel
   alive within 60 seconds? Measure: time to first status change; my own 1–5 rating.
5. prototypes/p2-realtime-day: text-only farm on the real clock for 7 real days (Vigor,
   three crops, the Ledger Bin at 06:00). Question: is a daily check-in satisfying or a chore?
   Measure: did I open it every day; minutes per visit; one line per day in a log.
6. prototypes/p3-combat-feel: one Vault floor, Blade and Hammer, Dust Wisps and Beetles,
   placeholders. Question: are telegraphs readable at 16×32 on a laptop and a phone?
   Measure: hits taken that I could not see coming, counted over 10 minutes.
7. prototypes/p4-mayor-paper: a paper prototype (a Markdown deck of 12 permission cards
   with action, params, exposure, rationale, rule hits, tier). Question: can I say why each
   was auto-approved, queued or blocked within 5 seconds? Measure: cards I got wrong.
8. docs/preprod/VERTICAL-SLICE.md: the slice = Phases 0–2 complete + the thinnest path
   through 5, 6 and 7D: Character Creator (look + persona only), one farm day on the real
   clock, hire, awaken against the sim endpoint, the in-game Agent Screen, one medium-risk
   request approved in the Mayor's inbox, the Awakening scene with placeholder art and one
   music loop. List the session prompts it uses, in order, what each is allowed to stub, and
   the hand-verification script (15 minutes, numbered steps, expected screens).

CONTRACTS: prototypes import nothing from apps/ or packages/ except packages/sim; no
prototype touches the gateway or any real agent; findings go to DECISIONS.md as
"Prototype pN: question, measure, result, decision"; the slice is cut from the spec, never
extended beyond it.

VALIDATE: each prototype's verdict line is written before the next starts; the GDD gap report
has an owner and a phase for every blocking gap; SCOPE.md totals are summed and the cut line
is drawn with a one-line justification.

ASK ME: the 1–5 ratings and daily log entries for p1 and p2 are mine to supply — stop and
ask for them before writing their verdicts; whether the first production target is the
slice only or the slice plus Phase 3.

DO NOT: polish a prototype; keep prototype code after its verdict; resolve a GDD gap by
changing a §10 or RPG.md number silently (propose in GDD-GAPS.md, I decide).

DONE WHEN: the four verdicts are in DECISIONS.md, the slice doc exists with its 15-minute
script, SCOPE.md has a cut line, and CURRENT points at phase-0.md.
