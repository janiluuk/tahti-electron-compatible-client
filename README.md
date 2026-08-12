# Tahti Nuclear Player

**Tahti Nuclear** is the next listen + artist studio client for [Tahti](https://tahti.live) — a Finnish nonprofit, channel-first broadcasting platform for independent artists. It is built on [Nuclear](https://github.com/nukeop/nuclear)’s free, ad-free player UI (React + shared design system), and ships today as a Vite SPA on **[beta.tahti.live](https://beta.tahti.live)** against the live production API.

> **Not upstream Nuclear.** Do not open PRs against [nukeop/nuclear](https://github.com/nukeop/nuclear) from this tree. See [TAHTI.md](./TAHTI.md).

## What it is

Tahti is channel-first radio and archive listening: artists broadcast live, publish music and albums, and earn directly from fan subscriptions. Production today still serves the Next.js app in the separate `tahti` monorepo (`apps/web` on `app.tahti.live`).

This repository holds:

1. **`@nuclearplayer/tahti-web`** — the Nuclear-based **listen + studio** web client (the cutover candidate for `apps/web`)
2. **Nuclear desktop player** — the original Tauri music player, plugins, and shared UI packages this client reuses

The web client is not a separate product backend. It talks to the same public Tahti API (`api.tahti.live`), chat (`chat.tahti.live`), and media CDN that production uses. Cutover planning lives in [`packages/tahti-web/CUTOVER.md`](./packages/tahti-web/CUTOVER.md).

## Why it exists

Production `apps/web` grew as a full Next stack (listen, studio, admin, marketing islands). Nuclear gives Tahti a **player-native** shell: queue, themes, keyboard-friendly chrome, and a studio that feels like a desk for going live — not a generic SaaS dashboard.

Goals:

- Modern listen UX (directory, channel HLS/archive, radio, chat, fan subscribe) on Nuclear UI
- Artist studio pillars (Go Live, library, releases, playlists/albums, channel design, schedule, stats, revenue) democked against the live API
- A clear path to replace `app.tahti.live` once route compatibility and remaining parity items land (see CUTOVER)
- Keep Nuclear’s agent/desktop heritage: shared `@nuclearplayer/ui` themes, plugin-oriented architecture, AGPL

Honest status: beta already covers the core listener and studio loops on live data. A few production surfaces remain partial or out of scope for Nuclear UI (board admin, full SEO/SSR, some settings depth). Tracked in [`FEATURES.md`](./packages/tahti-web/FEATURES.md).

## What it provides

| Audience | Surfaces |
|----------|----------|
| **Listeners** | Channel directory, live/archive listen, Tahti Radio, profiles, collections, smart links, follows, DMs, governance, Stripe fan-subscribe |
| **Artists** | Studio home, Go Live (OBS/RTMP + multistream), music library/upload, releases, playlists & albums, channel designer, schedule, stats, revenue / Stripe Connect, distribution |
| **Developers** | Same-origin `/tahti-api` proxy to production API on beta; public OpenAPI/Scalar at [`https://api.tahti.live/api`](https://api.tahti.live/api); offline mock mode for UI work |
| **Desktop** | Full Nuclear Tauri player (search, local library, plugins, remote control) — separate from the Tahti web cutover |

Live beta: **https://beta.tahti.live**

## Screenshots

From `@nuclearplayer/tahti-web` (mock data for stable docs captures; beta uses the live API).

### Listen home

![Listen directory — favorites, Tahti Radio, and channel discovery](./packages/tahti-web/docs/redesign-shots/listen-home-v1.png)

*Listen hub: library favorites, Tahti Radio, and discover.*

### Channel (live + archive)

![Channel page with live stage, archive, and chat](./packages/tahti-web/docs/redesign-shots/listen-channel-v1.png)

*Public channel: live stage, pinned archive, chat rail.*

### Fan subscribe

![Subscribe page with Supporter and Patron tiers](./packages/tahti-web/docs/redesign-shots/subscribe-v1.png)

*Fan membership tiers (Stripe Checkout on live API).*

### Studio home

![Studio overview with broadcast and music pillars](./packages/tahti-web/docs/redesign-shots/studio-home-v1.png)

*Studio overview — Go Live, schedule, music, upload, albums.*

### Go Live

![Go Live wizard with OBS RTMP credentials](./packages/tahti-web/docs/redesign-shots/studio-go-live-v1.png)

*Broadcast wizard: Connect → Live → Multistream.*

### Playlists & channel design

![Studio playlists list](./packages/tahti-web/docs/redesign-shots/studio-playlists-v1.png)

*Playlists — organize archive tracks and releases.*

![Channel designer with Aurora visualizer preset](./packages/tahti-web/docs/redesign-shots/studio-channel-v1.png)

*Channel designer — look, 24/7 radio, profile, domain.*

More studio captures: [`packages/tahti-web/docs/redesign-shots/`](./packages/tahti-web/docs/redesign-shots/).

## Who it’s for

- **Tahti contributors** shipping the next listen / studio client (`packages/tahti-web`)
- **Developers** exploring Nuclear’s Tauri player, plugins, and shared UI in this fork

## What’s in this repo

| Area | Package / path | Role |
|------|----------------|------|
| **Tahti web (beta)** | `@nuclearplayer/tahti-web` | Listen + studio UI → public Tahti API (or mocks) |
| **Desktop player** | `@nuclearplayer/player` | Nuclear Tauri app (React + Rust) |
| Shared UI / themes | `@nuclearplayer/ui`, `themes`, … | Design system used by player and Tahti web |
| Plugin SDK | `@nuclearplayer/plugin-sdk` | Plugin API (published upstream to npm) |

pnpm + Turborepo. Package manager: `pnpm@10.33.4` (see root `package.json`).

Feature checklist: [`packages/tahti-web/FEATURES.md`](./packages/tahti-web/FEATURES.md). Cutover: [`packages/tahti-web/CUTOVER.md`](./packages/tahti-web/CUTOVER.md). Package README: [`packages/tahti-web/README.md`](./packages/tahti-web/README.md).

## Prerequisites

- **Node.js** — `.node-version` pins **24**; Tahti web also runs on **Node 22+**
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
# Tahti listen + studio → http://localhost:5180
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
pnpm tauri build    # desktop app (see AGENTS.md)
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
| Next listen+studio client on Nuclear UI (`beta.tahti.live`) | `apps/web` + API/worker at the `tahti` workspace |
| Same public API / chat / CDN | Full product stack, Swarm, board admin |
| Cutover plan: `packages/tahti-web/CUTOVER.md` | Pointer: `ops/nuclear-web-cutover.md` |

Public API docs (Scalar + OpenAPI): [`https://api.tahti.live/api`](https://api.tahti.live/api). Remotes and sync notes: [TAHTI.md](./TAHTI.md).

## Agents & contributing

- **AI agents:** follow [AGENTS.md](./AGENTS.md) (commands, packages, code style, Rust layout, testing).
- Upstream Nuclear does not take direct app PRs; prefer plugins for Nuclear itself. This fork is for Tahti work — coordinate with the maintainers before large changes.
- Skills under `.agents/skills/` (components, plugins, host pattern, docs).

## License

[AGPL-3.0-only](./LICENSE) — same as Nuclear upstream.
