# Nuclear MCP (desktop) — preserved as-is in this fork

The original Nuclear **Model Context Protocol** server is **not** part of the Vite SPA (`@nuclearplayer/tahti-web` / beta.tahti.live). It is the **Tauri desktop player** stack, kept **byte-identical** to upstream Nuclear in this monorepo.

## Where it lives

| Piece | Path |
|-------|------|
| Rust server (`rmcp` Streamable HTTP) | `packages/player/src-tauri/src/mcp/` |
| TS lifecycle (`mcp_start` / `mcp_stop`) | `packages/player/src/services/mcp/` |
| Tool metadata (Queue, Playback, …) | `packages/plugin-sdk/src/mcp/` |
| Settings UI | Player → Settings → Integrations |
| Docs | `packages/docs/integrations/mcp-server.md` |
| Architecture | `packages/docs/development/mcp-architecture.md` |

**Parity check** (optional, needs sibling `../nuclear` checkout):

```bash
node packages/tahti-web/scripts/verify-nuclear-mcp-parity.mjs
```

## Enable (desktop)

1. Run the Nuclear player from this repo:
   ```bash
   export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
   pnpm --filter @nuclearplayer/player tauri:dev   # or the package’s documented tauri script
   ```
2. Settings → Integrations → **Enable MCP Server**.
3. Server binds `http://127.0.0.1:8800/mcp` … `8809` (localhost only).
4. Point Cursor / Claude / Codex at that URL with **Streamable HTTP** transport.

Tools (unchanged from upstream): `list_methods`, `method_details`, `describe_type`, `call` over domains Queue, Playback, Metadata, Favorites, Playlists, Dashboard, Providers (+ Settings in plugin-sdk meta).

## Why not on beta.tahti.live

MCP requires the Tauri process + webview **bridge** to the live player API. A multi-user CDN SPA cannot host that localhost control plane. Cutover of listen/studio to SPA does **not** remove desktop MCP from this fork.

## Product stance

- **Desktop Nuclear player in `tahti-nuclear`:** MCP **complete / as-is**.
- **Web cutover (`tahti-web`):** N/A for Nuclear MCP; optional future *Tahti API* MCP would be a separate package, not a port of this server.
