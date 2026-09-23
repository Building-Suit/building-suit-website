import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3440, height: 1440 },
];

async function assertScrollLayout(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    headerWidth: document.querySelector(".bs-gsap-header")?.getBoundingClientRect().width ?? 0,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.headerWidth).toBeLessThanOrEqual(1272);
}

for (const viewport of VIEWPORTS) {
  test("responsive scroll layout at " + viewport.width + "x" + viewport.height + " — English", async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(250);
    await assertScrollLayout(page);
  });

  test("responsive scroll layout at " + viewport.width + "x" + viewport.height + " — Arabic", async ({ page, context }) => {
    await context.addCookies([{ name: "bs-lang", value: "ar", url: "http://localhost:3412" }]);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(250);
    await assertScrollLayout(page);
  });
}

test("reduced motion preserves the same responsive geometry", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await assertScrollLayout(page);
});
