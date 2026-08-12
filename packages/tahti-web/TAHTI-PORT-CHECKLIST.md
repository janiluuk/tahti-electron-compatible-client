# Tahti port checklist — `@nuclearplayer/tahti-web`

Living checklist of **prod `apps/web` → Nuclear tahti-web POC**.  
Companion tables: [FEATURES.md](./FEATURES.md). Mock offline paths: [MOCKS.md](./MOCKS.md).

**Last audited:** 2026-08-12 against monorepo routes under `apps/web/src/app` + public/me APIs.

---

## Status tags

| Tag            | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| `done`         | Ported and wired to live API (prod builds do not silent-mock) |
| `partial`      | UI or API incomplete vs prod                                  |
| `missing`      | Not in POC                                                    |
| `mock-only`    | Works under `VITE_FORCE_MOCK=1` / intentional Nuclear chrome  |
| `unwired`      | UI present but fake / link-out / not connected to API         |
| `link-out`     | Deep-links to `tahti.live` instead of in-POC flow             |
| `out-of-scope` | Explicitly not rebuilding (admin, marketing site, etc.)       |

---

## Priority backlog (implement next)

Ordered by listener/artist value × API readiness:

1. [x] **Stash upload + delete** — `POST /api/me/stash/prepare` → PUT → `POST /api/me/stash`, `DELETE /api/me/stash/:id`
2. [x] **Stats plays detail** — `GET /api/me/stats/plays` time series on `/studio/stats`
3. [x] **Account security (TOTP)** — `/api/me/totp/*` in Settings → Account
4. [x] **Venue register** — `POST /api/v1/venues` at `/venues/register`
5. [~] **Channel chat hardening** — fail closed on join failure in prod (no silent mock-send); captcha rail parity still open
6. [ ] **Sources OAuth polish** — live connect is href-only; in-app connect is mock; live Preview disabled
7. [ ] **Stash share links** — `POST /api/me/stash/:id/share` + revoke (UI: disabled Share + callout on `/studio/stash`)
8. [ ] **Membership purchase** — `/signup/payment` Stripe checkout (Account callout)
9. [ ] **Distribution / radio slots / moderate** — listed on Studio home as not in this client
10. [ ] **Full Three.js visualizer presets** — ChannelView still aurora/grid/bars POC
11. [ ] **Multitrack timeline editing** — editor callout + map inventory
12. [ ] **Press-kit gallery upload + member invites** — disabled actions + Settings callouts
13. [ ] **Listener-only dashboard** — non-artist `/dashboard` home
14. [ ] **Production cutover** — replace `apps/web` listen/studio with this client

**UX honesty / map:** `/more` (Tahti map) surfaces port backlog + mock inventory from `portInventory.ts` (synced with this file).

---

## Done / ported (high level)

- Listen directory, channel HLS + archive, radio, profile, collections, smart links, embeds
- Auth: login / TOTP login / register / logout / email verify
- Follows, fan subscribe checkout, my subscriptions, governance vote/comments, DMs
- Add-to-playlist → `/api/me/collections`
- Studio: home, Go Live wizard, archive/Music, upload, releases, collections/album designer, schedule, channel design, updates/newsletter, revenue/Connect, fan-tier editor
- Stats summary + top tracks/countries + **plays time series**
- Stash list/play/download + **upload/delete**
- Settings shell (Nuclear sections) + artist/discovery/domain/notifications/social
- Venue directory + **register**
- Account **TOTP enable/disable**

---

## Mock / stub / unwired inventory

Things that look like product UI but are incomplete, offline-only, or still link out:

| Surface                           | What’s fake / thin                                                                           | Fix path                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `VITE_FORCE_MOCK=1` whole app     | Full fixture session ([MOCKS.md](./MOCKS.md))                                                | Keep for demos; never default in prod        |
| Dev silent mock fallback          | When API down + `VITE_ALLOW_MOCK_FALLBACK` (default on in Vite dev)                          | `VITE_ALLOW_MOCK_FALLBACK=0` for strict live |
| Sources OAuth “Connect”           | In-app toggle only under FORCE_MOCK; live uses external href                                 | Complete OAuth return handling in POC        |
| Spotify / SoundCloud stream URLs  | Live Preview **disabled** (DEMO_MP3 only under FORCE_MOCK)                                   | Wire real preview / import playables         |
| Channel chat                      | Fail closed when join fails (prod); mock send only under FORCE_MOCK; captcha rail still thin | Finish captcha parity                        |
| Themes                            | Nuclear local presets (`mock-ok`)                                                            | Keep — not a Tahti API                       |
| Help / legal                      | Static POC copy + prod links                                                                 | Optional: fetch help CMS later               |
| Studio home / Account / Settings  | Honest callouts + disabled dead actions; extras still link-out                               | Port remaining settings APIs                 |
| StudioGate setup-channel          | `link-out` + capability notice                                                               | Port channel provision wizard                |
| Favorites / history               | Mostly **localStorage**, not server library                                                  | Optional: sync with API if/when exists       |
| Pro editor                        | Partial vs prod multitrack — callout on editor                                               | Timeline + export parity                     |
| Stash shares                      | Upload/list/play/delete done; **Share disabled** + notice                                    | Share/revoke APIs exist                      |
| Feature map `/more`, Screen atlas | Port inventory panel + doc chrome (`mock-ok`)                                                | Keep                                         |
| Board `/admin/*`                  | `out-of-scope`                                                                               | Stay on prod                                 |

---

## Gap matrix vs prod `apps/web` (not yet / partial)

### Public / anonymous

| Prod                                          | POC                | Status                     |
| --------------------------------------------- | ------------------ | -------------------------- |
| `/listen`                                     | `/`                | `done`                     |
| `/c/:slug` live+archive+chat                  | `/channel/$slug`   | `partial` (chat)           |
| `/radio`, `/u/:user`, collections, `/r/:slug` | matching           | `done`                     |
| `/venues`                                     | `/venues`          | `done`                     |
| `/venues/register`                            | `/venues/register` | `done`                     |
| `/transparency`, `/status`                    | matching           | `done`                     |
| `/help/*`                                     | `/help` static     | `partial`                  |
| `/`, `/apply`, marketing                      | —                  | `missing` / `out-of-scope` |
| Green room `/u/:user/green-room`              | —                  | `missing`                  |

### Auth / account

| Prod                         | POC                | Status               |
| ---------------------------- | ------------------ | -------------------- |
| Login / TOTP / join / verify | matching           | `done`               |
| `/signup/payment` membership | —                  | `missing`            |
| Password change (if any)     | —                  | `missing` / rare API |
| TOTP setup/disable           | Settings → Account | `done`               |
| `/setup-password`            | —                  | `missing`            |

### Listener

| Prod                                | POC        | Status    |
| ----------------------------------- | ---------- | --------- |
| Follow / fan sub / DMs / governance | matching   | `done`    |
| Listener dashboard                  | —          | `missing` |
| Server-side favorites library       | local only | `partial` |

### Artist studio

| Prod                                                              | POC                          | Status                                               |
| ----------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| Broadcast / upload / archive / releases / collections             | matching                     | `done`                                               |
| Stash                                                             | `/studio/stash`              | `partial` → upload/delete done; shares still missing |
| Stats + detail/plays                                              | `/studio/stats`              | `done` (plays series; no map viz)                    |
| Editor                                                            | `/studio/editor`             | `partial`                                            |
| Distribution, radio slots, moderate, insights, events, embeds mgr | —                            | `missing`                                            |
| Newsletter compose                                                | `/studio/updates`            | `done` (lite)                                        |
| Press kit / members / moderators                                  | settings sections + link-out | `partial`                                            |

### Out of scope

- `/admin/*`, board financial tooling, ops, marketing `website/`

---

## How to verify

```bash
unset VITE_FORCE_MOCK
VITE_ALLOW_MOCK_FALLBACK=0 pnpm --filter @nuclearplayer/tahti-web dev

# Offline demo
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
```

Update this file when a backlog item ships or a new `unwired` surface is found.
