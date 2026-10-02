# PHASE 9 — AUDIO, AUDIT AND POLISH (branch: phase/9-polish · 1 session · plan first · Sonnet, composer subagent)

ROLE: Senior game engineer leading the composer subagent. Phase 9 only: music and sound,
the Founder's Audit, the Town Ledger, Prestige, Sim Season, accessibility.

READ: docs/spec/PROMPT.md §7.3 item 5 (Sim Season), §10 (the Founder's Audit, the Town
Ledger), §13 (all of it), §16.3–§16.4, §17 Phase 9, docs/GUARDRAILS.md,
docs/spec/phases/phase-9.md.

GOAL: The town sounds like itself, grows louder as the firm grows and quieter — never
darker — on a losing week; Year 3 scores stewardship as much as wealth; and a sandbox mode
runs the whole game fast on the mock fleet without touching the bridge.

BUILD: music.yaml and sfx.yaml with the §13 map; Phaser 4 Web Audio playback with OGG +
M4A, sample-accurate loop points, phase-locked stems on one AudioContext clock, buses
Music/SFX/UI/master with sliders, autoplay unlock, optional pause on blur, −16 / −20 LUFS
normalisation in the asset pipeline; vertical layering by Town Level and the bar-boundary
transitions; rain and losing-week mixes; Mayor stinger ducking; the ~250 SFX hooks wired to
events; optional TTS barks with voice.tts_voice_id, a town mute and captions; the Founder's
Audit (Year 3 Spring 1, 21 points, lantern tiers) with the fourth voice; the Town Ledger
(100%) tracker and the Town Clock; Prestige (a second town, same agents); Sim Season
(20-minute days on packages/sim, saves marked sim: true, bridge disabled); the accessibility
settings (reduce-motion, reduce-audio, captions, readable font, high-contrast skin, 32-px
touch targets).

CONTRACTS: stems unmute one per Town Level (L1 solo guitar → L5 full ensemble); a losing
week mutes the chip lead and adds a pad, nothing else; the permission stinger is a two-note
"hm?", never an alarm; no cue below 200 Hz carries information alone; Audit scoring per the
§10 table; Sim Season never mints bridge Marks.

TESTS FIRST: (AC1) a test drives Town Level 1 → 5 and asserts the exact stem set at each,
and a losing-week fixture changes only the chip lead and the pad; (AC2) the Audit scores
fixture saves at 6, 11, 17 and 21 points into lanterns 1–4; (AC3) Sim Season runs a 20-minute
day on the mock fleet and the Marks ledger shows zero bridge entries; plus a captions test
that every bark and story cue has subtitle text.

ASK ME: whether to ship TTS barks now (needs a voice provider key, which never enters the
repo) or leave the hook in place with barks off (default).

DO NOT: use any music or effect without a recorded licence; let a stinger escalate for a
real permission request; let Sim Season touch the gateway.

DONE WHEN: AC1–AC3 green; VERIFY.md Phase 9 includes the level-by-level listening check
and the Sim Season start command. Report as usual, plus the asset provenance table.
