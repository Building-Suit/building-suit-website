#!/usr/bin/env node
// One-off deterministic asset generation (not AI/generative imagery): renders a small
// static HTML template with the approved logo asset + canonical tokens through headless
// Chromium and screenshots it. Produces the two OG images and the favicon tile.
// Rerun manually with `node scripts/generate-og-assets.mjs` if copy or tokens change.

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_LIGHT = join(ROOT, "public/brand/building-suit-logo-light.png");

const NAVY_GRADIENT = "linear-gradient(160deg, #16293B 0%, #0D1B28 100%)";
const GOLD = "#EBB45A";
const PEARL = "#F7F8FA";

function ogHtml({ status, headline, dir }) {
  const logoDataUri = `data:image/png;base64,${readFileSync(LOGO_LIGHT).toString("base64")}`;
  return `<!doctype html>
<html dir="${dir}">
<head><meta charset="utf-8" /></head>
<body style="margin:0;">
  <div style="width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:${NAVY_GRADIENT};font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px);background-size:60px 60px;"></div>
    <img src="${logoDataUri}" style="height:150px;width:auto;position:relative;z-index:1;" />
    <div style="position:relative;z-index:1;display:inline-flex;padding:8px 20px;border-radius:999px;background:rgba(255,255,255,0.12);color:${PEARL};font-size:22px;font-weight:600;">${status}</div>
    <div style="position:relative;z-index:1;color:${PEARL};font-size:44px;font-weight:800;max-width:820px;text-align:center;line-height:1.2;">${headline}</div>
    <div style="position:relative;z-index:1;width:120px;height:3px;background:${GOLD};border-radius:2px;"></div>
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

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

  const og = [
    { locale: "en", status: "Coming Soon", headline: "A clearer way to run your building is coming.", dir: "ltr" },
    { locale: "ar", status: "قريبًا", headline: "طريقة أوضح لإدارة مبناك… قريبًا.", dir: "rtl" },
  ];

  for (const item of og) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(ogHtml(item));
    await page.screenshot({ path: join(ROOT, `public/og/coming-soon-${item.locale}.png`) });
    await page.close();
    console.log(`Wrote public/og/coming-soon-${item.locale}.png`);
  }

  const faviconPage = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await faviconPage.setContent(faviconHtml());
  await faviconPage.screenshot({ path: join(ROOT, "public/brand/favicon.png") });
  await faviconPage.close();
  console.log("Wrote public/brand/favicon.png");

  await browser.close();
}

main();
