/**
 * Capture Nuclear UI screenshots for the prod→Nuclear screen atlas.
 * Expect Vite with VITE_FORCE_MOCK=1 on REDESIGN_BASE_URL (default :5190).
 */
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../docs/redesign-shots');
mkdirSync(outDir, { recursive: true });

const BASE = process.env.REDESIGN_BASE_URL || 'http://127.0.0.1:5190';

const authState = {
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
};

/** @type {{ path: string, out: string, auth?: boolean }[]} */
const shots = [
  // Public / listen
  { path: '/', out: 'listen-home-v1.png', auth: false },
  { path: '/radio', out: 'listen-radio-v1.png', auth: false },
  { path: '/channel/demo', out: 'listen-channel-v1.png', auth: false },
  { path: '/u/demo', out: 'listen-artist-v1.png', auth: true },
  { path: '/r/demo', out: 'listen-smartlink-v1.png', auth: false },
  { path: '/subscribe/demo', out: 'subscribe-v1.png', auth: false },
  { path: '/venues', out: 'venues-v1.png', auth: false },
  { path: '/venues/register', out: 'venues-register-v1.png', auth: false },
  { path: '/embed/c/demo', out: 'embed-channel-v1.png', auth: false },
  { path: '/login', out: 'auth-login-v1.png', auth: false },
  { path: '/join', out: 'auth-join-v1.png', auth: false },
  { path: '/help', out: 'help-v1.png', auth: false },
  { path: '/status', out: 'status-v1.png', auth: false },
  { path: '/transparency', out: 'transparency-v1.png', auth: false },
  { path: '/governance', out: 'governance-v1.png', auth: false },
  { path: '/about', out: 'legal-about-v1.png', auth: false },
  // Listener
  { path: '/library', out: 'listener-library-v1.png', auth: true },
  { path: '/messages', out: 'listener-messages-v1.png', auth: true },
  { path: '/settings', out: 'settings-v1.png', auth: true },
  { path: '/sources', out: 'sources-v1.png', auth: true },
  // Studio
  { path: '/studio', out: 'studio-home-v1.png', auth: true },
  { path: '/studio/go-live', out: 'studio-go-live-v1.png', auth: true },
  { path: '/studio/archive', out: 'studio-archive-v1.png', auth: true },
  {
    path: '/studio/archive/arch-mock-1',
    out: 'studio-archive-item-v1.png',
    auth: true,
  },
  { path: '/studio/upload', out: 'studio-upload-v1.png', auth: true },
  { path: '/studio/releases', out: 'studio-releases-v1.png', auth: true },
  {
    path: '/studio/releases/rel-mock-1',
    out: 'studio-release-detail-v1.png',
    auth: true,
  },
  { path: '/studio/collections', out: 'studio-collections-v1.png', auth: true },
  { path: '/studio/editor', out: 'studio-editor-v1.png', auth: true },
  { path: '/studio/schedule', out: 'studio-schedule-v1.png', auth: true },
  { path: '/studio/stats', out: 'studio-stats-v1.png', auth: true },
  {
    path: '/studio/stats/detail',
    out: 'studio-stats-detail-v1.png',
    auth: true,
  },
  { path: '/studio/channel', out: 'studio-channel-v1.png', auth: true },
  {
    path: '/studio/setup-channel',
    out: 'studio-setup-channel-v1.png',
    auth: true,
  },
  { path: '/studio/shows', out: 'studio-shows-v1.png', auth: true },
  { path: '/studio/events', out: 'studio-events-v1.png', auth: true },
  { path: '/studio/playlists', out: 'studio-playlists-v1.png', auth: true },
  { path: '/studio/updates', out: 'studio-updates-v1.png', auth: true },
  { path: '/studio/revenue', out: 'studio-revenue-v1.png', auth: true },
  {
    path: '/studio/distribution',
    out: 'studio-distribution-v1.png',
    auth: true,
  },
  { path: '/studio/stash', out: 'studio-stash-v1.png', auth: true },
  { path: '/more', out: 'map-more-v1.png', auth: true },
];

const launchOpts = {
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.env.CHROMIUM_NO_SANDBOX ? ['--no-sandbox'] : [],
};

let browser = await chromium.launch(launchOpts);
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let lastAuth = null;

/** Some pages (e.g. hCaptcha widgets) can crash the renderer in a
 * network-sandboxed environment — relaunch and re-apply auth if that happens. */
async function ensureAlive() {
  if (browser.isConnected() && !page.isClosed()) {
    return;
  }
  browser = await chromium.launch(launchOpts);
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  lastAuth = null;
}

async function setAuth(on) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  if (on) {
    await page.evaluate((state) => {
      localStorage.setItem('tahti-web-auth', JSON.stringify(state));
      localStorage.setItem('tahti-web-onboarded:mock-1', '1');
    }, authState);
  } else {
    await page.evaluate(() => {
      localStorage.removeItem('tahti-web-auth');
    });
  }
}

let failed = 0;

for (const s of shots) {
  await ensureAlive();
  const wantAuth = s.auth !== false;
  if (lastAuth !== wantAuth) {
    await setAuth(wantAuth);
    lastAuth = wantAuth;
  }
  try {
    await page.goto(`${BASE}${s.path}`, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
  } catch {
    await ensureAlive();
    try {
      await page.goto(`${BASE}${s.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    } catch (err) {
      console.error('skip', s.out, err.message);
      failed += 1;
      continue;
    }
  }
  try {
    if (s.out === 'map-more-v1.png') {
      // Seed one note so the CSV export button renders in its enabled state.
      await page.evaluate(() => {
        localStorage.setItem(
          'tahti-web-map-notes',
          JSON.stringify({
            state: {
              notesByCaseId: {
                'anon-home': 'Genre chips need higher contrast on dark theme.',
              },
            },
            version: 0,
          }),
        );
      });
      await page.reload({ waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(1800);
    const out = join(outDir, s.out);
    await page.screenshot({ path: out, fullPage: true });
    let text = (
      await page
        .locator('body')
        .innerText()
        .catch(() => '')
    ).slice(0, 200);
    if (!text || text.length < 8) {
      // Flaky renders happen in this sandboxed headless env — one retry with a reload.
      await page
        .reload({ waitUntil: 'networkidle', timeout: 30000 })
        .catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: out, fullPage: true });
      text = (
        await page
          .locator('body')
          .innerText()
          .catch(() => '')
      ).slice(0, 200);
    }
    console.log('wrote', s.out, '|', text.replace(/\s+/g, ' ').slice(0, 80));
    if (!text || text.length < 8) {
      console.warn('WARN empty-ish', s.out);
      failed += 1;
    }
  } catch (err) {
    console.error('skip', s.out, err.message);
    failed += 1;
  }
}

await browser.close();
console.log(`done ${shots.length} shots, warnings=${failed}`);
if (failed > shots.length / 2) {
  process.exitCode = 1;
}
