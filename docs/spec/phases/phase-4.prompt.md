# PHASE 4 — ART PIPELINE (branch: phase/4-art · 1 session plus my batches · plan first · Sonnet)

ROLE: Senior game engineer and the pixel-artist subagent's lead on Agent Town. Phase 4 only:
the prompt packs, the inbox watcher, the processing pipeline, the hot-swap. You never
generate images yourself in this session.

READ: docs/spec/PROMPT.md §4, §14 (all of it), §17 Phase 4, docs/GUARDRAILS.md,
.claude/rules/art.md, docs/spec/phases/phase-4.md.

GOAL: My Midjourney images become game-ready pixel art on a real grid and a locked palette
without anyone touching Photoshop, and nothing in the repo ever automates Midjourney unless I
opt in with the typed acknowledgment.

BUILD:
1. art/batches/<id>/prompts.md generator from the §14.3 templates, filling {slots} from the
   cards and the building list; the Style Bible batch first (four prompts, one chosen, its
   URL and seed recorded in art/style.json as the global --sref).
2. art/inbox/<id>/ watcher with the naming convention {kind}__{id}__{variant}.png; kinds
   tileset | ground | building | interior | portrait | sprite-ref | mayor | crop | ui | fx.
3. pnpm art:process: #FF00FF key-out or rembg + alpha threshold; grid recovery with
   proper-pixel-art or Retro Diffusion's Pixel Art Fixer (never naive resize); palette lock
   to art/palette.gpl (48 colours) with no dithering by default; outline, orphan-pixel and
   padding cleanup; atlas packing per category and 4×4 walk sheets; assets/manifest.assets.json;
   provenance (source, prompt, date, licence) for every asset; originals in art/raw (git-ignored).
4. pnpm art:qa with the §4.7 checks; hot-swap of placeholders when a processed asset lands.
5. Path B gating only: ART_BROWSER_MODE=on plus the exact acknowledgment string, per-batch
   approval with prompts, count and estimated GPU use shown, max 8 prompts per batch,
   one batch at a time, stop on any warning. Implement the gate and the logging; the browser
   driver itself is a stub that refuses unless both conditions hold.

CONTRACTS: targets — tiles 16×16, buildings multiples of 16, portraits 64×64, characters
16×32, crops 16×16 per stage; six expressions per named character; palette 48 colours; every
asset has provenance or art:qa fails.

TESTS FIRST: (AC) a fixture image at 1024×1024 with an implied 16-px grid processes to a
64×64 asset whose every pixel is in the palette and whose alpha is 0 or 255; the inbox
watcher swaps Rex's placeholder portrait within 5 s of a file landing; art:qa fails on a
fixture with one off-palette pixel and on one missing provenance; Path B refuses to start
without the acknowledgment string.

ASK ME BEFORE BUILDING: nothing; the Style Bible choice happens when I drop the images.

DO NOT: generate, download or scrape anything from Midjourney; use any artist or game name in
a prompt; commit originals; mark an asset as original if it is a placeholder.

DONE WHEN: all AC green; the first prompt pack (Style Bible + Trading Firm + Rex) is written
to art/batches/001/prompts.md for me; VERIFY.md Phase 4 explains the drop-and-watch loop.
