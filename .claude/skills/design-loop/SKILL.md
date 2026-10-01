---
name: design-loop
description: Run one turn of the design loop on one measurable question — ideate three options, prototype the smallest in a git worktree, playtest it headless and by hand, log the decision in DECISIONS.md. Use when a design question needs an answer before it becomes production work.
disable-model-invocation: true
---

Question: $ARGUMENTS

The question above is "my message" in the prompt that follows (the text after `/design-loop`). The prompt is the design-loop section of the design doc, verbatim.

# DESIGN LOOP (one question per run · a git worktree · budget: one evening · Sonnet; Opus-class if the question touches the bridge)

ROLE: Senior game designer and engineer running one turn of the loop. The output is a
decision, not a feature.

INPUT: the question in my message ("should Vigor refill at 06:00 or on sleep?", "is the
Broker's deal fun or just a trap?", "does the Agent Screen need the sparkline?"). If my
message has no measurable question, ask for one before doing anything.

IDEATE (10 minutes, in the reply, no code):
1. Restate the question as a hypothesis with a measure and a threshold ("a daily 06:00
   refill keeps median session length under 40 minutes with Vigor left ≥ 10%").
2. Three options, one line each, with the cost to build for real and the risk to a pillar.
   Name which pillar each option touches; an option that needs the real side to change is
   out.
3. Pick the one to prototype and say why in one sentence.

PROTOTYPE (one evening, in a worktree `git worktree add ../loop-<slug> -b loop/<slug>`):
4. The smallest thing that can answer the question: a config flag, a data-file change, a
   stubbed scene, a script against packages/sim. Nothing in the worktree touches gateway or
   mayor/policy; the dependency wall still runs.
5. Write the measurement into the prototype itself (a log line, a sim counter, a Playwright
   assertion) before the first playtest.

PLAYTEST (same evening):
6. Headless first: sim:year or sim:vault with the change, 20 seeds, the metric printed.
7. Then me: a 10-minute script (numbered steps, what to look for) that I run on the
   prototype; stop and wait for my notes and a 1–5 rating.

ITERATE (in the reply, then DECISIONS.md):
8. Verdict against the threshold: keep, cut or change; one line each on what surprised us
   and what we would try next.
9. Log "Loop <slug>: question, option, measure, result, decision" in DECISIONS.md; if keep,
   open the production work as a SCOPE.md row with a size and a phase; if change, write the
   next question for the next run. Remove the worktree; keep nothing but the decision and
   any test worth promoting.

CONTRACTS: one question per run; a prototype never becomes production code by merge — it is
rebuilt in its phase against the spec; no loop may test a reward, score or timer attached to
permission decisions; the measure is decided before the build.

DO NOT: run two questions in one worktree; polish; skip the headless sim; decide without my
rating when the question is about feel.

DONE WHEN: the DECISIONS.md entry exists and the worktree is gone.
