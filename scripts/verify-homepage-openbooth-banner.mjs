import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const videoPath = path.join(root, 'assets/open-booth/openbooth-demo-banner.mp4');
const posterPath = path.join(root, 'assets/open-booth/openbooth-demo-banner.jpg');
const bannerVideoTag = page.match(/<video\b[^>]*class="ob-home-banner-video"[^>]*>/)?.[0];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(page.includes('class="ob-home-banner"'), 'Homepage is missing the full-width OpenBooth banner');
assert(bannerVideoTag, 'Homepage is missing the OpenBooth banner video');
assert(page.includes('src="assets/open-booth/openbooth-demo-banner.mp4"'), 'Homepage is missing the OpenBooth MP4 source');
assert(page.includes('poster="assets/open-booth/openbooth-demo-banner.jpg"'), 'Homepage is missing the OpenBooth poster');
for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline', 'preload="metadata"']) {
  assert(bannerVideoTag.includes(attribute), `OpenBooth banner video is missing ${attribute}`);
}
assert(!page.includes('openbooth-demo-banner.gif'), 'Homepage still references the temporary GIF');
assert(!page.includes('ob-home-photo-tag'), 'OpenBooth banner should not overlay a text tag');
assert(/\.ob-home-banner\s*\{[^}]*width:\s*100%[^}]*height:\s*calc\(100svh - 173px\)[^}]*min-height:\s*520px/s.test(page), 'Desktop OpenBooth banner does not match the Metal Arm hero scale');
assert(/@media \(max-width: 600px\)[\s\S]*?\.ob-home-banner\s*\{[^}]*height:\s*calc\(100svh - 148px\)[^}]*min-height:\s*480px/s.test(page), 'Mobile OpenBooth banner does not match the Metal Arm hero scale');

assert(fs.existsSync(videoPath), 'Missing OpenBooth MP4 asset');
assert(fs.existsSync(posterPath), 'Missing OpenBooth poster asset');

const probe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'error',
  '-show_streams',
  '-show_format',
  '-of', 'json',
  videoPath,
], { encoding: 'utf8' }));
const videoStream = probe.streams.find((stream) => stream.codec_type === 'video');
const audioStream = probe.streams.find((stream) => stream.codec_type === 'audio');
const duration = Number(probe.format.duration);

assert(videoStream?.codec_name === 'h264', `Expected H.264 video, found ${videoStream?.codec_name ?? 'none'}`);
assert(videoStream.width === 1920 && videoStream.height === 1080, `Expected 1920x1080 video, found ${videoStream.width}x${videoStream.height}`);
assert(!audioStream, 'OpenBooth banner should not contain an audio stream');
assert(duration >= 17.9 && duration <= 18.1, `Expected an 18-second banner, found ${duration} seconds`);

const posterProbe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'error',
  '-show_streams',
  '-of', 'json',
  posterPath,
], { encoding: 'utf8' }));
const posterStream = posterProbe.streams[0];
assert(posterStream?.width === 1920 && posterStream?.height === 1080, `Expected 1920x1080 poster, found ${posterStream?.width}x${posterStream?.height}`);

console.log('Homepage OpenBooth banner verification passed.');
