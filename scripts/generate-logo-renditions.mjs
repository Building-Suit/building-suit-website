#!/usr/bin/env node
// Generates correctly-sized, compressed raster renditions of the two approved logo
// masters for each real on-page display size (@2x each, for retina). This is exactly
// what the source logo-usage rules ask for ("Provide @1x/@2x/@3x raster exports ... so
// the mark stays crisp across densities" / "Serve appropriately sized assets ... never
// CSS-stretch the logo") — proportional resize only, no crop/recolor/redraw/flatten.
// The 920x1245 master PNGs are untouched and remain the hashed provenance source; these
// are additional derived files, not replacements.

import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_DIR = join(ROOT, "public/brand");

// height in px @1x; each is exported at 1x and 2x. Chosen from actual max display
// heights used in the components: header/footer need <=40px, the hero architectural
// signal needs <=128px.
const SIZES = [
  { suffix: "sm", height: 48 }, // header (40px) + footer (32px), @1x covers both with margin
  { suffix: "md", height: 128 }, // architectural signal
];

async function renderVariant(variant) {
  const masterPath = join(BRAND_DIR, `building-suit-logo-${variant}.png`);
  const master = sharp(masterPath);
  const meta = await master.metadata();

  for (const { suffix, height } of SIZES) {
    for (const scale of [1, 2]) {
      const targetHeight = height * scale;
      const targetWidth = Math.round((meta.width / meta.height) * targetHeight);
      const outPath = join(BRAND_DIR, `building-suit-logo-${variant}-${suffix}${scale === 2 ? "@2x" : ""}.png`);
      await sharp(masterPath)
        .resize({ height: targetHeight, width: targetWidth, fit: "contain", withoutEnlargement: false })
        .png({ compressionLevel: 9, quality: 90 })
        .toFile(outPath);
      console.log(`Wrote ${outPath} (${targetWidth}x${targetHeight})`);
    }
  }
}

async function main() {
  await renderVariant("dark");
  await renderVariant("light");
}

main();
