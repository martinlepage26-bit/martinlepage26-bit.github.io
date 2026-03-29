import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const host = process.env.SMOKE_HOST ?? '127.0.0.1';
const rawPort = process.env.SMOKE_PORT ?? '4511';
const port = parseInt(rawPort, 10);
if (Number.isNaN(port)) {
  throw new Error(`SMOKE_PORT must be a number, got: ${rawPort}`);
}
const baseUrl = `http://${host}:${port}`;
const baseRoutes = [
  '/',
  '/gaia/',
  '/gaia/book/',
  '/gaia/glossary/',
  '/lotus/',
  '/projects/',
  '/writing/',
  '/governance/',
  '/governance/methods/',
  '/projects/from-ai-anxiety-to-recursive-governance-under-constraint/',
];

function runNpm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCmd, args, { stdio: 'inherit' });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed: npm ${args.join(' ')} (code=${code ?? 'null'}, signal=${signal ?? 'none'})`));
    });
  });
}

async function waitForPreview(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/`);
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // preview is not ready yet
    }

    await delay(500);
  }

  throw new Error(`Preview server did not become reachable within ${timeoutMs}ms at ${url}`);
}

async function stopPreview(preview) {
  if (preview.exitCode !== null) {
    return;
  }

  preview.kill('SIGTERM');

  await Promise.race([
    once(preview, 'exit'),
    delay(3000),
  ]);

  if (preview.exitCode === null) {
    preview.kill('SIGKILL');
    await once(preview, 'exit');
  }
}

async function assertPortAvailable(hostname, portNumber) {
  await new Promise((resolve, reject) => {
    const probe = createServer();

    probe.once('error', (error) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
        reject(new Error(`Smoke port ${hostname}:${portNumber} is already in use. Stop the existing server or set SMOKE_PORT.`));
        return;
      }

      reject(error);
    });

    probe.listen(Number(portNumber), hostname, () => {
      probe.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(undefined);
      });
    });
  });
}

async function pickProjectDetailRoute() {
  const projectsDistDir = join(process.cwd(), 'dist', 'projects');

  const entries = await readdir(projectsDistDir, { withFileTypes: true });
  const firstProjectSlug = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))[0];

  if (!firstProjectSlug) {
    throw new Error('No built project detail routes found under dist/projects');
  }

  return `/projects/${firstProjectSlug}/`;
}

async function run() {
  console.log('==> Building site');
  await runNpm(['run', 'build']);
  await assertPortAvailable(host, port);

  const projectDetailRoute = await pickProjectDetailRoute();
  const routes = [...baseRoutes, projectDetailRoute];

  console.log(`==> Dynamic project route check: ${projectDetailRoute}`);
  console.log(`==> Starting preview at ${baseUrl}`);
  const preview = spawn(
    npmCmd,
    ['run', 'preview', '--', '--host', host, '--port', String(port), '--strictPort'],
    { stdio: 'inherit' },
  );

  try {
    await waitForPreview(baseUrl);

    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route}`);
      if (response.status < 200 || response.status >= 400) {
        throw new Error(`Route failed: ${route} -> HTTP ${response.status}`);
      }
      console.log(`ok ${route} -> ${response.status}`);
    }

    console.log('Smoke test passed.');
  } finally {
    await stopPreview(preview);
  }
}

run().catch((error) => {
  console.error(`Smoke test failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
