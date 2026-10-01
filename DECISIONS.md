# Decisions

Every default a session chose and why (PROMPT.md §0, working rule 6), newest entries at the end of each section. Prototype and design-loop verdicts go here too, in the shape the stage prompts give.

## Session 0 — 2026-10-01

- The repo moved from the v1 layout (playbook tab: `00-prompt.md`, `12-game-layer.md`, phases 0–9) to the layout `docs/spec/PROMPT.md` §18 and §19.6 specify, plus the session prompts from the _Claude Code prompts by phase_ tab and the stage prompts from the _prompts by game-dev phase_ tab. The game-layer addendum stays as `docs/spec/GAME-LAYER.md` for its long-form tables (cast with homes, the music map and SFX groups, sheet naming, the pixel QA checklist); where it and `PROMPT.md` differ, `PROMPT.md` wins, and `RPG.md` §1 overrides both on the points it lists.
- Bare § references inside `GAME-LAYER.md` use the v1 prompt's numbering (art pipeline §8 → `PROMPT.md` §14, non-functional requirements §10 → §16, the event model §5.5 → §5.4); they were left verbatim.
- Acceptance criteria in the phase files are copied verbatim and split into bullets at the source's own `;` separators and `(n)` markers; nothing is reworded.
- `scripts/banned-words.txt` lists the reference game's distinctive proper nouns and phrases. Left out on purpose: its character names that are also ordinary English words or very common first names (Alex, Sam, Emily, George, Penny, Robin, Sandy, Leo, Lewis, Clint, Kent, Pam, Vincent, Gus), so an original line about a bird or a coin does not trip the check.
- `.claude/settings.json` departs from `PROMPT.md` §18 in two rules: `Read(./agents/**)` and `Edit(./agents/**)` became `Read(/agents/**)` and `Edit(/agents/**)`, anchored to the project root, because a `./path` deny rule matches every directory named `agents` and blocked `.claude/agents/` itself. The real-card directory stays denied. Update §18 of the design doc to match.
- The four content subagents are in `.claude/agents/` beside the reviewer, written from §18 with the §19.6 additions.
- `RPG.md` §1 and §8 and `PROMPT.md` §19.1 call the 36-slot backpack the **Ledger Pack**; the exported tabs say "Deluxe Pack", a reference-game name that is on the banned list. Update the design doc to match.
- `README.md` is an Agent Town stub until Phase 0 writes the full one; `.github/settings.yml`, the Obsidian template's repository settings (`is_template: true`), was deleted. `.obsidian/` and `LICENSE` stay.
- `/design-loop` takes its question from the skill arguments; one line at the top of the skill says so, the rest is the tab's prompt verbatim.

## Phase 0 — Discover and scaffold (no product code)

_Nothing yet._

## Phase 1 — MVP town

_Nothing yet._

## Phase 2 — Live updates and the Mayor

_Nothing yet._

## Phase 3 — Evolving town

_Nothing yet._

## Phase 4 — Midjourney assets

_Nothing yet._

## Phase 5 — World and Founder

_Nothing yet._

## Phase 6 — Farm and economy

_Nothing yet._

## Phase 7 — Life and story (four sessions: cast and hearts; charter and festivals; the Vault; the pipeline)

_Nothing yet._

## Phase 8 — Mini-games

_Nothing yet._

## Phase 9 — Audio, audit and polish

_Nothing yet._

## Phase 10 — Combat core and the first two wings

_Nothing yet._

## Phase 11 — Magic, gear, companions, fishing

_Nothing yet._

## Phase 12 — Treasury, Undercount, the Receiver and the Deep Stacks

_Nothing yet._
