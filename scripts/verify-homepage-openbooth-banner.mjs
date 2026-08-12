import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const photoPath = path.join(root, 'assets/open-booth/openbooth-wide.png');
const photoTag = page.match(/<img\b[^>]*class="ob-home-photo-image"[^>]*>/)?.[0];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(page.includes('class="ob-home-media"'), 'Homepage is missing the OpenBooth photo layout');
assert(page.includes('class="ob-home-photo ob-home-photo--booth"'), 'Homepage is missing the notched OpenBooth photo card');
assert(photoTag, 'Homepage is missing the OpenBooth photo');
assert(photoTag.includes('src="assets/open-booth/openbooth-wide.png"'), 'Homepage is not using the previous OpenBooth photo');
assert(photoTag.includes('loading="lazy"'), 'OpenBooth photo should load lazily');
assert(photoTag.includes('decoding="async"'), 'OpenBooth photo should decode asynchronously');
assert(page.includes('class="ob-home-photo-tag">[ OPENBOOTH ]</div>'), 'Homepage is missing the OpenBooth photo label');
assert(!page.includes('class="ob-home-banner-video"'), 'Homepage should not render the newer OpenBooth video banner');
assert(/\.ob-home-photo--booth\s*\{[^}]*aspect-ratio:\s*16 \/ 10/s.test(page), 'Desktop OpenBooth photo should use its previous 16:10 ratio');
assert(/@media \(max-width: 600px\)[\s\S]*?\.ob-home-photo--booth\s*\{[^}]*aspect-ratio:\s*4 \/ 3/s.test(page), 'Mobile OpenBooth photo should use its previous 4:3 ratio');
assert(fs.existsSync(photoPath), 'Missing previous OpenBooth homepage photo');

console.log('Homepage OpenBooth photo verification passed.');
