import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3440, height: 1440 },
];

async function assertSingleViewport(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    stageHeight: document.querySelector(".bs-gsap-landing")?.getBoundingClientRect().height ?? 0,
  }));

  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 2);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.stageHeight).toBeLessThanOrEqual(metrics.clientHeight + 2);
}

for (const viewport of VIEWPORTS) {
  test("one viewport at " + viewport.width + "x" + viewport.height + " — English", async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(250);
    await assertSingleViewport(page);
  });

  test("one viewport at " + viewport.width + "x" + viewport.height + " — Arabic", async ({ page, context }) => {
    await context.addCookies([{ name: "bs-lang", value: "ar", url: "http://localhost:3412" }]);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(250);
    await assertSingleViewport(page);
  });
}

test("reduced motion keeps the single-screen layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await assertSingleViewport(page);
});
