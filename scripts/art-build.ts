// pnpm art:build — compiles art/pixel into what the client loads under
// apps/town-client/public/assets/tallyford: the town tileset in four seasons and its Tiled map,
// the character atlas and portraits for every card in packages/sim/fixtures, the UI atlas and the
// bitmap font. Every output is recorded in art/provenance.json; `pnpm art:qa` checks them all.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIRS, frame, FRAMES_PER_DIR, HAIR_STYLES, type Look } from '../art/pixel/characters.ts';
import { buildFont } from '../art/pixel/font.ts';
import { paletteGpl, SEASON_SWAPS, SKIN, TRIO, type Season } from '../art/pixel/palette.ts';
import { AtlasBuilder, toPNG } from '../art/pixel/pixmap.ts';
import { EXPRESSIONS, portraitStrip } from '../art/pixel/portraits.ts';
import { buildTown, MAP_H, MAP_W } from '../art/pixel/town-map.ts';
import { smokeFrames } from '../art/pixel/objects.ts';
import { BUBBLE, BUBBLE_TAIL, EMOTES, lightMask, PANEL, ring } from '../art/pixel/ui.ts';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'apps', 'town-client', 'public', 'assets', 'tallyford');
const FIXTURES = join(ROOT, 'packages', 'sim', 'fixtures');
const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

const written: string[] = [];

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
function write(rel: string, data: Buffer | string): void {
  const file = join(OUT, rel);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, data);
  written.push(relative(ROOT, file));
}

/** The look stored on a card under visual.layers; checked field by field, no guesses. */
function lookOf(card: unknown, file: string): Look {
  const layers = (
    card as {
      data?: { extensions?: { agent_town?: { visual?: { layers?: Record<string, unknown> } } } };
    }
  ).data?.extensions?.agent_town?.visual?.layers;
  if (!layers) throw new Error(`${file}: visual.layers missing (run pnpm sim:fixtures)`);
  const str = (k: string): string => {
    const v = layers[k];
    if (typeof v !== 'string') throw new Error(`${file}: visual.layers.${k} must be a string`);
    return v;
  };
  const skin = str('skin');
  const hair = str('hair');
  const hairColor = str('hair_color');
  const top = str('top');
  const bottom = str('bottom');
  if (!(skin in SKIN)) throw new Error(`${file}: unknown skin ${skin}`);
  if (!HAIR_STYLES.includes(hair as never)) throw new Error(`${file}: unknown hair ${hair}`);
  for (const t of [hairColor, top, bottom])
    if (!(t in TRIO)) throw new Error(`${file}: unknown ramp ${t}`);
  const accessory = layers.accessory;
  return {
    skin: skin as Look['skin'],
    hair: hair as Look['hair'],
    hairColor: hairColor as Look['hairColor'],
    eyes: str('eyes'),
    top: top as Look['top'],
    bottom: bottom as Look['bottom'],
    shoes: str('shoes'),
    accessory: typeof accessory === 'string' ? (accessory as Look['accessory']) : 'none',
  };
}

// write in place (a running Vite dev server keeps its public-folder watch), then prune stale files
mkdirSync(OUT, { recursive: true });
const before = new Set(walk(OUT));

// 1. palette
writeFileSync(join(ROOT, 'art', 'palette.gpl'), paletteGpl());

// 2. the town
const town = buildTown();
for (const s of SEASONS) write(`tiles-${s}.png`, toPNG(town.tileset.render(SEASON_SWAPS[s])));
write('town.json', JSON.stringify(town.json) + '\n');

// 3. people from the sim's cards
const cards = readdirSync(FIXTURES)
  .filter((f) => f.endsWith('.card.json'))
  .sort()
  .map((f) => ({
    file: f,
    card: JSON.parse(readFileSync(join(FIXTURES, f), 'utf8')) as {
      data: { name: string; extensions: { agent_town: { id: string } } };
    },
  }));
const chars = new AtlasBuilder(512);
const people: { id: string; name: string }[] = [];
for (const { file, card } of cards) {
  const id = card.data.extensions.agent_town.id;
  const look = lookOf(card, file);
  for (const d of DIRS)
    for (let n = 0; n < FRAMES_PER_DIR; n++) chars.add(`${id}/${d}/${n}`, frame(look, d, n));
  write(`portraits/${id}.png`, toPNG(portraitStrip(look)));
  people.push({ id, name: card.data.name });
}
const charSheet = chars.render();
write('characters.png', toPNG(charSheet.sheet));
write(
  'characters.json',
  AtlasBuilder.phaserJson(charSheet.frames, 'characters.png', charSheet.sheet),
);
write(
  'portraits.json',
  JSON.stringify({ expressions: EXPRESSIONS, size: 64, people }, null, 2) + '\n',
);

// 4. UI atlas, the panel on its own for CSS, and the font
const ui = new AtlasBuilder(256);
ui.add('panel', PANEL);
ui.add('bubble', BUBBLE);
ui.add('bubble-tail', BUBBLE_TAIL);
for (const [k, p] of Object.entries(EMOTES)) ui.add(`emote-${k}`, p);
ui.add('light', lightMask());
ui.add('ring', ring());
smokeFrames().forEach((f, i) => ui.add(`smoke-${i}`, f));
const uiSheet = ui.render();
write('ui.png', toPNG(uiSheet.sheet));
write('ui.json', AtlasBuilder.phaserJson(uiSheet.frames, 'ui.png', uiSheet.sheet));
write('ui/panel.png', toPNG(PANEL));
const font = buildFont('cream', 'tally');
write('font/tally.png', toPNG(font.sheet));
write('font/tally.xml', font.xml);
const fontInk = buildFont('ink', 'tally-ink');
write('font/tally-ink.png', toPNG(fontInk.sheet));
write('font/tally-ink.xml', fontInk.xml);

// 5. manifest and provenance
write(
  'manifest.json',
  JSON.stringify(
    {
      generated_by: 'scripts/art-build.ts',
      map: {
        width: MAP_W,
        height: MAP_H,
        tiles: town.tileset.tiles.length,
        water_tiles: Object.keys(town.waterCycle).length,
        lights: town.lights.length,
        spawns: town.spawns.length,
        smoke: town.smoke.length,
      },
      people: people.length,
      seasons: SEASONS,
    },
    null,
    2,
  ) + '\n',
);
for (const stale of before)
  if (!written.includes(relative(ROOT, stale))) rmSync(stale, { force: true });
const provenanceFile = join(ROOT, 'art', 'provenance.json');
const keep = (JSON.parse(readFileSync(provenanceFile, 'utf8')) as { file: string }[]).filter(
  (e) => !e.file.startsWith('apps/town-client/public/assets/'),
);
const today = new Date().toISOString().slice(0, 10);
for (const f of written.filter((w) => w.endsWith('.png'))) {
  keep.push({
    file: f,
    source: 'original: art/pixel/*.ts compiled by scripts/art-build.ts',
    prompt: null,
    date: today,
    licence: 'project (MIT, see LICENSE)',
  } as never);
}
writeFileSync(provenanceFile, JSON.stringify(keep, null, 2) + '\n');
console.log(
  `art:build — ${town.tileset.tiles.length} tiles, ${people.length} people, ${written.length} files under apps/town-client/public/assets/tallyford`,
);
