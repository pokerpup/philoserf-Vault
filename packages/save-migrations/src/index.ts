import { z } from 'zod';

// PROMPT.md §3: forward-only save migrations + historical fixtures. Phase 0 defines v1 (the save
// envelope) so every later phase adds a step here and a fixture under fixtures/ instead of editing v1.

export const CURRENT_SAVE_VERSION = 1;

export const SaveV1 = z
  .object({
    v: z.literal(1),
    created_at: z.iso.datetime(),
    /** Spring 1 in the player's local zone (§7.3.4); every later clock reading derives from it. */
    spring_one: z.object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      day: z.number().int().min(1).max(31),
    }),
    town_seed: z.number().int().nonnegative(),
    /** §7.3.5: Sim Season saves never mint bridge Marks. */
    sim: z.boolean(),
  })
  .loose();
export type SaveV1 = z.infer<typeof SaveV1>;
export type Save = SaveV1;

type Step = {
  from: number;
  to: number;
  up: (s: Record<string, unknown>) => Record<string, unknown>;
};
/** Ordered, forward-only; a step never reads a later version's fields. */
export const STEPS: readonly Step[] = [];

const Versioned = z.object({ v: z.number().int().positive() }).loose();

export function migrate(raw: unknown): Save {
  let doc = Versioned.parse(raw) as Record<string, unknown> & { v: number };
  if (doc.v > CURRENT_SAVE_VERSION)
    throw new Error(`save v${doc.v} is newer than this build (v${CURRENT_SAVE_VERSION})`);
  for (const step of STEPS) {
    if (doc.v === step.from) doc = { ...step.up(doc), v: step.to } as typeof doc;
  }
  return SaveV1.parse(doc);
}

export function newSave(now: Date, townSeed: number, sim = false): Save {
  return SaveV1.parse({
    v: 1,
    created_at: now.toISOString(),
    spring_one: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() },
    town_seed: townSeed,
    sim,
  });
}
