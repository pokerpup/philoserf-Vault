# PHASE 11 — MAGIC, GEAR, COMPANIONS, FISHING (branch: phase/11-ledgercraft · 1–2 sessions · plan first · Opus-class)

ROLE: Senior game engineer. Phase 11 only: Ledgercraft, the Gilded Reading Room and the
Broker, the full gear system, companions, the fishing expansion, C1–C5 and M7.

READ: docs/spec/RPG.md §3 (the party, Juniper, Tallow, Brother Osric), §5, §7 (all tiers,
Seals, armor, charms, uniques, tempering), §8 (tonics, meals), §9, §10 (C1–C5, M7, the
legendary hunts), §12 Phase 11; docs/GUARDRAILS.md.

BUILD: spells.json with the sixteen Entries, Ink pool and regen, Entry levels I–III, the
second slot at Ledgercraft 5, Ledgercraft XP and professions, magic refused in safe zones;
the Gilded Reading Room roster and bosses/broker.yaml with the three deals; weapons.json
Gold, Sterling and Moonsilver, seals.json, armor.json, charms, soles, tempering +1..+5,
Moonsilver forging at the smithy; uniques Breakeven, Clerk's Lantern, Underwriter's Shield,
Red Ribbon, Comptroller's Seal placeholder; tonics.json and the meal buffs in recipes.json;
companions (Juniper, Ada 22:00–06:00, created residents at the Armory) with follow-and-engage
AI, companion Trust from runs, sit-out on 0 HP; rods.json, tackle.json, bait, the marsh and
Vault pools, the fish pond and traps, legends.yaml with the catch sequence (bar → Stamp or
Reconcile window → bar) and the first three hunts; missions c1–c5 and m7; Juniper's forge
quest producing The Final Tally.

CONTRACTS: Ink 60 + 5 per level, regen 1/s out of combat and 0.3/s in; Entry costs and
effects exactly as §5; cancel pairs Scorched/Frosted, Balanced/Overdrawn, Insured/Red-Inked;
the Broker keeps every promise (deal status and drop both applied); companion AI is scripted,
never a model; live agents are never companions; legendary fish never sell.

TESTS FIRST: (AC1) every spell casts in the Vault and refuses in every safe zone; (AC2) a
created resident completes C5 as the only companion and gains the lore.memories entry (and
the manifest-hash test still passes if that resident is later awakened); (AC3) each of the
Broker's deals applies its status and its drop; (AC4) The Auditor is catchable only after
01:00 with luck ≥ 0.05 at the Ford with Ash Rod and Bug Bait; plus tempering math, Seal
socketing and removal, and pond breeding over 14 ticks.

ASK ME: whether companions may be two created residents at once (default: yes); whether Ada
should also be available by day after her 10-heart event (default: no).

DO NOT: give any companion a model call; let a Seal, meal or spell touch an agent field;
sell a unique in any shop.

DONE WHEN: AC1–AC4 green and the reviewer PASSes; VERIFY.md Phase 11 includes one
legendary hunt start to finish.
