/**
 * Media optimization — media-src/ (originals, never shipped) -> public/ (what deploys).
 *
 * Originals stay untouched in media-src/ so this is always re-runnable and never
 * degrades an image by recompressing its own output. Every file public/ needs is
 * generated here; nothing in public/images or public/video is hand-maintained.
 *
 * For each image we emit an optimized .jpg (the path the components already
 * reference, and the fallback for browsers without WebP) plus a .webp sibling.
 * public/.htaccess swaps in the .webp automatically when the browser advertises
 * support, which is why no component markup had to change.
 *
 *   node scripts/optimize-media.mjs [--force]
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

// @ffmpeg-installer ships CommonJS only, so it needs require() in this ESM file.
const require = createRequire(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'media-src');
const OUT = path.join(root, 'public');
const force = process.argv.includes('--force');

/**
 * maxEdge is the longest-edge cap in CSS pixels, sized for a 2x display of the
 * largest box each image is ever shown in:
 *   photos   — grid thumbnail, but click-to-expand shows them near full width
 *   previews — a 140px-tall panel in the Interact scene, so they were ~5x oversized
 *   profile  — a single fixed portrait slot
 */
const IMAGE_JOBS = [
  { dir: 'images', maxEdge: 1600, quality: 80, files: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg', 'photo6.jpg'] },
  { dir: 'images', maxEdge: 1200, quality: 82, files: ['profile.jpg'] },
  { dir: 'images/previews', maxEdge: 700, quality: 78, files: null },
];

/**
 * Open Graph cards. These are composites, not resizes, so they do not fit the
 * IMAGE_JOBS shape: a black canvas, an SVG type layer rasterised by sharp, and (for
 * the photography card) a photograph feathered in on the right.
 *
 * They land at public/ root, not public/images, because that is where SEO.jsx points
 * and where a link-preview crawler will ask for them.
 *
 * No .webp sibling is emitted, deliberately. public/.htaccess swaps a .jpg for a
 * .webp whenever the request advertises image/webp and the file exists; some
 * link-preview crawlers send that header and then reject the WebP payload, which
 * would put us right back at "every shared link renders as a grey box".
 */
const COMPOSITE_JOBS = [
  {
    out: 'og-image.jpg',
    sources: ['og/og-image.svg'],
    extraSources: [path.join(OUT, 'logo.png')],
    layers: async () => [
      { input: await sharp(path.join(OUT, 'logo.png')).resize(96, 96, { fit: 'inside' }).png().toBuffer(), left: 80, top: 64 },
      { input: path.join(SRC, 'og/og-image.svg') },
    ],
  },
  {
    out: 'og-photography.jpg',
    sources: ['og/og-photography.svg', 'images/photo3.jpg'],
    extraSources: [],
    // Every frame in this portfolio is portrait-orientation, so a cover crop of the
    // whole 1.9:1 canvas decapitates the subject. The photo is composited as a
    // 420px column flush right instead, feathered into the black canvas so its edge
    // does not read as a pasted rectangle.
    layers: async () => [
      {
        input: await sharp(path.join(SRC, 'images/photo3.jpg'))
          .rotate()
          .resize({ width: 420, height: 630, fit: 'cover' })
          .toBuffer(),
        left: 780,
        top: 0,
      },
      {
        input: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="630">' +
            '<defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0">' +
            '<stop offset="0" stop-color="#000000" stop-opacity="1"/>' +
            '<stop offset="1" stop-color="#000000" stop-opacity="0"/>' +
            '</linearGradient></defs>' +
            '<rect width="60" height="630" fill="url(#f)"/></svg>',
        ),
        left: 780,
        top: 0,
      },
      { input: path.join(SRC, 'og/og-photography.svg') },
    ],
  },
];

// A composite that silently lost its type layer still writes a valid JPEG, so the
// only cheap automatic check is that the output is not suspiciously small.
const MIN_COMPOSITE_BYTES = 25 * 1024;

const VIDEO_JOBS = [
  // 1280x720 is the largest this is ever painted at; it autoplays muted as a
  // background layer, so bitrate matters far more than resolution here.
  { file: 'video.mp4', maxHeight: 720, crf: 28 },
];

const bytes = (n) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(2)} MB`);
const size = (p) => (fs.existsSync(p) ? fs.statSync(p).size : 0);

/** Skip work when the output is already newer than its source. */
const isFresh = (srcPath, ...outPaths) =>
  !force &&
  outPaths.every((o) => fs.existsSync(o)) &&
  outPaths.every((o) => fs.statSync(o).mtimeMs >= fs.statSync(srcPath).mtimeMs);

const totals = { srcBytes: 0, outBytes: 0, written: 0, skipped: 0 };

async function buildComposites() {
  for (const job of COMPOSITE_JOBS) {
    const srcPaths = [...job.sources.map((f) => path.join(SRC, f)), ...job.extraSources];
    const missing = srcPaths.filter((f) => !fs.existsSync(f));
    if (missing.length) {
      console.error(`  ! missing source for ${job.out}: ${missing.map((f) => path.relative(root, f)).join(', ')}`);
      process.exit(1);
    }

    const outPath = path.join(OUT, job.out);
    // Keyed on every source, so a copy edit to the SVG or a new photograph both
    // invalidate the output.
    const newestSrc = srcPaths.reduce((a, b) => (fs.statSync(a).mtimeMs >= fs.statSync(b).mtimeMs ? a : b));
    const srcBytes = srcPaths.reduce((n, f) => n + size(f), 0);
    totals.srcBytes += srcBytes;

    if (isFresh(newestSrc, outPath)) {
      totals.outBytes += size(outPath);
      totals.skipped += 1;
      continue;
    }

    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
      .composite(await job.layers())
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(outPath);

    const outBytes = size(outPath);
    if (outBytes < MIN_COMPOSITE_BYTES) {
      // Almost always a font that did not resolve, which produces a nearly empty
      // card without throwing. Fail the build rather than ship a blank OG image.
      console.error(`  ! ${job.out} came out at ${bytes(outBytes)} (< ${bytes(MIN_COMPOSITE_BYTES)}) — layers probably failed to render`);
      process.exit(1);
    }

    totals.outBytes += outBytes;
    totals.written += 1;
    console.log(`  ${job.out.padEnd(30)} ${bytes(srcBytes).padStart(9)} -> ${bytes(outBytes).padStart(9)} jpg  (1200x630, no webp sibling)`);
  }
}

async function optimizeImages() {
  for (const job of IMAGE_JOBS) {
    const srcDir = path.join(SRC, job.dir);
    if (!fs.existsSync(srcDir)) continue;

    const outDir = path.join(OUT, job.dir);
    fs.mkdirSync(outDir, { recursive: true });

    const files = job.files ?? fs.readdirSync(srcDir).filter((f) => /\.(jpe?g|png)$/i.test(f));

    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      if (!fs.existsSync(srcPath)) {
        console.warn(`  ! missing source, skipped: ${path.relative(root, srcPath)}`);
        continue;
      }

      const base = file.replace(/\.(jpe?g|png)$/i, '');
      const jpgOut = path.join(outDir, `${base}.jpg`);
      const webpOut = path.join(outDir, `${base}.webp`);
      const srcBytes = size(srcPath);
      totals.srcBytes += srcBytes;

      // Only the .jpg is checked: the .webp is deliberately absent whenever it
      // came out larger, so requiring it here would rebuild every run.
      if (isFresh(srcPath, jpgOut)) {
        totals.outBytes += size(jpgOut);
        totals.skipped += 1;
        continue;
      }

      // withoutEnlargement keeps a source that is already small from being
      // upscaled into a bigger file than it started as.
      const pipeline = sharp(srcPath)
        .rotate() // bake in EXIF orientation before the metadata is stripped
        .resize({ width: job.maxEdge, height: job.maxEdge, fit: 'inside', withoutEnlargement: true });

      await pipeline
        .clone()
        .jpeg({ quality: job.quality, mozjpeg: true, progressive: true })
        .toFile(jpgOut);

      await pipeline.clone().webp({ quality: job.quality }).toFile(webpOut);

      // WebP does not always beat mozjpeg — on noisy photographic detail it can
      // come out larger. Drop it when it loses so the .htaccess swap is only ever
      // an improvement, and so we don't ship a file nothing should request.
      const webpWins = size(webpOut) < size(jpgOut);
      if (!webpWins) fs.unlinkSync(webpOut);

      totals.outBytes += size(jpgOut);
      totals.written += 1;
      console.log(
        `  ${path.join(job.dir, file).padEnd(30)} ${bytes(srcBytes).padStart(9)} -> ` +
          `${bytes(size(jpgOut)).padStart(9)} jpg  ` +
          (webpWins ? `${bytes(size(webpOut)).padStart(9)} webp` : '     (webp larger, dropped)'),
      );
    }
  }
}

function optimizeVideos() {
  const srcDir = path.join(SRC, 'video');
  if (!fs.existsSync(srcDir)) return;

  let ffmpeg;
  try {
    ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
  } catch {
    ffmpeg = null;
  }

  const outDir = path.join(OUT, 'video');
  fs.mkdirSync(outDir, { recursive: true });

  for (const job of VIDEO_JOBS) {
    const srcPath = path.join(srcDir, job.file);
    if (!fs.existsSync(srcPath)) continue;

    const base = job.file.replace(/\.mp4$/i, '');
    const mp4Out = path.join(outDir, `${base}.mp4`);
    const posterOut = path.join(outDir, `${base}-poster.jpg`);
    const srcBytes = size(srcPath);
    totals.srcBytes += srcBytes;

    if (isFresh(srcPath, mp4Out, posterOut)) {
      totals.outBytes += size(mp4Out);
      totals.skipped += 1;
      continue;
    }

    if (!ffmpeg) {
      // Shipping the original beats shipping nothing; the video element still works.
      console.warn('  ! ffmpeg unavailable — copying video through unoptimized');
      fs.copyFileSync(srcPath, mp4Out);
      totals.outBytes += size(mp4Out);
      continue;
    }

    execFileSync(ffmpeg, [
      '-y', '-loglevel', 'error',
      '-i', srcPath,
      // -2 keeps width even, which H.264 requires.
      '-vf', `scale=-2:'min(${job.maxHeight},ih)'`,
      '-c:v', 'libx264', '-crf', String(job.crf), '-preset', 'slow', '-profile:v', 'main',
      // faststart relocates the moov atom to the front so playback can begin
      // before the whole file has arrived.
      '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
      // The element is muted and decorative; the audio track is dead weight.
      '-an',
      mp4Out,
    ]);

    // Poster frame: without one the element paints a black box until the first
    // frame decodes, and it gives preload="metadata" something to show.
    execFileSync(ffmpeg, [
      '-y', '-loglevel', 'error',
      '-i', mp4Out, '-frames:v', '1', '-q:v', '4',
      posterOut,
    ]);

    totals.outBytes += size(mp4Out);
    totals.written += 1;
    console.log(
      `  ${path.join('video', job.file).padEnd(30)} ${bytes(srcBytes).padStart(9)} -> ` +
        `${bytes(size(mp4Out)).padStart(9)} mp4  ${bytes(size(posterOut)).padStart(9)} poster`,
    );
  }
}

console.log('Optimizing media (media-src/ -> public/)…\n');
await optimizeImages();
await buildComposites();
optimizeVideos();

console.log(
  `\nSource ${bytes(totals.srcBytes)} -> shipped ${bytes(totals.outBytes)} ` +
    `(${(100 - (totals.outBytes / totals.srcBytes) * 100).toFixed(1)}% smaller)  ` +
    `${totals.written} written, ${totals.skipped} already current`,
);
