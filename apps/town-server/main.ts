import { buildApp, startTicking } from './app.ts';

// Phase 0 defaults (DECISIONS.md): server on 3001, client on 3000, loopback only.
const PORT = Number(process.env.TOWN_SERVER_PORT ?? 3001);
const HOST = process.env.TOWN_SERVER_HOST ?? '127.0.0.1';

const town = buildApp();
const stop = startTicking(town);
town.app.addHook('onClose', async () => stop());

const shutdown = () => {
  town.app.close().then(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await town.app.listen({ port: PORT, host: HOST });
console.log(
  `town-server: http://${HOST}:${PORT}/api/health · ${town.fleet.roster().length} sim agents · bridge rate 0`,
);
