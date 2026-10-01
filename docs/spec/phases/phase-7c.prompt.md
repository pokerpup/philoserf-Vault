# PHASE 7C — THE VAULT SHELL (branch: phase/7c-vault-shell · 1 session · plan first · Sonnet)

ROLE: Senior game engineer. 7C only: the Vault Below without combat — floors, ladders, ore,
gems, pages, the elevator, Peaceful hazards. Combat, enemies and keepers come in Phase 10;
build so Phase 10 extends this scene rather than replacing it.

READ: docs/spec/PROMPT.md §10 (ore and the Vault, Prospecting), §19 item 1 (60 floors, five
wings, elevator every 6), docs/spec/RPG.md §2 (the wings), §11 (floor generation, dungeon.yaml).

BUILD: VaultScene with seeded floor generation from wing-specific prefab rooms (dungeon.yaml),
60 floors in five wings, one hidden ladder per floor, a shaft at 5%, the elevator every 6
floors gated by the Prospectors' Hall, ore nodes by wing (Copper 1–12, Iron 13–24, Gold 25–36,
Sterling 37–60), gems, an Old Ledger page every 3 floors, Peaceful hazards (collapsing shelves,
blinding dust, gusts, coin traps), the Vault pool tiles on floors 30 and 54 (fishing in Phase
11), 6 Vigor per floor, Prospecting XP and professions, the furnace (5 ore + 1 coal → 1 bar).

CONTRACTS: the same seed generates the same floor; a cleared floor stays cleared until the
DayTick; ore and gem values from §10; no enemy entities in this phase.

TESTS FIRST: deterministic generation (500 seeds, identical layouts on replay); the elevator
refuses before the Prospectors' Hall; page cadence every 3 floors over a 60-floor run;
hazards cannot reduce Heart below 1 in Peaceful (Heart exists as a stat from here).

DO NOT: add enemies, weapons or a knockout; bake wing art — placeholders.

DONE WHEN: the sim walks all 60 floors in Peaceful and reports ore, gems and pages per wing
within the §11 income bands for loot (excluding enemy drops).
