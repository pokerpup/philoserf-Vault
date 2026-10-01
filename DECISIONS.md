# Decisions

Every default a session chose and why (PROMPT.md §0, working rule 6), newest entries at the end of each section. Prototype and design-loop verdicts go here too, in the shape the stage prompts give.

## Session 0 — 2026-10-01

- The repo moved from the v1 layout (playbook tab: `00-prompt.md`, `12-game-layer.md`, phases 0–9) to the layout `docs/spec/PROMPT.md` §18 and §19.6 specify, plus the session prompts from the _Claude Code prompts by phase_ tab and the stage prompts from the _prompts by game-dev phase_ tab. The game-layer addendum stays as `docs/spec/GAME-LAYER.md` for its long-form tables (cast with homes, the music map and SFX groups, sheet naming, the pixel QA checklist); where it and `PROMPT.md` differ, `PROMPT.md` wins, and `RPG.md` §1 overrides both on the points it lists.
- Bare § references inside `GAME-LAYER.md` use the v1 prompt's numbering (art pipeline §8 → `PROMPT.md` §14, non-functional requirements §10 → §16, the event model §5.5 → §5.4); they were left verbatim.
- Acceptance criteria in the phase files are copied verbatim and split into bullets at the source's own `;` separators and `(n)` markers; nothing is reworded.
- `scripts/banned-words.txt` lists the reference game's distinctive proper nouns and phrases. Left out on purpose: its character names that are also ordinary English words or very common first names (Alex, Sam, Emily, George, Penny, Robin, Sandy, Leo, Lewis, Clint, Kent, Pam, Vincent, Gus), so an original line about a bird or a coin does not trip the check. `Deluxe Pack` and `Large Pack` are on the list although `RPG.md` §1 and §8 use "Deluxe Pack" as a Tallyford backpack tier: rename that tier when Phase 10 builds it, or drop the entry knowingly.
- The four content subagents live under `docs/setup/subagents/` until `.claude/settings.json` is corrected: the pasted `Read(./agents/**)` and `Edit(./agents/**)` deny rules match every directory named `agents` (a `./path` deny rule matches at any depth), which blocks `.claude/agents/` and blocked the first staging folder, `docs/setup/agents/`. See `docs/setup/README.md`.
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
