#!/usr/bin/env node
// Captures visual evidence for the scroll-driven GSAP public landing.
// The app must already be running at BASE_URL (defaults to Playwright preview port).

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "test-results/visual-evidence");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3412";

async function capture(browser, name, { viewport, lang, reducedMotion }) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });

  if (lang) {
    await context.addCookies([{ name: "bs-lang", value: lang, domain: "localhost", path: "/" }]);
  }

  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(reducedMotion ? 150 : 650);

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  const horizontalOverflow = metrics.scrollWidth > metrics.clientWidth + 2;
  const missingScrollStory = metrics.scrollHeight <= metrics.clientHeight;

  await page.screenshot({ path: join(OUT_DIR, name + ".png"), fullPage: true });
  await context.close();

  if (errors.length || horizontalOverflow || missingScrollStory) {
    console.error("✗ " + name + ": errors=" + JSON.stringify(errors) +
      " horizontalOverflow=" + horizontalOverflow +
      " missingScrollStory=" + missingScrollStory +
      " metrics=" + JSON.stringify(metrics));
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

async function main() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

  await capture(browser, "mobile-390x844", { viewport: { width: 390, height: 844 } });
  await capture(browser, "desktop-1440x900", { viewport: { width: 1440, height: 900 } });
  await capture(browser, "desktop-1920x1080", { viewport: { width: 1920, height: 1080 } });
  await capture(browser, "ultrawide-3440x1440", { viewport: { width: 3440, height: 1440 } });
  await capture(browser, "reduced-motion-390x844", { viewport: { width: 390, height: 844 }, reducedMotion: true });
  await capture(browser, "reduced-motion-1440x900", { viewport: { width: 1440, height: 900 }, reducedMotion: true });
  await capture(browser, "ar-mobile-390x844", { viewport: { width: 390, height: 844 }, lang: "ar" });
  await capture(browser, "ar-desktop-1440x900", { viewport: { width: 1440, height: 900 }, lang: "ar" });

  await browser.close();
}

main();
