// Regenerates packages/sim/fixtures/*.card.json from src/roles.ts (committed; a test keeps them in sync).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allCards } from '../src/cards.ts';
import { FIXTURES_DIR } from '../src/fixtures.ts';

mkdirSync(FIXTURES_DIR, { recursive: true });
for (const card of allCards()) {
  const id = card.data.extensions.agent_town!.id;
  writeFileSync(join(FIXTURES_DIR, `${id}.card.json`), JSON.stringify(card, null, 2) + '\n');
  console.log(`wrote fixtures/${id}.card.json`);
}
