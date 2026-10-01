import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { cruise, type ICruiseResult, type IReporterOutput } from 'dependency-cruiser';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import config from '../.dependency-cruiser.cjs';

// Phase 0 TESTS FIRST: "a depcruise test with one deliberate bad import that fails, then is removed".
// The bad import lives in a throwaway tree so the repo itself never carries it.
const RULE = 'game-never-imports-gateway-or-mayor-policy';
let base: string;

const write = (rel: string, text: string) => {
  const p = join(base, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
};

async function violations(): Promise<ICruiseResult['summary']['violations']> {
  const out: IReporterOutput = await cruise(['apps', 'packages'], {
    ...config.options,
    baseDir: base,
    validate: true,
    ruleSet: { forbidden: config.forbidden },
  });
  return (out.output as ICruiseResult).summary.violations;
}

beforeAll(() => {
  base = mkdtempSync(join(tmpdir(), 'agent-town-wall-'));
  write('apps/town-server/gateway/client.ts', 'export const gateway = 1;\n');
  write('apps/town-server/mayor/policy/engine.ts', 'export const policy = 1;\n');
  write('apps/town-server/events/store.ts', 'export const store = 1;\n');
  write(
    'packages/game-core/src/good.ts',
    "import { store } from '../../../apps/town-server/events/store.ts';\nexport const ok = store;\n",
  );
});
afterAll(() => rmSync(base, { recursive: true, force: true }));

describe('§3.5 dependency wall', () => {
  it('passes a game package that only reads through the event store', async () => {
    expect((await violations()).filter((v) => v.rule.name === RULE)).toEqual([]);
  });

  it('fails a transitive route too: game-core → events/ → gateway', async () => {
    write(
      'apps/town-server/events/leak.ts',
      "import { gateway } from '../gateway/client.ts';\nexport const leak = gateway;\n",
    );
    write(
      'packages/game-core/src/indirect.ts',
      "import { leak } from '../../../apps/town-server/events/leak.ts';\nexport const no = leak;\n",
    );
    const bad = (await violations()).filter((v) => v.rule.name === RULE);
    expect(bad.map((v) => v.from)).toEqual(['packages/game-core/src/indirect.ts']);
    rmSync(join(base, 'apps/town-server/events/leak.ts'));
    rmSync(join(base, 'packages/game-core/src/indirect.ts'));
    expect((await violations()).filter((v) => v.rule.name === RULE)).toEqual([]);
  });

  it('fails a game-core import of mayor/policy and a server game import of gateway, then is clean once removed', async () => {
    write(
      'packages/game-core/src/bad.ts',
      "import { policy } from '../../../apps/town-server/mayor/policy/engine.ts';\nexport const no = policy;\n",
    );
    write(
      'apps/town-server/game/bad.ts',
      "import { gateway } from '../gateway/client.ts';\nexport const no = gateway;\n",
    );
    const bad = (await violations()).filter((v) => v.rule.name === RULE);
    expect(bad.map((v) => v.from).sort()).toEqual([
      'apps/town-server/game/bad.ts',
      'packages/game-core/src/bad.ts',
    ]);
    rmSync(join(base, 'packages/game-core/src/bad.ts'));
    rmSync(join(base, 'apps/town-server/game/bad.ts'));
    expect((await violations()).filter((v) => v.rule.name === RULE)).toEqual([]);
  });
});
