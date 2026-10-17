// Menjalankan semua test browser terhadap halaman demo.
//
//   npm run test:browser                 # Chromium
//   npm run test:browser -- firefox      # Firefox
//   npm run test:browser -- all          # Chromium, Firefox, WebKit
//
// Browser Playwright dipasang sekali: npx playwright install chromium firefox webkit
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const engines = !args.length ? ['chromium'] : args.includes('all') ? ['chromium', 'firefox', 'webkit'] : args;
const files = readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort();

// Proses anak dijalankan asinkron: server Vite berada di proses ini, jadi tidak boleh diblokir.
function runFile(file, engine) {
  return new Promise((resolve) => {
    const child = spawn('node', [join(here, file)], { env: { ...process.env, BROWSER: engine } });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('close', (status) => resolve({ status, output }));
  });
}

const server = await createServer({ root: join(here, '../..'), server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();

let failed = 0;
for (const engine of engines) {
  let passed = 0;
  for (const file of files) {
    const run = await runFile(file, engine);
    const lines = run.output.split('\n');
    const pass = lines.filter((l) => l.startsWith('PASS')).length;
    const fails = lines.filter((l) => /^(FAIL|ERROR)/.test(l));
    passed += pass;
    failed += fails.length + (run.status && !fails.length ? 1 : 0);
    console.log(`${fails.length || run.status ? '✗' : '✓'} ${engine.padEnd(8)} ${file}: ${pass} lolos${fails.length ? `, ${fails.length} gagal` : ''}`);
    fails.forEach((l) => console.log(`    ${l.slice(0, 300)}`));
    if (run.status && !fails.length) console.log(lines.slice(-8).join('\n'));
  }
  console.log(`  ${engine}: ${passed} pemeriksaan lolos\n`);
}

await server.close();
process.exit(failed ? 1 : 0);
