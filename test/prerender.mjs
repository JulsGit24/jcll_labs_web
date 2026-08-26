#!/usr/bin/env node
// Prerender-contract test suite — audit-01-search-visibility.
//
// Pure Node, no framework, same { name, pass, detail } shape as test/run.mjs.
//
// WHY THIS IS A SEPARATE FILE, NOT MORE OF test/run.mjs:
// `npm test` = `vite build && node test/run.mjs`. A plain `vite build` writes the
// ~0.9 KB SPA shell to dist/index.html and never creates dist/photography/ at all
// (confirmed: after a plain `npm test` run, `dist/photography/index.html` does not
// exist). Only `npm run build:prod` (media -> vite build -> scripts/prerender.mjs
// -> compress-dist) produces the real prerendered documents this suite exists to
// verify. Folding these checks into test/run.mjs would either (a) silently pass
// against the wrong artifact every time a plain `npm test` runs, which is exactly
// the false-green the Developer's notes warned QA about, or (b) force every
// `npm test` invocation to pay for a full build:prod (media pass + prerender +
// compression), which is minutes instead of seconds for what is meant to be the
// fast baseline suite. So: this file assumes dist/ already holds a build:prod
// output and does NOT run any build itself.
//
// Run via `npm run test:prerender` (= `npm run build:prod && node test/prerender.mjs`).
//
// Sections:
//   1. Static byte-level checks on dist/index.html and dist/photography/index.html
//      (the audits' own `curl` verification commands, encoded as permanent guards)
//   2. Browser hydration checks against the ALREADY-BUILT dist/ (spawns its own
//      `vite preview` on a dedicated port; never calls `vite build`)

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://jcll.me';

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail: detail || '' });
}
function read(p) {
  return fs.readFileSync(p, 'utf8');
}
function exists(p) {
  return fs.existsSync(p);
}

// ---------------------------------------------------------------------------
// Preflight: bail out clearly (not a false pass, not a cryptic crash) if this
// was run against a plain `vite build` output instead of `build:prod`.
// ---------------------------------------------------------------------------

const photographyPath = path.join(DIST, 'photography', 'index.html');
if (!exists(photographyPath)) {
  console.error(
    '\n[prerender-tests] dist/photography/index.html does not exist.\n' +
      'This suite only makes sense against a `npm run build:prod` output — plain\n' +
      '`vite build` (which is what `npm test` runs) does not create it.\n' +
      'Run `npm run build:prod` first, then `node test/prerender.mjs`.\n' +
      '(Or just run `npm run test:prerender`, which does both in order.)\n'
  );
  process.exit(2);
}

// ---------------------------------------------------------------------------
// 1. Static byte-level checks — design spec §7 item 6, the audits' own `curl`
//    verification commands. Read straight from dist/ bytes, no browser.
// ---------------------------------------------------------------------------

const DOCS = [
  { route: '/', file: path.join(DIST, 'index.html'), canonical: `${SITE_URL}/`, minBytes: 15000 },
  // Lead's ruling (audit-01-search-visibility): the spec's ≥20 KB floor was
  // chosen before anyone measured. The Developer's ~14 KB is a genuine,
  // unpadded 380-word page with five images — do not pad copy to clear an
  // arbitrary byte count. Floor lowered to 10 KB: enough to reject an empty
  // shell, not enough to demand invented content. The real criteria are
  // "non-stub size" + "has a real <h1>" + "required meta present", all
  // checked explicitly below — the byte count alone was never the point.
  { route: '/photography/', file: photographyPath, canonical: `${SITE_URL}/photography/`, minBytes: 10000 },
];

for (const doc of DOCS) {
  const label = `dist${doc.route === '/' ? '/index.html' : '/photography/index.html'}`;
  if (!exists(doc.file)) {
    record(`${label} exists`, false, `missing at ${doc.file}`);
    continue;
  }
  const html = read(doc.file);
  const bytes = Buffer.byteLength(html, 'utf8');

  record(
    `${label} is non-stub size (>= ${Math.round(doc.minBytes / 1024)} KB, not a bare shell)`,
    bytes >= doc.minBytes,
    `${bytes} bytes`
  );

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  record(`${label} contains >= 1 <h1>`, h1Count >= 1, `found ${h1Count}`);

  const titleCount = (html.match(/<title[\s>]/g) || []).length;
  record(`${label} contains exactly one <title>`, titleCount === 1, `found ${titleCount}`);

  const descCount = (html.match(/<meta\s+name="description"/g) || []).length;
  record(`${label} contains exactly one <meta name="description">`, descCount === 1, `found ${descCount}`);

  const canonicalMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)];
  record(
    `${label} contains exactly one <link rel="canonical">`,
    canonicalMatches.length === 1,
    `found ${canonicalMatches.length}`
  );
  const canonicalHref = canonicalMatches[0]?.[1];
  record(
    `${label} canonical href is ${doc.canonical}`,
    canonicalHref === doc.canonical,
    `found ${JSON.stringify(canonicalHref)}`
  );

  record(
    `${label} contains no "prerender=1" leakage`,
    !html.includes('prerender=1'),
    html.includes('prerender=1') ? 'found' : ''
  );

  record(
    `${label} contains <meta name="robots">`,
    /<meta\s+name="robots"\s+content="[^"]*index[^"]*"/.test(html),
    /<meta\s+name="robots"/.test(html) ? 'present but content unexpected' : 'missing entirely'
  );

  // JSON-LD: must parse and carry the entity graph's stable @id.
  const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  let ld = null;
  try {
    ld = ldMatch ? JSON.parse(ldMatch[1]) : null;
  } catch {
    /* reported below */
  }
  const orgNode = ld?.['@graph']?.find((n) => n['@id'] === `${SITE_URL}/#organization`);
  record(
    `${label} JSON-LD parses and contains "@id":"${SITE_URL}/#organization"`,
    !!orgNode,
    orgNode ? '' : `parsed=${!!ld}, raw~=${ldMatch ? ldMatch[1].slice(0, 150) : 'no <script type=application/ld+json> found'}`
  );

  const sameAs = orgNode?.sameAs;
  const bareSameAs = Array.isArray(sameAs)
    ? sameAs.filter((u) => /^https?:\/\/(www\.)?(instagram|twitter|linkedin)\.com\/?$/.test(u))
    : [];
  record(
    `${label} sameAs is absent or contains no bare platform homepages`,
    sameAs === undefined || bareSameAs.length === 0,
    sameAs === undefined ? 'absent, as expected (SOCIAL_LINKS empty)' : `sameAs=${JSON.stringify(sameAs)}`
  );

  record(
    `${label} contains no google-site-verification tag (GSC_VERIFICATION is empty)`,
    !html.includes('google-site-verification'),
    html.includes('google-site-verification') ? 'found' : ''
  );

  const forbiddenSchema = ['AggregateRating', 'reviewRating', '"@type":"Review"'];
  const schemaHits = forbiddenSchema.filter((s) => html.includes(s));
  record(
    `${label} contains no Review/AggregateRating/reviewRating markup`,
    schemaHits.length === 0,
    schemaHits.length ? schemaHits.join(', ') : ''
  );

  // .br/.gz siblings must exist — compress-dist.mjs runs after prerender.mjs
  // in build:prod specifically so the prerendered HTML isn't shipped
  // uncompressed (design spec / PM brief build-order requirement).
  const brExists = exists(`${doc.file}.br`);
  const gzExists = exists(`${doc.file}.gz`);
  record(`${label} has a .br sibling`, brExists, brExists ? '' : `missing ${doc.file}.br`);
  record(`${label} has a .gz sibling`, gzExists, gzExists ? '' : `missing ${doc.file}.gz`);
}

// html lang attribute sanity (both should be English content by default, per
// spec: prerender the English document only).
for (const doc of DOCS) {
  if (!exists(doc.file)) continue;
  const html = read(doc.file);
  const label = doc.route === '/' ? 'dist/index.html' : 'dist/photography/index.html';
  record(`${label} has <html lang="en">`, /<html[^>]*\blang="en"/.test(html), '');
}

// ---------------------------------------------------------------------------
// 2. Browser hydration checks against the already-built dist/. Never runs
//    `vite build` — that would overwrite the prerendered artifacts this
//    entire suite exists to test.
// ---------------------------------------------------------------------------

async function runHydrationChecks() {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    record('[browser] puppeteer available', null, 'SKIPPED — puppeteer not installed; static checks above stand alone');
    return;
  }

  const PORT = 4821; // distinct from test/run.mjs's 4653 and scripts/prerender.mjs's 4738
  let server;
  try {
    server = spawn(process.execPath, [path.join(ROOT, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: 'pipe',
    });
  } catch (e) {
    record('[browser] vite preview started', false, e.message);
    return;
  }

  let serverUp = false;
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok || res.status < 500) {
        serverUp = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  record('[browser] vite preview server is reachable', serverUp, serverUp ? '' : 'did not respond within 30s');
  if (!serverUp) {
    server.kill();
    return;
  }

  // Toggles language and returns the <h1> text before/after. Handles both a
  // fresh page (the welcome modal is showing, no language selected yet) and a
  // page visited after another route in the same browser session (language
  // already persisted to localStorage, modal absent) — routes share an
  // origin and browser context here, so the second route visited legitimately
  // starts with a language already chosen.
  async function toggleLanguageAndGetH1s(page) {
    const modalEnBtn = await page.$('.lang-btn.en');
    if (modalEnBtn) {
      await modalEnBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
    const before = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.lang-switch.desktop-only button')];
      const active = btns.find((b) => b.classList.contains('active'));
      const other = btns.find((b) => b !== active);
      if (other) other.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const after = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');
    return { before, after };
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const routes = [
      { path: '/', h1KeyEn: null },
      { path: '/photography/', h1KeyEn: null },
    ];
    for (const route of routes) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => consoleErrors.push(String(err)));

      let navOk = true;
      let navErr = '';
      try {
        await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch (e) {
        navOk = false;
        navErr = e.message;
      }
      record(`[browser] ${route.path} (prerendered) loads`, navOk, navErr);

      if (navOk) {
        record(
          `[browser] ${route.path} (prerendered) — no console errors`,
          consoleErrors.length === 0,
          consoleErrors.length ? consoleErrors.slice(0, 5).join(' | ') : ''
        );

        // The whole point of prerendering: content must already be in the DOM
        // before any JS runs. This is a much stronger check than "#root has
        // content" against a hydrating SPA shell, because it's checking the
        // literal bytes the browser painted from the network response.
        const h1AtLoad = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');
        record(`[browser] ${route.path} (prerendered) has a non-empty <h1> immediately`, h1AtLoad.length > 0, `"${h1AtLoad}"`);

        // Real hydration proof, same technique as test/run.mjs: flip language
        // via the persistent nav switch (dismissing the welcome modal first
        // if it's showing) and assert the <h1> text actually changes. A
        // prerendered-but-dead page (broken hydration) would leave it static.
        try {
          const { before, after } = await toggleLanguageAndGetH1s(page);
          record(
            `[browser] ${route.path} (prerendered) language toggle changes <h1> — proves hydration survived prerendering`,
            before.length > 0 && after.length > 0 && before !== after,
            `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`
          );
        } catch (e) {
          record(`[browser] ${route.path} (prerendered) language toggle changes <h1> — proves hydration survived prerendering`, false, e.message);
        }

        // The prerendered-doc-specific count: exactly 1 <meta name="description">
        // once hydrated (Helmet ADOPTS the data-rh="true" tag it finds already in
        // the DOM rather than appending a second one) — design spec §7 item 4.
        const descCount = await page.evaluate(() => document.querySelectorAll('meta[name="description"]').length);
        record(
          `[browser] ${route.path} (prerendered, post-hydration) has exactly 1 <meta name="description"> (Helmet adopts, doesn't duplicate)`,
          descCount === 1,
          `found ${descCount}`
        );
      }
      await page.close();
    }
  } catch (e) {
    record('[browser] hydration smoke test completed', false, e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) server.kill();
  }
}

// ---------------------------------------------------------------------------

async function main() {
  await runHydrationChecks();

  const failed = results.filter((r) => r.pass === false);
  const skipped = results.filter((r) => r.pass === null);
  const passed = results.filter((r) => r.pass === true);

  console.log('\n=== Prerender-contract test suite (audit-01-search-visibility) ===\n');
  for (const r of results) {
    const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : 'SKIP';
    console.log(`[${mark}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }

  console.log(`\n${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped, ${results.length} total.\n`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main();
