import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class FakeElement {
  constructor(dataset = {}) {
    this.dataset = { ...dataset };
    this.hidden = false;
    this.textContent = '';
    this.innerHTML = '';
    this.attributes = new Map();
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  click() {
    this.listeners.get('click')?.();
  }
}

const tierIds = ['pair', 'bimanual', 'boothPair', 'boothBimanual'];
const optionNodes = tierIds.map((id) => new FakeElement({ tier: id }));
const options = new FakeElement();
options.querySelectorAll = (selector) => selector === '.opt' ? optionNodes : [];

const label = new FakeElement();
const price = new FakeElement();
const count = new FakeElement();
const parts = new FakeElement();
const control = new FakeElement();
const tag = new FakeElement();
const cta = new FakeElement();
const image = new FakeElement();
image.hidden = true;
const placeholder = new FakeElement();
const visual = new FakeElement();

const singleNodes = new Map([
  ['[data-so-buy-options]', options],
  ['[data-so-buy-cta]', cta],
  ['[data-so-buy-image]', image],
  ['[data-so-buy-placeholder]', placeholder],
  ['[data-so-buy-visual]', visual],
]);

const multipleNodes = new Map([
  ['.faq-item', []],
  ['[data-so-buy-label]', [label]],
  ['[data-so-buy-price]', [price]],
  ['[data-so-buy-count]', [count]],
  ['[data-so-buy-parts]', [parts]],
  ['[data-so-buy-control]', [control]],
  ['[data-so-buy-tag]', [tag]],
]);

const document = {
  getElementById: () => null,
  querySelector: (selector) => singleNodes.get(selector) ?? null,
  querySelectorAll: (selector) => multipleNodes.get(selector) ?? [],
};

const source = await readFile(new URL('./so101.js', import.meta.url), 'utf8');
vm.runInNewContext(source, { document, window: {} }, { filename: 'scripts/so101.js' });

const selectTier = (id) => {
  const option = optionNodes.find((node) => node.dataset.tier === id);
  assert.ok(option, `Expected ${id} option to exist in the harness`);
  option.click();
};

selectTier('bimanual');
assert.equal(image.hidden, false, 'Bimanual selection should reveal the SO-101 product photograph');
assert.equal(placeholder.hidden, true, 'Bimanual selection should hide the technical placeholder');
assert.equal(visual.dataset.hasProductImage, 'true', 'Bimanual selection should mark the gallery as photographic');

for (const id of ['pair', 'boothPair', 'boothBimanual']) {
  selectTier(id);
  assert.equal(image.hidden, true, `${id} selection should hide the bimanual product photograph`);
  assert.equal(placeholder.hidden, false, `${id} selection should reveal the technical placeholder`);
  assert.equal(visual.dataset.hasProductImage, 'false', `${id} selection should mark the gallery as technical`);
}

console.log('SO-101 product image behavior verified.');
