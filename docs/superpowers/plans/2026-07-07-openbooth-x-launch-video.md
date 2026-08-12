# OpenBooth X Launch Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable generator for a horizontal OpenBooth launch video for X.

**Architecture:** A single Node script validates assets, downloads the required Chakra Petch display fonts into the build folder, renders three FFmpeg segments, concatenates them, and exports the final MP4. The website pages remain unchanged.

**Tech Stack:** Node.js standard library, FFmpeg, FFprobe, H.264 MP4.

---

### Task 1: Add Render Script

**Files:**
- Create: `scripts/create-openbooth-launch-video.mjs`

- [x] **Step 1: Define required assets and output paths**

Use absolute paths derived from the repository root for all source media, fonts, intermediate clips, preview frames, and the final MP4.

- [x] **Step 2: Validate tooling and source assets**

Run `ffmpeg -version` and `ffprobe -version`; fail if either command is unavailable. Check each source file with `fs.existsSync`.

- [x] **Step 3: Download Chakra Petch fonts when missing**

Use `curl -L --fail` to download `ChakraPetch-Bold.ttf` and `ChakraPetch-SemiBold.ttf` from Google Fonts into `build/openbooth-launch/fonts/`.

- [x] **Step 4: Render four segments**

Render:
- continuous title/data overlays over one uninterrupted hero-video segment;
- three vertical demo videos side by side;
- dark MakerMods brand close with `www.makermods.ai/openbooth`.

- [x] **Step 5: Concatenate and create previews**

Write `build/openbooth-launch/concat.txt`, concatenate the rendered segment MP4s into `assets/open-booth/openbooth-launch-x.mp4`, and export four representative PNG preview frames.

### Task 2: Verify Export

**Files:**
- Output: `assets/open-booth/openbooth-launch-x.mp4`
- Output: `build/openbooth-launch/previews/*.png`

- [x] **Step 1: Run generator**

Run: `node scripts/create-openbooth-launch-video.mjs`

- [x] **Step 2: Verify media properties**

Run:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name,duration -of default=noprint_wrappers=1 assets/open-booth/openbooth-launch-x.mp4
```

Expected: H.264, 1920x1080, 30 fps, approximately 30 seconds.

- [x] **Step 3: Inspect preview frames**

Open or visually inspect:
- `build/openbooth-launch/previews/01-title.png`
- `build/openbooth-launch/previews/02-dataset.png`
- `build/openbooth-launch/previews/03-demos.png`
- `build/openbooth-launch/previews/04-brand.png`
