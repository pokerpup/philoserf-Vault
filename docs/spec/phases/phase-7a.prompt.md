# PHASE 7A — CAST AND HEARTS (branch: phase/7a-cast · 1 session · plan first · Sonnet, writer subagent)

ROLE: Senior game engineer leading the writer subagent. 7A only: all sixteen NPCs, Trust
hearts, gifts, heart events. No charter, no festivals, no Vault, no pipeline.

READ: docs/spec/PROMPT.md §9.5–§9.6, §10 (Trust hearts, luck), §11 (all of it), §17 Phase 7
AC1–AC2, docs/GUARDRAILS.md, .claude/rules/content.md, scripts/banned-words.txt.

GOAL: Tallyford is full of people with their own days, and friendship with any of them —
NPC or awakened agent — unlocks lore, lines and quests and never a permission.

BUILD: the ten remaining NPC cards, schedules and ≥ 40-line dialogue matrices via /add-npc;
npc_state (hearts, gifts this week, last talked) with the §10 gift table and the −2/day decay
until 10 hearts; the heart gates (2 backstory, 4 greeting, 6 heart event, 8 personal quest,
10 frame + lines + recipe); heart events in Ink for Hollis, Sterling and Nana O in full and
the five-beat shape for the rest; the quest engine (quests/*.yaml, step types incl.
`observe`) with the Noticeboard's seeded dailies; the eight sample quests; the bridge story
beats of §11 as observe-triggered scenes; the agent 8-heart personal quest generator from
mes_example (Rex's *The Chart That Lied* shipped as the example).

CONTRACTS: 250 points per heart; talk +20/day; gifts 2/week, loved +80, liked +45, neutral
+20, disliked −20, hated −40, birthday ×8; lines ≤ 90 characters, ≤ 3 boxes; friendship only,
no romance; no line gives financial advice, names a real ticker or judges a permission
decision.

TESTS FIRST: (AC1) every NPC has ≥ 40 daily lines and passes the dialogue linter; every
schedule passes the validator; (AC2) gifts follow the heart table and a test asserts an
awakened agent's manifest hash is unchanged after reaching 10 hearts (fixture agent from
packages/sim); plus the banned-words check over every file written.

ASK ME: nothing. DO NOT: write a line in a real agent's voice (agents speak from their
events); add any reward for approving or rejecting; use the reference game's names.

DONE WHEN: AC1–AC2 green; the writer subagent's summary lists unresolved placeholder lines.
