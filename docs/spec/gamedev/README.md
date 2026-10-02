# Claude Code prompts by game-dev phase

One Claude Code prompt for each of the six industry phases — concept, pre-production, production, testing, launch, live ops — plus the design loop under them, each built from the specs, playbook and session prompts in the other tabs. The build phases 0–12 are the production phase's content; these prompts sit above and around them.

Source: the *Claude Code prompts by game-dev phase* tab of the design doc, verbatim. The six stage prompts are the `N-<stage>.prompt.md` files beside this file; the design loop is the `/design-loop` skill in `.claude/skills/design-loop/SKILL.md`. The production stage runs the session prompts in `docs/spec/phases/`.

## Overview: the six phases on this project

The first two phases are already mostly done on paper — five tabs of spec are the Game Design Document — so their prompts turn that paper into a high-concept doc, four throwaway prototypes and one playable vertical slice before the sixteen production sessions start. Testing overlaps production from Phase 6 of the build onward; launch is a self-hosted gold build with a two-week soft launch on the mock fleet; live ops is a weekly rhythm.

[Diagram in the source doc, not exported: the six phases · gates between them · the design loop underneath]

The shaded bands are the two already mostly done on paper; each diamond is the gate named under it, and QA runs alongside production rather than after it.

| Industry phase | What the tabs already hold | What its prompt produces | Exit gate |
| --- | --- | --- | --- |
| 1. Concept / ideation | The goal statement, the five pillars, the reference maps, the player as Founder | `docs/concept/HIGH-CONCEPT.md`, a one-page pitch, kill criteria | The "why play" sentence survives a cold read |
| 2. Pre-production | The design spec, the RPG expansion, the playbook, the session prompts | A GDD gap report, four prototypes with a question each, a scope ledger, the vertical slice | The slice plays for 15 minutes on a laptop, hand-verified |
| 3. Production | Phases 0–12 and their session prompts | Alpha (every feature in, placeholder content), Beta (every piece of content in), sprint reports | Alpha and Beta audits pass |
| 4. Testing / QA | The sims, Playwright flows, linters, VERIFY.md | Playtest protocol, triage board, tuning diffs, accessibility and security audits | Zero P0/P1, targets met, pacing in band |
| 5. Launch | The NFRs, the definition of done, the art provenance | Gold build, deploy, docs, licence audit, marketing kit, soft launch | Gold checklist signed, soft launch clean |
| 6. Post-launch / live ops | The add-ons list, Prestige, festivals, Town Level thresholds | Patch cadence, content calendar, analytics loop, roster growth | A weekly rhythm that runs without heroics |

**Milestone tracker** (tick the status as the gates pass; the exit criteria are the ones the prompts test):

| Milestone | Ends | Exit criterion | Status |
| --- | --- | --- | --- |
| High concept approved | Concept | The pitch answers "why would someone play this?" in one sentence and lists what would make us stop | Not started |
| Vertical slice playable | Pre-production | Create → farm a day → hire → awaken (sim endpoint) → open the Agent Screen → approve one request, with placeholder art and one music loop, in 15 minutes | Not started |
| Alpha (features in) | Production | Every §2 product requirement has a working path; content may be placeholder; Phases 0–3, 5–8, 10 feature-complete | Not started |
| Beta (content in) | Production | Counts met: 16 NPCs × 40 lines, 22 crops, 30 fish, 60 floors, 16 Entries, \~60 stems; Phases 4, 7A–7D, 9, 11, 12 done | Not started |
| Gold | Launch | Zero P0/P1, licence and originality audits clean, VERIFY.md walked end to end, backup and curfew drills pass | Not started |
| Live | Live ops | First patch shipped on cadence, first content drop scheduled, telemetry reviewed once | Not started |

## The prompts

| Stage | File |
| --- | --- |
| Phase 1 — Concept / ideation | `1-concept.prompt.md` |
| Phase 2 — Pre-production | `2-preproduction.prompt.md` |
| Phase 3 — Production | `3-production.prompt.md` |
| Phase 4 — Testing / QA | `4-qa.prompt.md` |
| Phase 5 — Launch | `5-launch.prompt.md` |
| Phase 6 — Post-launch / live ops | `6-live-ops.prompt.md` |
| The design loop — ideate → prototype → playtest → iterate | `.claude/skills/design-loop/SKILL.md` (`/design-loop <question>`) |

## What each stage does

### Phase 1 — Concept / ideation

The concept exists in five tabs but not in one page; this session writes the page and tests whether the hook survives being said plainly.

### Phase 2 — Pre-production

The GDD is the five tabs; what is missing is proof. This session finds the gaps, builds four throwaway prototypes that each answer one question, writes the scope ledger, and defines the vertical slice that the production prompts will build first.

### Phase 3 — Production

Production is the sixteen session prompts in the other tab run in order, with two audits that define alpha and beta; this prompt is the sprint wrapper that picks the next session, runs it, and keeps the milestone honest.

### Phase 4 — Testing / QA

QA overlaps production from Phase 6 onward and becomes the whole job between beta and gold; this prompt sets up the machinery once and is re-run as the QA session each week.

### Phase 5 — Launch

Launch here means a gold build you can deploy on your own server, a two-week soft launch on the mock fleet, and only then the real agents connected one at a time; the "platform certification" of a web PWA is Lighthouse, accessibility and security checks you run yourself.

### Phase 6 — Post-launch / live ops

Live ops for a one-person town is a rhythm, not a team: a weekly patch, a monthly content drop tied to the real season, a quarterly add-on from the original backlog, and a telemetry review that produces balance diffs rather than opinions.

### The design loop — ideate → prototype → playtest → iterate

This prompt runs under every phase and is used dozens of times: one question, one throwaway prototype in a worktree, one measured playtest, one logged decision. Save it as `.claude/skills/design-loop/SKILL.md` so it runs as `/design-loop <question>`.
