# Sherman-Davison Business Solutions

Landing page for **Sherman-Davison Business Solutions** — editorial portfolio with live project stats.

Domain: [shermandavison.com](https://shermandavison.com) (formerly `ancc.blog`).

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

Dev proxies (see `vite.config.ts`):

- `/api/golf/*` → golf API
- `/api/ditto/*` → `ditto.jungle.win`

## DNS (required before first deploy of the new domain)

See [docs/DNS-PORKBUN.md](docs/DNS-PORKBUN.md). Point `@`, `www`, and `golf` A records at `204.168.147.6`, then wait for propagation.

## Deploy

```bash
./deploy.sh
```

Builds the site, rsyncs `dist/` to `/srv/shermandavison` on the VPS, backs up and syncs the `Caddyfile`, and reloads Caddy.

## Live stats

| Source | How |
| ------ | --- |
| **Ditto** | Same-origin proxy `/api/ditto/*` → `ditto.jungle.win` (avoids CORS) |
| **Golf** | Same-origin proxy `/api/golf/*` → local FastAPI on `:8000` |
| **Blackjack** | Still at `blackjack.ancc.blog` (not linked on homepage after rebrand) |

## What this repo contains

- `src/` — Vite app (projects, dashboard, stats client)
- `Caddyfile` — HTTPS for shermandavison.com, golf subdomain, legacy redirects, Ditto proxy
- `deploy.sh` — build, publish, and reload Caddy
- `docs/DNS-PORKBUN.md` — Porkbun DNS checklist
