---
paths:
  - "art/**"
---

# Art: rendering rules, art bible and post-processing

`docs/spec/PROMPT.md` §4 and §14.6, verbatim. Naming patterns for sheets are in `docs/spec/GAME-LAYER.md` §5.

## §4 Rendering rules and art bible essentials

1. Base tile 16×16; internal resolution 480×270 (16:9) scaled by integer factors only (2×, 3×, 4×), letterboxed. Never fractional zoom on the town layer.
2. Phaser config `render: { pixelArt: true }` (no antialias, roundPixels on), camera `roundPixels = true`, `Scale.FIT` with an integer-zoom override, nearest-neighbour filtering on every texture; CSS `image-rendering: pixelated` on the canvas and every sprite or portrait image, shown at integer multiples.
3. Characters are 16×32 (two tiles tall); portraits 64×64 with six expressions (neutral, happy, sad, annoyed, surprised, smug); one shared 48-colour warm palette in `art/palette.gpl` (portraits use a 32-colour subset each); 1-px selective dark outlines; light from the upper left; seasons are palette swaps plus a few replacement tiles; night is one blue-violet overlay at 55% plus warm light masks.
4. Creator layers (body ×6 skin ramps, hair ×24, eyes ×8, top ×16, bottom ×10, shoes ×6, accessory ×14) share one 16×32 frame grid and a feet anchor, drawn in a neutral ramp that a Phaser 4 palette-swap pipeline recolours at runtime, so a new resident needs no new sheet. Animation sets: walk 4×4 dir, idle 2, sit/work 2 + type-burst, tool swings 4×4 dir (hoe, can, axe, pick, rod), carry 4, emote pops (heart, !, ?, zzz, gear, letter), rest 2; agents add phone, eureka, stretch; the Mayor adds stamp, bell, glasses.
5. UI is wood-panel with brass corners and 3-slice frames; a 5×7 pixel font for HUD numbers; a licensed pixel font (OFL or CC0, licence stored) for body text at 2× minimum; a readable non-pixel font toggle.
6. Placeholders until the pipeline delivers: Kenney Tiny Town and Tiny series (CC0), licences stored in `assets/third_party`. Every asset carries provenance (source, prompt, date, licence).
7. `pnpm art:qa` fails on off-grid pixels, colours outside the palette, orphan pixels, silhouettes touching the frame, inconsistent light direction, identical crop stages, portrait expressions under 12 pixels different from neutral, or missing provenance.

## §14.6 Post-processing (`pnpm art:process`)

1. Key out flat #FF00FF; otherwise rembg, then threshold alpha to 0/255.
2. Grid recovery: detect the implied pixel grid and downscale to true resolution with proper-pixel-art or Retro Diffusion's Pixel Art Fixer, never naive resizing. Targets: tiles 16×16, buildings multiples of 16, portraits 64×64, characters 16×32, crops 16×16 per stage.
3. Palette lock to `palette.gpl`, no dithering unless enabled; report assets whose colour error is too high.
4. Cleanup: 1-px outline consistency, no orphan pixels, 1-px transparent padding; then the `pnpm art:qa` checks from §4.
5. Pack Phaser atlases per category and 4-direction × 4-frame walk sheets; write `assets/manifest.assets.json`; keep originals in `art/raw` (git-ignored); record provenance for every asset.
