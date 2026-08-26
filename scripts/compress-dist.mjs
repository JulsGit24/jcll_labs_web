/**
 * Pre-compress the build output for Apache's mod_deflate/mod_brotli to serve
 * directly (see the AddEncoding/RewriteRule block in public/.htaccess).
 *
 * Compressing at build time rather than per-request means Hostinger's shared CPU
 * does no work, and we can afford maximum compression levels that would be far too
 * slow to run on the fly. Uses only node:zlib — no dependency.
 *
 *   node scripts/compress-dist.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');

// Text formats only. Re-compressing jpg/webp/mp4 wastes space and CPU for ~0 gain.
const COMPRESSIBLE = /\.(html?|css|js|mjs|json|svg|xml|txt|md|map|webmanifest)$/i;

// Below roughly one TCP segment the encoding overhead can exceed the saving, and
// the extra request bookkeeping is not worth it.
const MIN_BYTES = 1024;

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run the build first.');
  process.exit(1);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

let originalTotal = 0;
let gzipTotal = 0;
let brotliTotal = 0;
let count = 0;

for (const file of walk(DIST)) {
  // Skip artifacts of a previous run so we never compress a .gz into a .gz.gz.
  if (/\.(gz|br)$/i.test(file)) continue;
  if (!COMPRESSIBLE.test(file)) continue;

  const source = fs.readFileSync(file);
  if (source.length < MIN_BYTES) continue;

  const gz = zlib.gzipSync(source, { level: zlib.constants.Z_BEST_COMPRESSION });
  const br = zlib.brotliCompressSync(source, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length,
    },
  });

  // Only keep an encoding that actually beats the original, so the .htaccess
  // rewrite (which requires the file to exist) never serves a larger response.
  if (gz.length < source.length) fs.writeFileSync(`${file}.gz`, gz);
  if (br.length < source.length) fs.writeFileSync(`${file}.br`, br);

  originalTotal += source.length;
  gzipTotal += Math.min(gz.length, source.length);
  brotliTotal += Math.min(br.length, source.length);
  count += 1;
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const pct = (n) => `${(100 - (n / originalTotal) * 100).toFixed(1)}% smaller`;

if (count === 0) {
  console.log('Pre-compression: nothing above the size threshold.');
} else {
  console.log(
    `Pre-compressed ${count} files: ${kb(originalTotal)} raw -> ` +
      `${kb(gzipTotal)} gzip (${pct(gzipTotal)}), ${kb(brotliTotal)} brotli (${pct(brotliTotal)})`,
  );
}
