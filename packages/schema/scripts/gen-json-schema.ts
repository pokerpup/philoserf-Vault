// Writes the JSON Schema twins of the Zod contracts (PROMPT.md §3: "Zod schemas + generated JSON Schema").
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { AgentEvent, CardV2, EventEnvelope } from '../src/index.ts';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'json');
mkdirSync(out, { recursive: true });
const targets = {
  'card-v2.schema.json': CardV2,
  'event-envelope.schema.json': EventEnvelope,
  'agent-event.schema.json': AgentEvent,
} as const;
for (const [file, schema] of Object.entries(targets)) {
  const json = z.toJSONSchema(schema, { target: 'draft-7', unrepresentable: 'any' });
  writeFileSync(join(out, file), JSON.stringify(json, null, 2) + '\n');
  console.log(`wrote packages/schema/json/${file}`);
}
