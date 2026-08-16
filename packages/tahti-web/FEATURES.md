# Feature port checklist — prod Tahti → `@nuclearplayer/tahti-web`

Track what has been ported from `apps/web` into the Nuclear listen/studio POC.

**Status**

| Tag | Meaning |
|-----|---------|
| `live-api` | Real API path; production build does **not** silent-mock on failure |
| `mock-ok` | Works offline under `VITE_FORCE_MOCK=1` |
| `partial` | UI or API incomplete vs prod |
| `missing` | Not in POC |
| `link-out` | Deep-links to production `tahti.live` |
| `out-of-scope` | Explicitly not rebuilding (admin, etc.) |

**Demock wave** — next items to harden against live `api.tahti.live` / beta:

- [x] Wave 0: mock session (auth/follow/subscribe/sources) for offline demo — [MOCKS.md](MOCKS.md)
- [x] Wave 1: stop silent mock fallback in **production** builds (`api/mode.ts`); chat WS defaults to `wss://chat.tahti.live`
- [x] Wave 2: Go Live / broadcast — prod builds no silent mock for stream-settings / signal / RTMP (`broadcast.ts`)
- [x] Wave 3: Upload + archive — prod builds no silent mock archive seed; upload still prepare→PUT→complete on live API (`studio.ts`)
- [x] Wave 4: Fan subscribe Stripe checkout + Connect portal/onboard (`client.ts` subscribe, `revenue.ts`)
- [x] Wave 5: DMs + governance — prod builds no silent mock inbox; vote/comments already live (`messages.ts`, governance in `client.ts`)
- [x] Wave 6: Channel WebGL visualizer parity (POC canvas/WebGL on ChannelView; full Three.js presets still optional)

**Product priority** (shipped):

1. [x] Album-based designer — `/studio/collections` create + cover/style/tracklist designer
2. [x] Add-to-playlist — player bar + archive + track tables → `/api/me/collections`
3. [x] Visualizations — ChannelView WebGL/canvas visualizer + shared analyser
4. [x] Broadcasting wizard — Connect → Live → Multistream step chrome
5. [x] Email verify route — `/verify` (+ join deep-link)
6. [x] Fan-sub tier editor — Settings → Money (`/api/me/fan-tiers`)

### Checklist — shipped vs remaining

**Shipped (beta)**

- [x] Listen directory, channel HLS, archive, radio, profile, collections, smart links
- [x] Auth login / TOTP / register / logout
- [x] Email verify page (`/verify`)
- [x] Follows, favorites/history (local), fan subscribe checkout, DMs, governance
- [x] Add to playlist
- [x] Studio: Go Live wizard, Music, upload, releases, collections/album designer
- [x] Studio: schedule, stats summary, channel design, updates, revenue/Connect
- [x] Channel visualizer POC + analyser
- [x] Fan tier create / activate-deactivate
- [x] Settings shell (Nuclear sections), Sources hub (partial OAuth UX)
- [x] Embeds

**Remaining / partial**

- [ ] Channel chat hardening (captcha / rail parity)
- [ ] Full Three.js visualizer preset set
- [x] Stash upload / delete
- [ ] Stats detail page (beyond summary)
- [ ] Sources OAuth silent-mock demock polish
- [x] Venue register
- [x] Membership purchase (`/signup/payment`) — Stripe checkout + mock activate
- [x] TOTP at login (manage/settings depth still thin)
- [x] Distribution (catalog + Revelator + Spotify profile)
- [x] Channel moderators (`/studio/moderation`)
- [x] Listener-only dashboard (`/dashboard` routes non-artists to `/library`)
- [ ] Radio slots depth
- [ ] Multitrack timeline editing, press-kit / invites polish
- [ ] Production cutover for `apps/web`

---

## 1. Anonymous listen

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Listen directory | `/listen` | `/` | `live-api` | `GET /api/v1/channels/directory` |
| Channel live + HLS | `/c/:slug` | `/channel/$slug` | `live-api` | visualizer stage on Live tab |
| Channel archive | `/c/:slug` | `/channel/$slug` | `live-api` | listen-events after ~15s |
| Channel chat | `/c/:slug` | rail + `/chat/$slug` | `partial` | REST + Centrifugo; captcha when configured |
| Tahti Radio | `/radio` | `/radio` | `live-api` | |
| Artist profile | `/u/:username` | `/u/$username` | `live-api` | Music tab: pinned tracks (max 4) above catalog; Stage pins via `PATCH /api/me/archive/:id` `{ pinned }` |
| Collection | `/u/:user/c/:slug` | `/u/$username/c/$slug` | `live-api` | |
| Smart link | `/r/:slug` | `/r/$slug` | `live-api` | |
| Venues list | `/venues` | `/venues` | `partial` | list only |
| Venue register | `/venues/register` | `/venues/register` | `live-api` | `POST /api/v1/venues`; board verifies |
| Transparency | `/transparency` | `/transparency` | `live-api` | |
| Help | `/help/*` | `/help` | `mock-ok` | static copy |
| Legal / about | `/about`… | same | `partial` | POC + prod links |
| Platform status | `/status` | `/status` | `live-api` | |
| Marketing home / apply | `/`, `/apply` | — | `missing` | listen hub is home |
| VOD seek | player | PlayerBar | `live-api` | |

## 2. Auth / account

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Login + session | `/login` | `/login` | `live-api` | cookies via `/tahti-api` |
| TOTP | `/login` | `/login` | `live-api` | |
| Register | `/join` | `/join` | `live-api` | |
| Email verify | `/verify` | `/verify` (+ join) | `live-api` | auto-verify from `?token=` |
| Membership purchase | `/signup/payment` | `/signup/payment` | `live-api` | Stripe checkout; mock instant-activate under FORCE_MOCK |
| Logout / `/me` | session | store | `live-api` | |
| Password setup (invite link) | `/setup-password?token=` | `/setup-password` | `live-api` | one-time token sets initial password (no logged-in "change password" exists in prod — TOTP is the only account security setting) |

## 3. Logged-in listener

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Follow / following | profile | `/library` | `live-api` | |
| Local favorites / history | — | `/library/*` | `partial` | localStorage + follows |
| Add to playlist | mini-player / archive | player bar + Music + tables | `live-api` | create playlist + add archive item |
| Fan subscribe | `/u/:user/subscribe` | `/subscribe/$username` | `live-api` | demock wave 4; mock activates only under FORCE_MOCK |
| My subscriptions | account | `/settings/money` | `live-api` | |
| Membership status | account | `/settings/account` | `live-api` | |
| Governance list/vote | `/governance` | `/governance` | `live-api` | demock wave 5; 401/403 → forbidden empty |
| DMs | `/dashboard/messages` | `/library/messages` | `live-api` | demock wave 5 |
| Listener-only dashboard | `/dashboard` | `/dashboard` → `/library` | `live-api` | non-artists no longer hit the Studio "create a channel" wall |

## 4. Artist studio

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Studio home | `/dashboard` | `/studio` | `live-api` | |
| Setup channel | `/dashboard/setup-channel` | `/studio/setup-channel` | `live-api` | `POST /api/me/channel/provision`; prod path aliases redirect |
| Go Live | `/dashboard/broadcast` | `/studio/go-live` | `live-api` | broadcast wizard steps; simulator only under FORCE_MOCK |
| Multistream RTMP | broadcast | go-live tab | `live-api` | |
| Archive / Music | `/dashboard/archive` | `/studio/archive` | `live-api` | |
| Upload | `/dashboard/upload` | `/studio/upload` | `live-api` | prepare→PUT→complete; demock wave 3 |
| Pro editor | `/dashboard/editor` | `/studio/editor` | `partial` | |
| Releases / collections | `/dashboard/releases`… | `/studio/releases`… | `live-api` | album designer on collections |
| Schedule / programme | schedule | `/studio/schedule` | `live-api` | |
| Stats | `/dashboard/stats` | `/studio/stats` | `partial` | no detail page |
| Channel design | channel/edit | `/channel/$slug?edit=1` + `/studio/channel` | `partial` | Inline Edit design: presets, layers drag/hide/add; layout localStorage; look via API |
| Updates / newsletter | posts | `/studio/updates` | `live-api` | |
| Revenue / Connect | revenue | `/studio/revenue` | `live-api` | demock wave 4; onboard/portal redirect to Stripe |
| Stash | `/dashboard/stash` | `/studio/stash` | `live-api` | upload/delete + mock |
| Distribution | `/dashboard/distribution` | `/studio/distribution` | `live-api` | catalog, Revelator pay+submit, Spotify profile, royalties |
| Radio slots / Shows | `/dashboard/tahti-radio-slots` | `/studio/shows` | `partial` | bookings live; series localStorage |
| Channel moderators | `/dashboard/moderate/:slug` | `/studio/moderation` | `live-api` | |

## 5. Settings / sources

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Settings shell | `/dashboard/settings/*` | `/settings` | `partial` | Nuclear sections |
| Artist / discovery / domain | settings | sections | `live-api` | |
| Notifications / social | settings | sections | `live-api` | |
| Themes | — | `/settings/themes` | `mock-ok` | Nuclear presets |
| Fan-sub tier editor | fan-subs settings | Settings → Money | `live-api` | create + activate/deactivate |
| Sources hub | import | `/sources` | `partial` | |
| OAuth connect | OAuth start | Sources | `partial` | live href; mock in-app connect |
| SoundCloud / Spotify import | import | Sources | `live-api` | |

## 6. Embeds / misc

| Feature | Prod | POC | Status | Notes |
|---------|------|-----|--------|-------|
| Embeds c/r/col | `/embed/*` | `/embed/*` | `live-api` | |
| Feature map | — | `/more` | `mock-ok` | checklist + flow diagrams |
| Screen atlas | e2e screenshots | `/more` (Screen atlas) | `mock-ok` | curated prod PNGs under `public/map/` + Nuclear routes |
| Board admin | `/admin/*` | — | `out-of-scope` | |
| WebGL visualizer | channel page | ChannelView Live | `partial` | aurora/grid/bars POC; not full Three.js preset set |

## 7. Desktop Nuclear integrations (not web SPA)

| Feature | Upstream Nuclear | This fork | Status | Notes |
|---------|------------------|-----------|--------|-------|
| MCP server (Streamable HTTP) | Tauri `packages/player` MCP | same paths | **complete / as-is** | Byte-identical to sibling `nuclear` checkout; Settings → Integrations in **desktop player**; see [`docs/MCP.md`](docs/MCP.md) |
| MCP tool meta | `@nuclearplayer/plugin-sdk/mcp` | same | **complete / as-is** | |
| MPD / Nuclear Jam HTTP | Tauri player | present in player | desktop-only | Not ported to beta SPA (same as upstream) |

Web cutover (`beta.tahti.live`) does **not** host Nuclear MCP — localhost player control plane. Do not strip `packages/player/src-tauri/src/mcp/` when packaging desktop.

---

## How to verify live (not mock)

```bash
# Dev against local or proxied API (no FORCE_MOCK)
unset VITE_FORCE_MOCK
pnpm --filter @nuclearplayer/tahti-web dev

# Optional: refuse mock fallback even in dev
VITE_ALLOW_MOCK_FALLBACK=0 pnpm --filter @nuclearplayer/tahti-web dev

# Beta build (prod mode → no silent mock fallback)
pnpm deploy:tahti-beta
# then https://beta.tahti.live — login with a real Tahti account
```

Update this file when a row moves from `partial` → `live-api` or a demock wave completes.
