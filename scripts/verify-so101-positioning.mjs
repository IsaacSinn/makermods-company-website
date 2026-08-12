import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withoutAllowedHuggingFaceUrls(page) {
  return page.replace(/https:\/\/huggingface\.co\/docs\/lerobot\/[^"'<>\s]*/gi, '');
}

const productPage = read('so101.html');
const buyPage = read('so101-buy.html');
const siteNav = read('scripts/site-nav.js');

for (const [name, page] of [
  ['SO-101 product page', productPage],
  ['SO-101 buy page', buyPage],
]) {
  assert(page.includes('MakerMods Lab'), `${name} must position MakerMods Lab as the operating software`);
  assert(!/\blerobot\b/i.test(withoutAllowedHuggingFaceUrls(page)), `${name} must not contain visible LeRobot positioning`);
  assert(page.includes('<maker-nav'), `${name} must use the universal navigation component`);
}

assert(siteNav.includes("label: 'MakerMods Lab'"), 'Universal navigation must use the MakerMods Lab label');

const sourceIndex = productPage.indexOf('id="open-source"');
const specsIndex = productPage.indexOf('id="specs"');
const labIndex = productPage.indexOf('id="makermods-lab"');
const openBoothIndex = productPage.indexOf('id="openbooth"');
assert(labIndex !== -1 && openBoothIndex !== -1 && labIndex < openBoothIndex, 'MakerMods Lab must appear before OpenBooth');
assert(productPage.includes('[ OPEN SOURCE <span class="b">·</span> 03 · MAKERMODS LAB ]'), 'MakerMods Lab must be section 03');
assert(productPage.includes('[ ADD OPENBOOTH <span class="b">·</span> 04 ]'), 'OpenBooth must be section 04');
assert(sourceIndex !== -1 && specsIndex !== -1 && sourceIndex < specsIndex, 'Read the Source must appear before Hardware');
assert(productPage.includes('[ READ THE SOURCE <span class="b">·</span> 05 ]'), 'Read the Source must be section 05');
assert(productPage.includes('[ HARDWARE <span class="b">·</span> 06 ]'), 'Hardware must be section 06');
assert(productPage.includes('[ FAQ <span class="b">·</span> 07 ]'), 'FAQ must be section 07');

for (const page of [productPage, buyPage]) {
  assert(page.includes('https://huggingface.co/docs/lerobot/so101'), 'SO-101 pages must retain the official Hugging Face setup guide');
  assert(page.includes('https://github.com/TheRobotStudio/SO-ARM100'), 'SO-101 pages must retain the hardware source repository');
}

console.log('SO-101 MakerMods Lab positioning verification passed.');
