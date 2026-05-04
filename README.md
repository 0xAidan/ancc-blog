# ancc.blog

Minimal landing page for `ancc.blog` with a clean golf app URL on `golf.ancc.blog`.

## What this repo contains

- `index.html` - bare-minimum homepage
- `Caddyfile` - HTTPS + routing config

## DNS setup in Porkbun

Create these DNS records:

- `A` record for `@` -> your Hetzner server IPv4
- `A` record for `www` -> your Hetzner server IPv4
- `A` record for `golf` -> your Hetzner server IPv4

Wait for DNS to propagate (often a few minutes, sometimes longer).

## Server setup on Hetzner (Ubuntu/Debian)

1) Install Caddy:

```bash
sudo apt update
sudo apt install -y caddy
```

2) Copy site files to the server:

```bash
sudo mkdir -p /srv/ancc-blog
sudo cp index.html /srv/ancc-blog/index.html
```

3) Install Caddy config:

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy --no-pager
```

4) Make sure your golf app is running on:

`127.0.0.1:8000`

If it currently runs on `0.0.0.0:8000`, that still works, but `127.0.0.1` is safer when reverse proxied.

## Verify

```bash
curl -I https://ancc.blog
curl -I https://golf.ancc.blog
```

Both should return successful HTTP status codes (for example `200`).

