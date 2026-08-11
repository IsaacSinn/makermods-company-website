# SO-101 Product Image Design

## Goal

Use `assets/open-booth/notused_so101-kit.png` as the real product photography for the SO-101 product-page hero and for the plain bimanual configuration on the SO-101 buy page.

## Approved presentation

- The SO-101 product page keeps its existing two-column hero and technical frame, but the placeholder illustration is replaced by the supplied product photograph.
- The photograph fills the hero media frame. The technical corner markers, top label, and bottom specification strip remain as restrained overlays positioned away from the robot arms.
- The buy-page configurator shows the photograph only when `SO-101 Bimanual Kit` is selected.
- The standard pair and both OpenBooth bundles retain the existing technical configuration visual so the photograph is not presented as a different bundle.
- The buy-page image and technical placeholder switch in place; the gallery dimensions do not move when the selection changes.

## Accessibility and responsive behavior

- The product-page image uses descriptive alternative text identifying the SO-101 robot arm kit.
- The buy-page image uses descriptive alternative text identifying the bimanual SO-101 kit and is removed from the accessibility tree while hidden.
- Both uses preserve the supplied image's resolution and use responsive image sizing without generating a lower-resolution derivative.
- On narrow screens, the existing landscape media ratio remains, with object positioning tuned to keep the arms visible.

## Constraints

- Work only in the isolated `feature/homepage-gif-banner` worktree.
- Do not commit or push.
- Reuse the existing image without AI generation or destructive image edits.
