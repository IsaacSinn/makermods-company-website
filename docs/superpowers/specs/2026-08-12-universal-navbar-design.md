# Universal Navbar Design

## Goal

Replace the duplicated navbar markup across the MakerMods static site with one dependency-free shared component. A change to the shared component must update every page automatically.

## Scope

- Use one shared navbar on the homepage, product pages, product buy pages, OpenBooth, and MakerMods Lab.
- Keep one canonical logo and navigation-link list.
- Remove all navbar cart placeholder text.
- Keep the top-right call to action configurable per page.
- Support CTA labels such as `Buy →`, `Join waitlist`, `GitHub ↗`, and `← back` while applying the same shared visual style.
- Preserve the current page indicator and responsive behavior.
- Do not change footer navigation or unrelated page content.

## Architecture

Create a dependency-free custom element, `<maker-nav>`, in `scripts/site-nav.js`. Each HTML page will replace its duplicated `<nav>` block with the custom element and load the shared script.

The component owns:

- logo markup and home link;
- navigation labels, order, and destinations;
- active-link rendering;
- top-right CTA markup;
- accessible navigation and CTA labels.

Each page supplies only page-specific state through attributes:

```html
<maker-nav
  active="openbooth"
  cta-label="Buy →"
  cta-href="/open-booth-buy">
</maker-nav>
```

Supported attributes:

| Attribute | Purpose |
| --- | --- |
| `active` | Identifies the current product navigation item. Omit when no item is active. |
| `cta-label` | Sets the visible top-right CTA text. |
| `cta-href` | Sets the CTA destination. |
| `cta-external` | When present, opens the CTA in a new tab and adds safe external-link attributes. |

If the CTA label or destination is omitted, the component renders an empty reserved action slot so the shared navigation remains aligned.

## Styling

Move the canonical navbar and CTA rules into `styles/site-nav.css`. All pages load this stylesheet, and page-specific styles must not redefine the shared navbar selectors. The CTA uses one width, typography, border, hover state, and responsive treatment regardless of its label or destination.

## Routing

Use the existing extensionless production URLs. The local preview server must continue resolving those routes to their `.html` files.

## Loading and Failure Behavior

The component script loads with `defer` and upgrades `<maker-nav>` after the document is parsed. The element contains a short accessible fallback link to the homepage so navigation does not become an unexplained blank area if JavaScript fails.

## Verification

Automated checks will verify that:

- every in-scope page uses exactly one `<maker-nav>`;
- no in-scope page contains duplicated navbar link markup or cart placeholder text;
- every component instance loads the shared script and stylesheet;
- the shared component contains the canonical link order and configurable CTA behavior;
- each page declares the intended active item and CTA label/destination.

Browser verification will cover the homepage, OpenBooth, SO-101, Metal Arm, MakerMods Lab, and representative buy pages at desktop and mobile widths. It will confirm clean-route navigation, consistent CTA styling, active states, and the absence of cart text.
