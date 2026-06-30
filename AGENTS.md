# AGENTS.md

## Cursor Cloud specific instructions

This is a static **Vite + TypeScript** site (`ancc.blog`). There is no local backend in this repo.

### Services / commands
- **Dev server**: `npm run dev` (Vite, serves on `http://localhost:5173`). This is the main thing to run for development.
- **Typecheck + production build**: `npm run build` (runs `tsc` then `vite build`). There is no separate lint script — `tsc` (via `build`) is the type/lint gate.
- **Preview built output**: `npm run preview`.

### Non-obvious notes
- **Golf stats need a proxy.** Live golf stats are fetched from `/api/golf/*`, which Vite's dev server proxies to the remote `https://golf.ancc.blog/api/*` (see `server.proxy` in `vite.config.ts`). In production this same path is served by Caddy (see `Caddyfile`). Golf stats only resolve when that remote API is reachable.
- **Ditto stats are a direct cross-origin fetch** to `https://ditto.jungle.win/api/public/landing-preview`. If that host is unreachable, the Ditto status dot stays "down" but the page still renders fine — stats failures are handled gracefully and never block the page.
- `deploy.sh` and the `Caddyfile` are for production deployment to a Hetzner VPS over SSH; they are not needed for local development.
