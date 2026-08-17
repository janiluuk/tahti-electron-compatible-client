import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';

// Written by the "Apply review" button on /more (ScreenAtlas). Claude Code
// reads this file to see which pages still need changes vs. which are
// approved — see tahti-fit/README.md for the review workflow.
const REVIEW_STATE_PATH = join(
  process.cwd(),
  '../../tahti-fit/review-state.json',
);

/** Dev-only endpoint: POST /__api/apply-review writes the current review
 * state (comments + approvals) to a repo file instead of just localStorage,
 * so it survives outside the browser and Claude Code can act on it. */
function reviewStateApiPlugin(): Plugin {
  return {
    name: 'tahti-review-state-api',
    configureServer(server) {
      server.middlewares.use('/__api/apply-review', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            mkdirSync(dirname(REVIEW_STATE_PATH), { recursive: true });
            writeFileSync(
              REVIEW_STATE_PATH,
              `${JSON.stringify(payload, null, 2)}\n`,
              'utf8',
            );
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, path: REVIEW_STATE_PATH }));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tahtiApi =
    env.VITE_TAHTI_API_PROXY_TARGET ||
    env.VITE_TAHTI_API_URL ||
    'http://localhost:15011';

  return {
    plugins: [react(), tailwindcss(), svgr(), reviewStateApiPlugin()],
    clearScreen: false,
    server: {
      host: process.env.VITE_HOST ?? 'localhost',
      port: 5180,
      strictPort: true,
      proxy: {
        '/tahti-api': {
          target: tahtiApi,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tahti-api/, ''),
        },
      },
    },
    preview: {
      port: 5180,
    },
  };
});
