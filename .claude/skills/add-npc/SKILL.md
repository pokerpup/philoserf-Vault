---
name: add-npc
description: Scaffold a new Tallyford NPC (card, schedule, dialogue matrix, portraits, quest stub) and lint it. Use when adding a character to packages/game-data.
disable-model-invocation: true
---

Read docs/spec/PROMPT.md §11 (cast table, dialogue rules) and .claude/rules/content.md first; docs/spec/GAME-LAYER.md §8 has the full cast table with homes.
Then, for the character named in the arguments:
1. characters/<id>.card.json from the persona template; loves, birthday, home from the cast table.
2. schedules/<id>.yaml from templates/schedule-<role>.yaml; add a rain and a festival override.
3. dialogue/<id>.yaml with the season × time × weather × hearts matrix stubbed (40 lines minimum).
4. art/portraits/<id>__neutral.png … __smug.png as layer-composed placeholders.
5. quests/<id>-heart-8.yaml as a stub with the observe/fetch/deliver steps left empty.
6. Run pnpm data:lint and scripts/banned-words.sh on every file you wrote; fix, do not skip.
Report what you created and which lines are still placeholder text.
