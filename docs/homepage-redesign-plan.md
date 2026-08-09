# Homepage redesign — spec

Goal: make `index.html` read like an SF/YC startup landing page (one narrative: thesis → flagship → platform → lab), not a product catalog. Currently it is nav + a 2×2 grid of four equal product cards — that is the problem.

## Global constraints (hard rules)

- **Only `index.html` may change.** Do not touch any other HTML page, `styles/*.css`, `scripts/`, or assets.
- Keep the existing `<nav class="nav">` and `<footer class="footer">` markup exactly as-is.
- Keep `<head>` SEO scaffolding (canonical, JSON-LD, favicon, stylesheet links). You may update `<title>`, meta/og/twitter *descriptions* to match the new flagship framing.
- Homepage-specific CSS lives in the inline `<style>` block in `index.html` (replace the current product-card CSS there). Use only design tokens from `styles/tokens.css` (var(--…)) — no new hex colors, no new fonts, no external resources.
- Grep-enforceable:
  - `grep -c "OpenBooth SO101" index.html` ≥ 2
  - `grep -ci "OpenBooth Dataset" index.html` → 0
  - `grep -c "banner.mp4" index.html` ≥ 1 (Metal Arm hero video)
  - `grep -c "openbooth-bimanual" index.html` ≥ 1 (SO101 photo)
- All four product links must still exist somewhere on the page: `metal-arm.html`, `openbooth`, `xlerobot.html`, `elrobot.html`.
- Videos: `autoplay muted loop playsinline preload="metadata"` + poster, same as today. Images below the fold: `loading="lazy" decoding="async"`.
- Accessibility floor: aria-labels on media links, alt text, `@media (prefers-reduced-motion: reduce)` disables transforms/animations you add.
- Responsive: must hold at 1440, 1024, 768, 390 wide. Single column on mobile.

## Section 1 — Hero (thesis + Metal Arm flagship)

Reuse the existing `.hero` component from `metal-arm.html` lines ~339–404 (classes `.hero`, `.hero-inner`, `.hero-photo`, `.hero-title`, `.hero-sub` are already in `styles/page.css` — read that markup and mirror its structure; do not redefine those classes).

- Left panel `.hero-photo` (dark): `<video src="assets/metal-arm/banner.mp4" poster="assets/metal-arm/hero.png" …>`, with the `.crosshair`, four `.corner` divs, `.label-tag` = `[ METAL ARM · FLAGSHIP ]`, `.meta-strip` = `6-AXIS · 3 KG PAYLOAD · ±0.1 MM · CNC ALUMINUM`.
- Right copy:
  - eyebrow: `[ OPEN-SOURCE ROBOTICS · PHYSICAL AI ]`
  - `<h1 class="hero-title">Open robots for<br>physical AI<span class="o">.</span></h1>`
  - `.hero-sub`: "MakerMods builds open-source robots for makers, students, and researchers. Meet Metal Arm — our flagship six-axis, all-aluminum manipulator, ready for ROS, LeRobot, and VLA training out of the box."
  - CTAs: primary `.btn.btn-stencil` → `metal-arm.html`, text `[ EXPLORE METAL ARM → ]`; secondary `.btn.btn-secondary` → `metal-arm-buy.html`, text `Buy now · $2,499`.
- Check how `.hero` behaves at 390px (page.css already has a 1-column fallback at 960px) — the homepage must not horizontally scroll.

## Section 2 — OpenBooth SO101 (platform story)

`<section class="section bg-grid" id="openbooth">` using `.section-head`.

- Eyebrow: `[ OPENBOOTH · SO101 ]`; H2: `OpenBooth SO101.`; lead: "A controlled booth that teaches SO101 arms new skills. Browse 152 public skills recorded by the community, then train your robot on top of them instead of starting from zero."
- Two-column split row (define new classes prefixed `ob-home-` in the inline style block):
  - Left: photo card — `<img src="assets/open-booth/openbooth-bimanual product.png">` (bimanual SO101 arms inside the booth), corner brackets like the product cards had, tag `[ SO101 · BIMANUAL ]`.
  - Right: three-line "how it works" list (reuse the 01/02/03 pattern from the openbooth page: start from public skills / drop your SO101 into a consistent workspace / record less data per new behavior), a stat row (`152 public skills · 17.7 hours · 41 task tags`) in mono, then CTAs: `.btn-stencil` `[ BROWSE SKILLS → ]` → `openbooth`, `.btn-secondary` `Buy OpenBooth` → `open-booth-buy.html`.
- Below the split: a **skills filmstrip** — one row of 8 thumbnails from `assets/open-booth/thumbnails/` plus a 9th tile reading `+144 more →` linking to `openbooth`. Pick 8 visually distinct scenes (different users/tasks, no near-duplicates — at most one per contributor). Tiles: square-ish, 1px `var(--line)` borders, tiny mono caption from the task name (e.g. "pick cup"), hover lifts border to `var(--ink)`. On mobile the strip becomes a 3-column grid showing 5 thumbs + the more-tile (hide the rest with a class).
- The whole section must link the *story* (skills library), not read as a store shelf.

## Section 3 — In the lab (XLeRobot + ElRobot, secondary)

`<section class="section" id="lab">`.

- section-head: eyebrow `[ ALSO FROM MAKERMODS ]`, H2 `In the lab.`, lead one short sentence ("Two more open platforms we build and ship.").
- Two **horizontal** compact cards side by side (media left ≈40%, body right), clearly smaller than the hero — h3 ≈ 22–26px, not 42px:
  - XLeRobot: `assets/xlerobot.mp4` (poster `assets/xlerobot-hero.png`), one-liner "Bimanual mobile manipulator, ships fully assembled, LeRobot-compatible." meta `$999` + `View →`, links `xlerobot.html`.
  - ElRobot: `assets/elrobot/hero.jpg`, one-liner "Fully assembled 3D-printed teleop pair for imitation-learning research." meta `$399 · pre-order` + `View →`, links `elrobot.html`.
- Cards use the notch clip-path (`var(--notch-md)`) + 1px border, hover: border-color var(--ink), translateY(-2px). Stack vertically on mobile.

## Revision 2 (Ryan's feedback — supersedes conflicting rules above)

1. **Hero goes full-bleed.** Replace the split `.hero` (photo left / copy right) with a full-viewport-width cinematic hero:
   - `assets/metal-arm/banner.mp4` spans 100vw (no container clip), height ~78vh (min 560px, max 860px), `object-fit: cover`.
   - Copy overlays the video, bottom-left inside `.container`: eyebrow, H1, sub (max 52ch), CTAs. All copy light (`#F5F5F5` on video) over a left+bottom dark gradient scrim (e.g. `linear-gradient(to top, rgba(10,10,10,.82), rgba(10,10,10,.25) 55%, transparent)` plus a subtle left gradient) so text passes contrast on every frame.
   - Keep the `[ METAL ARM · FLAGSHIP ]` label-tag (top-left) and the meta chip strip (bottom-right or under the CTAs); keep corner brackets at the video edges. New classes prefixed `home-hero-` in the inline style block; do NOT reuse `.hero`/`.hero-inner` grid.
   - H1 uses Ryan's exact phrase: `Open Source Ecosystem<br>for Physical AI<span class="o">.</span>` — sized with `clamp(44px, 6.5vw, 92px)`. Sub keeps the Metal Arm flagship framing. Update `<title>` and og/twitter titles to match ("MakerMods | Open Source Ecosystem for Physical AI").
   - Mobile: scrim darkens further, copy stays overlaid (min-height ~90svh is fine), no horizontal scroll.
2. **XLeRobot + ElRobot get louder.** Replace the compact horizontal "In the lab" cards with two large half-width cards (grid 2×1, stack on mobile): media on top at 16/10 (`assets/xlerobot.mp4` w/ poster; `assets/elrobot/hero.jpg`), corner brackets + mono tag on media, h3 at clamp(28px, 2.6vw, 38px), one-line description, price + `View →` meta row. Same notch/border/hover language as the rest of the site. Keep the section *below* OpenBooth and keep its head ("In the lab." is fine) so hierarchy stays flagship → platform → robots, but the cards themselves should feel like real products, not footnotes.
3. **Remove MakerMods App from the homepage.** Delete the `makermods-app/` link from the homepage nav AND the homepage footer Shop list (this revision overrides the "footer unchanged" rule — only that one `<li>`/`<a>` is removed; everything else in nav/footer stays byte-identical). Other pages are still untouchable.
4. Grep additions: `grep -c "Open Source Ecosystem" index.html` ≥ 2 (h1 + title); `grep -ci "makermods-app" index.html` → 0.

## Revision 3 (copy pass — supersedes all quoted copy above)

All homepage prose was rewritten by hand after Revision 2: relaxed and human in register, no em dashes, no "x, y, and z" triads. The literal copy strings quoted in earlier sections are no longer authoritative; the live `index.html` text is. Structural copy (mono `[ BRACKET ]` labels, the 01/02/03 step numbers, the stat row) is intentionally kept. The footer blurb was also rewritten under this rule, superseding Revision 2's "footer byte-identical except the app link" constraint.

## Tone

Copy is plain, specific, active voice. No marketing filler ("revolutionary", "seamless"). Mono eyebrows in the existing `[ BRACKET ]` style. The page should feel like one company with one flagship, one data platform, and a lab — not four SKUs.
