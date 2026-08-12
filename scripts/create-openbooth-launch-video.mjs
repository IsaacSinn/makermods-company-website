import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(repoRoot, 'build', 'openbooth-launch');
const segmentDir = join(buildDir, 'segments');
const previewDir = join(buildDir, 'previews');
const fontDir = join(buildDir, 'fonts');
const plateDir = join(buildDir, 'plates');
const output = join(repoRoot, 'assets', 'open-booth', 'openbooth-launch-x.mp4');

const W = 1920;
const H = 1080;
const FPS = 30;
const ORANGE = '0xFF6B2C';
const PAPER = '0xFAFAFA';
const INK = '0x0A0A0A';

const assets = {
  hero: join(repoRoot, 'assets', 'open-booth', 'hero.mp4'),
  demo1: join(repoRoot, 'assets', 'open-booth', 'openbooth_demo_1_clip.mp4'),
  demo2: join(repoRoot, 'assets', 'open-booth', 'openbooth_demo_2_clip.mp4'),
  demo3: join(repoRoot, 'assets', 'open-booth', 'openbooth_demo_3_clip.mp4'),
  logo: join(repoRoot, 'makermods-app', 'assets', 'logo-wordmark-white.png'),
};

const fonts = {
  bold: join(fontDir, 'ChakraPetch-Bold.ttf'),
  semi: join(fontDir, 'ChakraPetch-SemiBold.ttf'),
};

const plates = {
  title: join(plateDir, '01-title-text.png'),
  dataset: join(plateDir, '02-dataset-text.png'),
  demos: join(plateDir, '03-demos-text.png'),
  brand: join(plateDir, '04-brand-text.png'),
};

const fontUrls = {
  [fonts.bold]: 'https://github.com/google/fonts/raw/main/ofl/chakrapetch/ChakraPetch-Bold.ttf',
  [fonts.semi]: 'https://github.com/google/fonts/raw/main/ofl/chakrapetch/ChakraPetch-SemiBold.ttf',
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function runWithInput(command, args, input) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function requireCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'ignore',
  });
  if (result.status !== 0) {
    throw new Error(`${command} is required but was not available`);
  }
}

function ensureFile(file) {
  if (!existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

function ensureDirs() {
  [buildDir, segmentDir, previewDir, fontDir, plateDir].forEach((dir) => {
    mkdirSync(dir, { recursive: true });
  });
}

function ensureFonts() {
  Object.entries(fontUrls).forEach(([file, url]) => {
    if (!existsSync(file)) {
      run('curl', ['-L', '--fail', '-o', file, url]);
    }
  });
}

function renderTextPlates() {
  const spec = {
    width: W,
    height: H,
    fonts,
    plates,
  };

  const script = String.raw`
import json
import sys
from PIL import Image, ImageDraw, ImageFont

spec = json.load(sys.stdin)
W = spec["width"]
H = spec["height"]
fonts = spec["fonts"]
plates = spec["plates"]

WHITE = (250, 250, 250, 255)
WHITE_SOFT = (250, 250, 250, 210)
WHITE_DIM = (250, 250, 250, 178)
ORANGE = (255, 107, 44, 255)
BLACK_STROKE = (0, 0, 0, 120)
BLACK_BOX = (0, 0, 0, 116)

def load(kind, size):
    return ImageFont.truetype(fonts[kind], size=size)

def text_size(draw, xy, text, font, **kwargs):
    box = draw.textbbox(xy, text, font=font, **kwargs)
    return box[2] - box[0], box[3] - box[1]

def draw_text(draw, xy, text, kind, size, fill=WHITE, anchor=None, stroke=0):
    draw.text(
        xy,
        text,
        font=load(kind, size),
        fill=fill,
        anchor=anchor,
        stroke_width=stroke,
        stroke_fill=BLACK_STROKE,
    )

def save(img, path):
    img.save(path)

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw_text(draw, (88, 320), "[ OPEN SOURCE ROBOTICS SKILLS / HUGGING FACE ]", "semi", 28, WHITE_DIM)
draw_text(draw, (84, 388), "OpenBooth", "bold", 124, WHITE, stroke=2)
draw_text(draw, (84, 528), "skills", "bold", 156, ORANGE, stroke=2)
draw_text(draw, (84, 704), "for Robots", "bold", 108, WHITE, stroke=2)
draw_text(draw, (W // 2, 70), "SCROLL", "semi", 14, WHITE_DIM, anchor="mm")
draw_text(draw, (W // 2, 98), "v", "semi", 24, WHITE_DIM, anchor="mm")
save(img, plates["title"])

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw_text(draw, (84, 660), "OpenBooth Data", "bold", 88, WHITE, stroke=2)
draw_text(draw, (86, 800), "152 datasets", "semi", 52, ORANGE)
draw_text(draw, (470, 800), "40 task tags", "semi", 52, WHITE)
draw_text(draw, (86, 876), "Reusable SO101 skills from real robot recordings", "semi", 34, WHITE_SOFT)
save(img, plates["dataset"])

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw_text(draw, (86, 722), "[ HACKATHON WINNER DEMOS ]", "semi", 28, WHITE_DIM)
draw_text(draw, (84, 780), "Recreate winning hackathon demos", "bold", 78, WHITE, stroke=2)
draw_text(draw, (84, 884), "with", "bold", 94, WHITE, stroke=2)
draw_text(draw, (288, 884), "OpenBooth", "bold", 94, ORANGE, stroke=2)
for x, label in [(32, "DEMO 01"), (672, "DEMO 02"), (1312, "DEMO 03")]:
    label_font = load("semi", 24)
    tw, th = text_size(draw, (0, 0), label, label_font)
    draw.rectangle((x - 12, 28, x + tw + 12, 72), fill=BLACK_BOX)
    draw.text((x, 34), label, font=label_font, fill=WHITE_SOFT)
save(img, plates["demos"])

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw_text(draw, (W // 2, 642), "www.makermods.ai/openbooth", "semi", 48, WHITE, anchor="mm")
save(img, plates["brand"])
`;

  runWithInput('python3', ['-c', script], JSON.stringify(spec));
}

function commonEncode(outFile) {
  return [
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-level:v',
    '4.1',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(FPS),
    '-movflags',
    '+faststart',
    '-an',
    '-y',
    outFile,
  ];
}

function renderHeroIntroSegment() {
  const out = join(segmentDir, '01-hero-intro.mp4');
  const base = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},format=rgba`,
    'drawbox=x=0:y=0:w=iw:h=ih:color=black@0.56:t=fill',
    'drawgrid=width=48:height=48:thickness=1:color=white@0.07',
  ].join(',');
  const filter = [
    `${base}[base]`,
    '[1:v]format=rgba,fade=t=in:st=0:d=0.35:alpha=1,fade=t=out:st=5.7:d=0.5:alpha=1[title]',
    '[2:v]format=rgba,fade=t=in:st=5.9:d=0.55:alpha=1,fade=t=out:st=11.65:d=0.35:alpha=1[data]',
    '[base][title]overlay=0:0[tmp]',
    '[tmp][data]overlay=0:0,format=yuv420p[v]',
  ].join(';');

  run('ffmpeg', [
    '-t',
    '12',
    '-i',
    assets.hero,
    '-loop',
    '1',
    '-t',
    '12',
    '-i',
    plates.title,
    '-loop',
    '1',
    '-t',
    '12',
    '-i',
    plates.dataset,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    ...commonEncode(out),
  ]);
  return out;
}

function renderDemoSegment() {
  const out = join(segmentDir, '03-demos.mp4');
  const prep = (input, label) =>
    `[${input}:v]scale=640:${H}:force_original_aspect_ratio=increase,crop=640:${H},setsar=1,fps=${FPS},format=rgba[${label}]`;
  const base = [
    '[d1][d2][d3]hstack=inputs=3',
    'drawbox=x=638:y=0:w=4:h=ih:color=black@0.54:t=fill',
    'drawbox=x=1278:y=0:w=4:h=ih:color=black@0.54:t=fill',
    'drawbox=x=0:y=0:w=iw:h=100:color=black@0.42:t=fill',
    'drawbox=x=0:y=692:w=iw:h=388:color=black@0.62:t=fill',
  ].join(',');
  const filter = [
    prep(0, 'd1'),
    prep(1, 'd2'),
    prep(2, 'd3'),
    `${base}[base]`,
    '[base][3:v]overlay=0:0,fade=t=in:st=0:d=0.35,fade=t=out:st=12.65:d=0.35,format=yuv420p[v]',
  ].join(';');

  run('ffmpeg', [
    '-stream_loop',
    '-1',
    '-t',
    '13',
    '-i',
    assets.demo1,
    '-stream_loop',
    '-1',
    '-t',
    '13',
    '-i',
    assets.demo2,
    '-stream_loop',
    '-1',
    '-t',
    '13',
    '-i',
    assets.demo3,
    '-loop',
    '1',
    '-t',
    '13',
    '-i',
    plates.demos,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    ...commonEncode(out),
  ]);
  return out;
}

function renderBrandSegment() {
  const out = join(segmentDir, '04-brand.mp4');
  const filter = [
    '[1:v]scale=520:-1,format=rgba[logo]',
    '[0:v][logo]overlay=(W-w)/2:(H-h)/2-85[base]',
    '[base][2:v]overlay=0:0,fade=t=in:st=0:d=0.55,fade=t=out:st=4.35:d=0.65,format=yuv420p[v]',
  ].join(';');

  run('ffmpeg', [
    '-f',
    'lavfi',
    '-i',
    `color=c=${INK}:s=${W}x${H}:d=5:r=${FPS}`,
    '-i',
    assets.logo,
    '-loop',
    '1',
    '-t',
    '5',
    '-i',
    plates.brand,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    ...commonEncode(out),
  ]);
  return out;
}

function concatSegments(segments) {
  const concatFile = join(buildDir, 'concat.txt');
  const lines = segments.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join('\n');
  writeFileSync(concatFile, `${lines}\n`);
  run('ffmpeg', ['-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', '-movflags', '+faststart', '-y', output]);
}

function renderPreviews() {
  const previews = [
    ['2.2', '01-title.png'],
    ['8.4', '02-data.png'],
    ['16.0', '03-demos.png'],
    ['27.0', '04-brand.png'],
  ];
  previews.forEach(([time, name]) => {
    run('ffmpeg', ['-ss', time, '-i', output, '-frames:v', '1', '-update', '1', '-q:v', '2', '-y', join(previewDir, name)]);
  });
}

function main() {
  ensureDirs();
  requireCommand('ffmpeg', ['-version']);
  requireCommand('ffprobe', ['-version']);
  Object.values(assets).forEach(ensureFile);
  ensureFonts();
  renderTextPlates();

  const segments = [
    renderHeroIntroSegment(),
    renderDemoSegment(),
    renderBrandSegment(),
  ];
  concatSegments(segments);
  renderPreviews();

  run('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height,r_frame_rate,codec_name,duration',
    '-of',
    'default=noprint_wrappers=1',
    output,
  ]);
}

main();
