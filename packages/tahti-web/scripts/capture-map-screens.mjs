import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outRoot = join(__dirname, '../public/map/nuclear');
mkdirSync(outRoot, { recursive: true });

const BASE = process.env.MAP_BASE_URL || 'https://beta.tahti.live';
const CHANNEL = process.env.MAP_CHANNEL || 'liis-kask-ee';
// username often equals slug prefix before -ee/-fi
const USER =
  process.env.MAP_USER || CHANNEL.replace(/-(ee|fi|vn|lv|se|no|dk)$/, '');

/** @type {{ id: string; path: string; wait?: number }[]} */
const shots = [
  { id: 'listen', path: '/' },
  { id: 'radio', path: '/radio' },
  { id: 'channel', path: `/channel/${CHANNEL}` },
  { id: 'profile', path: `/u/${USER}` },
  { id: 'subscribe', path: `/subscribe/${USER}` },
  { id: 'login', path: '/login' },
  { id: 'join', path: '/join' },
  { id: 'verify', path: '/verify' },
  { id: 'library', path: '/library' },
  { id: 'governance', path: '/governance' },
  { id: 'settings', path: '/settings' },
  { id: 'sources', path: '/sources' },
  { id: 'studio', path: '/studio' },
  { id: 'go-live', path: '/studio/go-live' },
  { id: 'archive', path: '/studio/archive' },
  { id: 'collections', path: '/studio/collections' },
  { id: 'upload', path: '/studio/upload' },
  { id: 'stash', path: '/studio/stash' },
  { id: 'stats', path: '/studio/stats' },
  { id: 'stats-detail', path: '/studio/stats/detail' },
  { id: 'more', path: '/more' },
  { id: 'help', path: '/help' },
  { id: 'status', path: '/status' },
  { id: 'transparency', path: '/transparency' },
];

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});

// Pitch-quality captures: a named, populated artist (not generic "Demo
// Artist"), and LIVE so the go-live/studio shots show the real on-air
// state instead of an empty connect flow.
const AUTH_STATE = {
  state: {
    user: {
      id: 'mock-1',
      email: 'demo@tahti.live',
      username: USER,
      displayName: 'Mart Saar',
      isBoard: false,
      membershipStatus: 'ACTIVE',
      channel: { slug: CHANNEL, state: 'LIVE' },
    },
  },
  version: 0,
};

/** Right rail (chat/queue) is collapsed on every shot except one, so the
 * chat feature is demonstrated exactly once rather than showing
 * "Chat unavailable" on every single capture. */
const CHAT_DEMO_SHOT_ID = 'channel';

async function setLocalStorage(p) {
  await p.evaluate(
    ({ auth, rightCollapsed }) => {
      localStorage.setItem('tahti-web-auth', JSON.stringify(auth));
      localStorage.setItem(
        'tahti-web-layout',
        JSON.stringify({
          state: {
            leftCollapsed: false,
            rightCollapsed,
            leftWidth: 220,
            rightWidth: 340,
            bottomQueueOpen: false,
          },
          version: 3,
        }),
      );
    },
    { auth: AUTH_STATE, rightCollapsed: true },
  );
}

// Prime localStorage from an actual page on BASE before the shot loop
// (can't set localStorage before a document has loaded that origin).
await page
  .goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 })
  .catch(() => {});
await setLocalStorage(page);

for (const s of shots) {
  const url = `${BASE}${s.path}`;
  const out = join(outRoot, `${s.id}.png`);
  try {
    // Re-apply layout state per shot (some pages reset chatSlug/rightCollapsed
    // on mount) -- keep chat open only for the one demo shot.
    await page.evaluate(
      (rightCollapsed) => {
        const raw = localStorage.getItem('tahti-web-layout');
        const parsed = raw ? JSON.parse(raw) : { state: {}, version: 3 };
        parsed.state.rightCollapsed = rightCollapsed;
        localStorage.setItem('tahti-web-layout', JSON.stringify(parsed));
      },
      s.id === CHAT_DEMO_SHOT_ID ? false : true,
    );
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(s.wait ?? 900);
    // Hide cookie/noise if any; capture main viewport
    await page.screenshot({ path: out, fullPage: false });
    console.log('ok', s.id, s.path);
  } catch (err) {
    console.error('fail', s.id, err.message);
    // Still try a quick load screenshot
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: out, fullPage: false });
      console.log('ok-soft', s.id);
    } catch (e2) {
      console.error('skip', s.id, e2.message);
    }
  }
}

await browser.close();
console.log('done', outRoot);
