import { test, expect } from "@playwright/test";

// Hard product requirement (task brief §10/§32): the Coming Soon experience must fit
// inside one viewport at every supported size, in both reading directions, with and
// without reduced motion. This is a regression test, not a visual preference — it must
// fail if a future edit accidentally reintroduces a second "page" below the fold.

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
];

const TABLET_VIEWPORTS = [
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
];

const DESKTOP_VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

const ALL_VIEWPORTS = [...MOBILE_VIEWPORTS, ...TABLET_VIEWPORTS, ...DESKTOP_VIEWPORTS];

// Sub-pixel layout rounding across browsers/zoom levels; not a tolerance for real overflow.
const TOLERANCE_PX = 2;

async function assertNoScroll(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollHeight, `vertical overflow: scrollHeight=${metrics.scrollHeight} clientHeight=${metrics.clientHeight}`).toBeLessThanOrEqual(
    metrics.clientHeight + TOLERANCE_PX
  );
  expect(metrics.scrollWidth, `horizontal overflow: scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth}`).toBeLessThanOrEqual(
    metrics.clientWidth + TOLERANCE_PX
  );
}

for (const viewport of ALL_VIEWPORTS) {
  test(`no scroll at ${viewport.width}x${viewport.height} — English LTR`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(400); // let the entrance sequence settle
    await assertNoScroll(page);
  });

  test(`no scroll at ${viewport.width}x${viewport.height} — Arabic RTL`, async ({ page, context }) => {
    await context.addCookies([{ name: "bs-lang", value: "ar", url: "http://localhost:3412" }]);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(400);
    await assertNoScroll(page);
  });
}

// Reduced-motion pass at a representative mobile and desktop size (task §33's required
// reduced-motion evidence viewports).
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`no scroll at ${viewport.width}x${viewport.height} — reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(viewport);
    await page.goto("/");
    await assertNoScroll(page);
  });
}
