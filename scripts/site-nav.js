(() => {
  'use strict';

  const NAV_LINKS = [
    { key: 'maker-arm', label: 'Maker Arm', href: '/maker-arm' },
    { key: 'metal-arm', label: 'Metal Arm', href: '/metal-arm' },
    { key: 'openbooth', label: 'OpenBooth', href: '/openbooth' },
    { key: 'makermods-lab', label: 'MakerMods Lab', href: '/makermods-app/' },
    {
      key: 'lerobot-kits',
      label: 'LeRobot Kits',
      children: [
        {
          key: 'so101',
          label: 'SO-101',
          href: '/so101',
          blurb: 'Open-source leader + follower arm pair',
          thumb: '/assets/so101/bimanual-so101.png',
        },
        {
          key: 'xlerobot',
          label: 'XLeRobot',
          href: '/xlerobot',
          blurb: 'Bimanual mobile manipulator, fully assembled',
          thumb: '/assets/xlerobot-hero.png',
        },
        {
          key: 'elrobot',
          label: 'ElRobot',
          href: '/elrobot',
          blurb: 'Open 7+1 DoF arm pair for imitation learning',
          thumb: '/assets/elrobot/hero.jpg',
        },
      ],
    },
    { key: 'docs', label: 'Docs', href: 'https://github.com/makermods-robotics', external: true },
    { key: 'community', label: 'Community', href: 'https://discord.gg/HpXj3ynhhF', external: true },
  ];

  const LOCAL_STATIC_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

  function resolveHref(href) {
    if (!LOCAL_STATIC_HOSTS.has(window.location.hostname) || !href.startsWith('/')) return href;

    const url = new URL(href, window.location.origin);
    if (url.pathname === '/openbooth') url.pathname = '/openbooth/';
    else if (url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      url.pathname += '.html';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function createLink({ label, href, external }, active) {
    const link = document.createElement('a');
    link.href = resolveHref(href);
    link.textContent = label;
    if (active) link.setAttribute('aria-current', 'page');
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    return link;
  }

  function createDropdown(item, active) {
    const isActive = item.children.some((child) => child.key === active);

    const wrap = document.createElement('div');
    wrap.className = 'nav-group';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-group-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    if (isActive) toggle.setAttribute('data-active', 'true');

    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = item.label;
    const caret = document.createElement('span');
    caret.className = 'nav-group-caret';
    caret.setAttribute('aria-hidden', 'true');
    toggle.append(toggleLabel, caret);

    const panel = document.createElement('div');
    panel.className = 'nav-group-panel';
    panel.hidden = true;

    for (const child of item.children) {
      const link = document.createElement('a');
      link.className = 'nav-group-item';
      link.href = resolveHref(child.href);
      if (child.key === active) link.setAttribute('aria-current', 'page');

      if (child.thumb) {
        const figure = document.createElement('span');
        figure.className = 'nav-group-thumb';
        const img = document.createElement('img');
        img.src = child.thumb;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        figure.append(img);
        link.append(figure);
      }

      const text = document.createElement('span');
      text.className = 'nav-group-text';
      const name = document.createElement('span');
      name.className = 'nav-group-name';
      name.textContent = child.label;
      text.append(name);
      if (child.blurb) {
        const blurb = document.createElement('span');
        blurb.className = 'nav-group-blurb';
        blurb.textContent = child.blurb;
        text.append(blurb);
      }
      link.append(text);
      panel.append(link);
    }

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      wrap.dataset.open = String(open);
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // pointer users get hover-to-open; touch and keyboard rely on the click above
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      wrap.addEventListener('mouseenter', () => setOpen(true));
      wrap.addEventListener('mouseleave', () => setOpen(false));
    }

    wrap.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.focus();
      }
    });

    wrap.addEventListener('focusout', (event) => {
      if (!wrap.contains(event.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', (event) => {
      if (!wrap.contains(event.target)) setOpen(false);
    });

    wrap.append(toggle, panel);
    return wrap;
  }

  class MakerNav extends HTMLElement {
    connectedCallback() {
      if (this.dataset.rendered === 'true') return;

      const active = this.getAttribute('active');
      const ctaLabel = this.getAttribute('cta-label');
      const ctaHref = this.getAttribute('cta-href');

      const nav = document.createElement('nav');
      nav.className = 'nav';
      nav.setAttribute('aria-label', 'Primary');

      const inner = document.createElement('div');
      inner.className = 'nav-inner';

      const logo = document.createElement('a');
      logo.href = '/';
      logo.className = 'nav-logo';
      logo.setAttribute('aria-label', 'MakerMods home');

      const lightLogo = document.createElement('img');
      lightLogo.className = 'nav-logo-light';
      lightLogo.src = '/assets/logo-wordmark.png';
      lightLogo.alt = 'MakerMods';

      const darkLogo = document.createElement('img');
      darkLogo.className = 'nav-logo-dark';
      darkLogo.src = '/makermods-app/assets/logo-wordmark-white.png';
      darkLogo.alt = '';

      logo.append(lightLogo, darkLogo);

      const links = document.createElement('div');
      links.className = 'nav-links';
      for (const item of NAV_LINKS) {
        links.append(
          item.children ? createDropdown(item, active) : createLink(item, item.key === active),
        );
      }

      const actions = document.createElement('div');
      actions.className = 'nav-actions';
      if (ctaLabel && ctaHref) {
        const cta = createLink(
          { label: ctaLabel, href: ctaHref, external: this.hasAttribute('cta-external') },
          false,
        );
        cta.id = 'nav-buy';
        cta.className = 'btn nav-buy is-idle';
        actions.append(cta);
      }

      inner.append(logo, links, actions);
      nav.append(inner);
      this.replaceChildren(nav);
      this.dataset.rendered = 'true';
    }
  }

  if (!customElements.get('maker-nav')) {
    customElements.define('maker-nav', MakerNav);
  }
})();
