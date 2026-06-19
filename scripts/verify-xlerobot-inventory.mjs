import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

const buyPage = read('buy.html');
const mainScript = read('scripts/main.js');

const variants = {
  blackRobotOnly: {
    id: '51817674047805',
    availabilityKey: "black:robot-only",
    maxQuantity: 1,
  },
  whiteRobotOnly: {
    id: '51036164555069',
    availabilityKey: "white:robot-only",
    maxQuantity: 0,
  },
  whiteJetson: {
    id: '51314503123261',
    availabilityKey: "white:jetson",
    maxQuantity: 0,
  },
};

assert(buyPage.includes(`data-variant-black="${variants.blackRobotOnly.id}"`), 'Black Robot Only variant ID must stay wired in buy.html');
assert(buyPage.includes(`data-variant-white="${variants.whiteRobotOnly.id}"`), 'White Robot Only variant ID must stay present but gated');
assert(buyPage.includes(`data-variant-white="${variants.whiteJetson.id}"`), 'White Jetson variant ID must stay present but gated');
assert(buyPage.includes('1 black robot-only unit in stock'), 'Buy page must show only 1 buyable black robot-only unit');
assert(buyPage.includes('White is sold out.'), 'Buy page must label white XLeRobot as sold out');
assert(buyPage.includes('Robot + Jetson Nano Pack is sold out.'), 'Buy page must label the Jetson build as sold out');

for (const variant of Object.values(variants)) {
  assert(mainScript.includes(variant.id), `main.js must know variant ${variant.id}`);
  assert(mainScript.includes(variant.availabilityKey), `main.js must define availability for ${variant.availabilityKey}`);
  assert(mainScript.includes(`available: ${variant.maxQuantity}`), `main.js must set ${variant.availabilityKey} availability to ${variant.maxQuantity}`);
}

assert(mainScript.includes('selectedVariant()'), 'Checkout flow must resolve selected variant metadata before cart creation');
assert(mainScript.includes('isVariantBuyable'), 'Checkout flow must check selected variant availability');
assert(mainScript.includes('Math.min(requestedQuantity, variant.available)'), 'Checkout quantity must be capped by available inventory');
assert(mainScript.includes('variant.available < 1'), 'Sold-out variants must be blocked before Shopify cart creation');

console.log('XLeRobot inventory verification passed.');
