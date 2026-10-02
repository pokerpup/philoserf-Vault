/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'game-never-imports-gateway-or-mayor-policy',
      comment:
        'PROMPT.md §3.5 and §6.7: apps/town-server/game/**, packages/game-*/** and apps/town-client/src/game/** have no import path to gateway/** or mayor/policy/**.',
      severity: 'error',
      from: { path: '^(packages/game-[^/]+/|apps/town-server/game/|apps/town-client/src/game/)' },
      // reachable: the rule is about any import *path*, so a route through events/ or a package fails too.
      to: { path: '^apps/town-server/(gateway|mayor/policy)/', reachable: true },
    },
    {
      name: 'client-never-imports-server',
      comment: 'The client only talks to the server over HTTP and SSE.',
      severity: 'error',
      from: { path: '^apps/town-client/' },
      to: { path: '^apps/town-server/' },
    },
    {
      name: 'no-circular',
      severity: 'warn',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|dist|public)/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'types', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
