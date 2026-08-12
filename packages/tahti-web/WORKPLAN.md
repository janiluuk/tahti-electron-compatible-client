# WORKPLAN — tahti-web POC

## Shipped

- [x] Sparse sidebar + Studio/Sources/Library/Channel tabs
- [x] Sources **CardGrid** big service icon tiles + detail pane
- [x] **Settings** Nuclear-style (Themes under Settings; Account demoted)
- [x] Go Live, catalog, upload, schedule, stats
- [x] Profile-integrated channel designer (owner Design tab)
- [x] Studio Channel design / profile / domain
- [x] Editor EQ/comp/limiter + markers + stems
- [x] Newsletter send, DMs, releases, revenue, governance
- [x] **Offline mock session** — auth `/me`, follow set, fan subscribe activate, Sources Connect, Stripe Connect in-app ([MOCKS.md](MOCKS.md))

## Remaining / future

- [ ] Mock polish: shared chat history, richer studio seeds, press-kit + invites offline
- [ ] WebGL visualizer runtime matching production channel page
- [ ] Multitrack timeline editing
- [ ] Richer press-kit gallery / member invites
- [ ] Production cutover for apps/web

## Verify

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
pnpm --filter @nuclearplayer/tahti-web type-check
pnpm --filter @nuclearplayer/tahti-web build
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
# http://localhost:5180 — login demo@tahti.live / any password
```
