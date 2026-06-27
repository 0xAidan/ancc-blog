# ancc.blog

Landing page for **Aidan Nugent Consulting Company** — editorial portfolio with live project stats.

## Stack

- Vite + TypeScript (static build)
- **Italiana** (hero) + **Cutive Mono** (body)
- Deployed to Hetzner via Caddy

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

Golf stats use a dev proxy (`/api/golf/*` → `golf.ancc.blog/api/*`) configured in `vite.config.ts`.

## Deploy

```bash
./deploy.sh
```

Builds the site, copies `dist/*` to the VPS, syncs the `Caddyfile`, and reloads Caddy.

## Live stats

| Source | How |
| ------ | --- |
| **Ditto** | Cross-origin fetch to `ditto.jungle.win/api/public/landing-preview` (+ optional `/api/public/stats` for wallet counts) |
| **Golf** | Same-origin proxy at `ancc.blog/api/golf/*` → local FastAPI on `:8000` (see `Caddyfile`) |

## What this repo contains

- `src/` — Vite app (projects, dashboard, stats client)
- `Caddyfile` — HTTPS routing for ancc.blog + golf.ancc.blog + Golf API proxy
- `deploy.sh` — build, publish, and reload Caddy
