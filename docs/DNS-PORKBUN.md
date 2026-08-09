# Porkbun DNS setup for shermandavison.com

Do this **before** deploying the new Caddyfile. Caddy needs DNS to already point at the VPS so it can get Let's Encrypt certificates.

## Server IP

`204.168.147.6` (same VPS that currently serves `ancc.blog`)

## Steps in Porkbun

1. Log in to [Porkbun](https://porkbun.com) → **Domain Management** → `shermandavison.com` → **DNS**.
2. **Delete** every record that points at Porkbun parking (`pixie.porkbun.com`, or A records `207.207.210.229` / `207.207.210.107`). That usually means:
   - ALIAS / CNAME / A for `@` (blank host)
   - ALIAS / CNAME / A for `www`
3. **Add** these three records:

| Type | Host / Subdomain | Answer / Value | TTL |
| ---- | ---------------- | -------------- | --- |
| A    | *(leave blank)*  | `204.168.147.6` | 600 (or default) |
| A    | `www`            | `204.168.147.6` | 600 |
| A    | `golf`           | `204.168.147.6` | 600 |

4. Leave MX / TXT alone (there are none today). Do **not** change nameservers.
5. Wait until these resolve (often a few minutes with TTL 600):

```bash
dig +short shermandavison.com A
# expect: 204.168.147.6

dig +short www.shermandavison.com A
# expect: 204.168.147.6

dig +short golf.shermandavison.com A
# expect: 204.168.147.6
```

## Do not change

- Keep `ancc.blog` DNS pointed at `204.168.147.6` forever so the 301 redirects keep working.
