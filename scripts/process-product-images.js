/*
 * Normalize all product images from products_img/ into /public/images/products/.
 * - Flatten any transparency onto pure white (so PNG-nobg images match webp-with-bg).
 * - Fit into an 800x800 canvas, centered, padded with white (uniform aspect).
 * - Output as webp (quality 90) for small file size + broad browser support.
 *
 * Usage: node scripts/process-product-images.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "products_img");
const OUT = path.join(__dirname, "..", "public", "images", "products");

// Mapping: source file → output filename (slug.webp)
const MAPPING = [
  { src: "25863216.png.webp",      out: "nakonechnik-bez-filtra.webp" },
  { src: "23964678.jpg.webp",      out: "nakonechnik-s-filtrom.webp" },
  { src: "86686625.jpg.webp",      out: "nakonechniki-pcr-v-shtative.webp" },
  { src: "69047679.jpg.webp",      out: "nakonechniki-1000mkl-s-filtrom.webp" },
  { src: "11975291.jpg.webp",      out: "probirka-eppendorf-1-5ml.webp" },
  { src: "56669911.jpg.webp",      out: "mikroprobirki-edta.webp" },
  { src: "81320889.jpg.webp",      out: "kyuvety-analizatora.webp" },
  { src: "389243b6-9467-4d2b-995e-9e6dde38f0d1_removalai_preview.png",
    out: "planshet-96-glubokii.webp" },
  { src: "68672748.jpg-Photoroom.png", out: "shtativ-96.webp" },
  { src: "Removal-783.png",        out: "plenka-germetizatsii-planshetov.webp" },
  { src: "75243684.jpg.webp",      out: "sterilnye-zondy.webp" },
  { src: "71194798.jpg.webp",      out: "zond-tampon-odnorazovyi.webp" },
  { src: "85593840.jpg.webp",      out: "vatnaya-palochka.webp" },
  { src: "16294887.jpg.webp",      out: "konteyner-mochi-120ml.webp" },
  { src: "18356891.png.webp",      out: "konteyner-mochi-s-perehodnikom.webp" },
  { src: "45071865.jpg.webp",      out: "mocheprieymnik-1500ml.webp" },
  { src: "48463617.jpg.webp",      out: "mocheprieymnik-pediatricheskyi.webp" },
  { src: "92709496.jpg.webp",      out: "mochesbornik-universalnyi.webp" },
];

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  for (const { src, out } of MAPPING) {
    const inputPath = path.join(SRC, src);
    const outputPath = path.join(OUT, out);
    try {
      await sharp(inputPath)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize({
          width: 800,
          height: 800,
          fit: "contain",
          background: { r: 255, g: 255, b: 255 },
        })
        .webp({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ ${src} → ${out}`);
    } catch (err) {
      console.error(`✗ ${src}: ${err.message}`);
    }
  }
  console.log("\nDone.");
})();
