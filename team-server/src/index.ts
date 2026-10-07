import { loadConfig } from './config.ts';
import { log } from './log.ts';
import { createTeamServer } from './server.ts';

const cfg = loadConfig();
if (!cfg.devAuth && !cfg.repo) throw new Error('PROJECT_REPO ("owner/name") is required unless TEAM_DEV_AUTH=1');
const server = createTeamServer({ cfg });

server.listen().then((port) => {
  log.info('team server listening', { port, store: cfg.store, repo: cfg.repo || undefined, devAuth: cfg.devAuth, firebase: cfg.firebaseProjectId || undefined });
  if (cfg.devAuth) log.warn('TEAM_DEV_AUTH is enabled — any client can impersonate any user. Never use in production.');
});

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  log.info('shutting down', { signal });
  const t = setTimeout(() => process.exit(0), 8000);
  await server.close().catch((e) => log.error('shutdown error', { err: String(e) }));
  clearTimeout(t);
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (e) => log.error('unhandledRejection', { err: String(e) }));
