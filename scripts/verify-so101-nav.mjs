import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sharedCss = fs.readFileSync(path.join(root, 'styles/page.css'), 'utf8');
const appCss = fs.readFileSync(path.join(root, 'makermods-app/styles.css'), 'utf8');
const pages = [
  'buy.html',
  'elrobot.html',
  'index.html',
  'makermods-app/index.html',
  'metal-arm-buy.html',
  'metal-arm.html',
  'open-booth-buy.html',
  'openbooth/index.html',
  'so101-buy.html',
  'so101.html',
  'xlerobot.html',
];
const expectedLinks = [
  ['Metal Arm', '/metal-arm'],
  ['OpenBooth', '/openbooth'],
  ['MakerMods Lab', '/makermods-app/'],
  ['SO-101', '/so101'],
  ['XLeRobot', '/xlerobot'],
  ['ElRobot', '/elrobot'],
  ['Docs', 'https://github.com/makermods-robotics'],
  ['Community', 'https://discord.gg/HpXj3ynhhF'],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const filePath of pages) {
  const html = fs.readFileSync(path.join(root, filePath), 'utf8');
  const nav = html.match(/<nav class="nav">[\s\S]*?<\/nav>/)?.[0];
  const navLinks = nav?.match(/<div class="nav-links">[\s\S]*?<\/div>/)?.[0];
  assert(navLinks, `${filePath} is missing its primary nav-links block`);

  const links = [...navLinks.matchAll(/<a\b([^>]*)>([^<]+)<\/a>/g)];
  assert(links.length === expectedLinks.length, `${filePath} should contain all ${expectedLinks.length} navbar links`);
  for (let index = 0; index < expectedLinks.length; index += 1) {
    const [expectedLabel, expectedHref] = expectedLinks[index];
    const [, attributes, label] = links[index];
    assert(label === expectedLabel, `${filePath} navbar item ${index + 1} should be ${expectedLabel}`);
    assert(attributes.includes(`href="${expectedHref}"`), `${filePath} should link ${expectedLabel} to ${expectedHref}`);
  }

  assert(!/nav-cart|cart\s*·\s*0/i.test(nav), `${filePath} navbar should not contain cart text`);
}

assert(
  /@media \(min-width: 981px\) and \(max-width: 1199px\)[\s\S]*?\.nav-links\s*\{\s*gap:\s*var\(--s-3\)/.test(sharedCss),
  'Shared navigation should use compact spacing at intermediate desktop widths',
);
assert(
  /@media \(min-width: 981px\) and \(max-width: 1199px\)[\s\S]*?\.nav-links\s*\{\s*gap:\s*var\(--s-3\)/.test(appCss),
  'MakerMods Lab navigation should use compact spacing at intermediate desktop widths',
);
for (const [name, css] of [['shared', sharedCss], ['MakerMods Lab', appCss]]) {
  assert(/\.nav-actions\s*\{[^}]*width:\s*138px/.test(css), `${name} navigation should reserve a fixed action slot`);
  assert(/\.nav-buy\s*\{[^}]*width:\s*138px/.test(css), `${name} navigation CTA should use the shared width`);
  assert(/\.nav-buy\s*\{[^}]*font-family:\s*var\(--font-mono\)/.test(css), `${name} navigation CTA should use the shared font`);
}

console.log(`Navigation verification passed for ${pages.length} navbars.`);
