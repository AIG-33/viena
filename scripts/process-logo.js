// Processes /viena-removebg-preview.png into two PNG variants under /public/images/:
//   logo-dark.png  — copy of original (for light backgrounds)
//   logo-light.png — dark pixels flipped to white, teal/colored pixels preserved (for dark bg)
//
// Heuristic for "is this pixel dark ink vs accent color":
//   saturation_range = max(R,G,B) - min(R,G,B) — low = grayscale, high = colored.
//   If grayscale AND dark (max < 180), treat as ink → force to white on light variant.

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SRC = path.join(__dirname, "..", "viena-removebg-preview.png");
const OUT_DIR = path.join(__dirname, "..", "public", "images");
const DARK = path.join(OUT_DIR, "logo-dark.png");
const LIGHT = path.join(OUT_DIR, "logo-light.png");

const GRAY_SAT_THRESHOLD = 30; // pixels with range<= this are treated as grayscale
const DARK_LUMA_THRESHOLD = 180; // grayscale pixels with max<= this are considered "ink"

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await sharp(SRC).png({ compressionLevel: 9 }).toFile(DARK);

  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  let flipped = 0;
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2], a = out[i + 3];
    if (a < 10) continue;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const range = maxC - minC;
    if (range <= GRAY_SAT_THRESHOLD && maxC <= DARK_LUMA_THRESHOLD) {
      // Grayscale & dark → treat as ink. Map to white, preserve alpha.
      out[i] = 255; out[i + 1] = 255; out[i + 2] = 255;
      flipped++;
    }
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(LIGHT);

  console.log(`✔ ${DARK}`);
  console.log(`✔ ${LIGHT}  (flipped ${flipped} ink pixels → white)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
