# tahti-electron-compatible-client

Tahti fork of [Nuclear](https://github.com/nukeop/nuclear): a desktop music player (Tauri + React) plus a **Tahti listen / artist studio** web POC built on the same UI stack.

Inspired by Nuclear’s free, ad-free player model — adapted toward high-quality streaming so artists can present their work well.

> **Not upstream Nuclear.** Do not open PRs against [nukeop/nuclear](https://github.com/nukeop/nuclear) from this tree. See [TAHTI-FORK.md](./TAHTI-FORK.md).

## Who it’s for

- **Tahti contributors** building the next listen / studio web client (`packages/tahti-web`)
- **Developers** exploring Nuclear’s Tauri player, plugins, and shared UI packages in this fork

## What’s in this repo

| Area | Package / path | Role |
|------|----------------|------|
| **Tahti web POC** | `@nuclearplayer/tahti-web` | Listen + studio UI against the public Tahti API (or mocks) |
| **Desktop player** | `@nuclearplayer/player` | Nuclear Tauri app (React + Rust) |
| Shared UI / themes | `@nuclearplayer/ui`, `themes`, … | Design system used by player and Tahti web |
| Plugin SDK | `@nuclearplayer/plugin-sdk` | Plugin API (published upstream to npm) |

pnpm + Turborepo monorepo. Package manager: `pnpm@10.33.4` (see root `package.json`).

### Tahti web POC (shipped in beta)

Documented in [`packages/tahti-web/FEATURES.md`](./packages/tahti-web/FEATURES.md). Highlights:

- Listen directory, channel HLS / archive, radio, profiles, collections, smart links
- Auth (login / TOTP / register), follows, fan subscribe (Stripe), DMs, governance
- Studio: Go Live wizard, music upload, releases, album/collections designer, schedule, revenue / Connect
- Channel visualizer POC, settings shell, embeds

Still partial vs production `apps/web` (e.g. chat hardening, full visualizer presets) — see the feature checklist.

### Nuclear desktop player

Free, open-source desktop player: search, playlists, local library, plugins, remote control (HTTP/SSE, MPD, MCP), Discord presence, yt-dlp integration, and more. Agent-oriented detail: [AGENTS.md](./AGENTS.md). Upstream docs: [docs.nuclearplayer.com](https://docs.nuclearplayer.com).

## Prerequisites

- **Node.js** — `.node-version` pins **24**; Tahti web notes also call for **Node 22+**
- **pnpm** 10.x (`corepack enable` or install via npm)
- For the **desktop player only**: [Tauri 2](https://v2.tauri.app/start/prerequisites/) system deps + **Rust** ≥ 1.77.2

Tahti web (`pnpm dev:tahti`) does **not** require Rust/Tauri.

## Install

```bash
git clone https://github.com/janiluuk/tahti-electron-compatible-client.git
cd tahti-electron-compatible-client
pnpm install
```

## Run / develop

```bash
# Tahti listen + studio web POC → http://localhost:5180
pnpm dev:tahti

# Offline demo (no API); login: demo@tahti.live / any password
VITE_FORCE_MOCK=1 pnpm dev:tahti

# Nuclear desktop player (Tauri)
pnpm dev

# Player with Vite bound to 0.0.0.0 (remote-control UI from other devices)
pnpm dev:remote

# Storybook
pnpm storybook
```

## Build / quality

```bash
pnpm build          # all packages
pnpm tauri build    # desktop app (from player / via turbo scripts as documented in AGENTS.md)
pnpm lint
pnpm type-check
pnpm test
```

## Configuration (Tahti web)

Copy and edit env from [`packages/tahti-web/.env.example`](./packages/tahti-web/.env.example):

| Variable | Purpose |
|----------|---------|
| `VITE_TAHTI_API_PROXY_TARGET` | Dev proxy target (default `http://localhost:15011`) |
| `VITE_TAHTI_API_URL` | Absolute API base (dev/CORS only; leave unset in prod → same-origin `/tahti-api`) |
| `VITE_FORCE_MOCK=1` | Offline mock mode |
| `VITE_ALLOW_MOCK_FALLBACK` | Silent mock when API fails (default on in Vite dev, off in prod builds) |
| `VITE_CENTRIFUGO_WS` | Chat websocket (prod default `wss://chat.tahti.live/...`) |
| `VITE_HCAPTCHA_SITEKEY` | Optional chat gate |
| `VITE_HOST` | Vite bind host (e.g. `0.0.0.0`) |

More: [`packages/tahti-web/MOCKS.md`](./packages/tahti-web/MOCKS.md), [`packages/tahti-web/README.md`](./packages/tahti-web/README.md).

### Beta deploy

```bash
pnpm deploy:tahti-beta
```

Publishes the Tahti web build for `beta.tahti.live` (vimage / Pi proxy). See [`packages/tahti-web/deploy/README.md`](./packages/tahti-web/deploy/README.md).

## Relation to Tahti

| This repo | Production Tahti monorepo |
|-----------|---------------------------|
| Experimental / next listen+studio client on Nuclear UI | `apps/web` and API/services at [tahti](https://github.com/janiluuk) (separate workspace) |
| Talks to public `api.tahti.live` (or local API via proxy) | Full product stack |

Fork remotes and sync notes: [TAHTI-FORK.md](./TAHTI-FORK.md).

## Agents & contributing

- **AI agents:** follow [AGENTS.md](./AGENTS.md) (commands, packages, code style, Rust layout, testing).
- Upstream Nuclear does not take direct app PRs; prefer plugins for Nuclear itself. This fork is for Tahti work — coordinate with the maintainers before large changes.
- Skills under `.agents/skills/` (components, plugins, host pattern, docs).

## License

[AGPL-3.0-only](./LICENSE) — same as Nuclear upstream.
