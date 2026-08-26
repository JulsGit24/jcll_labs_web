/**
 * Build-time prerendering — dist/ (vite's SPA shell) -> dist/ (real, readable HTML).
 *
 * Production is Apache + PHP on shared hosting with no Node runtime, so runtime SSR
 * has nowhere to run. Snapshotting the built app into static .html files at build
 * time gets the same result for crawlers: Apache serves them as ordinary files, and
 * the SPA catch-all in public/.htaccess never fires for a path that is a real file.
 *
 * The snapshot is merged INTO vite's own dist/index.html — that file carries the
 * correct hashed <script type="module"> / modulepreload / stylesheet tags, and a raw
 * page.content() dump would ship stale or duplicated asset references and an
 * unhydratable page.
 *
 * The page is visited with ?prerender=1, which makes Home.jsx skip its WebGL canvas.
 * Headless Chrome's GL is software-emulated; a throw from inside <Canvas> propagates
 * out of an unguarded subtree and the whole app renders nothing, silently producing
 * an empty snapshot. The canvas holds no text, no links and no alt attributes, it is
 * position:absolute/inset:0 so its absence changes no layout, and React re-renders it
 * on mount. Every word a human sees is in the snapshot. This is not cloaking.
 *
 * Failure is fatal, deliberately. test/run.mjs's browser section SKIPs when puppeteer
 * is unavailable because the browser is a bonus verification layer there. Here the
 * browser IS the deliverable — a build that silently ships a blank shell is the exact
 * problem this script exists to fix.
 *
 *   node scripts/prerender.mjs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const PORT = 4738;

// `out` is relative to dist/. "/" is merged in place; every other route gets its own
// directory so mod_dir's DirectoryIndex serves it — that is what lets the existing
// catch-all rewrite in public/.htaccess stay untouched.
//
// minText is a "this is not a blank shell" floor on rendered innerText, not a content
// target. It is per-route because innerText counts only what is painted: image alt
// text and form placeholders do not contribute, so /photography/ measures far lower
// than its word count suggests. The floors below sit ~20% under the values measured
// on a good build — a real render failure drops to roughly zero, not to 80%.
const ROUTES = [
    { url: '/', out: 'index.html', minText: 1500 },
    { url: '/photography', out: 'photography/index.html', minText: 1000 },
];

let server;
let browser;

const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const fail = (msg) => {
    console.error(`\n  prerender FAILED: ${msg}`);
    if (browser) browser.close().catch(() => { });
    if (server) server.kill();
    process.exit(1);
};

const templatePath = path.join(DIST, 'index.html');
if (!fs.existsSync(templatePath)) fail('dist/index.html is missing — run `vite build` first');
const template = fs.readFileSync(templatePath, 'utf8');

// Every hashed asset reference vite emitted, so the merge can prove it lost none.
const templateAssets = [...template.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

let puppeteer;
try {
    puppeteer = (await import('puppeteer')).default;
} catch (e) {
    fail(`puppeteer is not installed (${e.message}). It is a devDependency and prerendering needs it.`);
}

console.log('Prerendering routes (vite preview -> dist/)…\n');

// vite's bin is spawned directly rather than through `npx` + shell:true. A shell
// wrapper on Windows means server.kill() kills the wrapper and orphans the real
// process, which then holds --strictPort and breaks the next build.
server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    stdio: 'pipe',
});

// Poll the port itself rather than parsing stdout — more robust than a string match
// against a subprocess spawned through shell:true/npx, where stdout buffering varies
// by platform. Same approach as test/run.mjs's browser section.
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
if (!serverUp) fail(`vite preview did not answer on port ${PORT} within 30s`);

// Nothing is written until every route has been snapshotted: the preview server is
// serving the same dist/index.html this script is about to overwrite, and a route
// rendered against an already-prerendered shell would inherit the previous route's
// baked-in head tags.
const pending = [];

try {
    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
    });

    for (const route of ROUTES) {
        const page = await browser.newPage();

        // networkidle0 is wrong here: the Films section autoplays a 1.2 MB video and
        // the network does not go idle promptly. Wait for the H1 the page must have.
        await page.goto(`http://localhost:${PORT}${route.url}?prerender=1`, { waitUntil: 'load', timeout: 30000 });
        try {
            await page.waitForSelector('#root h1', { timeout: 20000 });
        } catch {
            fail(`${route.url} never rendered an <h1> into #root`);
        }

        const snapshot = await page.evaluate(() => {
            // Framer Motion writes its `initial` state as inline styles, and every
            // below-the-fold section uses whileInView + viewport:{once:true}. In a
            // headless viewport those elements never enter view, so their inline
            // opacity:0 never clears and the snapshot would bake style="opacity:0"
            // onto most of the page — which Google may read as hidden text. Stripping
            // the properties is deterministic; a settle timeout is not.
            document.querySelectorAll('#root [style]').forEach((el) => {
                el.style.removeProperty('opacity');
                el.style.removeProperty('transform');
                el.style.removeProperty('visibility');
                if (!el.getAttribute('style')) el.removeAttribute('style');
            });

            // #root only, never document.body: LanguageModal renders through
            // createPortal into body and, with no localStorage, is open on every
            // fresh visit. Serialising body would make a full-screen language chooser
            // the first thing in the crawlable HTML.
            const rootEl = document.getElementById('root');

            // data-rh is kept on the copied tags — that attribute is what makes
            // react-helmet-async adopt and replace them on mount instead of appending
            // a second copy of every tag.
            const head = [...document.head.querySelectorAll('[data-rh="true"]')]
                .map((el) => el.outerHTML)
                .join('\n    ');

            // document.title is read separately because react-helmet-async does NOT
            // emit a <title data-rh> element — it mutates the existing one in place,
            // so the title is invisible to the data-rh sweep above.
            return { body: rootEl.innerHTML, head, title: document.title, textLength: rootEl.innerText.length };
        });

        await page.close();

        if (!/<h1/i.test(snapshot.body)) fail(`${route.url}: snapshot contains no <h1`);
        if (snapshot.textLength < route.minText) fail(`${route.url}: rendered text is only ${snapshot.textLength} chars (floor ${route.minText})`);
        if (!snapshot.head.includes('rel="canonical"')) fail(`${route.url}: no canonical tag in the Helmet head`);
        if (!snapshot.title) fail(`${route.url}: rendered document has no title`);

        // The static <meta description> is dropped because Helmet emits its own
        // data-rh copy of it. The static <title> is rewritten in place instead:
        // Helmet has no <title data-rh> to copy, so deleting this element would ship
        // a document with no title at all.
        const titleTag = `<title>${escapeHtml(snapshot.title)}</title>`;
        let html = template
            .replace(/<title>[^<]*<\/title>/, titleTag)
            .replace(/\s*<meta name="description" content="[^"]*"\s*\/?>/, '')
            .replace('</head>', `  ${snapshot.head}\n  </head>`);

        if (!html.includes(titleTag)) fail(`${route.url}: title was not written into the template`);

        const rootDiv = '<div id="root"></div>';
        if (!html.includes(rootDiv)) fail(`${route.url}: template has no ${rootDiv} to fill`);
        html = html.replace(rootDiv, `<div id="root">${snapshot.body}</div>`);

        if (html.includes('prerender=1')) fail(`${route.url}: merged document leaks prerender=1`);
        const missing = templateAssets.filter((a) => !html.includes(a));
        if (missing.length) fail(`${route.url}: merge lost asset reference(s) ${missing.join(', ')}`);

        pending.push({ route, html, textLength: snapshot.textLength });
    }
} catch (e) {
    fail(e.stack || e.message);
}

await browser.close();
browser = null;
server.kill();

for (const { route, html, textLength } of pending) {
    const outPath = path.join(DIST, route.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(`  ${route.url.padEnd(15)} -> dist/${route.out.padEnd(24)} ${kb.padStart(7)} KB  ${textLength} chars of text`);
}

console.log(`\n${pending.length} routes prerendered.`);
