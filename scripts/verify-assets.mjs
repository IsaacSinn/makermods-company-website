import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceFiles = [
  'index.html',
  'xlerobot.html',
  'buy.html',
  'metal-arm.html',
  'metal-arm-buy.html',
  'openbooth/index.html',
  'open-booth-buy.html',
  'makermods-app/index.html',
  'styles/page.css',
  'styles/open-booth.css',
  'scripts/main.js',
  'scripts/open-booth.js',
];

const ignoredSourceMedia = [
  /\.MOV$/i,
  /(^|\/)MVI_8967\.MP4$/i,
  /(^|\/)xlerobot\.gif$/i,
];

const preloadAutoAllowlist = new Set([
  'buy.html::assets/xlerobot.mp4',
  'openbooth/index.html::/assets/open-booth/hero.mp4',
  'xlerobot.html::assets/xlerobot.mp4',
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

function existsLocalRef(filePath) {
  return exists(filePath) || exists(`${filePath}.html`);
}

function isExternalRef(ref) {
  return /^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(ref);
}

function stripRef(ref) {
  return ref.split('#')[0].split('?')[0];
}

function resolveLocalRef(filePath, ref) {
  if (ref.startsWith('/')) {
    return path.normalize(ref.slice(1));
  }
  return path.normalize(path.join(path.dirname(filePath), stripRef(ref)));
}

for (const filePath of sourceFiles) {
  assert(exists(filePath), `Missing source file: ${filePath}`);
}

const xlerobotPage = read('xlerobot.html');
assert(xlerobotPage.includes('class="twitter-tweet"'), 'XLeRobot page must keep tweet blockquotes for rich previews');
assert(xlerobotPage.includes('https://platform.twitter.com/widgets.js'), 'XLeRobot page must load the X/Twitter widget script for tweet previews');
assert(xlerobotPage.includes('data-twitter-widgets-src'), 'XLeRobot page must lazy-load tweet previews instead of blocking initial render');

const localRefs = [];
const refPattern = /(?:src|href|poster)=["']([^"']+)["']|url\(["']?([^)"']+)["']?\)/g;
for (const filePath of sourceFiles) {
  const text = read(filePath);
  let match;
  while ((match = refPattern.exec(text))) {
    const ref = match[1] || match[2];
    if (!ref || ref.includes('${') || isExternalRef(ref)) continue;
    localRefs.push({ filePath, ref, resolved: resolveLocalRef(filePath, ref) });
  }
}

for (const { filePath, ref, resolved } of localRefs) {
  assert(existsLocalRef(resolved), `${filePath} references missing local asset: ${ref} -> ${resolved}`);
  assert(
    !ignoredSourceMedia.some((pattern) => pattern.test(ref) || pattern.test(resolved)),
    `${filePath} references ignored source media: ${ref}`,
  );
}

const videoPattern = /<video\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g;
for (const filePath of sourceFiles.filter((file) => file.endsWith('.html'))) {
  const text = read(filePath);
  let match;
  while ((match = videoPattern.exec(text))) {
    const tag = match[0];
    const src = match[1];
    assert(tag.includes('poster='), `${filePath} video is missing a poster: ${src}`);
    if (tag.includes('preload="auto"') || tag.includes("preload='auto'")) {
      assert(preloadAutoAllowlist.has(`${filePath}::${src}`), `${filePath} should not eagerly preload non-critical video: ${src}`);
    }
  }
}

const catalog = JSON.parse(read('assets/open-booth/catalog.json'));
assert(Array.isArray(catalog.datasets), 'OpenBooth catalog must contain a datasets array');
for (const dataset of catalog.datasets) {
  assert(exists(dataset.thumbnail_path), `Missing OpenBooth thumbnail: ${dataset.thumbnail_path}`);
  assert(exists(dataset.contact_sheet_path), `Missing OpenBooth contact sheet: ${dataset.contact_sheet_path}`);
  assert(
    !ignoredSourceMedia.some((pattern) => pattern.test(dataset.thumbnail_path) || pattern.test(dataset.contact_sheet_path)),
    `OpenBooth catalog references ignored source media for ${dataset.repo}`,
  );
}

const ignoredTracked = execFileSync('git', ['ls-files', '-ci', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
for (const filePath of ignoredTracked) {
  assert(
    !ignoredSourceMedia.some((pattern) => pattern.test(filePath)),
    `Ignored source media is tracked by git: ${filePath}`,
  );
}

console.log(`Asset verification passed for ${localRefs.length} local refs and ${catalog.datasets.length} OpenBooth datasets.`);
