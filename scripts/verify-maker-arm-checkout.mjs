import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('maker-arm-buy.html', 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];

function createPage(search = '') {
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
    dataset: {}, style: {}, listeners: {}, value: id === 'maker-arm-quantity' ? '1' : id === 'leader-arm-quantity' ? '0' : '',
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
  page.quantity = (value, kind = 'maker-arm') => {
    elements.get(`${kind}-quantity`).value = value;
    elements.get(`${kind}-quantity`).listeners.input();
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
    for (const leader of [0, 1, 2, 4]) {
      const page = createPage(`?build=${build}`);
      page.quantity(String(quantity));
      page.quantity(String(leader), 'leader-arm');
      const total = `$${(quantity * price + leader * 199).toLocaleString('en-US')}`;
      for (const id of ['cart-total', 'cta-price', 'summary-price']) assert.equal(page.text(id), total);
      assert.equal(page.text('cart-build-price'), `$${(quantity * price).toLocaleString('en-US')}`);
      assert.equal(page.text('cart-arm-count'), `${quantity} Maker Arm${quantity === 1 ? '' : 's'}`);
      assert.equal(page.elements.get('cart-leader-line').hidden, leader === 0);
      assert.equal(page.text('cart-leader-price'), `$${(leader * 199).toLocaleString('en-US')}`);
      assert.equal(page.text('cart-leader-name'), `Star Arm 102-HD (Leader) × ${leader}`);
      await page.checkout();
      const lines = [{ merchandiseId: `gid://shopify/ProductVariant/${variant}`, quantity }];
      if (leader) lines.push({ merchandiseId: 'gid://shopify/ProductVariant/52875826594109', quantity: leader });
      assert.deepEqual(page.requests[0].variables.input.lines, lines);
      assert.equal(page.popups[0].location.href, 'https://checkout.example/test');
    }
  }
}

const page = createPage();
page.quantity('2');
page.tiers[1].click();
assert.equal(page.text('cart-total'), '$2,398', 'Changing builds must preserve quantity');
page.elements.get('leader-arm-increase').listeners.click();
assert.equal(page.text('cart-total'), '$2,597');
page.elements.get('leader-arm-increase').listeners.click();
assert.equal(page.text('cart-total'), '$2,796');
page.elements.get('leader-arm-decrease').listeners.click();
page.elements.get('leader-arm-decrease').listeners.click();
assert.equal(page.elements.get('leader-arm-decrease').disabled, true);
assert.equal(page.text('cart-total'), '$2,398');
for (const kind of ['maker-arm', 'leader-arm']) {
  const invalidValues = ['', '-1', '1.5', 'abc', 'Infinity', '9007199254740992'];
  if (kind === 'maker-arm') invalidValues.push('0');
  for (const invalid of invalidValues) {
    page.quantity(invalid, kind);
    await page.checkout();
    assert.ok(page.elements.get(`${kind}-quantity`).validationMessage);
    assert.equal(page.requests.length, 0, `Invalid ${kind} quantity ${invalid} must not reach Shopify`);
    assert.equal(page.popups.length, 0);
  }
  page.quantity('1', kind);
}
page.quantity('2', 'leader-arm');
page.tiers[0].click();
assert.equal(page.text('cart-total'), '$1,397', 'Changing builds preserves independent quantities');
page.elements.get('maker-arm-increase').listeners.click();
assert.equal(page.text('cart-total'), '$2,396');
page.elements.get('maker-arm-decrease').listeners.click();
assert.equal(page.elements.get('maker-arm-decrease').disabled, true);
page.quantity('3');
assert.equal(page.elements.get('maker-arm-quantity').validationMessage, '');
await page.checkout();
assert.equal(page.requests[0].variables.input.lines[0].quantity, 3);
assert.equal(page.requests[0].variables.input.lines[1].quantity, 2);
assert.equal(createPage('?build=unknown').text('cart-total'), '$999');
console.log('Maker Arm checkout verification passed: independent quantities, both builds, stepper buttons, leader removal, totals, and invalid input.');
