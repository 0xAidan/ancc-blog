# ancc.blog

Landing page for **Aidan Nugent Consulting Company** — editorial terminal with live project stats, interactive shell, and dashboard panels.

## Stack

- Vite + TypeScript (static build)
- **Italiana** (hero) + **Cutive Mono** (body/terminal)
- Deployed to Hetzner via Caddy (`file_server`)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy

```bash
./deploy.sh
```

Runs `npm run build` and copies `dist/*` to `golf-vps:/srv/ancc-blog/`.

## Terminal commands

| Command | Description |
| ------- | ----------- |
| `help` | List commands |
| `projects` / `ls` | List projects |
| `open ditto` / `open golf` | Navigate to project |
| `status` | Health check both projects |
| `stats` | Live stats for Ditto + Golf |
| `ditto stats` / `golf stats` | Single project stats |
| `refresh` | Bust cache and re-fetch |
| `dashboard` / `dashboard hide` | Toggle stat panels |
| `clear` | Clear terminal |
| `about`, `whoami`, `banner`, `sudo` | Easter eggs |

## Live stats (CORS)

Stats fetch from `ditto.jungle.win` and `golf.ancc.blog`. Golf requires CORS allowlist for `https://ancc.blog` (see `golf-model/app.py`). Ditto allows cross-origin reads via existing `cors()` middleware.

## What this repo contains

- `src/` — Vite app (shell, dashboard, stats client)
- `deploy.sh` — build + publish to VPS
- `Caddyfile` — HTTPS routing for ancc.blog + golf.ancc.blog
