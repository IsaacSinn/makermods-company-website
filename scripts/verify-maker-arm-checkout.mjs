import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('maker-arm-buy.html', 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];

function createPage(search = '') {
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
    dataset: {}, style: {}, listeners: {}, value: id === 'maker-arm-quantity' ? '1' : '',
    addEventListener(type, callback) { this.listeners[type] = callback; },
    setAttribute(name, value) { this[name] = value; },
    setCustomValidity(message) { this.validationMessage = message; },
    reportValidity() { this.reported = true; },
  }]));
  const tiers = ['diy', 'assembled'].map((tier) => ({
    dataset: { tier },
    addEventListener(type, callback) { this.click = callback; },
  }));
  const requests = [];
  const popups = [];
  const page = { elements, tiers, requests, popups };
  vm.runInNewContext(source, {
    URLSearchParams, console,
    document: { getElementById: (id) => elements.get(id), querySelectorAll: () => tiers },
    window: {
      location: { search },
      open() {
        const popup = { location: {}, closed: false, close() { this.closed = true; } };
        popups.push(popup);
        return popup;
      },
    },
    alert: (message) => assert.fail(message),
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return { json: async () => ({ data: { cartCreate:
        { cart: { checkoutUrl: 'https://checkout.example/test' }, userErrors: [] },
      } }) };
    },
  });
  page.quantity = (value) => {
    elements.get('maker-arm-quantity').value = value;
    elements.get('maker-arm-quantity').listeners.input();
  };
  page.checkout = () => elements.get('config-buy-cta').listeners.click({ preventDefault() {} });
  page.text = (id) => elements.get(id).textContent;
  return page;
}

for (const [build, variant, price] of [
  ['diy', '52875818205501', 999],
  ['assembled', '52875818238269', 1199],
]) {
  for (const quantity of [1, 2, 5]) {
    for (const leader of [false, true]) {
      const page = createPage(`?build=${build}`);
      page.quantity(String(quantity));
      if (leader) page.elements.get('leader-toggle').listeners.click();
      const total = `$${(quantity * price + (leader ? 199 : 0)).toLocaleString('en-US')}`;
      for (const id of ['cart-total', 'cta-price', 'summary-price']) assert.equal(page.text(id), total);
      assert.equal(page.text('cart-build-price'), `$${(quantity * price).toLocaleString('en-US')}`);
      assert.equal(page.text('cart-arm-count'), `${quantity} Maker Arm${quantity === 1 ? '' : 's'}`);
      await page.checkout();
      const lines = [{ merchandiseId: `gid://shopify/ProductVariant/${variant}`, quantity }];
      if (leader) lines.push({ merchandiseId: 'gid://shopify/ProductVariant/52875826594109', quantity: 1 });
      assert.deepEqual(page.requests[0].variables.input.lines, lines);
      assert.equal(page.popups[0].location.href, 'https://checkout.example/test');
    }
  }
}

const page = createPage();
page.quantity('2');
page.tiers[1].click();
assert.equal(page.text('cart-total'), '$2,398', 'Changing builds must preserve quantity');
page.elements.get('leader-toggle').listeners.click();
assert.equal(page.text('cart-total'), '$2,597');
page.elements.get('leader-toggle').listeners.click();
assert.equal(page.text('cart-total'), '$2,398');
for (const invalid of ['', '0', '-1', '1.5', 'abc', 'Infinity', '9007199254740992']) {
  page.quantity(invalid);
  await page.checkout();
  assert.ok(page.elements.get('maker-arm-quantity').validationMessage);
  assert.equal(page.requests.length, 0, `Invalid quantity ${invalid} must not reach Shopify`);
  assert.equal(page.popups.length, 0);
}
page.quantity('3');
assert.equal(page.elements.get('maker-arm-quantity').validationMessage, '');
await page.checkout();
assert.equal(page.requests[0].variables.input.lines[0].quantity, 3);
assert.equal(createPage('?build=unknown').text('cart-total'), '$999');
console.log('Maker Arm checkout verification passed: quantities, both builds, leader add-on, totals, and invalid input.');
