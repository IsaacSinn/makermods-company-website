/* XLeRobot Buy Page — interactivity */
(() => {
  'use strict';

  /* ----------- Icon set (24x24, stroke 1.5) ----------- */
  const ICONS = {
    // 3-tier IKEA trolley with omni wheels
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16M4 10h16M4 16h16"/><path d="M5 4v12M19 4v12"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/></svg>',
    // Generic robotic arm — base, shoulder, elbow, wrist
    arm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="19" width="9" height="2.5" rx="0.4"/><path d="M10.5 19v-4"/><circle cx="10.5" cy="13.8" r="1.3"/><path d="M11.4 13L15.6 8.4"/><circle cx="16" cy="8" r="1.3"/><path d="M16.9 7.4L19 5.3"/><circle cx="19.5" cy="4.8" r="1"/></svg>',
    // Powered USB hub box with three ports and a host lead
    usb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="8" rx="1"/><rect x="5" y="13" width="3" height="2.5"/><rect x="10.5" y="13" width="3" height="2.5"/><rect x="16" y="13" width="3" height="2.5"/><path d="M12 10V5"/><circle cx="12" cy="4.5" r="0.7" fill="currentColor"/></svg>',
    // Battery / power bank
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="16" height="8" rx="1"/><path d="M21 11v2"/><path d="M7 11v2M11 11v2"/></svg>',
    // Cable with two USB-C connectors
    cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="4" height="4" rx="0.5"/><path d="M3.5 11.5v1"/><path d="M6 12 C 9.5 6, 14.5 18, 18 12"/><rect x="18" y="10" width="4" height="4" rx="0.5"/><path d="M20.5 11.5v1"/></svg>',
    // CPU / Jetson Nano
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>'
  };

  /* ----------- State ----------- */
  const state = { compute: 'robot-only', color: 'white' };

  const PRICES = { 'robot-only': 999, jetson: 1699 };
  const NAMES = { 'robot-only': 'Robot Only', jetson: 'Jetson Nano Pack' };
  const COLORS = { white: 'White' };

  function selectedOption() {
    return document.querySelector(`[data-opt-list] .opt[data-compute="${state.compute}"]`);
  }

  function selectedVariantId() {
    const opt = selectedOption();
    if (!opt) return '';
    const key = 'variant' + state.color.charAt(0).toUpperCase() + state.color.slice(1);
    return opt.dataset[key] || '';
  }

  function updateBuyCta() {
    const buyCta = document.getElementById('config-buy-cta');
    if (!buyCta) return;
    const nameEl = buyCta.querySelector('[data-config-buy-name]');
    const colorEl = buyCta.querySelector('[data-config-buy-color]');
    const priceEl = buyCta.querySelector('[data-config-buy-price]');
    if (nameEl) nameEl.textContent = NAMES[state.compute].toUpperCase();
    if (colorEl) colorEl.textContent = COLORS[state.color].toUpperCase();
    if (priceEl) priceEl.textContent = '$' + PRICES[state.compute].toLocaleString();
  }

  /* ----------- Box list ----------- */
  const BOX_BASE = [
    { icon: 'cart',      name: 'IKEA mobile cart', desc: '3-tier trolley with bearing-supported omni wheels. In-place 360° rotation.', qty: '×1' },
    { icon: 'arm',       name: 'SO-101 follower arms', desc: '5+1 DOF (5 DOF + gripper). Mounted to the cart.', qty: '×2' },
    { icon: 'arm',       name: 'SO-101 leader arms', desc: 'Teleop controllers, same kinematics. For bimanual teleop.', qty: '×2' },
    { icon: 'usb',       name: 'USB hub array', desc: 'One hub behind each arm — every cable reachable, no shoulder-deep digging.', qty: '×2' },
    { icon: 'battery',   name: 'Quick-release power bank cradle', desc: 'Fits the Lenovo Fluxo (sold separately).', qty: '×1' },
    { icon: 'cable',     name: 'Cable kit', desc: '2× 12V power · 2× 7.4V power · 4× USB-A to USB-C.', qty: 'kit' }
  ];
  const BOX_JETSON = { icon: 'cpu', name: 'Jetson Nano + SSD', desc: 'Flashed with Ubuntu, LeRobot, and MakerMods runtime.', qty: '×1', jetson: true };

  function renderBox() {
    const list = document.querySelector('[data-box-list]');
    if (!list) return;
    const items = state.compute === 'jetson' ? [...BOX_BASE, BOX_JETSON] : BOX_BASE;
    list.innerHTML = items.map(it => `
      <div class="box-item">
        <div class="thumb">${ICONS[it.icon]}</div>
        <div>
          <div class="name">${it.name}${it.jetson ? '<span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;background:var(--ink);color:var(--paper);padding:2px 6px;margin-left:8px;font-weight:400;vertical-align:3px">jetson pack</span>' : ''}</div>
          <div class="desc">${it.desc}</div>
        </div>
        <div class="qty">${it.qty}</div>
      </div>
    `).join('');
  }

  /* ----------- Specs ----------- */
  function specRows() {
    const isJ = state.compute === 'jetson';
    return [
      ['Dimensions', '1240mm H · 365mm D · 426mm W<span class="imp imp-block">48.8" H · 14.4" D · 16.8" W</span>'],
      ['Weight', '10 kg<span class="imp imp-block">22 lb</span>'],
      ['Arms', '2× SO-101 follower + 2× SO-101 leader (bimanual teleop)'],
      ['Reach (per arm)', '500mm (SO-101)<span class="imp imp-block">19.7"</span>'],
      ['Payload per arm', '500g<span class="imp imp-block">1.1 lb</span>'],
      ['DOF per arm', '5 + gripper'],
      ['Assembly', '~95% pre-built · 4 screws for top racks of cart'],
      ['Omni wheel base · top speed', '0.5 m/s<span class="imp imp-block">1.6 ft/s</span>'],
      ['Cameras', '2× USB webcams · 1280×720 · main + left-arm wrist (same module)'],
      ['Power',
        '<div>Leader arms: 7.4V 3A × 2 (one per leader arm)</div>' +
        '<div>Follower arms: 12V 3A × 2 (one per follower arm)</div>' +
        '<div class="imp imp-block" style="margin-top:6px">Power bank: optional, user-supplied. Recommended: Lenovo Fluxo × 2. Any power bank combo with 3 USB-C PD ports rated for 12V 3A output will work.</div>'
      ],
      ['Compute', isJ ? 'NVIDIA Jetson Nano + SSD' : 'Tethered laptop over USB-C · optional NVIDIA Jetson Nano'],
      ['Connectivity', isJ ? 'Wi-Fi (Jetson onboard) · 2× USB hubs (each: 1 leader arm + 1 follower arm + 1 camera)' : '2× USB hubs (each: 1 leader arm + 1 follower arm + 1 camera)'],
      ['Software', 'LeRobot · MakerMods app · HuggingFace'],
      ['License', 'MIT (hardware + firmware)'],
      ['Repository', '<a href="https://github.com/Maker-Mods/XLeRobot-hardware" target="_blank" rel="noopener">github.com/Maker-Mods/XLeRobot-hardware</a>']
    ];
  }

  function renderSpecs() {
    const grid = document.querySelector('[data-spec-grid]');
    if (!grid) return;
    grid.innerHTML = specRows().map(([k, v]) =>
      `<div class="spec-row"><span class="k">${String(k).toLowerCase()}</span><span class="v">${v}</span></div>`
    ).join('');
  }

  /* ----------- Compute selection ----------- */
  function setCompute(id) {
    if (!PRICES[id]) return;
    state.compute = id;

    // option cards
    document.querySelectorAll('[data-opt-list] .opt').forEach(btn => {
      btn.dataset.active = btn.dataset.compute === id ? 'true' : 'false';
    });

    // hero price + label
    const priceEl = document.querySelector('[data-hero-price]');
    const buildEl = document.querySelector('[data-hero-build]');
    if (priceEl) priceEl.textContent = '$' + PRICES[id].toLocaleString();
    if (buildEl) buildEl.textContent = NAMES[id];

    // gallery tag
    const tag = document.querySelector('[data-cg-tag]');
    if (tag) tag.textContent = '[ image pending · ' + state.color + ' · ' + id + ' ]';

    updateBuyCta();

    renderBox();
    renderSpecs();
  }

  function setColor(id) {
    if (!COLORS[id]) return;
    state.color = id;

    document.querySelectorAll('[data-color-list] .swatch').forEach(btn => {
      btn.dataset.active = btn.dataset.color === id ? 'true' : 'false';
    });

    const colorLabel = document.querySelector('[data-color-label]');
    if (colorLabel) colorLabel.textContent = COLORS[id].toLowerCase();

    const gallery = document.querySelector('.cg-main');
    if (gallery) gallery.dataset.color = id;

    const tag = document.querySelector('[data-cg-tag]');
    if (tag) tag.textContent = '[ image pending · ' + id + ' · ' + state.compute + ' ]';

    updateBuyCta();
  }

  /* ----------- Shopify Storefront API: cart → checkout ----------- */
  const SHOPIFY_DOMAIN = 'makermods.myshopify.com';
  const STOREFRONT_TOKEN = 'e2d29379e81ae0f09b8bbd67b6b74515';

  async function createCheckoutUrl(variantId, quantity) {
    const merchandiseId = 'gid://shopify/ProductVariant/' + variantId;
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query: `mutation CartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart { checkoutUrl }
            userErrors { field message }
          }
        }`,
        variables: { input: { lines: [{ merchandiseId, quantity: quantity || 1 }] } }
      })
    });
    const data = await res.json();
    const errs = data?.data?.cartCreate?.userErrors;
    if (errs && errs.length) throw new Error(errs.map(e => e.message).join('; '));
    const url = data?.data?.cartCreate?.cart?.checkoutUrl;
    if (!url) throw new Error('No checkout URL returned');
    return url;
  }

  const buyCtaEl = document.getElementById('config-buy-cta');
  if (buyCtaEl) {
    buyCtaEl.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = selectedVariantId();
      if (!variantId) {
        alert(COLORS[state.color] + ' ' + NAMES[state.compute] + ' is not yet available for purchase. Please pick another option.');
        return;
      }
      // Open a blank tab synchronously so we don't trip popup blockers; navigate to checkout once we have the URL.
      const win = window.open('about:blank', '_blank');
      const originalText = buyCtaEl.innerHTML;
      buyCtaEl.style.pointerEvents = 'none';
      buyCtaEl.innerHTML = '[ OPENING CHECKOUT… ]';
      try {
        const url = await createCheckoutUrl(variantId, 1);
        if (win && !win.closed) win.location.href = url;
        else window.location.href = url;
      } catch (err) {
        if (win && !win.closed) win.close();
        console.error('Checkout error:', err);
        alert('Could not open checkout: ' + err.message);
      } finally {
        buyCtaEl.style.pointerEvents = '';
        buyCtaEl.innerHTML = originalText;
      }
    });
  }

  /* ----------- Wire up: compute options ----------- */
  document.querySelectorAll('[data-opt-list] .opt').forEach(btn => {
    btn.addEventListener('click', () => setCompute(btn.dataset.compute));
  });

  document.querySelectorAll('[data-color-list] .swatch').forEach(btn => {
    btn.addEventListener('click', () => setColor(btn.dataset.color));
  });

  setColor(state.color);
  setCompute(state.compute);

  /* ----------- Wire up: smooth scroll ----------- */
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ----------- Nav buy button: hot when hero CTA scrolls out ----------- */
  const heroCta = document.getElementById('hero-buy-cta');
  const navBuy = document.getElementById('nav-buy');
  if (heroCta && navBuy && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      navBuy.classList.toggle('is-idle', visible);
      navBuy.classList.toggle('is-hot', !visible);
    }, { threshold: 0.1 });
    obs.observe(heroCta);
  }

  /* ----------- Demo videos ----------- */
  const videoFrames = document.querySelectorAll('[data-video-row] .video-frame');
  const fmtTime = s => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ':' + String(r).padStart(2, '0');
  };
  videoFrames.forEach(frame => {
    frame.addEventListener('click', () => {
      videoFrames.forEach(f => {
        const isActive = f === frame;
        f.dataset.active = isActive ? 'true' : 'false';
        const bar = f.querySelector('.scrub .bar');
        if (bar) bar.dataset.active = isActive ? 'true' : 'false';
        const vid = f.querySelector('.v-media');
        const elapsed = f.querySelector('.scrub .elapsed');
        if (elapsed && !vid) elapsed.textContent = isActive ? '0:18' : '0:00';
      });
    });

    // Live-tick scrub bar for embedded video + seek on click/drag
    const vid = frame.querySelector('.v-media');
    if (vid) {
      const scrub = frame.querySelector('.scrub');
      const bar = scrub && scrub.querySelector('.bar');
      const elapsed = scrub && scrub.querySelector('.elapsed');
      const update = () => {
        const dur = vid.duration || 1;
        const pct = Math.min(100, (vid.currentTime / dur) * 100);
        if (bar) bar.style.setProperty('--p', pct + '%');
        if (elapsed) elapsed.textContent = fmtTime(vid.currentTime);
      };
      vid.addEventListener('timeupdate', update);
      vid.addEventListener('loadedmetadata', update);
      if (bar) bar.dataset.active = 'true';

      // Seek interaction
      if (bar) {
        let dragging = false;
        const seekFromEvent = (e) => {
          const rect = bar.getBoundingClientRect();
          const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
          const pct = Math.max(0, Math.min(1, x / rect.width));
          const dur = vid.duration || 1;
          vid.currentTime = pct * dur;
        };
        const stopProp = e => e.stopPropagation();
        scrub.addEventListener('click', stopProp);
        bar.addEventListener('mousedown', e => {
          stopProp(e); e.preventDefault();
          dragging = true;
          seekFromEvent(e);
        });
        window.addEventListener('mousemove', e => { if (dragging) seekFromEvent(e); });
        window.addEventListener('mouseup', () => { dragging = false; });
        bar.addEventListener('touchstart', e => {
          stopProp(e);
          dragging = true;
          seekFromEvent(e);
        }, { passive: true });
        bar.addEventListener('touchmove', e => { if (dragging) seekFromEvent(e); }, { passive: true });
        bar.addEventListener('touchend', () => { dragging = false; });
      }
    }
  });

  /* ----------- FAQ accordion ----------- */
  document.querySelectorAll('[data-faq] .faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.dataset.open === 'true';
      document.querySelectorAll('[data-faq] .faq-item').forEach(i => i.dataset.open = 'false');
      item.dataset.open = wasOpen ? 'false' : 'true';
    });
  });

  /* ----------- Initial render ----------- */
  renderBox();
  renderSpecs();
})();
