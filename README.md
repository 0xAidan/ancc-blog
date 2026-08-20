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

## ASCII art generator

Turns a photo into real ASCII art (every mark is a typed character) rendered as a PNG in the
site palette. Needs Python 3 with Pillow.

```bash
python3 scripts/ascii-art.py photo.jpg -o public/art.png --cols 220
```

A busy background converts into character noise that swamps the subject, so cut the subject
out first. That step needs `rembg`, kept in its own venv because it is a heavy dependency:

```bash
python3 -m venv .venv-cutout
.venv-cutout/bin/pip install "rembg[cli]" onnxruntime
.venv-cutout/bin/python scripts/cutout.py photo.jpg -o photo-cut.png
python3 scripts/ascii-art.py photo-cut.png -o public/art.png \
  --cols 230 --trim --transparent --contrast 3 --optimize
```

`public/dog-ascii.png` was produced with exactly that command.

| Flag | What it does |
| ---- | ------------ |
| `--cols` | Character columns. Higher is more detailed (150–300 for a portrait) |
| `--charset` | `dense` (most detail), `code`, `slashes`, `classic`, `blocks` |
| `--threshold N` | Blanks cells darker than `N` (0–255), dropping a dark background |
| `--transparent` | Transparent background instead of `--bg` |
| `--shade` | Dims characters in darker areas for more depth |
| `--invert` | Swaps light and dark |
| `--trim` | Crops transparent margins off a cut-out subject |
| `--optimize` | Palette-compresses the PNG (~3x smaller) |
| `--txt` | Also writes the characters as a `.txt` |

Defaults match the site tokens (`--fg #6ec4e8`, `--bg #0a0a0c`). HEIC input is converted
automatically via `sips`. Run with `--help` for the full list.

## DNS

See [docs/DNS-PORKBUN.md](docs/DNS-PORKBUN.md). Point `@`, `www`, and `golf` A records at `204.168.147.6` before the first production deploy.

## Deploy

```bash
./deploy.sh
```

Builds with Astro, rsyncs `dist/` to `/srv/shermandavison`, backs up and syncs the `Caddyfile`, reloads Caddy.
