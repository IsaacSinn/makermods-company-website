# SO101 Buy Images and Lead Time Design

## Objective

Update the SO101 buy-page gallery so each configuration has the intended product image state, and replace August shipping language with a two-week lead time for all four configurations.

## Scope

The change is limited to `so101-buy.html`, `scripts/so101.js`, `styles/so101.css` if required for the empty-image state, and focused verification. The OpenBooth buy page remains unchanged.

## Image mapping

Each tier in `scripts/so101.js` owns its image state, image source, alternative text, and gallery note.

- `pair` — display `assets/open-booth/notused_so101-kit.png`, which is the existing SO101 kit photograph currently used for the bimanual option.
- `bimanual` — display no photograph. Keep the existing technical placeholder until a new photograph is available.
- `boothPair` — display `assets/open-booth/openbooth-bimanual product.png`, matching the image assigned to OpenBooth + SO101 Kit on `open-booth-buy.html`.
- `boothBimanual` — display `assets/open-booth/openbooth-bimanual product.png`, matching the image assigned to OpenBooth + SO101 Bimanual Kit on `open-booth-buy.html`.

The shared gallery image element updates its `src` and `alt` from the selected tier. The technical placeholder is shown only for tiers without an image. The visual container's `data-has-product-image` value continues to control photo-versus-placeholder styling.

## Gallery note

Replace the static bimanual-photo note with a data-bound note that changes with the selected tier:

- Pair: `SO101 leader + follower kit.`
- Bimanual: `New SO101 bimanual kit photography coming soon.`
- Pair + OpenBooth: `SO101 leader + follower kit with OpenBooth.`
- Bimanual + OpenBooth: `SO101 bimanual kit with OpenBooth.`

## Lead time

All four SO101 configurations display a lead time of `2 weeks` in the shared purchase summary. Remove `Shipping in August.` from the buy-page introduction and remove every remaining visible August shipping reference from `so101-buy.html`.

The selected tier does not change the lead time; the shared value remains `2 weeks` for every option.

## Verification

Update focused SO101 product-image verification to exercise all four options and assert:

- the pair uses the SO101 kit photograph;
- the bimanual option hides the photograph and shows the technical placeholder;
- both OpenBooth bundles use the same image as their matching options on the OpenBooth buy page;
- each selected image has the expected alternative text;
- each option shows the expected gallery note;
- `so101-buy.html` contains `2 weeks` and no visible August shipping language;
- all existing repository verification scripts continue to pass.

## Delivery

Commit and push only to `feature/so101-pages-and-openbooth-banner`. Do not create or reopen a pull request. Remove all temporary `docs/superpowers/` specifications and plans before the final feature commit.
