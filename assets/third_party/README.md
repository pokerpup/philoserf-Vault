# Third-party assets

PROMPT.md §4.6 allows Kenney Tiny Town and the Tiny series (CC0 1.0) as placeholders, with their
licence files stored here. The town does not use them: every picture is original, drawn as code in
`art/pixel/` and compiled by `pnpm art:build`, recorded in `art/provenance.json`.

If a later phase does drop a CC0 pack in, keep its `License.txt` beside the images in a subfolder
here and add each file to `art/provenance.json` with `"licence": "CC0 1.0"`; `pnpm art:qa` checks
grid and provenance for CC0 files and skips the palette check, which binds only art made for this
project.
