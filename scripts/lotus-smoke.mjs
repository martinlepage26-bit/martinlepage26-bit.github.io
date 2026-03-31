import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { once } from 'node:events';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const host = process.env.LOTUS_SMOKE_HOST ?? '127.0.0.1';
const port = parseInt(process.env.LOTUS_SMOKE_PORT ?? '4518', 10);
const baseUrl = `http://${host}:${port}`;

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

async function ensureBuiltLotus() {
  const buildCandidates = [
    new URL('../dist/lotus', import.meta.url),
    new URL('../dist/lotus/index.html', import.meta.url),
  ];

  for (const candidate of buildCandidates) {
    try {
      await access(candidate, fsConstants.R_OK);
      return;
    } catch {
      // keep checking the remaining candidate paths
    }
  }

  throw new Error(
    'LOTUS smoke requires an existing build at dist/lotus or dist/lotus/index.html. Run `npm run lotus:full-check` or `npm run build` first.',
  );
}

async function waitForPreview(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/lotus`);
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // preview is not ready yet
    }

    await delay(500);
  }

  throw new Error(`Preview server did not become reachable within ${timeoutMs}ms at ${url}/lotus`);
}

async function stopPreview(preview) {
  if (preview.exitCode !== null) {
    return;
  }

  preview.kill('SIGTERM');
  await Promise.race([once(preview, 'exit'), delay(3000)]);

  if (preview.exitCode === null) {
    preview.kill('SIGKILL');
    await once(preview, 'exit');
  }
}

async function fetchHtmlOk(route, expectedTitle, expectedSnippets, unexpectedSnippets = []) {
  const response = await fetch(`${baseUrl}${route}`);
  if (response.status < 200 || response.status >= 400) {
    throw new Error(`Route failed: ${route} -> HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  assert.match(contentType, /text\/html/i, `Route should return HTML content: ${route}`);

  const body = await response.text();
  assert.match(body, expectedTitle, `Route should render the expected Lotus document title: ${route}`);
  for (const snippet of expectedSnippets) {
    assert.match(body, snippet, `Route should include the expected Lotus copy for ${route}`);
  }
  for (const snippet of unexpectedSnippets) {
    assert.doesNotMatch(body, snippet, `Route should not include stale Lotus content for ${route}`);
  }
  assert.doesNotMatch(body, /\{\{.*\}\}/, `Route should not expose unresolved template placeholders: ${route}`);

  console.log(`ok ${route} -> ${response.status} ${contentType}`);
}

async function main() {
  console.log('==> Running LOTUS source contract checks');
  await runNpm(['run', 'lotus:check']);

  console.log('==> Reusing existing build');
  await ensureBuiltLotus();

  console.log(`==> Starting preview at ${baseUrl}`);
  const preview = spawn(
    npmCmd,
    ['run', 'preview', '--', '--host', host, '--port', String(port), '--strictPort'],
    { stdio: 'inherit' },
  );

  try {
    await waitForPreview(baseUrl);
    await fetchHtmlOk(
      '/lotus',
      /<title>Lotus \| LOTUS<\/title>/,
      [
        /When life gets harder to carry, LOTUS helps make the pattern clearer\./,
        /id="lotus-workbench"/,
        /id="lotus-vector"/,
      ],
      [/Open the first bloom\./],
    );
    await fetchHtmlOk(
      '/lotus/',
      /<title>Lotus \| LOTUS<\/title>/,
      [
        /When life gets harder to carry, LOTUS helps make the pattern clearer\./,
        /id="lotus-workbench"/,
        /id="lotus-vector"/,
      ],
      [/Open the first bloom\./],
    );
    await fetchHtmlOk(
      '/lotus/research/',
      /<title>Lotus Research Route \| LOTUS<\/title>/,
      [
        /The Lotus agency scorer is back on the main route\./,
        /Open the Lotus scorer/,
      ],
    );
    console.log('LOTUS smoke test passed.');
  } finally {
    await stopPreview(preview);
  }
}

main().catch((error) => {
  console.error(`LOTUS smoke test failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
