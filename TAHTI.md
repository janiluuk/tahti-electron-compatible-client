# Tahti Nuclear Player — project notes

Tahti Nuclear Player is built on [nukeop/nuclear](https://github.com/nukeop/nuclear) (AGPL-3.0).

It is **not** the upstream Nuclear project. Do not open Nuclear PRs from this tree without cherry-picking onto a clean upstream branch.

## Product in one paragraph

**Tahti** is a Finnish nonprofit broadcasting platform for independent artists (live channels, archive, fan subscriptions). This fork adds `@nuclearplayer/tahti-web` — a Nuclear-UI listen + studio SPA that already runs on **beta.tahti.live** against the production API, intended to replace the Next.js `apps/web` client after cutover ([`packages/tahti-web/CUTOVER.md`](./packages/tahti-web/CUTOVER.md)).

## Remotes

| Remote | URL | Role |
|--------|-----|------|
| `origin` | `https://github.com/janiluuk/tahti-electron-compatible-client.git` | Tahti Nuclear Player (push here) |
| `upstream` | `https://github.com/nukeop/nuclear.git` | Nuclear upstream (fetch/rebase only) |

Sync upstream later:

```bash
git fetch upstream
git rebase upstream/master   # or merge
```

## Tahti package

- **`packages/tahti-web`** — listen/studio client on Nuclear UI → public Tahti API
- Dev: `pnpm dev:tahti` (Node 22+)
- Offline: `VITE_FORCE_MOCK=1 pnpm dev:tahti`
- Deploy beta: `pnpm deploy:tahti-beta` → vimage `:15180` / `beta.tahti.live`
- Docs: package [`README.md`](./packages/tahti-web/README.md), [`FEATURES.md`](./packages/tahti-web/FEATURES.md), [`MOCKS.md`](./packages/tahti-web/MOCKS.md), [`deploy/README.md`](./packages/tahti-web/deploy/README.md)
- Screenshots: [`packages/tahti-web/docs/redesign-shots/`](./packages/tahti-web/docs/redesign-shots/)
- Local planning (gitignored): `tahti-fit/`

Public API reference: [`https://api.tahti.live/api`](https://api.tahti.live/api).

## Detached from `/home/jani/workspace/nuclear`

The pristine upstream clone at `~/workspace/nuclear` should track `nukeop/nuclear` only. All Tahti work lives **here**.
