# Deploy beta (`beta.tahti.live`)

Deploys this package onto **vimage** beside production Tahti (`/srv/tahti`), talking to the **public** API.

## Quick deploy

From the Nuclear monorepo root:

```bash
pnpm deploy:tahti-beta
```

Or:

```bash
./packages/tahti-web/deploy/deploy-vimage.sh
```

SSH target defaults to `vimage` (root@192.168.2.100). Override with `DEPLOY_HOST` / `REMOTE_PATH` / `HOST_PORT`.

## What gets installed

| Path / port | Role |
|-------------|------|
| `/srv/tahti` | Production stack (not modified) |
| `/srv/tahti-beta` | Beta SPA `dist/` + `deploy/` |
| `192.168.2.100:15180` | Container `tahti-beta-web` |

## API wiring

1. Build leaves `VITE_TAHTI_API_URL` unset → browser calls `/tahti-api/...`.
2. Container nginx (`nginx.conf`) proxies `/tahti-api/` → `https://api.tahti.live/`.
3. Chat: `VITE_CENTRIFUGO_WS=wss://chat.tahti.live/connection/websocket`.

Production CORS already allows `*.tahti.live`.

## Nginx Proxy Manager

1. DNS: `beta.tahti.live` → same public IP as other `*.tahti.live` hosts.
2. Proxy Host:
   - Domain: `beta.tahti.live`
   - Forward: `http://192.168.2.100:15180`
   - SSL: Let's Encrypt, force HTTPS
   - Websockets: on
