import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sharedCss = fs.readFileSync(path.join(root, 'styles/page.css'), 'utf8');
const appCss = fs.readFileSync(path.join(root, 'makermods-app/styles.css'), 'utf8');
const expected = new Map([
  ['buy.html', 'so101.html'],
  ['elrobot.html', 'so101.html'],
  ['index.html', 'so101.html'],
  ['makermods-app/index.html', '../so101.html'],
  ['metal-arm-buy.html', 'so101.html'],
  ['metal-arm.html', 'so101.html'],
  ['open-booth-buy.html', 'so101.html'],
  ['openbooth/index.html', '/so101'],
  ['so101-buy.html', 'so101.html'],
  ['so101.html', 'so101.html'],
  ['xlerobot.html', 'so101.html'],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [filePath, expectedHref] of expected) {
  const html = fs.readFileSync(path.join(root, filePath), 'utf8');
  const nav = html.match(/<nav class="nav">[\s\S]*?<\/nav>/)?.[0];
  const navLinks = nav?.match(/<div class="nav-links">[\s\S]*?<\/div>/)?.[0];
  assert(navLinks, `${filePath} is missing its primary nav-links block`);

  const so101Links = [...navLinks.matchAll(/<a\b([^>]*)>SO-101<\/a>/g)];
  assert(so101Links.length === 1, `${filePath} should contain exactly one SO-101 navbar link`);

  const attributes = so101Links[0][1];
  assert(attributes.includes(`href="${expectedHref}"`), `${filePath} should link SO-101 to ${expectedHref}`);
  if (filePath === 'so101.html') {
    assert(attributes.includes('aria-current="page"'), 'so101.html should mark SO-101 as the current page');
  } else {
    assert(!attributes.includes('aria-current='), `${filePath} should not mark SO-101 as the current page`);
  }
}

assert(
  /@media \(min-width: 961px\) and \(max-width: 1199px\)[\s\S]*?\.nav-links\s*\{\s*gap:\s*var\(--s-3\)/.test(sharedCss),
  'Shared navigation should use compact spacing at intermediate desktop widths',
);
assert(
  /@media \(min-width: 981px\) and \(max-width: 1199px\)[\s\S]*?\.nav-links\s*\{\s*gap:\s*var\(--s-2\)/.test(appCss),
  'MakerMods App navigation should use compact spacing at intermediate desktop widths',
);

console.log(`SO-101 navigation verification passed for ${expected.size} navbars.`);
