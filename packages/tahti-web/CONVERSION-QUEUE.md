# Conversion queue — artist + admin gaps (Nuclear)

Source of truth for **what exists on tahti.live but not yet in `@nuclearplayer/tahti-web`**.  
Also see [FEATURES.md](./FEATURES.md) for shipped rows.

Convert **one row at a time**.

## Artist / studio — priority

| # | Feature | Prod | Nuclear | Status |
|---|---------|------|---------|--------|
| 1 | Venue register | `/venues/register` | `/venues/register` | **done** (`live-api` + mock) |
| 2 | Membership purchase | `/signup/payment` | `/signup/payment` + Settings Account | **done** (`live-api` + mock) |
| 3 | Password / security + TOTP manage | settings/account | Settings Account (TOTP) | **done** (TOTP; no separate change-password API in prod) |
| 4 | Distribution | `/dashboard/distribution` | `/studio/distribution` | **done** (`live-api` + mock) |
| 5 | Tahti Radio slot booking | `/dashboard/tahti-radio-slots` | — | `missing` ← **next** |
| 6 | Channel moderators | `/dashboard/moderate/:slug` | — | `missing` |
| 7 | Artist venues manage | `/dashboard/venues` | — | `missing` |
| 8 | Events | `/dashboard/events` | — | `missing` |
| 9 | Studio embeds manager | `/dashboard/embeds` | public embeds only | `missing` |
| 10 | Insights | `/dashboard/insights/:kind/:id` | — | `missing` |
| 11 | Stats detail | `/dashboard/stats/detail` | summary only | `partial` |
| 12 | Stash upload / delete | `/dashboard/stash` | `/studio/stash` | **done** (`live-api` + mock) |
| 13 | Press kit | settings/presskit | — | `missing` |
| 14 | Green room / members | settings/* | — | `missing` |
| 15 | Mentions / announcements editor | settings/* | — | `missing` |
| 16 | Setup channel wizard | `/dashboard/setup-channel` | link-out | `link-out` |
| 17 | Upload from broadcast + imports | `/dashboard/upload/*` | partial | `partial` |
| 18 | Pro multitrack timeline | `/dashboard/editor` | partial | `partial` |
| 19 | Channel gallery / text-layer | `/dashboard/channel/*` | Edit design partial | `partial` |
| 20 | Listener-only dashboard | `/dashboard` | — | `missing` |

## Board admin — queued

| # | Feature | Prod | Status |
|---|---------|------|--------|
| A1 | Admin shell + dashboard | `/admin`, `/admin/dashboard` | `missing` |
| A2 | Users | `/admin/users` | `missing` |
| A3 | Streams + controls | `/admin/streams` | `missing` |
| A4 | Radio + submissions | `/admin/radio*` | `missing` |
| A5 | News / announcements / top-lists / selects | various | `missing` |
| A6 | Support | `/admin/support` | `missing` |
| A7 | Storage / files | `/admin/storage`, `files` | `missing` |
| A8 | Financial | `/admin/financial/*` | `missing` |
| A9 | Governance admin | `/admin/governance/*` | `missing` |
| A10 | Grants / AGM / beta / vendors | various | `missing` |
| A11 | Reports / feature requests / status | various | `missing` |
| A12 | Channel archive/programme admin | `/admin/channels/...` | `missing` |

## Shipped elsewhere (not in queue)

Listen, auth, studio core (go-live, archive, upload, releases, collections, schedule, updates, revenue), channel design presets, fan tiers, sources hub, embeds, `/more` map.
