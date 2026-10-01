// A 5×7 pixel font for HUD numbers and in-world labels (PROMPT.md §4.5), with a BMFont XML
// descriptor for Phaser. Lower-case letters share the capitals' glyphs.
import { blank, blit, px, type Pixmap } from './pixmap.ts';

const GLYPHS: Record<string, string> = {
  A: `.###.\n#...#\n#...#\n#####\n#...#\n#...#\n#...#`,
  B: `####.\n#...#\n#...#\n####.\n#...#\n#...#\n####.`,
  C: `.####\n#....\n#....\n#....\n#....\n#....\n.####`,
  D: `####.\n#...#\n#...#\n#...#\n#...#\n#...#\n####.`,
  E: `#####\n#....\n#....\n####.\n#....\n#....\n#####`,
  F: `#####\n#....\n#....\n####.\n#....\n#....\n#....`,
  G: `.####\n#....\n#....\n#..##\n#...#\n#...#\n.####`,
  H: `#...#\n#...#\n#...#\n#####\n#...#\n#...#\n#...#`,
  I: `#####\n..#..\n..#..\n..#..\n..#..\n..#..\n#####`,
  J: `....#\n....#\n....#\n....#\n#...#\n#...#\n.###.`,
  K: `#...#\n#..#.\n#.#..\n##...\n#.#..\n#..#.\n#...#`,
  L: `#....\n#....\n#....\n#....\n#....\n#....\n#####`,
  M: `#...#\n##.##\n#.#.#\n#.#.#\n#...#\n#...#\n#...#`,
  N: `#...#\n##..#\n#.#.#\n#..##\n#...#\n#...#\n#...#`,
  O: `.###.\n#...#\n#...#\n#...#\n#...#\n#...#\n.###.`,
  P: `####.\n#...#\n#...#\n####.\n#....\n#....\n#....`,
  Q: `.###.\n#...#\n#...#\n#...#\n#.#.#\n#..#.\n.##.#`,
  R: `####.\n#...#\n#...#\n####.\n#.#..\n#..#.\n#...#`,
  S: `.####\n#....\n#....\n.###.\n....#\n....#\n####.`,
  T: `#####\n..#..\n..#..\n..#..\n..#..\n..#..\n..#..`,
  U: `#...#\n#...#\n#...#\n#...#\n#...#\n#...#\n.###.`,
  V: `#...#\n#...#\n#...#\n#...#\n#...#\n.#.#.\n..#..`,
  W: `#...#\n#...#\n#...#\n#.#.#\n#.#.#\n##.##\n#...#`,
  X: `#...#\n#...#\n.#.#.\n..#..\n.#.#.\n#...#\n#...#`,
  Y: `#...#\n#...#\n.#.#.\n..#..\n..#..\n..#..\n..#..`,
  Z: `#####\n....#\n...#.\n..#..\n.#...\n#....\n#####`,
  '0': `.###.\n#...#\n#..##\n#.#.#\n##..#\n#...#\n.###.`,
  '1': `..#..\n.##..\n..#..\n..#..\n..#..\n..#..\n.###.`,
  '2': `.###.\n#...#\n....#\n...#.\n..#..\n.#...\n#####`,
  '3': `####.\n....#\n....#\n.###.\n....#\n....#\n####.`,
  '4': `...#.\n..##.\n.#.#.\n#..#.\n#####\n...#.\n...#.`,
  '5': `#####\n#....\n####.\n....#\n....#\n#...#\n.###.`,
  '6': `.###.\n#....\n#....\n####.\n#...#\n#...#\n.###.`,
  '7': `#####\n....#\n...#.\n..#..\n.#...\n.#...\n.#...`,
  '8': `.###.\n#...#\n#...#\n.###.\n#...#\n#...#\n.###.`,
  '9': `.###.\n#...#\n#...#\n.####\n....#\n....#\n.###.`,
  ' ': `.....\n.....\n.....\n.....\n.....\n.....\n.....`,
  '.': `.....\n.....\n.....\n.....\n.....\n.##..\n.##..`,
  ',': `.....\n.....\n.....\n.....\n.##..\n..#..\n.#...`,
  ':': `.....\n.##..\n.##..\n.....\n.##..\n.##..\n.....`,
  ';': `.....\n.##..\n.##..\n.....\n.##..\n..#..\n.#...`,
  '!': `..#..\n..#..\n..#..\n..#..\n..#..\n.....\n..#..`,
  '?': `.###.\n#...#\n....#\n...#.\n..#..\n.....\n..#..`,
  "'": `..#..\n..#..\n.#...\n.....\n.....\n.....\n.....`,
  '"': `.#.#.\n.#.#.\n.....\n.....\n.....\n.....\n.....`,
  '-': `.....\n.....\n.....\n#####\n.....\n.....\n.....`,
  '+': `.....\n..#..\n..#..\n#####\n..#..\n..#..\n.....`,
  '/': `....#\n....#\n...#.\n..#..\n.#...\n#....\n#....`,
  '(': `...#.\n..#..\n.#...\n.#...\n.#...\n..#..\n...#.`,
  ')': `.#...\n..#..\n...#.\n...#.\n...#.\n..#..\n.#...`,
  '%': `##..#\n##.#.\n..#..\n..#..\n..#..\n.#.##\n#..##`,
  '&': `.##..\n#..#.\n#.#..\n.#...\n#.#.#\n#..#.\n.##.#`,
  '·': `.....\n.....\n.....\n.##..\n.##..\n.....\n.....`,
  '₥': `#...#\n##.##\n#.#.#\n#.#.#\n#..##\n#.#.#\n##..#`,
  '×': `.....\n#...#\n.#.#.\n..#..\n.#.#.\n#...#\n.....`,
  '→': `.....\n..#..\n...#.\n#####\n...#.\n..#..\n.....`,
};

export const GLYPH_W = 5;
export const GLYPH_H = 7;
const CELL_W = 6;
const CELL_H = 8;
const COLS = 16;

export interface Font {
  sheet: Pixmap;
  xml: string;
}

/** The glyph sheet in `color` plus the BMFont descriptor. */
export function buildFont(color = 'cream', name = 'tally'): Font {
  const keys = Object.keys(GLYPHS);
  const rows = Math.ceil(keys.length / COLS);
  const sheet = blank(COLS * CELL_W, rows * CELL_H);
  const chars: string[] = [];
  keys.forEach((ch, i) => {
    const g = px(GLYPHS[ch]!, { '#': color });
    const x = (i % COLS) * CELL_W;
    const y = Math.floor(i / COLS) * CELL_H;
    blit(sheet, g, x, y);
    const codes = [ch.codePointAt(0)!];
    if (/^[A-Z]$/.test(ch)) codes.push(ch.toLowerCase().codePointAt(0)!);
    for (const id of codes)
      chars.push(
        `<char id="${id}" x="${x}" y="${y}" width="${GLYPH_W}" height="${GLYPH_H}" xoffset="0" yoffset="0" xadvance="${CELL_W}" page="0" chnl="15"/>`,
      );
  });
  const xml = [
    '<?xml version="1.0"?>',
    '<font>',
    `  <info face="${name}" size="${GLYPH_H}" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="0" aa="1" padding="0,0,0,0" spacing="1,1" outline="0"/>`,
    `  <common lineHeight="${CELL_H + 1}" base="${GLYPH_H}" scaleW="${sheet.w}" scaleH="${sheet.h}" pages="1" packed="0" alphaChnl="0" redChnl="4" greenChnl="4" blueChnl="4"/>`,
    `  <pages><page id="0" file="${name}.png"/></pages>`,
    `  <chars count="${chars.length}">`,
    ...chars.map((c) => `    ${c}`),
    '  </chars>',
    '</font>',
    '',
  ].join('\n');
  return { sheet, xml };
}

/** Render a string with the font, for previews and the DOM. */
export function text(s: string, color = 'cream'): Pixmap {
  const chars = [...s.toUpperCase()];
  const out = blank(chars.length * CELL_W, GLYPH_H);
  chars.forEach((ch, i) =>
    blit(out, px(GLYPHS[ch] ?? GLYPHS['?']!, { '#': color }), i * CELL_W, 0),
  );
  return out;
}
