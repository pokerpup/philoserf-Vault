# Third-party assets

PROMPT.md §4.6: placeholders are Kenney Tiny Town and the Tiny series (CC0 1.0), with their licence
files stored here. This repo was bootstrapped on a machine without download access, so the
placeholder town currently uses a generated flat-colour tileset (`pnpm placeholders`, recorded in
`art/provenance.json`).

To use the Kenney tiles instead:

1. Download Tiny Town from https://kenney.nl/assets/tiny-town and unzip it into
   `assets/third_party/kenney-tiny-town/` (keep Kenney's `License.txt` beside the images).
2. Copy `Tilemap/tilemap_packed.png` to `apps/town-client/public/assets/placeholder/tileset.png`
   and update the `tilesets[0]` entry in `town.json` to the sheet's size (12 columns, 132 tiles).
3. Add the file to `art/provenance.json` with `"licence": "CC0 1.0"` and `"source": "Kenney Tiny Town"`.
   `pnpm art:qa` checks grid and provenance for CC0 files and skips the palette check, which only
   binds art made for this project.
