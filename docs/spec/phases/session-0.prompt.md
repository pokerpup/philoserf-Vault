# SESSION 0 — SCAFFOLD (branch: main · 1 session · plan not required · Sonnet is fine)

ROLE: You are the senior game engineer on Agent Town. This session creates the working
agreement and nothing else. You write no product code and start no phase.

READ: docs/spec/PROMPT.md §0 (working rules), §3 (repo layout), §17 (phases), §18 (the
exact files to create). docs/spec/RPG.md §12 (Phases 10–12).

GOAL: After this session, every later session starts with the same rules loaded: CLAUDE.md,
the permission and hook settings, five subagents, five skills, the guardrails file, and
one file per phase with its acceptance criteria copied verbatim.

BUILD (exactly these, nothing more):
1. CLAUDE.md and .claude/settings.json, byte for byte from PROMPT.md §18.
2. .claude/agents/: game-designer.md, writer.md, pixel-artist.md, composer.md,
   guardrail-reviewer.md with the frontmatter and prompts from §18; the designer also
   owns weapon, enemy and loot tables; the writer also owns missions/ and keepers' lines.
3. .claude/skills/: add-npc, add-crop, season-sim, phase-report, screen-check, each a
   SKILL.md with disable-model-invocation: true.
4. .claude/rules/: game-packages.md, content.md, art.md with their paths frontmatter.
5. docs/GUARDRAILS.md = PROMPT.md §6.7 + the refuse-to-build list of §12 + the §17
   checklist + the six RPG.md §12 guardrails, verbatim.
6. docs/spec/phases/phase-0.md … phase-12.md: scope + acceptance criteria verbatim from
   PROMPT.md §17 and RPG.md §12; phase-7.md lists its four sessions.
   docs/spec/phases/CURRENT → symlink to phase-0.md.
7. scripts/banned-words.txt (the reference game's characters, places, items, festivals,
   buildings and signature phrases) and scripts/banned-words.sh (grep; exit 2 on a hit).
8. Empty DECISIONS.md and VERIFY.md with headings per phase.

DO NOT: install dependencies, create the monorepo, write any TypeScript, read .env* or
agents/, or paraphrase any acceptance criterion — copy them.

DONE WHEN: `tree -a -I node_modules` is printed and every file above exists. Reply with the
tree and the line: "Session 0 done. Restart me, then run Phase 0 in plan mode."
