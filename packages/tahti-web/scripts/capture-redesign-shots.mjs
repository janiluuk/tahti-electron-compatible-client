import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../docs/redesign-shots');
mkdirSync(outDir, { recursive: true });

const BASE = process.env.REDESIGN_BASE_URL || 'http://127.0.0.1:5190';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem(
    'tahti-web-auth',
    JSON.stringify({
      state: {
        user: {
          id: 'mock-1',
          email: 'demo@tahti.live',
          username: 'demo',
          displayName: 'Demo Artist',
          isBoard: false,
          membershipStatus: 'ACTIVE',
          channel: { slug: 'demo', state: 'OFFLINE' },
        },
      },
      version: 0,
    }),
  );
});

const shots = [
  {
    path: '/studio/schedule',
    out: 'studio-schedule-v1.png',
    check: (t) => {
      const l = t.toLowerCase();
      return (
        l.includes('schedule') &&
        l.includes('next planned broadcast') &&
        !l.includes('/api/')
      );
    },
  },
  {
    path: '/studio/stats',
    out: 'studio-stats-v1.png',
    check: (t) => {
      const l = t.toLowerCase();
      return (
        l.includes('stats') &&
        l.includes('top tracks') &&
        !l.includes('/api/me/stats')
      );
    },
  },
];

for (const s of shots) {
  await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const text = await page.locator('body').innerText();
  console.log(`--- ${s.out} ---\n`, text.slice(0, 1200));
  if (!s.check(text)) {
    console.error('FAIL check', s.out);
    process.exitCode = 1;
  }
  const out = join(outDir, s.out);
  await page.screenshot({ path: out, fullPage: true });
  console.log('wrote', out);
}

await browser.close();
