# Sherman-Davison Business Solutions

Landing site for **Sherman-Davison Business Solutions** — futuristic dark portfolio with a config-driven live dashboard, project pages, and tools.

Live domain: [shermandavison.com](https://shermandavison.com) (formerly `ancc.blog`).

## Stack

- Astro 5 (static)
- Tailwind CSS v4
- Chart.js (lazy-loaded client charts)
- Space Grotesk + JetBrains Mono (self-hosted)
- Deployed to Hetzner via Caddy (`./deploy.sh`)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4321

Dev proxies:

- `/api/golf/*` → golf API
- `/api/ditto/*` → `ditto.jungle.win`

## Configure (easy extensions)

| File | Purpose |
| ---- | ------- |
| `src/config/site.ts` | Brand, nav, social, footer |
| `src/config/projects.ts` | Projects (`hidden: true` to hide) |
| `src/config/panels.ts` | Dashboard stats + charts |
| `src/config/tools.ts` | Tools registry |
| `src/lib/sources/` | API adapters (`golf.ts`, `ditto.ts`) |

Add a project = one object in `projects.ts`. Add a chart = one object in `panels.ts` + mapping in `dashboard-client.ts` if needed.

## DNS

See [docs/DNS-PORKBUN.md](docs/DNS-PORKBUN.md). Point `@`, `www`, and `golf` A records at `204.168.147.6` before the first production deploy.

## Deploy

```bash
./deploy.sh
```

Builds with Astro, rsyncs `dist/` to `/srv/shermandavison`, backs up and syncs the `Caddyfile`, reloads Caddy.
