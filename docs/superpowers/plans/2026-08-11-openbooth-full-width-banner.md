# OpenBooth Full-Width Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary OpenBooth GIF with a full-width, high-resolution MP4 banner matching the Metal Arm hero scale without overlaid copy.

**Architecture:** The homepage retains its existing OpenBooth content flow, but the media moves into a full-bleed banner between the introduction and supporting content. A dedicated verifier checks the HTML/CSS contract and probes the generated asset.

**Tech Stack:** Static HTML/CSS, Node.js verification, FFmpeg/FFprobe, H.264 MP4.

## Global Constraints

- Work only in `feature/homepage-gif-banner`.
- Do not commit or push.
- Use the exact 22–40 second source segment.
- Keep all OpenBooth copy outside the video.

---

### Task 1: Banner Contract Test

**Files:**
- Create: `scripts/verify-homepage-openbooth-banner.mjs`
- Test: `scripts/verify-homepage-openbooth-banner.mjs`

- [ ] Write assertions for the MP4 source, poster, playback attributes, full-width hero-height CSS, absence of the GIF, and absence of overlay text.
- [ ] Run `node scripts/verify-homepage-openbooth-banner.mjs` and confirm it fails because the MP4 banner is not implemented.

### Task 2: High-Resolution Media

**Files:**
- Create: `assets/open-booth/openbooth-demo-banner.mp4`
- Create: `assets/open-booth/openbooth-demo-banner.jpg`
- Delete: `assets/open-booth/openbooth-demo-banner.gif`

- [ ] Encode seconds 22–40 to 1920×1080 H.264 with no audio and fast-start metadata.
- [ ] Extract the matching 1920×1080 poster.
- [ ] Probe the media and confirm its dimensions, codec, duration, and lack of audio.

### Task 3: Full-Width Homepage Banner

**Files:**
- Modify: `index.html`

- [ ] Replace the contained GIF picture with a full-bleed autoplaying video and poster.
- [ ] Match `.home-hero` desktop and mobile heights, retain corner markers, and remove the overlaid text tag.
- [ ] Run the new verifier and the repository asset verifier.

### Task 4: Browser Verification

**Files:**
- Verify: `index.html`

- [ ] Inspect desktop and mobile dimensions, overflow, video loading, and copy placement.
- [ ] Refresh Chrome at `http://127.0.0.1:4173/index.html#openbooth` for user review.
