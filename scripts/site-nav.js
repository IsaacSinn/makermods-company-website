(() => {
  'use strict';

  const NAV_LINKS = [
    { key: 'maker-arm', label: 'Maker Arm', href: '/maker-arm' },
    { key: 'metal-arm', label: 'Metal Arm', href: '/metal-arm' },
    { key: 'openbooth', label: 'OpenBooth', href: '/openbooth' },
    { key: 'makermods-lab', label: 'MakerMods Lab', href: '/makermods-app/' },
    { key: 'so101', label: 'SO-101', href: '/so101' },
    { key: 'xlerobot', label: 'XLeRobot', href: '/xlerobot' },
    { key: 'elrobot', label: 'ElRobot', href: '/elrobot' },
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
        links.append(createLink(item, item.key === active));
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
