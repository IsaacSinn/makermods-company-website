# SO-101 Product Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SO-101 product hero placeholder with the supplied product photograph and show the same photograph only for the plain bimanual tier on the SO-101 buy page.

**Architecture:** Keep the existing page structure and technical styling. Add a real image element to each media frame, then let `scripts/so101.js` toggle the buy-page photograph and the existing technical placeholder when the selected tier changes.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js verification script

## Global Constraints

- Work only in the isolated `feature/homepage-gif-banner` worktree.
- Do not commit or push.
- Reuse `assets/open-booth/notused_so101-kit.png` at its existing 2400 × 1792 resolution.
- Show the buy-page photograph only for the `bimanual` tier, not the `pair`, `boothPair`, or `boothBimanual` tiers.
- Keep overlay text away from the product subject.

---

### Task 1: Verify bimanual media switching

**Files:**
- Create: `scripts/verify-so101-product-images.mjs`
- Test: `scripts/verify-so101-product-images.mjs`

**Interfaces:**
- Consumes: `scripts/so101.js` and the configurator selectors `[data-so-buy-image]`, `[data-so-buy-placeholder]`, and `[data-so-buy-visual]`
- Produces: A zero-dependency Node verifier that executes the real configurator script against a minimal DOM and checks visible media after tier clicks

- [x] **Step 1: Write the failing behavior test**

Create a DOM harness that loads and executes `scripts/so101.js`, clicks the `bimanual` option, and requires the product image to become visible while the technical placeholder becomes hidden. Then click the `pair` option and require the inverse state.

- [x] **Step 2: Run the verifier and confirm the expected failure**

Run: `node scripts/verify-so101-product-images.mjs`

Expected: FAIL because the buy-page image and media-switching selectors do not exist yet.

### Task 2: Add the product and bimanual images

**Files:**
- Modify: `so101.html:69-79`
- Modify: `so101-buy.html:57-66`
- Modify: `styles/so101.css:3-72,253-292,322-352`
- Modify: `scripts/so101.js:25-84`

**Interfaces:**
- Consumes: `assets/open-booth/notused_so101-kit.png` and the verifier selectors from Task 1
- Produces: A photographic SO-101 hero and a buy-page visual that switches between photography and technical configuration art without layout shift

- [x] **Step 1: Replace the product hero placeholder**

Add an eager, high-priority `<img>` using `assets/open-booth/notused_so101-kit.png`, descriptive alt text, intrinsic dimensions `2400` × `1792`, and the existing technical label/corners/specification overlays. Remove the placeholder letterforms and flow diagram.

- [x] **Step 2: Add both buy-page media states**

Add the product image with `data-so-buy-image` and keep the existing configuration illustration inside a wrapper with `data-so-buy-placeholder`. Mark the containing gallery media with `data-so-buy-visual`.

- [x] **Step 3: Switch media for the bimanual tier**

Give only the `bimanual` tier a `showProductImage: true` property. In `applyTier`, set the product image's `hidden` state to the inverse of that property, set the technical placeholder's `hidden` state to the property, and update `data-has-product-image` on the visual container.

- [x] **Step 4: Style the photographic states**

Use full-frame cover sizing with responsive object positioning, retain the frame corners, and give the bright photograph readable dark technical overlays. Ensure `[hidden]` media is not displayed and suppress the dark grid treatment in the photographic state.

- [x] **Step 5: Run the focused verifier**

Run: `node scripts/verify-so101-product-images.mjs`

Expected: PASS for bimanual selection and restoration of the technical placeholder on other selections.

### Task 3: Regression and visual verification

**Files:**
- Verify only; no additional files expected

**Interfaces:**
- Consumes: The completed static pages and local HTTP server
- Produces: Evidence that existing SO-101 navigation/assets still validate and that both media presentations render correctly

- [x] **Step 1: Run focused and existing automated checks**

Run:

```bash
node scripts/verify-so101-product-images.mjs
node scripts/verify-so101-nav.mjs
node scripts/verify-homepage-openbooth-banner.mjs
node scripts/verify-assets.mjs
node scripts/verify-xlerobot-inventory.mjs
git diff --check
```

Expected: All commands exit 0 with no new warnings.

- [x] **Step 2: Inspect the product page in the collaborative browser**

Open `so101.html` from the local server at a desktop viewport and confirm the supplied image fills the hero, the subject remains visible, and the technical overlays stay legible without covering the arms.

- [x] **Step 3: Inspect the buy-page tier switching**

Open `so101-buy.html`, select `SO-101 Bimanual Kit`, and confirm the photograph appears. Select `SO-101 Kit` and confirm the technical configuration visual returns without layout shift.

- [x] **Step 4: Stop with uncommitted changes**

Report the modified files and verification results. Do not create a commit and do not push.
