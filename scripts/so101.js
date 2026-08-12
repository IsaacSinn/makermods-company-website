(() => {
  'use strict';

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-q');
    if (!button) return;
    button.addEventListener('click', () => {
      const open = item.dataset.open === 'true';
      item.dataset.open = open ? 'false' : 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  const heroCta = document.querySelector('[data-hero-cta]');
  const navBuy = document.getElementById('nav-buy');
  if (heroCta && navBuy && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      navBuy.classList.toggle('is-hot', !entry.isIntersecting);
      navBuy.classList.toggle('is-idle', entry.isIntersecting);
    }, { threshold: 0.2 });
    observer.observe(heroCta);
  }

  const options = document.querySelector('[data-so-buy-options]');
  if (!options) return;

  const tiers = {
    pair: {
      label: 'SO-101 leader + follower kit',
      price: '$300',
      count: '1+1',
      parts: '1 leader arm / 1 follower arm',
      control: 'single-arm',
      tag: '[ SO-101 · LEADER + FOLLOWER ]',
      cartUrl: 'https://makermods.myshopify.com/cart/51851987812669:1',
      image: 'assets/open-booth/notused_so101-kit.png',
      imageAlt: 'SO-101 leader and follower robot arm kit',
      note: 'SO101 leader + follower kit.',
    },
    bimanual: {
      label: 'SO-101 bimanual kit',
      price: '$600',
      count: '2+2',
      parts: '2 leader arms / 2 follower arms',
      control: 'bimanual',
      tag: '[ SO-101 · BIMANUAL ]',
      cartUrl: 'https://makermods.myshopify.com/cart/51851988042045:1',
      note: 'New SO101 bimanual kit photography coming soon.',
    },
    boothPair: {
      label: 'SO-101 kit + OpenBooth',
      price: '$399',
      count: '1+1',
      parts: 'leader + follower / booth / 2 cameras',
      control: 'skill lab',
      tag: '[ SO-101 · OPENBOOTH ]',
      cartUrl: 'https://makermods.myshopify.com/cart/51852066324797:1,51851987812669:1',
      image: 'assets/open-booth/openbooth-bimanual product.png',
      imageAlt: 'OpenBooth with SO101 robots inside the training enclosure',
      note: 'SO101 leader + follower kit with OpenBooth.',
    },
    boothBimanual: {
      label: 'SO-101 bimanual + OpenBooth',
      price: '$699',
      count: '2+2',
      parts: '2 leaders + 2 followers / booth / 2 cameras',
      control: 'bimanual lab',
      tag: '[ SO-101 · BIMANUAL OPENBOOTH ]',
      cartUrl: 'https://makermods.myshopify.com/cart/51852066324797:1,51851988042045:1',
      image: 'assets/open-booth/openbooth-bimanual product.png',
      imageAlt: 'Bimanual OpenBooth with SO101 robots inside the training enclosure',
      note: 'SO101 bimanual kit with OpenBooth.',
    },
  };

  const write = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  };

  const applyTier = (id) => {
    const tier = tiers[id] || tiers.pair;
    options.querySelectorAll('.opt').forEach((option) => {
      option.dataset.active = option.dataset.tier === id ? 'true' : 'false';
      option.setAttribute('aria-pressed', option.dataset.tier === id ? 'true' : 'false');
    });
    write('[data-so-buy-label]', tier.label);
    write('[data-so-buy-price]', tier.price);
    document.querySelectorAll('[data-so-buy-count]').forEach((node) => {
      node.innerHTML = tier.count.replace('+', '<em>+</em>');
    });
    write('[data-so-buy-parts]', tier.parts);
    write('[data-so-buy-control]', tier.control);
    write('[data-so-buy-tag]', tier.tag);
    const hasProductImage = Boolean(tier.image);
    const productImage = document.querySelector('[data-so-buy-image]');
    const placeholder = document.querySelector('[data-so-buy-placeholder]');
    const visual = document.querySelector('[data-so-buy-visual]');
    if (productImage) {
      if (hasProductImage) {
        productImage.setAttribute('src', tier.image);
        productImage.setAttribute('alt', tier.imageAlt);
      }
      productImage.hidden = !hasProductImage;
    }
    if (placeholder) placeholder.hidden = hasProductImage;
    if (visual) visual.dataset.hasProductImage = hasProductImage ? 'true' : 'false';
    write('[data-so-buy-note]', tier.note);
    const cta = document.querySelector('[data-so-buy-cta]');
    if (cta) {
      cta.href = tier.cartUrl;
      cta.textContent = `[ BUY NOW · ${tier.price} -> ]`;
      cta.setAttribute('aria-label', `Buy ${tier.label} for ${tier.price}`);
    }
  };

  options.querySelectorAll('.opt').forEach((option) => {
    option.addEventListener('click', () => applyTier(option.dataset.tier));
  });

  applyTier('pair');
})();
