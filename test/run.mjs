#!/usr/bin/env node
// AEO / agent-readiness test suite.
//
// Pure Node, no test framework. Run via `npm test` (which builds first — vite's
// default emptyOutDir means every run is a clean build, so these assertions never
// trust a stale dist/). Structure: an array of independent checks, each returning
// { name, pass, detail }. Exits 1 if any check fails.
//
// Sections:
//   1. Build-output existence (does the file even ship to dist/)
//   2. JSON / XML validity
//   3. Domain consistency (no jcllphotography.com; jcll.me everywhere required)
//   4. robots.txt structural correctness (Content-Signal in every named group)
//   5. sitemap.xml content correctness
//   6. .htaccess structural safety (the highest-blast-radius file in the repo)
//   7. Cross-artifact consistency (SKILL.md digest, tool-description byte-match,
//      index.html <-> content.js byte-match)
//   8. Browser smoke test via Puppeteer against `vite preview` (best-effort; a
//      missing/uninstallable browser SKIPS this section, it does not fail the run)
//
// Add a new case by pushing another { name, fn } into CASES and, if it needs new
// fixtures (paths, expected strings), extend the constants section at the top.

import { execSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://jcll.me';
const OLD_DOMAIN = 'jcllphotography.com';

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
// 1. Build-output existence
// ---------------------------------------------------------------------------

const REQUIRED_DIST_FILES = [
  'index.html',
  '.htaccess',
  'robots.txt',
  'sitemap.xml',
  'home.md',
  'auth.md',
  'openapi.json',
  '.well-known/api-catalog',
  '.well-known/ai-catalog.json',
  '.well-known/agent-skills/index.json',
  '.well-known/agent-skills/submit-contact-inquiry/SKILL.md',
];

for (const rel of REQUIRED_DIST_FILES) {
  const p = path.join(DIST, rel);
  record(
    `dist ships ${rel}`,
    exists(p) && fs.statSync(p).isFile(),
    exists(p) ? '' : `missing at ${p}`
  );
}

// ---------------------------------------------------------------------------
// 2. JSON / XML validity
// ---------------------------------------------------------------------------

const JSON_ARTIFACTS = [
  'openapi.json',
  '.well-known/api-catalog',
  '.well-known/ai-catalog.json',
  '.well-known/agent-skills/index.json',
];

for (const rel of JSON_ARTIFACTS) {
  const p = path.join(DIST, rel);
  if (!exists(p)) {
    record(`${rel} parses as JSON`, false, 'file missing, cannot parse');
    continue;
  }
  try {
    JSON.parse(read(p));
    record(`${rel} parses as JSON`, true);
  } catch (e) {
    record(`${rel} parses as JSON`, false, e.message);
  }
}

// Minimal well-formedness checker: stack-based tag matcher. Good enough for a
// hand-authored sitemap with no namespaces beyond the default xmlns, no CDATA.
function checkXmlWellFormed(xml) {
  const withoutDecl = xml.replace(/<\?xml[^?]*\?>/, '');
  const withoutComments = withoutDecl.replace(/<!--[\s\S]*?-->/g, '');
  const tagRe = /<\/?[^>]+>/g;
  const stack = [];
  let m;
  while ((m = tagRe.exec(withoutComments))) {
    const tag = m[0];
    if (tag.startsWith('</')) {
      const name = tag.slice(2, -1).trim();
      const top = stack.pop();
      if (top !== name) {
        return { ok: false, detail: `mismatched close </${name}>, expected </${top}>` };
      }
    } else if (tag.endsWith('/>')) {
      // self-closing, no stack push
    } else {
      const name = tag.slice(1, -1).trim().split(/\s/)[0];
      stack.push(name);
    }
  }
  if (stack.length !== 0) {
    return { ok: false, detail: `unclosed tag(s): ${stack.join(', ')}` };
  }
  return { ok: true };
}

{
  const p = path.join(DIST, 'sitemap.xml');
  if (!exists(p)) {
    record('sitemap.xml is well-formed XML', false, 'file missing');
  } else {
    const r = checkXmlWellFormed(read(p));
    record('sitemap.xml is well-formed XML', r.ok, r.detail);
  }
}

// ---------------------------------------------------------------------------
// 3. Domain consistency
// ---------------------------------------------------------------------------

function grepDomain(dir, needle) {
  const hits = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        // Skip obvious binaries by extension.
        if (/\.(png|jpg|jpeg|svg|mp4|zip|ico|woff2?|ttf)$/i.test(entry.name)) continue;
        let text;
        try {
          text = fs.readFileSync(full, 'utf8');
        } catch {
          continue;
        }
        if (text.includes(needle)) hits.push(full);
      }
    }
  }
  if (exists(dir)) walk(dir);
  return hits;
}

for (const dir of ['src', 'public', 'dist']) {
  const hits = grepDomain(path.join(ROOT, dir), OLD_DOMAIN);
  record(
    `no "${OLD_DOMAIN}" remains under ${dir}/`,
    hits.length === 0,
    hits.length ? `found in: ${hits.map((h) => path.relative(ROOT, h)).join(', ')}` : ''
  );
}
{
  const p = path.join(ROOT, 'index.html');
  const hasOld = exists(p) && read(p).includes(OLD_DOMAIN);
  record(`no "${OLD_DOMAIN}" remains in index.html`, !hasOld, hasOld ? 'found' : '');
}

// Every file the spec (D1) names as needing the canonical domain literally.
const FILES_REQUIRING_SITE_URL = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/.well-known/api-catalog',
  'public/.well-known/ai-catalog.json',
  'public/openapi.json',
  'public/auth.md',
  'public/home.md',
  'src/utils/site.js',
];
for (const rel of FILES_REQUIRING_SITE_URL) {
  const p = path.join(ROOT, rel);
  const ok = exists(p) && read(p).includes(SITE_URL);
  record(`${rel} contains canonical domain ${SITE_URL}`, ok, ok ? '' : 'string not found');
}

// ---------------------------------------------------------------------------
// 4. robots.txt structural correctness
// ---------------------------------------------------------------------------

{
  const p = path.join(ROOT, 'public/robots.txt');
  const text = exists(p) ? read(p) : '';
  const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  const groups = blocks.filter((b) => /^User-agent:/im.test(b));

  const expectedAgents = [
    '*',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-Web',
    'ClaudeBot',
    'Google-Extended',
  ];

  record(
    'robots.txt has exactly 7 User-agent groups',
    groups.length === 7,
    `found ${groups.length}: ${groups.map((g) => (g.match(/User-agent:\s*(.+)/i) || [])[1]).join(', ')}`
  );

  const foundAgents = groups.map((g) => (g.match(/User-agent:\s*(\S+)/i) || [])[1]);
  const missingAgents = expectedAgents.filter((a) => !foundAgents.includes(a));
  record(
    'robots.txt names all 7 expected groups (4 audited crawlers + * + 2 extra)',
    missingAgents.length === 0,
    missingAgents.length ? `missing: ${missingAgents.join(', ')}` : ''
  );

  // The 4 crawlers the audit specifically named.
  const auditedFour = ['GPTBot', 'OAI-SearchBot', 'Claude-Web', 'Google-Extended'];
  const missingAudited = auditedFour.filter((a) => !foundAgents.includes(a));
  record(
    'robots.txt includes all 4 audited AI crawlers',
    missingAudited.length === 0,
    missingAudited.length ? `missing: ${missingAudited.join(', ')}` : ''
  );

  const CONTENT_SIGNAL_LINE = 'Content-Signal: ai-train=no, search=yes, ai-input=yes';
  const groupsMissingSignal = groups.filter((g) => !g.includes(CONTENT_SIGNAL_LINE));
  record(
    'Content-Signal line appears verbatim in EVERY named group (not just *)',
    groupsMissingSignal.length === 0,
    groupsMissingSignal.length
      ? `groups missing it: ${groupsMissingSignal
          .map((g) => (g.match(/User-agent:\s*(\S+)/i) || [])[1])
          .join(', ')}`
      : `verified in all ${groups.length} groups`
  );

  const sitemapLine = `Sitemap: ${SITE_URL}/sitemap.xml`;
  record(
    'robots.txt references the sitemap at file scope',
    text.includes(sitemapLine),
    text.includes(sitemapLine) ? '' : `expected line "${sitemapLine}" not found`
  );
}

// ---------------------------------------------------------------------------
// 5. sitemap.xml content correctness
// ---------------------------------------------------------------------------

{
  const p = path.join(ROOT, 'public/sitemap.xml');
  const text = exists(p) ? read(p) : '';
  const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const expectedLocs = [
    `${SITE_URL}/`,
    `${SITE_URL}/photography/`,
    `${SITE_URL}/experimental`,
    `${SITE_URL}/referral-club`,
    `${SITE_URL}/interact`,
  ];
  record(
    'sitemap.xml lists exactly the 5 expected URLs, no more no less',
    locs.length === expectedLocs.length && expectedLocs.every((u) => locs.includes(u)),
    `found: ${JSON.stringify(locs)}`
  );

  const forbidden = ['/privacy', '/terms', '#'];
  const badHits = forbidden.filter((f) => text.includes(f));
  record(
    'sitemap.xml does not list /privacy, /terms, or any #anchor',
    badHits.length === 0,
    badHits.length ? `found: ${badHits.join(', ')}` : ''
  );

  record(
    'sitemap.xml has no hreflang alternates (D3b — no per-locale URL exists)',
    !text.includes('hreflang'),
    text.includes('hreflang') ? 'hreflang attribute found' : ''
  );
}

// ---------------------------------------------------------------------------
// 6. .htaccess structural safety
// ---------------------------------------------------------------------------

{
  const p = path.join(ROOT, 'public/.htaccess');
  const text = exists(p) ? read(p) : '';

  const ORIGINAL_LINES = [
    'RewriteEngine On',
    'RewriteBase /',
    'RewriteRule ^index\\.html$ - [L]',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{REQUEST_FILENAME} !-d',
    'RewriteRule . /index.html [L]',
  ];

  // 6a. Every original line is present, byte-intact (allow leading whitespace
  // differences since indentation is not semantic in Apache config).
  const normalizedLines = text.split(/\r?\n/).map((l) => l.trim());
  const missingOriginal = ORIGINAL_LINES.filter((l) => !normalizedLines.includes(l));
  record(
    'all 6 original SPA rewrite lines are byte-intact',
    missingOriginal.length === 0,
    missingOriginal.length ? `missing/altered: ${JSON.stringify(missingOriginal)}` : ''
  );

  // 6b. They appear in original relative order.
  const positions = ORIGINAL_LINES.map((l) => normalizedLines.indexOf(l));
  let inOrder = positions.every((v) => v !== -1);
  if (inOrder) {
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] <= positions[i - 1]) {
        inOrder = false;
        break;
      }
    }
  }
  record('original SPA rewrite lines remain in original relative order', inOrder);

  // 6c. The catch-all rewrite (!-f / !-d / RewriteRule . /index.html) is still the
  // LAST thing in the mod_rewrite block — i.e. new content was inserted above it,
  // not interleaved after it in a way that could shadow it.
  const catchAllIdx = normalizedLines.indexOf('RewriteRule . /index.html [L]');
  const ifModuleCloseAfterCatchAll = normalizedLines
    .slice(catchAllIdx + 1)
    .findIndex((l) => l.length > 0);
  const nextNonBlank = catchAllIdx >= 0 ? normalizedLines.slice(catchAllIdx + 1).find((l) => l.length > 0) : null;
  record(
    'catch-all rewrite rule is immediately followed by the block close (nothing shadows it)',
    nextNonBlank === '</IfModule>',
    `next non-blank line after catch-all: ${JSON.stringify(nextNonBlank)}`
  );

  // 6d. No <If> block anywhere except inside a `#` comment line.
  const lines = text.split(/\r?\n/);
  const badIfLines = lines.filter((l) => {
    const trimmed = l.trim();
    if (trimmed.startsWith('#')) return false; // inside a comment, allowed
    // Match "<If" not followed by "Module" (so <IfModule is fine, <If ...> is not)
    return /<If(?!Module)/.test(trimmed);
  });
  record(
    'no <If>/<ElseIf>/<Else> block exists outside a comment (Apache 2.4-only, 500s on 2.2)',
    badIfLines.length === 0,
    badIfLines.length ? `offending line(s): ${JSON.stringify(badIfLines)}` : ''
  );

  // 6e. Every new directive type is inside a matching <IfModule> guard. Check by
  // scanning line-by-line with a simple nesting counter for IfModule blocks.
  function linesInsideIfModule(directiveRegex) {
    const offenders = [];
    let depth = 0;
    for (const raw of lines) {
      const l = raw.trim();
      if (/^<IfModule\b/i.test(l)) depth++;
      else if (/^<\/IfModule>/i.test(l)) depth = Math.max(0, depth - 1);
      else if (directiveRegex.test(l) && !l.startsWith('#')) {
        if (depth === 0) offenders.push(raw);
      }
    }
    return offenders;
  }

  const headerOffenders = linesInsideIfModule(/^Header\s/i);
  record(
    'every "Header" directive is inside an <IfModule> guard',
    headerOffenders.length === 0,
    headerOffenders.length ? JSON.stringify(headerOffenders) : ''
  );

  const mimeOffenders = linesInsideIfModule(/^(AddType|AddCharset|ForceType)\s/i);
  record(
    'every AddType/AddCharset/ForceType directive is inside an <IfModule> guard',
    mimeOffenders.length === 0,
    mimeOffenders.length ? JSON.stringify(mimeOffenders) : ''
  );

  // 6f. mod_headers and mod_mime blocks specifically present (the two new guards).
  record('has <IfModule mod_headers.c> guard', /<IfModule\s+mod_headers\.c>/.test(text));
  record('has <IfModule mod_mime.c> guard', /<IfModule\s+mod_mime\.c>/.test(text));
  record('has <IfModule mod_rewrite.c> guard (pre-existing, must survive)', /<IfModule\s+mod_rewrite\.c>/.test(text));

  // 6g. Balanced tags overall (IfModule and Files).
  // Count only on non-comment lines — a comment is allowed to mention "<IfModule>"
  // in prose (this file's mod_headers block does exactly that) without it counting
  // as a real tag.
  const codeLines = lines.filter((l) => !l.trim().startsWith('#'));
  function countTag(open, close) {
    const codeText = codeLines.join('\n');
    return {
      open: (codeText.match(new RegExp(open, 'gi')) || []).length,
      close: (codeText.match(new RegExp(close, 'gi')) || []).length,
    };
  }
  const ifm = countTag('<IfModule\\b[^>]*>', '</IfModule>');
  record('<IfModule> open/close tags balanced', ifm.open === ifm.close, `open=${ifm.open} close=${ifm.close}`);
  const files = countTag('<Files\\b[^>]*>', '</Files>');
  record('<Files> open/close tags balanced', files.open === files.close, `open=${files.open} close=${files.close}`);

  // 6h. The markdown-negotiation rewrite sits BEFORE the catch-all condition, or it
  // can never fire (the catch-all rewrites everything to index.html first... well,
  // actually order matters because Apache evaluates rules top-down within a
  // directory context and stops at [L] on match).
  const mdRuleIdx = normalizedLines.indexOf('RewriteRule ^$ /home.md [L]');
  record(
    'the text/markdown negotiation rule is positioned before the SPA catch-all (or it can never fire)',
    mdRuleIdx !== -1 && catchAllIdx !== -1 && mdRuleIdx < catchAllIdx,
    `md rule at line-index ${mdRuleIdx}, catch-all at ${catchAllIdx}`
  );
}

// ---------------------------------------------------------------------------
// 7. Cross-artifact consistency
// ---------------------------------------------------------------------------

{
  // Digest of the shipped SKILL.md must match what index.json (in the same dist/)
  // publishes — verified against the BUILD OUTPUT, not the source tree, since a
  // line-ending rewrite on checkout is exactly the failure mode being guarded
  // against (per the Developer's .gitattributes note).
  const skillPath = path.join(DIST, '.well-known/agent-skills/submit-contact-inquiry/SKILL.md');
  const indexPath = path.join(DIST, '.well-known/agent-skills/index.json');
  if (exists(skillPath) && exists(indexPath)) {
    const bytes = fs.readFileSync(skillPath);
    const actualHex = createHash('sha256').update(bytes).digest('hex');
    const idx = JSON.parse(read(indexPath));
    const entry = (idx.skills || [])[0] || {};
    const digestField = String(entry.digest || '');
    const sha256Field = String(entry.sha256 || '');
    const expectedDigest = `sha256:${actualHex}`;
    record(
      'agent-skills/index.json "digest" matches actual sha256 of shipped SKILL.md',
      digestField === expectedDigest,
      `actual=${expectedDigest} published=${digestField}`
    );
    record(
      'agent-skills/index.json "sha256" (compat field) matches actual sha256 too',
      sha256Field === actualHex,
      `actual=${actualHex} published=${sha256Field}`
    );
  } else {
    record('agent-skills/index.json digest matches shipped SKILL.md', false, 'one or both files missing from dist/');
  }
}

{
  // submit_contact_inquiry description must byte-match across index.json,
  // SKILL.md frontmatter, and AEO.jsx's source constant.
  const indexPath = path.join(DIST, '.well-known/agent-skills/index.json');
  const skillPath = path.join(DIST, '.well-known/agent-skills/submit-contact-inquiry/SKILL.md');
  const aeoPath = path.join(ROOT, 'src/components/AEO.jsx');

  let fromIndex = null;
  let fromSkill = null;
  let fromAeo = null;

  if (exists(indexPath)) {
    try {
      fromIndex = (JSON.parse(read(indexPath)).skills || [])[0]?.description ?? null;
    } catch {
      /* JSON validity already reported above */
    }
  }
  if (exists(skillPath)) {
    const m = read(skillPath).match(/^description:\s*(.+)$/m);
    fromSkill = m ? m[1].trim() : null;
  }
  if (exists(aeoPath)) {
    const m = read(aeoPath).match(/SUBMIT_INQUIRY_DESCRIPTION\s*=\s*'([^']+(?:\\.[^']*)*)'/);
    fromAeo = m ? m[1] : null;
  }

  const allPresent = fromIndex && fromSkill && fromAeo;
  const allMatch = allPresent && fromIndex === fromSkill && fromSkill === fromAeo;
  record(
    'submit_contact_inquiry description is byte-identical in index.json, SKILL.md, and AEO.jsx',
    allMatch,
    allMatch
      ? ''
      : `index=${JSON.stringify(fromIndex)} skill=${JSON.stringify(fromSkill)} aeo=${JSON.stringify(fromAeo)}`
  );
}

{
  // index.html <title>/<meta description> must byte-match content.en.seo.* (after
  // un-escaping the HTML entity in the title).
  const htmlPath = path.join(ROOT, 'index.html');
  const contentPath = path.join(ROOT, 'src/utils/content.js');
  const html = exists(htmlPath) ? read(htmlPath) : '';
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const htmlTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : null;
  const htmlDesc = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : null;

  // content.js is ESM; extract the en.seo.title/description with a tolerant regex
  // rather than importing (keeps this script dependency-free and fast).
  //
  // Tightened per QA (audit-01-search-visibility, design spec §7 item 2): the
  // previous version was `/en:\s*{[\s\S]*?seo:\s*{([\s\S]*?)}\s*,?\s*\n\s*}/`,
  // which does NOT stop at seo's own closing brace — `[\s\S]*?` is non-greedy but
  // the engine keeps extending the capture until it finds *some* `}` followed by
  // `,? \n }`, and nothing that shape immediately follows `seo`'s real close (a
  // comment line sits there). It ends up capturing everything up to the next
  // sibling key's closing pattern (in practice, past `seoPages` entirely) and
  // only produced the right title/description because `seo.title` happened to be
  // the first `title:` string encountered in that over-captured text. Reordering
  // `content.js` or adding a `title:` key anywhere earlier in `seoPages` would
  // have silently broken this. The version below matches the literal
  // `seo: { title: "...", description: "..." }` shape directly — order of any
  // sibling keys is irrelevant because the match terminates at seo's own `}`.
  const contentSrc = exists(contentPath) ? read(contentPath) : '';
  const enSeoMatch = contentSrc.match(
    /en:\s*{[\s\S]*?seo:\s*{\s*title:\s*(['"])((?:\\.|(?!\1).)*)\1,\s*description:\s*(['"])((?:\\.|(?!\3).)*)\3\s*,?\s*}/
  );
  const jsTitle = enSeoMatch ? enSeoMatch[2] : null;
  const jsDesc = enSeoMatch ? enSeoMatch[4] : null;

  record(
    'index.html <title> byte-matches content.en.seo.title',
    !!htmlTitle && !!jsTitle && htmlTitle === jsTitle,
    `html=${JSON.stringify(htmlTitle)} js=${JSON.stringify(jsTitle)}`
  );
  record(
    'index.html <meta description> byte-matches content.en.seo.description',
    !!htmlDesc && !!jsDesc && htmlDesc === jsDesc,
    `html=${JSON.stringify(htmlDesc)} js=${JSON.stringify(jsDesc)}`
  );
}

{
  // src/App.jsx: <AEO /> mounted as a sibling of <SEO />, not a replacement, and
  // SEO.jsx's own render output is untouched by this change (only the siteUrl line
  // was sanctioned to change).
  const appPath = path.join(ROOT, 'src/App.jsx');
  const app = exists(appPath) ? read(appPath) : '';
  const hasSeoImport = /import\s+SEO\s+from\s+['"]\.\/components\/SEO['"]/.test(app);
  const hasAeoImport = /import\s+AEO\s+from\s+['"]\.\/components\/AEO['"]/.test(app);
  const hasBothMounted = /<SEO\s*\/>/.test(app) && /<AEO\s*\/>/.test(app);
  record('App.jsx imports both SEO and AEO', hasSeoImport && hasAeoImport);
  record('App.jsx renders <SEO /> and <AEO /> as siblings', hasBothMounted);
}

// ---------------------------------------------------------------------------
// 7b. No invented facts (audit-01-search-visibility guardrails)
//
// The brief and intake are explicit: do not invent client data (reviews,
// ratings, third-party profiles, verification tokens) to make an audit score
// look better than reality. These are permanent regression guards against
// that discipline slipping in a future change — static/source-level here;
// the browser section below re-checks the same things against the live DOM.
// ---------------------------------------------------------------------------

{
  // schema.org review/rating markup must never appear anywhere in the repo.
  // Case-sensitive and scoped to the exact schema.org strings/@type values so
  // this doesn't false-positive on ordinary prose like content.js's
  // `testimonials.reviews` key (lowercase "reviews").
  const FORBIDDEN_SCHEMA = ['AggregateRating', 'reviewRating', '"@type":"Review"', "'@type': 'Review'", '"@type": "Review"'];
  const hits = [];
  for (const dir of ['src', 'public', 'dist']) {
    for (const needle of FORBIDDEN_SCHEMA) {
      grepDomain(path.join(ROOT, dir), needle).forEach((f) =>
        hits.push(`"${needle}" in ${path.relative(ROOT, f)}`)
      );
    }
  }
  record(
    'no Review / AggregateRating / reviewRating schema markup anywhere (no invented trust signals)',
    hits.length === 0,
    hits.length ? hits.join('; ') : ''
  );
}

{
  // A bare platform homepage in sameAs/footer/contact corroborates nothing and
  // is worse than omitting the field (per the brief). Scoped to the live
  // source files that feed sameAs + the footer + the contact icon row, and
  // strips `//`-prefixed comment lines first so the deliberately-commented
  // sample entry in site.js (which the owner must uncomment once real) never
  // trips this.
  function stripLineComments(text) {
    return text
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n');
  }
  const BARE_SOCIAL_RE = /https?:\/\/(www\.)?(instagram|twitter|linkedin)\.com\/?(?=["'`\s,)])/gi;
  const filesToScan = [
    'src/utils/site.js',
    'src/components/Footer.jsx',
    'src/components/SEO.jsx',
    'src/pages/Contact.jsx',
  ];
  const bareHits = [];
  for (const rel of filesToScan) {
    const p = path.join(ROOT, rel);
    if (!exists(p)) continue;
    const code = stripLineComments(read(p));
    for (const m of code.matchAll(BARE_SOCIAL_RE)) {
      bareHits.push(`${m[0]} in ${rel}`);
    }
  }
  record(
    'no live (uncommented) bare instagram.com/twitter.com/linkedin.com placeholder links',
    bareHits.length === 0,
    bareHits.length ? bareHits.join('; ') : ''
  );
}

{
  // GSC_VERIFICATION's documented default is empty, and SEO.jsx is written to
  // emit NO tag at all (not an empty content="") when it's empty. Confirm the
  // source still holds that contract; the browser section below confirms the
  // rendered DOM matches it.
  const sitePath = path.join(ROOT, 'src/utils/site.js');
  const site = exists(sitePath) ? read(sitePath) : '';
  const m = site.match(/GSC_VERIFICATION\s*=\s*(['"])(.*?)\1/);
  const isEmptyByDefault = m ? m[2] === '' : false;
  const seoPath = path.join(ROOT, 'src/components/SEO.jsx');
  const seoSrc = exists(seoPath) ? read(seoPath) : '';
  const hasConditionalRender = /GSC_VERIFICATION\s*\?\s*<meta[^>]*google-site-verification/.test(seoSrc);
  record(
    'GSC_VERIFICATION defaults to empty AND SEO.jsx renders the tag conditionally (never content="")',
    isEmptyByDefault && hasConditionalRender,
    `default empty=${isEmptyByDefault}, conditional render=${hasConditionalRender}`
  );
}

// ---------------------------------------------------------------------------
// 8. Browser smoke test (best-effort — never fails the run if unavailable)
// ---------------------------------------------------------------------------

async function runBrowserChecks() {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    record('[browser] puppeteer available', null, 'SKIPPED — puppeteer not installed; static checks above stand alone');
    return;
  }

  const PORT = 4653;
  let server;
  try {
    server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      shell: true,
      stdio: 'pipe',
    });
  } catch (e) {
    record('[browser] vite preview started', false, e.message);
    return;
  }

  // Poll the port itself rather than parsing stdout text — more robust than a
  // string match against a subprocess spawned through `shell: true`/npx, where
  // stdout buffering behavior varies by platform.
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

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const routes = ['/', '/experimental', '/referral-club', '/interact'];
    for (const route of routes) {
      const page = await browser.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('requestfailed', (req) => {
        // The SPA legitimately probes some optional assets; only record same-origin
        // document/script/stylesheet failures as meaningful.
        failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
      });
      page.on('pageerror', (err) => consoleErrors.push(String(err)));

      let navOk = true;
      let navErr = '';
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch (e) {
        navOk = false;
        navErr = e.message;
      }
      record(`[browser] ${route} loads`, navOk, navErr);

      if (navOk) {
        // Poll rather than a single evaluate() right after `networkidle0`.
        // QA found this flaky in practice on the three.js-heavy routes
        // (/experimental, /interact): `networkidle0` only waits for network
        // activity to settle, not for GSAP/Framer Motion entrance animations
        // or a WebGL canvas's first frame — under system load, text can still
        // be mid-animation (or not yet appended) at the instant navigation
        // resolves, producing a false "textLen=0" a moment before the same
        // page would have passed. Poll up to 5s instead of evaluating once.
        let rootInfo = { exists: false, children: 0, textLen: 0 };
        const rootDeadline = Date.now() + 5000;
        while (Date.now() < rootDeadline) {
          rootInfo = await page.evaluate(() => {
            const root = document.getElementById('root');
            return {
              exists: !!root,
              children: root ? root.children.length : 0,
              textLen: root ? root.innerText.trim().length : 0,
            };
          });
          if (rootInfo.exists && rootInfo.children > 0 && rootInfo.textLen > 0) break;
          await new Promise((r) => setTimeout(r, 250));
        }
        const rootHasContent = rootInfo.exists && rootInfo.children > 0 && rootInfo.textLen > 0;
        record(
          `[browser] ${route} renders content into #root`,
          rootHasContent,
          rootHasContent ? '' : `#root exists=${rootInfo.exists} children=${rootInfo.children} textLen=${rootInfo.textLen} after polling up to 5s`
        );

        record(
          `[browser] ${route} — no console errors`,
          consoleErrors.length === 0,
          consoleErrors.length ? consoleErrors.slice(0, 5).join(' | ') : ''
        );

        if (route === '/') {
          // Real hydration proof (design spec §7 item 5 / PM ruling): "renders
          // content into #root" above is now trivially true even pre-hydration
          // once the page is prerendered, so it no longer proves the JS bundle
          // actually took over the page. Toggling the language via a real click
          // and asserting the <h1> text changes proves client-side React is
          // live, event handlers are wired, and zustand state is driving a
          // re-render — a broken/unhydratable bundle fails this loudly while
          // still passing every other check on this list.
          try {
            // First visit: LanguageModal is showing (hasSelectedLanguage is
            // false with no persisted localStorage). Dismiss it via its own
            // English button, which also sets the initial language.
            await page.waitForSelector('.lang-btn.en', { timeout: 5000 });
            await page.click('.lang-btn.en');
            await new Promise((r) => setTimeout(r, 400));

            const h1Before = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');

            // Now use the persistent nav language switch to flip to Spanish.
            await page.evaluate(() => {
              const btns = [...document.querySelectorAll('.lang-switch.desktop-only button')];
              const esBtn = btns.find((b) => b.textContent.trim() === 'ES');
              if (esBtn) esBtn.click();
            });
            await new Promise((r) => setTimeout(r, 400));
            const h1After = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');

            record(
              '[browser] "/" language toggle (EN -> ES via nav) changes the <h1> text — proves hydration, not just render',
              h1Before.length > 0 && h1After.length > 0 && h1Before !== h1After,
              `before=${JSON.stringify(h1Before)} after=${JSON.stringify(h1After)}`
            );
          } catch (e) {
            record('[browser] "/" language toggle (EN -> ES via nav) changes the <h1> text — proves hydration, not just render', false, e.message);
          }

          // JSON-LD must parse and carry the entity graph's stable @id — this is
          // what lets Google join / and /photography/ into one business.
          const jsonLd = await page.evaluate(() => {
            const el = document.querySelector('script[type="application/ld+json"]');
            return el ? el.textContent : null;
          });
          let jsonLdParsed = null;
          try {
            jsonLdParsed = jsonLd ? JSON.parse(jsonLd) : null;
          } catch {
            /* reported below */
          }
          const orgId = jsonLdParsed?.['@graph']?.find((n) => n['@id'] === 'https://jcll.me/#organization');
          record(
            '[browser] "/" JSON-LD parses and contains "@id":"https://jcll.me/#organization"',
            !!orgId,
            orgId ? '' : `parsed=${!!jsonLdParsed}, raw=${jsonLd ? jsonLd.slice(0, 200) : 'null'}`
          );

          // sameAs, if present at all (SOCIAL_LINKS is empty by default so it
          // should be OMITTED, not an empty array), must never contain a bare
          // platform homepage.
          const sameAs = orgId?.sameAs;
          const bareSameAs = Array.isArray(sameAs)
            ? sameAs.filter((u) => /^https?:\/\/(www\.)?(instagram|twitter|linkedin)\.com\/?$/.test(u))
            : [];
          record(
            '[browser] "/" sameAs is absent (SOCIAL_LINKS empty by default) or contains no bare platform homepages',
            sameAs === undefined || bareSameAs.length === 0,
            sameAs === undefined ? 'absent, as expected' : `sameAs=${JSON.stringify(sameAs)}, bare=${JSON.stringify(bareSameAs)}`
          );

          // google-site-verification must be absent while GSC_VERIFICATION is
          // empty — an empty content="" reads as a FAILED verification attempt
          // to Google, which is worse than no tag at all.
          const gscTagCount = await page.evaluate(
            () => document.querySelectorAll('meta[name="google-site-verification"]').length
          );
          record(
            '[browser] "/" has no <meta name="google-site-verification"> while GSC_VERIFICATION is empty',
            gscTagCount === 0,
            gscTagCount ? `found ${gscTagCount}` : ''
          );

          // AEO.jsx graceful-degradation check: navigator.modelContext is absent in
          // stock Chrome/Chromium, and the app must still be fine — which the two
          // checks above already establish. Confirm the negative explicitly too.
          const hasModelContext = await page.evaluate(() => 'modelContext' in navigator);
          record(
            '[browser] navigator.modelContext is absent in this browser (expected — confirms the degrade path was actually exercised)',
            hasModelContext === false,
            hasModelContext ? 'modelContext unexpectedly present — WebMCP path was not exercised by this check' : ''
          );

          // Two <meta name="description"> tags are the documented, accepted cost
          // (spec §6.4) — assert the count is exactly 2, not more (which would mean
          // something is duplicating unexpectedly) and not fewer (which would mean
          // Helmet failed to mount).
          const descCount = await page.evaluate(
            () => document.querySelectorAll('meta[name="description"]').length
          );
          record(
            '[browser] "/" has exactly 2 <meta name="description"> (documented duplicate cost, spec §6.4)',
            descCount === 2,
            `found ${descCount}`
          );

          const linkRels = await page.evaluate(() =>
            [...document.querySelectorAll('link[rel]')].map((l) => `${l.rel}:${l.getAttribute('href')}`)
          );
          const hasHomeMdLink = linkRels.some((l) => l.includes('home.md'));
          record('[browser] "/" head contains AEO discovery <link> to home.md', hasHomeMdLink, JSON.stringify(linkRels));
        }
      }
      await page.close();
    }
  } catch (e) {
    record('[browser] smoke test completed', false, e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) server.kill();
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
// 9. Production payload budgets
//
// The site previously shipped 45 MB because full-resolution originals sat in
// public/ and every library landed in one eager chunk. These are regression
// guards on that, not micro-optimisation: they fail loudly if an unoptimised
// original is dropped into public/ or an eager import drags three.js back into
// the critical path. Budgets are deliberately well above current actuals so
// ordinary content changes don't trip them.
// ---------------------------------------------------------------------------

const BUDGETS = {
  singleImageKB: 400,     // largest shipped image; actual peak is ~194 KB
  allImagesKB: 3000,      // whole public/images tree; actual is ~1.6 MB
  videoKB: 2000,          // actual is ~1.23 MB
  criticalJsKB: 600,      // JS in dist/index.html; actual is ~428 KB
  distMB: 12,             // whole deployable; actual is ~6 MB incl. .br/.gz
};

function walkFiles(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walkFiles(full) : [full];
  });
}
const kb = (bytes) => Math.round(bytes / 1024);

function checkPayloadBudgets() {
  // No full-resolution original may ship. This is the check that would have
  // caught the original 5.9 MB dog.jpg / 7.7 MB diagram_plain.png.
  //
  // The two OG cover images (audit-01-search-visibility, C4) ship at dist/
  // ROOT — `${siteUrl}/og-image.jpg` — not under dist/images/**, so the walk
  // below is extended to include them (design spec §7 item 7). Tracked
  // separately too, immediately below, with the spec's exact acceptance
  // criteria (exist, ≤400 KB, no .webp sibling).
  const images = walkFiles(path.join(DIST, 'images')).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const ogImageFiles = ['og-image.jpg', 'og-photography.jpg']
    .map((f) => path.join(DIST, f))
    .filter(exists);
  const allImages = [...images, ...ogImageFiles];

  const oversized = allImages
    .map((f) => ({ f: path.relative(DIST, f), k: kb(fs.statSync(f).size) }))
    .filter((x) => x.k > BUDGETS.singleImageKB);
  record(
    `no shipped image exceeds ${BUDGETS.singleImageKB} KB`,
    oversized.length === 0,
    oversized.length ? `oversized: ${JSON.stringify(oversized)}` : `${allImages.length} images, largest ${Math.max(0, ...allImages.map((f) => kb(fs.statSync(f).size)))} KB`,
  );

  const imagesTotal = allImages.reduce((n, f) => n + fs.statSync(f).size, 0);
  record(
    `dist/images (+ root OG images) total under ${BUDGETS.allImagesKB} KB`,
    kb(imagesTotal) <= BUDGETS.allImagesKB,
    `${kb(imagesTotal)} KB across ${allImages.length} files`,
  );

  // C4's exact acceptance criteria, spec §7 item 6: both OG images exist, are
  // ≤400 KB (already covered above, restated here for a legible failure
  // message), and ship with NO .webp sibling — .htaccess would otherwise
  // serve WebP to link-preview crawlers/bots that only accept JPEG.
  const ogNames = ['og-image.jpg', 'og-photography.jpg'];
  const ogMissing = ogNames.filter((n) => !exists(path.join(DIST, n)));
  record(
    'dist/og-image.jpg and dist/og-photography.jpg both exist',
    ogMissing.length === 0,
    ogMissing.length ? `missing: ${ogMissing.join(', ')}` : ''
  );
  const ogOversized = ogNames
    .filter((n) => exists(path.join(DIST, n)))
    .map((n) => ({ n, k: kb(fs.statSync(path.join(DIST, n)).size) }))
    .filter((x) => x.k > 400);
  record(
    'OG images are each ≤ 400 KB',
    ogOversized.length === 0,
    ogOversized.length ? JSON.stringify(ogOversized) : ''
  );
  const ogWebpSiblings = ogNames.filter((n) => exists(path.join(DIST, n.replace(/\.jpg$/, '.webp'))));
  record(
    'OG images ship with NO .webp sibling (deliberate — link-preview crawlers get served the .jpg)',
    ogWebpSiblings.length === 0,
    ogWebpSiblings.length ? `unexpected sibling(s): ${ogWebpSiblings.join(', ')}` : ''
  );

  // Every .webp that ships must actually beat its .jpg sibling, otherwise the
  // .htaccess swap would serve the larger file to browsers that accept WebP.
  const losers = images
    .filter((f) => f.endsWith('.webp'))
    .map((w) => ({ w, j: w.replace(/\.webp$/, '.jpg') }))
    .filter(({ w, j }) => exists(j) && fs.statSync(w).size >= fs.statSync(j).size)
    .map(({ w }) => path.relative(DIST, w));
  record(
    'every shipped .webp is smaller than its .jpg sibling',
    losers.length === 0,
    losers.length ? `not smaller: ${JSON.stringify(losers)}` : 'all WebP variants win',
  );

  const videos = walkFiles(path.join(DIST, 'video')).filter((f) => /\.mp4$/i.test(f));
  const videoTotal = videos.reduce((n, f) => n + fs.statSync(f).size, 0);
  record(
    `dist/video total under ${BUDGETS.videoKB} KB`,
    kb(videoTotal) <= BUDGETS.videoKB,
    `${kb(videoTotal)} KB across ${videos.length} file(s)`,
  );

  // The poster is what the Films section paints before the video decodes.
  record(
    'video poster frame ships',
    exists(path.join(DIST, 'video', 'video-poster.jpg')),
    'dist/video/video-poster.jpg',
  );

  // Critical-path JS = only what index.html itself references. Anything reached
  // through a dynamic import is deliberately excluded.
  const html = read(path.join(DIST, 'index.html'));
  const criticalJs = [...new Set(html.match(/assets\/js\/[A-Za-z0-9._-]+\.js/g) || [])];
  const criticalBytes = criticalJs.reduce((n, rel) => n + (exists(path.join(DIST, rel)) ? fs.statSync(path.join(DIST, rel)).size : 0), 0);
  record(
    `critical-path JS under ${BUDGETS.criticalJsKB} KB`,
    kb(criticalBytes) <= BUDGETS.criticalJsKB,
    `${kb(criticalBytes)} KB across ${criticalJs.length} chunk(s): ${criticalJs.map((f) => path.basename(f)).join(', ')}`,
  );

  // three.js is ~880 kB and is only needed once a 3D scene mounts. If it ever
  // reappears in index.html, an eager import has undone the split.
  //
  // KNOWN WEAK GUARD (flagged by design spec §7 item 8 and confirmed by QA,
  // audit-01-search-visibility): this only checks the STRING "three"/"fiber"
  // literally inside index.html's own markup — Rollup's auto-named chunks
  // (index-aebb2d45.js etc.) never contain those substrings even when three.js
  // is bundled straight into them, so this check passes today despite three.js
  // actually being in the critical path. Kept for what it does catch (a raw
  // <script src="...three..."> reference); superseded by the direct chunk-byte
  // check immediately below for the real guarantee.
  const threeInHead = /three|fiber/i.test(html);
  record(
    'three.js is NOT referenced from index.html (stays out of the critical path) — WEAK, see next check',
    !threeInHead,
    threeInHead ? 'a static import is pulling three.js back into the entry graph' : 'deferred to dynamic import (but see the entry-chunk-bytes check below for the check that actually detects this)',
  );

  // The real guard: grep the entry chunk's own bytes for a string that only
  // exists inside three.js (WebGLRenderer). This is what actually catches
  // three.js landing in the critical path, regardless of Rollup's chunk
  // naming.
  //
  // KNOWN FAILING as of audit-01-search-visibility (lead-verified, not this
  // change's fault, deliberately NOT papered over): src/pages/Home.jsx:6 does
  // `import { BrainScene } from './Interact'` — a STATIC import. A previous
  // cycle made this dynamic (critical path was 428 KB); it was reverted to
  // static, most likely to work around a separate, still-open bug where the
  // hero animation disappears on scroll (tracked separately, out of scope
  // here). Home.jsx is eagerly imported by App.jsx, so Rollup cannot split
  // Interact/three/@react-three out of the entry chunk. Do not raise this
  // check's bar or delete it to force green — the fix is changing Home.jsx's
  // import back to dynamic (or resolving the underlying scroll bug so it can
  // stay dynamic), not the test.
  let webglHits = 0;
  let entryChunkBytes = 0;
  for (const rel of criticalJs) {
    const p = path.join(DIST, rel);
    if (!exists(p)) continue;
    webglHits += (fs.readFileSync(p, 'utf8').match(/WebGLRenderer/g) || []).length;
    entryChunkBytes += fs.statSync(p).size;
  }
  record(
    'three.js is NOT bundled into the entry chunk (WebGLRenderer string absent from chunk bytes)',
    webglHits === 0,
    webglHits > 0
      ? `KNOWN FAILING — ${webglHits} occurrence(s) of "WebGLRenderer" across ${criticalJs.length} entry chunk(s) totalling ${kb(entryChunkBytes)} KB (${criticalJs.map((f) => path.basename(f)).join(', ')}). Root cause: src/pages/Home.jsx:6 statically imports { BrainScene } from './Interact'. See test/run.mjs comment above.`
      : 'three.js confirmed absent from entry chunk bytes',
  );

  const distBytes = walkFiles(DIST).reduce((n, f) => n + fs.statSync(f).size, 0);
  record(
    `total dist/ under ${BUDGETS.distMB} MB`,
    distBytes / 1048576 <= BUDGETS.distMB,
    `${(distBytes / 1048576).toFixed(2)} MB`,
  );
}

// ---------------------------------------------------------------------------

async function main() {
  checkPayloadBudgets();
  await runBrowserChecks();

  const failed = results.filter((r) => r.pass === false);
  const skipped = results.filter((r) => r.pass === null);
  const passed = results.filter((r) => r.pass === true);

  console.log('\n=== AEO / agent-readiness test suite ===\n');
  for (const r of results) {
    const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : 'SKIP';
    console.log(`[${mark}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }

  console.log(
    `\n${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped, ${results.length} total.\n`
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main();
