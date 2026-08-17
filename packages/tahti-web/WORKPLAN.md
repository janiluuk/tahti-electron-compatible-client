# WORKPLAN — tahti-web POC

## Shipped

- [x] Sparse sidebar + Studio/Sources/Library/Channel tabs
- [x] Sources **CardGrid** big service icon tiles + detail pane
- [x] **Settings** Nuclear-style (Themes under Settings; Account demoted)
- [x] Go Live, catalog, upload, schedule, stats
- [x] Profile-integrated channel designer (owner Design tab)
- [x] Studio Channel design / profile / domain
- [x] **Inline channel page design** — `/channel/$slug?edit=1`: presets, side Layers (hide/add), drag reorder; layout localStorage; Look via API
- [x] Editor EQ/comp/limiter + markers + stems
- [x] Newsletter send, DMs, releases, revenue, governance
- [x] **Offline mock session** — auth `/me`, follow set, fan subscribe activate, Sources Connect, Stripe Connect in-app ([MOCKS.md](MOCKS.md))
- [x] **Port checklist** — [FEATURES.md](FEATURES.md)
- [x] **Demock wave 1** — prod builds skip silent mock fallback (`api/mode.ts`); chat WS → `wss://chat.tahti.live`
- [x] **Demock waves 2–3** — Go Live / broadcast + upload/archive live paths (see FEATURES.md)
- [x] **Demock waves 4–5** — fan subscribe + Connect; DMs + governance (see FEATURES.md)

## Product priority

- [x] **Album-based designer** — `/studio/collections`
- [x] **Add-to-playlist** — player bar, Music, tables
- [x] **Visualizations** — ChannelView + analyser
- [x] **Broadcasting wizard** — Connect → Live → Multistream
- [x] **Email verify** — `/verify`
- [x] **Fan-tier editor** — Settings → Money
- [x] **Screen atlas on `/more`** — curated e2e thumbnails + Nuclear routes (`public/map/`, `ScreenAtlas`)

## Checklist (remaining)

Kept in sync with [FEATURES.md](FEATURES.md)'s "Remaining / partial" list, which has the up-to-date detail — this is the short version.

- [ ] Full Three.js visualizer presets (confirmed still canvas/WebGL subset, no `three` dep)
- [ ] Sources OAuth callback-return verification (start URLs + mock-gating confirmed done; whether the callback lands on the SPA vs prod dashboard is unverified)
- [ ] Radio slots depth
- [ ] Multitrack timeline + press-kit polish
- [ ] Production cutover for `apps/web`

Done since last update (was listed here as remaining, verified shipped): channel chat hardening (hCaptcha + rail parity), Stash upload UI, Stats detail page, Venue register, Membership purchase, Password/account security (TOTP panel), board admin (22/22 pages, now `partial` not `out-of-scope`).

## Verify

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
pnpm --filter @nuclearplayer/tahti-web type-check
pnpm --filter @nuclearplayer/tahti-web build
# Offline:
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
# Live API (no silent mock in prod build):
unset VITE_FORCE_MOCK && pnpm --filter @nuclearplayer/tahti-web dev
```
