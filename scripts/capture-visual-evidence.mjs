#!/usr/bin/env node
// Captures the fixed-viewport visual evidence matrix required for the Coming Soon page
// QA pass (see docs/visual-qa.md): locale x theme x device, plus reduced-motion mobile
// and desktop. Requires the app to already be running at BASE_URL (defaults to the
// Playwright preview port). Output: test-results/visual-evidence/*.png.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "test-results/visual-evidence");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3412";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

async function capture(browser, name, { viewport, lang, theme, reducedMotion }) {
  const cookies = [];
  if (lang) cookies.push({ name: "bs-lang", value: lang, domain: "localhost", path: "/" });
  if (theme) cookies.push({ name: "bs-theme", value: theme, domain: "localhost", path: "/" });

  const context = await browser.newContext({
    viewport,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  if (cookies.length) await context.addCookies(cookies);

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(reducedMotion ? 200 : 700); // let entrance motion settle for non-reduced captures

  // Real incremental scroll (not a CDP full-page stitch) so IntersectionObserver-driven
  // viewport-reveal sections actually populate before the full-page screenshot is taken.
  await page.evaluate(async () => {
    const step = 400;
    const delay = 90;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.body.scrollHeight) {
      document.scrollingElement.scrollBy(0, step);
      await new Promise((r) => setTimeout(r, delay));
    }
    document.scrollingElement.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: join(OUT_DIR, `${name}.png`), fullPage: true });
  await context.close();

  if (errors.length) {
    console.error(`✗ ${name}: console/page errors`, errors);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${name}`);
  }
}

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

  await capture(browser, "en-light-mobile", { viewport: VIEWPORTS.mobile, lang: "en", theme: "light" });
  await capture(browser, "en-dark-mobile", { viewport: VIEWPORTS.mobile, lang: "en", theme: "dark" });
  await capture(browser, "ar-light-mobile", { viewport: VIEWPORTS.mobile, lang: "ar", theme: "light" });
  await capture(browser, "ar-dark-mobile", { viewport: VIEWPORTS.mobile, lang: "ar", theme: "dark" });

  await capture(browser, "en-light-desktop", { viewport: VIEWPORTS.desktop, lang: "en", theme: "light" });
  await capture(browser, "en-dark-desktop", { viewport: VIEWPORTS.desktop, lang: "en", theme: "dark" });
  await capture(browser, "ar-light-desktop", { viewport: VIEWPORTS.desktop, lang: "ar", theme: "light" });
  await capture(browser, "ar-dark-desktop", { viewport: VIEWPORTS.desktop, lang: "ar", theme: "dark" });

  await capture(browser, "reduced-motion-mobile", {
    viewport: VIEWPORTS.mobile,
    lang: "en",
    theme: "light",
    reducedMotion: true,
  });
  await capture(browser, "reduced-motion-desktop", {
    viewport: VIEWPORTS.desktop,
    lang: "en",
    theme: "light",
    reducedMotion: true,
  });

  await browser.close();
}

main();
