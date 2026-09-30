# Setup notes

## Move the four content subagents into `.claude/agents/`

`docs/setup/agents/` holds `game-designer.md`, `writer.md`, `pixel-artist.md` and `composer.md`,
written from playbook §3 and checked against the spec. They belong in `.claude/agents/` next to
`guardrail-reviewer.md`. The session that set up this repo could not write there: the pasted
`.claude/settings.json` denies `Read(./agents/**)` and `Edit(./agents/**)`, and in deny and ask
rules Claude Code matches a `./path` pattern at any depth, so those rules also cover
`.claude/agents/` (see <https://code.claude.com/docs/en/permissions#read-and-edit>). Once the
rules are scoped to the real-card directory, run `git mv docs/setup/agents/*.md .claude/agents/`
and delete `docs/setup/`.
