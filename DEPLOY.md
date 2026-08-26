# Deploying to Hostinger

## Build

```bash
npm install --legacy-peer-deps   # only if node_modules is missing (see note below)
npm run build:prod
```

`build:prod` runs three steps in order:

1. `npm run media` — regenerates `public/images` and `public/video` from the
   originals in `media-src/` (skips anything already current).
2. `vite build` — emits `dist/`.
3. `node scripts/compress-dist.mjs` — writes `.gz` and `.br` next to every text
   asset so Apache can serve them without compressing per request.

Output is `dist/` — about **5.4 MB**, of which ~1.9 MB is the `.gz`/`.br` copies.

> **Install note:** `react-lenis` declares a React 17/18 peer range while this
> project runs React 19, so a plain `npm install` fails with ERESOLVE. Use
> `--legacy-peer-deps`, which is how the existing tree was built.

## Upload

`dist-hostinger.zip` is the same output packaged with **its contents at the archive
root** (no `dist/` wrapper), so it extracts directly into `public_html`.

1. hPanel → **File Manager** → open `public_html`
2. Delete the previous release's files (keep anything you host outside this build)
3. Upload `dist-hostinger.zip`, then **Extract** it in place
4. Delete the zip

Or over SFTP/rsync, upload the *contents* of `dist/` into `public_html`.

### Must-haves after upload

These are easy to lose to a file manager that hides dotfiles — check each one:

- `public_html/.htaccess`
- `public_html/.well-known/` (4 files, including the nested
  `agent-skills/submit-contact-inquiry/SKILL.md`)
- `public_html/contact.php`

If `.htaccess` is missing, every route except `/` returns 404 and none of the
performance rules apply.

## Verify after deploy

```bash
curl -I https://jcll.me/                       # 200, Cache-Control: no-cache
curl -sI https://jcll.me/ -H 'Accept-Encoding: br' | grep -i content-encoding
curl -sI https://jcll.me/images/photo1.jpg -H 'Accept: image/webp' | grep -i 'content-type\|vary'
curl -s https://jcll.me/robots.txt | head -20
curl -sI https://jcll.me/experimental          # 200 (SPA rewrite), not 404
```

Expected: `content-encoding: br` on the HTML/JS/CSS, `content-type: image/webp`
on the photo request, and a 200 on `/experimental`.

The AEO work also has runtime pieces that can only be checked against real Apache
— `Link:` headers, `Accept: text/markdown` negotiation, the forced
`application/linkset+json` on `/.well-known/api-catalog`, and CORS on the JSON
documents. Re-run the isitagentready.com audit against the live domain to confirm.

## If something breaks

Everything added to `.htaccess` is wrapped in `<IfModule>`, so a missing Apache
module skips the block rather than faulting. If the site 500s anyway, the fastest
triage is to replace `.htaccess` with just the SPA rewrite:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

That restores routing; re-add the other blocks one at a time to find the culprit.
The likeliest candidate on a restrictive host is the precompressed-asset rewrite —
if `Content-Encoding` is set but the host strips it, browsers get unreadable bytes.
Deleting the `.br`/`.gz` files from the server disables that path entirely without
touching config, since the rules only fire when the file exists.

## Adding new photos or video

Put the original in `media-src/` — **never** directly in `public/images` or
`public/video`, which are generated and overwritten. Then:

```bash
npm run media        # add --force to rebuild everything
npm run build:prod
```

Size caps live in `IMAGE_JOBS` / `VIDEO_JOBS` at the top of
`scripts/optimize-media.mjs`. `npm test` fails if any shipped image exceeds 400 KB.
