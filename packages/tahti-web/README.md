# @nuclearplayer/tahti-web

**POC:** Tahti listen + artist studio client on Nuclear UI/themes.

## Run

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
pnpm --filter @nuclearplayer/tahti-web dev
# Offline demo (no API):
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
```

Open http://localhost:5180 — mock login: `demo@tahti.live` / any password. See [`MOCKS.md`](MOCKS.md).

## IA (sparse sidebar)

| Sidebar | In-page |
| --- | --- |
| Listen / Radio / Library / Studio / Sources / More | as before |
| **Settings** | Nuclear-style sections (Themes live here — not a sidebar item) |

### Settings sections

Account · Artist · Channel & design · Broadcast · Money · Notifications · Themes · Connections

`/themes` and `/account` redirect into Settings.

## Deploy (beta.tahti.live)

Builds against the public API (`/tahti-api` → `api.tahti.live`) and publishes on vimage `:15180`:

```bash
pnpm deploy:tahti-beta
```

See [`deploy/README.md`](deploy/README.md).

## Docs

- Coverage: `/more`
- Plan: `WORKPLAN.md`
