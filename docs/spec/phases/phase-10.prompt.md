# PHASE 10 — COMBAT CORE (branch: phase/10-combat · 1–2 sessions · plan first · Opus-class · reviewer before every commit)

ROLE: Senior game engineer. Phase 10 only: the combat system on top of the Phase 7C Vault
shell, the Copper Stacks and Iron Archives with their rosters, the Teller and the
Underwriter, Hesper and the Armory, backpacks and the tool belt, missions M1–M6.

READ: docs/spec/RPG.md §1, §2, §3 (Hesper, Juniper's card only — she joins in Phase 11),
§4 (all of it), §6 (status effects), §7 (Copper and Iron tiers, the classes), §8 (backpacks,
the belt), §10 (M1–M6), §11, §12 Phase 10; docs/spec/PROMPT.md §19; docs/GUARDRAILS.md.

GOAL: A readable action game under the town — every attack telegraphed, a dodge with
invulnerability frames, one spell slot, status effects as data — where a knocked-out
character is carried home and never killed.

BUILD: CombatScene extending VaultScene with Arcade physics; entities with Health, Statuses,
Hitbox/Hurtbox, a StateMachine (idle → telegraph → attack → recover → stagger → down) and
behaviours from the library (chase, dash, ranged, summon, shield, ambush, patrol, swarm);
enemies.json for the Copper and Iron rosters with HP, behaviour, inflicts, weak-to, drops;
bosses/teller.yaml and bosses/underwriter.yaml with phases, patterns, lines and adds;
status.json with all twelve effects, cancel pairs and no-stacking; weapons.json (five classes,
Copper and Iron tiers), the class moves, the input buffer, dodge and parry; Arms skill with
its XP and professions; loot.yaml seeded from day seed + run nonce; the knockout rule and
the Chapel wake-up; Peaceful and Standard modes; the Armory (Hesper's card, weapons and
armor shop, bounty board as a separate screen); backpack progression and the tool belt,
tools as weapons; missions/m1–m6.yaml; the companions' hooks left empty for Phase 11;
pnpm sim:vault for real.

CONTRACTS: Heart 100 + 10 per Arms level; Ink 60 (unused until Phase 11); dodge 0.35 s with
0.25 s invulnerability and 0.8 s cooldown, no Vigor; parry window 0.2 s; input buffer 150 ms;
hit-stop 60 ms; telegraphs 0.4–0.8 s; damage = weapon roll × (1 + 0.05 × Arms) × class
modifier × crit; taken = enemy − defense, min 1; tithe 10% of carried Marks capped at 500 ₥
and 10% of run loot, nothing else lost; floors cost 6 Vigor; at most 12 live enemies on
Copper rising to 20 later; Arms XP 5 per kill, 200 per keeper.

TESTS FIRST: (AC1) pnpm sim:vault clears Copper with a Copper Blade at Arms 1 in 20–30
minutes of simulated play and beats the Teller in 3–5 minutes; (AC2) a knocked-out
character wakes at the Chapel at 06:00 with weapons, spells, pages and companions intact
and the tithe logged; (AC3) 500 seeds generate identical floors on replay; (AC4) depcruise
and the manifest-hash test pass with gear equipped; plus status apply/cancel/no-stack tests,
the damage formula for every class, and a test that combat refuses to start in a safe zone.

ASK ME: whether Peaceful or Standard is the default for new saves (spec: Standard);
whether the tithe should be waived in Year 1 Spring (default: no).

DO NOT: let any enemy, drop or stat read an agent field; add a timer, streak or score tied
to the real side; spawn an enemy within sight of the firm; kill or roll back a save.

DONE WHEN: AC1–AC4 green and the reviewer PASSes; VERIFY.md Phase 10 walks M1 → M4 on
Standard and the knockout on purpose.
