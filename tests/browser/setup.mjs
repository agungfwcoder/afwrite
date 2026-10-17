// Pengaturan bersama test browser (Playwright).
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as pw from 'playwright';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:5199';
export const SHOTS = process.env.SHOTS || join(tmpdir(), 'wyswyg-screenshots');
mkdirSync(SHOTS, { recursive: true });

// Chromium: pakai Google Chrome yang terpasang jika ada; selain itu browser bawaan Playwright
// (npx playwright install chromium firefox webkit).
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function launch() {
  const engine = process.env.BROWSER || 'chromium';
  const options = engine === 'chromium' && existsSync(CHROME) ? { executablePath: CHROME } : {};
  return { engine, browser: await pw[engine].launch(options) };
}
