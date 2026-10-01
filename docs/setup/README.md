# Setup notes

## Move the four content subagents into `.claude/agents/`

`docs/setup/subagents/` holds `game-designer.md`, `writer.md`, `pixel-artist.md` and `composer.md`,
written from `docs/spec/PROMPT.md` §18 (with its §19.6 additions) and checked against the spec.
They belong in `.claude/agents/` next to `guardrail-reviewer.md`. The session that set up this repo
could not write there: `.claude/settings.json` denies `Read(./agents/**)` and `Edit(./agents/**)`,
and in deny and ask rules Claude Code matches a `./path` pattern at any depth, so those two rules
block every directory named `agents`, including `.claude/agents/` and the first staging folder
(see <https://code.claude.com/docs/en/permissions#read-and-edit>). Once the two rules are scoped to
the real-card directory at the project root, run `git mv docs/setup/subagents/*.md .claude/agents/`
and delete `docs/setup/`.
