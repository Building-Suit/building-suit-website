#!/usr/bin/env node
// Captures fixed-viewport visual evidence for the single-screen GSAP public landing.
// Set PLAYWRIGHT_CHROMIUM_PATH only when intentionally using a system Chromium.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "test-results/visual-evidence");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3412";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

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
  await page.waitForTimeout(reducedMotion ? 120 : 700);

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  const overflow =
    metrics.scrollHeight > metrics.clientHeight + 2 ||
    metrics.scrollWidth > metrics.clientWidth + 2;

  await page.screenshot({ path: join(OUT_DIR, name + ".png") });
  await context.close();

  if (errors.length || overflow) {
    console.error("✗ " + name + ": errors=" + JSON.stringify(errors) +
      " overflow=" + overflow +
      " metrics=" + JSON.stringify(metrics));
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

async function main() {
  const browser = await chromium.launch(
    chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}
  );

  await capture(browser, "mobile-360x640", { viewport: { width: 360, height: 640 } });
  await capture(browser, "mobile-390x844", { viewport: { width: 390, height: 844 } });
  await capture(browser, "desktop-1366x768", { viewport: { width: 1366, height: 768 } });
  await capture(browser, "desktop-1440x900", { viewport: { width: 1440, height: 900 } });
  await capture(browser, "ultrawide-3440x1440", { viewport: { width: 3440, height: 1440 } });
  await capture(browser, "reduced-motion-390x844", { viewport: { width: 390, height: 844 }, reducedMotion: true });
  await capture(browser, "ar-mobile-390x844", { viewport: { width: 390, height: 844 }, lang: "ar" });
  await capture(browser, "ar-desktop-1440x900", { viewport: { width: 1440, height: 900 }, lang: "ar" });

  await browser.close();
}

main();
