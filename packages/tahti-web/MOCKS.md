# Mock mode checklist (`VITE_FORCE_MOCK=1`)

Offline demo state lives in [`src/api/mock-session.ts`](src/api/mock-session.ts) (mutable) plus fixtures in [`src/api/mock.ts`](src/api/mock.ts).

## Working end-to-end paths

| Flow | Notes |
|------|--------|
| Login / TOTP / logout | Session via `setMockSessionUser`; `/me` returns it; persist rehydrates session |
| Listen / Radio / Channel / Archive | Directory + HLS/MP3 fixtures |
| Favorites / Follow | Mutable following set |
| Fan subscribe | Activates in-session; Account / Settings Money lists it |
| Studio Go Live | Broadcast mocks + simulate signal |
| Sources OAuth Connect | In-app mock connect/disconnect (no real OAuth redirect) |
| Stripe Connect onboard | In-app activate — no `connect.stripe.com` redirect |
| Chat join / send | Local mock append (history REST) |
| Governance vote / comment | In-memory motions |
| Messages / Studio catalog | Module-local stores |

## Demo credentials

- Any email + password → artist user with matching channel slug
- `demo@tahti.live` → username `demo`, Studio ready
- TOTP: email containing `+totp` or password `totp-demo`, then code `000000` or `123456`

## Still thin / next mock polish

- [ ] Chat: persist mock sends into shared history store (reload-safe)
- [ ] Seed richer archive / releases / collections for Studio browse
- [ ] Newsletter send confirmation + DM search users fixture expansion
- [ ] Press-kit gallery upload mock (currently link-out)
- [ ] Member invite mock (currently link-out)
- [ ] Visualizer: no mock needed — needs real WebGL runtime

## Run

```bash
VITE_FORCE_MOCK=1 pnpm --filter @nuclearplayer/tahti-web dev
```
