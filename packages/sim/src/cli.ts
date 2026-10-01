// pnpm sim        — stream the mock fleet's events as JSON lines for N virtual seconds
// pnpm sim:year   — stub: prints the §10 income table shape (Phase 6 fills it in)
// pnpm sim:vault  — stub: prints the RPG.md §11 Vault band shape (Phase 10 fills it in)
import { mkdirSync, writeFileSync } from 'node:fs';
import { MockFleet } from './fleet.ts';
import { loadFixtures } from './fixtures.ts';

const [, , cmd = 'run', ...rest] = process.argv;
const arg = (name: string, fallback: string) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? (rest[i + 1] as string) : fallback;
};

if (cmd === 'run') {
  const seconds = Number(arg('seconds', '30'));
  const seed = Number(arg('seed', '42'));
  const fleet = new MockFleet(loadFixtures(), { seed });
  const events = fleet.run(seconds);
  for (const e of events) console.log(JSON.stringify(e));
  console.error(
    `sim: ${events.length} events from ${fleet.roster().length} agents over ${seconds}s (seed ${seed})`,
  );
} else if (cmd === 'year') {
  // PROMPT.md §10 income targets (median of 20 seeded runs, no bridge Marks).
  const rows: [string, string][] = [
    ['Year 1 Spring', '4,000–7,000 ₥'],
    ['Year 1 Summer', '15,000–25,000 ₥'],
    ['Year 1 Fall', '30,000–50,000 ₥'],
    ['Year 1 Winter', '8,000–15,000 ₥'],
    ['Year 2 (each season)', '3× Year 1'],
    ['Charter Restored', 'by Year 2 Fall'],
    ["Founder's Audit", '3 lanterns (every festival, half the Vault)'],
  ];
  const lines = [
    'sim:year — 365-day headless economy run',
    'STUB: the farm economy lands in Phase 6; targets from PROMPT.md §10',
    '',
    `${'Period'.padEnd(22)} ${'Target'.padEnd(44)} Result`,
    '-'.repeat(80),
  ];
  for (const [p, t] of rows) lines.push(`${p.padEnd(22)} ${t.padEnd(44)} — (not simulated yet)`);
  mkdirSync('sim', { recursive: true });
  writeFileSync('sim/last-run.log', lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  console.log('\nfull log: sim/last-run.log');
} else if (cmd === 'vault') {
  const lines = [
    'sim:vault — headless combat run',
    'STUB: the Vault lands in Phase 10; bands from RPG.md §11',
    '',
    `${'Wing'.padEnd(22)} ${'Band'.padEnd(44)} Result`,
    '-'.repeat(80),
  ];
  for (const w of [
    'Copper Stacks',
    'Iron Archives',
    'Gilded Reading Room',
    'Treasury',
    'Undercount',
  ])
    lines.push(`${w.padEnd(22)} ${'see RPG.md §11'.padEnd(44)} — (not simulated yet)`);
  console.log(lines.join('\n'));
} else {
  console.error(`unknown command "${cmd}"; use run | year | vault`);
  process.exit(1);
}
