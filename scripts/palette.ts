import { readFileSync } from 'node:fs';

export type Rgb = [number, number, number];

/** Reads a GIMP .gpl palette: "r g b<tab>name" lines after the header. */
export function readPalette(file: string): Map<string, Rgb> {
  const out = new Map<string, Rgb>();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S.*)$/.exec(line);
    if (m) out.set(m[4]!.trim(), [Number(m[1]), Number(m[2]), Number(m[3])]);
  }
  return out;
}

export const rgbKey = (r: number, g: number, b: number): string => `${r},${g},${b}`;
