#!/usr/bin/env node
// One-off deterministic asset generation (not AI/generative imagery): renders a small
// static HTML template with the approved logo asset + canonical tokens through headless
// Chromium and screenshots it. Produces the two OG images and the favicon tile.
// Rerun manually with `node scripts/generate-og-assets.mjs` if copy or tokens change.

import { chromium } from "@playwright/test";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_LIGHT = join(ROOT, "public/brand/building-suit-logo-light.png");

const NAVY_GRADIENT = "linear-gradient(160deg, #16293B 0%, #0D1B28 100%)";
const GOLD = "#EBB45A";
const PEARL = "#F7F8FA";

function ogHtml({ status, promise, dir }) {
  const logoDataUri = `data:image/png;base64,${readFileSync(LOGO_LIGHT).toString("base64")}`;
  return `<!doctype html>
<html dir="${dir}">
<head><meta charset="utf-8" /></head>
<body style="margin:0;">
  <div style="width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:${NAVY_GRADIENT};font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px);background-size:60px 60px;"></div>
    <img src="${logoDataUri}" style="height:150px;width:auto;position:relative;z-index:1;" />
    <div style="position:relative;z-index:1;color:${PEARL};font-size:56px;font-weight:800;text-align:center;line-height:1.1;">${status}</div>
    <div style="position:relative;z-index:1;color:rgba(255,255,255,0.76);font-size:26px;font-weight:500;text-align:center;">${promise}</div>
    <div style="position:relative;z-index:1;width:120px;height:3px;background:${GOLD};border-radius:2px;margin-top:8px;"></div>
  </div>
</body>
</html>`;
}

function faviconHtml() {
  const logoDataUri = `data:image/png;base64,${readFileSync(LOGO_LIGHT).toString("base64")}`;
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;">
  <div style="width:512px;height:512px;display:flex;align-items:center;justify-content:center;background:${NAVY_GRADIENT};">
    <img src="${logoDataUri}" style="height:420px;width:auto;" />
  </div>
</body>
</html>`;
}

// These are flat brand compositions (gradient + text + logo, no photography), so
// palette-quantized PNG compression is visually safe and cuts file size dramatically
// versus Playwright's raw screenshot encoding (e.g. the favicon: ~129KB -> ~30KB).
async function compressInPlace(path) {
  const buffer = await sharp(path).png({ compressionLevel: 9, palette: true, quality: 82, effort: 10 }).toBuffer();
  await sharp(buffer).toFile(path);
}

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

  const og = [
    { locale: "en", status: "Coming Soon", promise: "Clarity you can trust.", dir: "ltr" },
    { locale: "ar", status: "قريبًا", promise: "وضوح تثق به.", dir: "rtl" },
  ];

  for (const item of og) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(ogHtml(item));
    const outPath = join(ROOT, `public/og/coming-soon-${item.locale}.png`);
    await page.screenshot({ path: outPath });
    await page.close();
    await compressInPlace(outPath);
    console.log(`Wrote public/og/coming-soon-${item.locale}.png`);
  }

  const faviconPath = join(ROOT, "public/brand/favicon.png");
  const faviconPage = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await faviconPage.setContent(faviconHtml());
  await faviconPage.screenshot({ path: faviconPath });
  await faviconPage.close();
  await compressInPlace(faviconPath);
  console.log("Wrote public/brand/favicon.png");

  await browser.close();
}

main();
