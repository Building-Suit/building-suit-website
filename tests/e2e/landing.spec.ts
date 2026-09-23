import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("single-screen GSAP landing", () => {
  for (const lang of ["en", "ar"]) {
    test("no WCAG A/AA violations — " + lang, async ({ page, context }) => {
      await context.addCookies([{ name: "bs-lang", value: lang, url: "http://localhost:3412" }]);
      await page.goto("/");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  test("English content is server rendered", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("Building Suit");
    expect(html).toContain("Coming Soon");
    expect(html).toContain("Clarity you can trust.");
    expect(html).toContain("Ledger Suit");
  });

  test("Arabic content is server rendered", async ({ request }) => {
    const response = await request.get("/", { headers: { cookie: "bs-lang=ar" } });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("قريبًا");
    expect(html).toContain("وضوح تثق به.");
  });

  test("project link is safe and absolute", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(".bs-gsap-project-card");
    await expect(link).toHaveCount(1);
    expect(await link.getAttribute("href")).toMatch(/^https:\/\//);
    await expect(link).toHaveAttribute("target", "_blank");
    expect(await link.getAttribute("rel")).toContain("noopener");
  });

  test("language control switches the live page to Arabic", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("language-control").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("h1")).toContainText("قريبًا");
  });

  test("appearance control cycles system, dark, light", async ({ page, context }) => {
    await context.addCookies([{ name: "bs-theme", value: "system", url: "http://localhost:3412" }]);
    await page.goto("/");
    const control = page.getByTestId("appearance-control");
    await control.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await control.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("invalid locale cookie degrades to English", async ({ page, context }) => {
    await context.addCookies([{ name: "bs-lang", value: "fr", url: "http://localhost:3412" }]);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("Coming Soon");
  });

  test("semantic landmarks and heading order are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header.bs-gsap-header")).toHaveCount(1);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h2")).toHaveCount(1);
  });

  test("reduced motion keeps the composition stable", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".bs-gsap-project-card")).toBeVisible();
    const ring = page.locator('[data-gsap="ring-a"]');
    const before = await ring.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(250);
    const after = await ring.evaluate((el) => getComputedStyle(el).transform);
    expect(after).toBe(before);
  });

  test("no console or page errors during load and locale switch", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("language-control").click();
    await page.waitForTimeout(150);
    expect(errors).toEqual([]);
  });
});
