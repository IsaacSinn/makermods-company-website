# OpenBooth Full-Width Banner Design

## Goal

Replace the temporary OpenBooth GIF on the homepage with a high-resolution, full-width video banner that matches the scale and playback behavior of the Metal Arm hero without placing copy over the footage.

## Design

- Use the requested 22–40 second segment from `VID_20260811_173538_095.mp4`.
- Encode a 1920×1080 H.264 MP4 with no audio, fast-start metadata, autoplay, muted, looping, inline playback, and metadata-only preload.
- Extract a matching 1920×1080 poster image from the clip.
- Render the banner full-bleed at the same desktop and mobile heights as `.home-hero`.
- Keep the OpenBooth heading, lead, workflow, stats, and buttons outside the banner.
- Keep only the Metal Arm-style corner markers over the video; remove the OpenBooth text tag.
- Preserve reduced-motion behavior through the existing script, which pauses autoplay videos.

## Verification

- Assert the homepage references the MP4 and poster and no longer references the GIF.
- Assert the video attributes and text-free banner markup.
- Verify the encoded video is 1920×1080 H.264, approximately 18 seconds, and contains no audio.
- Run the repository asset verifier and responsive browser checks.

## Constraints

- Work only in `feature/homepage-gif-banner`.
- Do not commit or push.
