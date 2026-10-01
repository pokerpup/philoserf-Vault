// 64×64 portrait busts (PROMPT.md §4.3): six expressions, composed from the same look as the
// sprite so the face in the panel is the person on the map. Hair is drawn as shapes, not copied.
import { SKIN, TRIO, type Ramp } from './palette.ts';
import {
  blank,
  blit,
  fillCircle,
  fillEllipse,
  fillRect,
  get,
  px,
  set,
  type Pixmap,
} from './pixmap.ts';
import type { Look } from './characters.ts';

export const EXPRESSIONS = ['neutral', 'happy', 'sad', 'annoyed', 'surprised', 'smug'] as const;
export type Expression = (typeof EXPRESSIONS)[number];

const CX = 32;
const HEAD_CY = 30;
const HEAD_RX = 17;
const HEAD_RY = 19;

function head(
  skin: readonly [string, string, string],
  topColor: readonly [string, string, string],
): Pixmap {
  const [sh, main, hi] = skin;
  const p = blank(64, 64);
  // shoulders and collar
  for (let y = 50; y < 64; y++) {
    const half = 12 + (y - 50) * 1.4;
    for (let x = 0; x < 64; x++) {
      const dx = x + 0.5 - CX;
      if (Math.abs(dx) > half) continue;
      set(p, x, y, dx < -half * 0.5 ? topColor[2] : dx > half * 0.55 ? topColor[0] : topColor[1]);
      if (Math.abs(dx) > half - 1 || y === 63) set(p, x, y, 'ink');
    }
  }
  // collar notch
  for (let y = 50; y < 56; y++)
    for (let x = CX - 2 - (y - 50); x <= CX + 1 + (y - 50); x++)
      if (y - 50 < 4) set(p, x, y, topColor[2]);
  // neck
  fillRect(p, CX - 5, 44, 10, 9, sh);
  for (let y = 44; y < 53; y++) {
    set(p, CX - 5, y, 'ink');
    set(p, CX + 4, y, 'ink');
  }
  // ears
  fillEllipse(p, CX - HEAD_RX, HEAD_CY + 3, 3, 4, main);
  fillEllipse(p, CX + HEAD_RX, HEAD_CY + 3, 3, 4, sh);
  // head with a shadow crescent on the lower right and a highlight on the upper left
  fillEllipse(p, CX, HEAD_CY, HEAD_RX, HEAD_RY, main);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const dx = (x + 0.5 - CX) / HEAD_RX;
      const dy = (y + 0.5 - HEAD_CY) / HEAD_RY;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const inner =
        ((x + 0.5 - CX + 2.5) / (HEAD_RX - 2)) ** 2 +
        ((y + 0.5 - HEAD_CY - 2.5) / (HEAD_RY - 2)) ** 2;
      if (inner > 1 && dx + dy > 0.1) set(p, x, y, sh);
      if (d < 0.5 && dx < -0.2 && dy < -0.4) set(p, x, y, hi);
    }
  }
  // selective outline: the darkest skin shade, ink only under the chin
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const dx = (x + 0.5 - CX) / HEAD_RX;
      const dy = (y + 0.5 - HEAD_CY) / HEAD_RY;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const outer =
        ((x + 0.5 - CX) / (HEAD_RX - 1)) ** 2 + ((y + 0.5 - HEAD_CY) / (HEAD_RY - 1)) ** 2;
      if (outer > 1) set(p, x, y, dy > 0.3 ? 'ink' : sh === 'bark-dark' ? 'ink' : sh);
    }
  }
  // ear outlines
  for (const [ex, col] of [
    [CX - HEAD_RX - 3, 'ink'],
    [CX + HEAD_RX + 2, 'ink'],
  ] as const)
    for (let y = HEAD_CY; y < HEAD_CY + 7; y++) set(p, ex, y, col);
  return p;
}

const EYE_LEGEND = { w: 'bone', i: 'IRIS', I: 'IRIS_SH', o: 'ink', g: 'cream', '.': null };
const EYES: Record<Expression, string> = {
  neutral: `.ooooo.\nowwiIwo\nowiIIwo\n.ooooo.`,
  happy: `.......\n.ooooo.\no.....o\n.......`,
  sad: `ooo....\n.owwio.\n.owiIo.\n..ooo..`,
  annoyed: `ooooooo\n.wwiIw.\n.ooooo.\n.......`,
  surprised: `.ooooo.\nowwwwwo\nowiIIwo\nowwIIwo\n.ooooo.`,
  smug: `ooooo..\n.wwiIo.\n.oooo..\n.......`,
};
const BROWS: Record<Expression, [string, number]> = {
  neutral: [`.####.\n......`, 0],
  happy: [`.####.\n#....#`, -1],
  sad: [`#.....\n.####.`, -1],
  annoyed: [`......\n######`, 1],
  surprised: [`.####.\n#....#`, -3],
  smug: [`......\n.#####`, 0],
};
const MOUTHS: Record<Expression, string> = {
  neutral: `.......\n.mmmmm.`,
  happy: `m.....m\n.mmmmm.\n..ppp..`,
  sad: `.mmmmm.\nm.....m`,
  annoyed: `...mmmm\n.......`,
  surprised: `..mmm..\n.m000m.\n.m000m.\n..mmm..`,
  smug: `...mmmm\n......m`,
};

function face(p: Pixmap, expr: Expression, iris: string, browColor: string, skinSh: string): void {
  const eye = px(EYES[expr], EYE_LEGEND);
  const left = { IRIS: iris, IRIS_SH: 'ink' };
  const painted = {
    w: eye.w,
    h: eye.h,
    px: eye.px.map((c) => (c === 'IRIS' ? left.IRIS : c === 'IRIS_SH' ? left.IRIS_SH : c)),
  };
  blit(p, painted, 20, 31);
  const mirrored = { w: eye.w, h: eye.h, px: painted.px.slice() };
  for (let y = 0; y < eye.h; y++)
    for (let x = 0; x < eye.w; x++)
      mirrored.px[y * eye.w + x] = painted.px[y * eye.w + (eye.w - 1 - x)]!;
  blit(p, mirrored, 37, 31);
  if (expr === 'neutral' || expr === 'surprised' || expr === 'sad') {
    set(p, 23, 32, 'cream');
    set(p, 40, 32, 'cream');
  }
  const [browRows, dy] = BROWS[expr];
  const brow = px(browRows, { '#': browColor });
  blit(p, brow, 20, 27 + dy);
  const browR = { w: brow.w, h: brow.h, px: brow.px.slice() };
  for (let y = 0; y < brow.h; y++)
    for (let x = 0; x < brow.w; x++)
      browR.px[y * brow.w + x] = brow.px[y * brow.w + (brow.w - 1 - x)]!;
  blit(p, browR, 38, 27 + dy);
  // nose
  set(p, 33, 36, skinSh);
  set(p, 33, 37, skinSh);
  set(p, 33, 38, skinSh);
  set(p, 34, 39, skinSh);
  set(p, 32, 39, skinSh);
  const mouth = px(MOUTHS[expr], { m: 'wine', p: 'peach', '0': 'ink' });
  blit(p, mouth, 29, expr === 'surprised' ? 41 : 42);
  if (expr === 'happy' || expr === 'smug') {
    fillRect(p, 21, 39, 3, 2, 'ember@120');
    fillRect(p, 40, 39, 3, 2, 'ember@120');
  }
}

interface HairShape {
  back?: (p: Pixmap, c: readonly [string, string, string]) => void;
  front: (p: Pixmap, c: readonly [string, string, string]) => void;
}

/** Fill the cap of hair over the top of the head, down to `hairline` at the centre. */
function cap(p: Pixmap, c: readonly [string, string, string], hairline: number, grow = 3): void {
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const dx = (x + 0.5 - CX) / (HEAD_RX + grow);
      const dy = (y + 0.5 - (HEAD_CY - 1)) / (HEAD_RY + grow);
      if (dx * dx + dy * dy > 1) continue;
      // hairline curves up at the temples
      const line = hairline + Math.abs(dx) * 4;
      if (y > line) continue;
      set(p, x, y, shadeHair(dx, dy, c));
    }
  }
}

function shadeHair(dx: number, dy: number, c: readonly [string, string, string]): string {
  const lit = -dx * 0.5 - dy;
  return lit > 0.75 ? c[2] : lit > -0.2 ? c[1] : c[0];
}

function outlineHair(p: Pixmap, color: string): void {
  const edge = new Set<number>();
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const here = get(p, x, y);
      if (here === null || !here.startsWith('HAIR')) continue;
      const n = [get(p, x - 1, y), get(p, x + 1, y), get(p, x, y - 1), get(p, x, y + 1)];
      if (n.some((v) => v === null || !v.startsWith('HAIR'))) edge.add(y * 64 + x);
    }
  }
  for (const i of edge) p.px[i] = color;
}

const H: readonly [string, string, string] = ['HAIR_SH', 'HAIR', 'HAIR_HI'];

const HAIR_SHAPES: Record<string, HairShape> = {
  crop: { front: (p) => cap(p, H, 20, 2) },
  slick: {
    front: (p) => {
      cap(p, H, 17, 3);
      for (let i = 0; i < 5; i++)
        for (let x = 22 + i * 4; x < 24 + i * 4; x++)
          for (let y = 10; y < 17; y++) if (get(p, x, y) === 'HAIR') set(p, x, y, 'HAIR_HI');
    },
  },
  'side-part': {
    front: (p) => {
      cap(p, H, 21, 3);
      // swept fringe over the left brow
      for (let y = 18; y < 30; y++) {
        const x0 = 15 + Math.floor((y - 18) * 0.4);
        const x1 = 34 - Math.floor((y - 18) * 1.6);
        for (let x = x0; x < x1; x++) set(p, x, y, y < 22 ? 'HAIR' : 'HAIR_SH');
      }
    },
  },
  bob: {
    back: (p) => {
      for (let y = 20; y < 46; y++)
        for (let x = 12; x < 52; x++)
          if (((x + 0.5 - CX) / 20) ** 2 + ((y + 0.5 - 30) / 20) ** 2 <= 1)
            set(p, x, y, x < CX ? 'HAIR' : 'HAIR_SH');
    },
    front: (p) => {
      cap(p, H, 23, 3);
      fillRect(p, 11, 26, 6, 20, 'HAIR');
      fillRect(p, 47, 26, 6, 20, 'HAIR_SH');
      for (let x = 11; x < 17; x++) set(p, x, 45, 'HAIR_SH');
    },
  },
  long: {
    back: (p) => {
      for (let y = 20; y < 62; y++)
        for (let x = 10; x < 54; x++)
          if (Math.abs(x + 0.5 - CX) < 22 - Math.max(0, 30 - y) * 0.6)
            set(p, x, y, x < CX ? 'HAIR' : 'HAIR_SH');
    },
    front: (p) => {
      cap(p, H, 22, 3);
      fillRect(p, 10, 26, 6, 36, 'HAIR');
      fillRect(p, 48, 26, 6, 36, 'HAIR_SH');
      for (let y = 18; y < 25; y++) for (let x = CX - 1; x <= CX; x++) set(p, x, y, 'SKIN_HOLE');
    },
  },
  ponytail: {
    back: (p) => {
      fillEllipse(p, 46, 44, 5, 12, 'HAIR_SH');
      fillEllipse(p, 44, 40, 4, 8, 'HAIR');
    },
    front: (p) => cap(p, H, 19, 3),
  },
  bun: {
    front: (p) => {
      cap(p, H, 20, 3);
      fillCircle(p, 36, 8, 6, 'HAIR');
      fillCircle(p, 34, 6, 3, 'HAIR_HI');
      for (let x = 30; x < 42; x++) set(p, x, 14, 'HAIR_SH');
    },
  },
  curly: {
    front: (p) => {
      cap(p, H, 22, 4);
      const bumps: [number, number][] = [
        [14, 24],
        [12, 30],
        [50, 24],
        [52, 30],
        [20, 12],
        [32, 7],
        [44, 12],
        [26, 8],
        [38, 8],
      ];
      for (const [x, y] of bumps) fillCircle(p, x, y, 4.5, x < CX ? 'HAIR' : 'HAIR_SH');
      for (const [x, y] of bumps.slice(4)) set(p, x - 1, y - 2, 'HAIR_HI');
    },
  },
  balding: {
    front: (p) => {
      fillRect(p, 12, 26, 5, 12, 'HAIR');
      fillRect(p, 47, 26, 5, 12, 'HAIR_SH');
      for (let x = 22; x < 43; x++) if ((x + 1) % 7 === 0) set(p, x, 13, 'HAIR_SH');
    },
  },
};

export function portrait(look: Look, expr: Expression): Pixmap {
  const skin = SKIN[look.skin];
  const hairC = TRIO[look.hairColor];
  const topC = TRIO[look.top];
  const shape = HAIR_SHAPES[look.hair] ?? HAIR_SHAPES.crop!;
  const p = blank(64, 64);
  if (shape.back) {
    const back = blank(64, 64);
    shape.back(back, H);
    outlineHair(back, 'HAIR_OUT');
    blit(p, back, 0, 0);
  }
  blit(p, head(skin, topC), 0, 0);
  face(p, expr, look.eyes, hairC[0], skin[0]);
  const front = blank(64, 64);
  shape.front(front, H);
  outlineHair(front, 'HAIR_OUT');
  for (let i = 0; i < front.px.length; i++) if (front.px[i] === 'SKIN_HOLE') front.px[i] = null;
  blit(p, front, 0, 0);
  // accessories
  if (look.accessory === 'glasses') {
    for (const cx of [23, 40]) {
      for (let a = 0; a < 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        set(
          p,
          Math.round(cx + Math.cos(t) * 5.5),
          Math.round(33 + Math.sin(t) * 4.5),
          'slate-dark',
        );
      }
    }
    for (let x = 29; x < 35; x++) set(p, x, 32, 'slate-dark');
  }
  if (look.accessory === 'glasses-up') {
    for (const cx of [26, 38])
      for (let a = 0; a < 48; a++) {
        const t = (a / 48) * Math.PI * 2;
        set(p, Math.round(cx + Math.cos(t) * 5), Math.round(16 + Math.sin(t) * 3), 'slate-dark');
      }
  }
  if (look.accessory === 'headset') {
    for (let a = 0; a < 90; a++) {
      const t = Math.PI + (a / 90) * Math.PI;
      set(
        p,
        Math.round(CX + Math.cos(t) * 20),
        Math.round(HEAD_CY - 2 + Math.sin(t) * 21),
        'slate-dark',
      );
    }
    fillRect(p, 10, 28, 5, 9, 'slate-dark');
    fillRect(p, 11, 29, 3, 7, 'slate');
    for (let y = 37; y < 46; y++) set(p, 14 + Math.floor((y - 37) * 0.8), y, 'slate-dark');
  }
  if (look.accessory === 'tie') {
    fillRect(p, CX - 2, 52, 4, 12, 'brick');
    fillRect(p, CX - 1, 51, 2, 2, 'brick-dark');
  }
  // resolve hair codes
  for (let i = 0; i < p.px.length; i++) {
    const c = p.px[i];
    if (c === 'HAIR') p.px[i] = hairC[1];
    else if (c === 'HAIR_SH') p.px[i] = hairC[0];
    else if (c === 'HAIR_HI') p.px[i] = hairC[2];
    else if (c === 'HAIR_OUT') p.px[i] = hairC[0] === 'ink' ? 'ink' : hairC[0];
  }
  return p;
}

/** The six expressions side by side, 384×64. */
export function portraitStrip(look: Look): Pixmap {
  const strip = blank(64 * EXPRESSIONS.length, 64);
  EXPRESSIONS.forEach((e, i) => blit(strip, portrait(look, e), i * 64, 0));
  return strip;
}

export const _p: Ramp | null = null;
