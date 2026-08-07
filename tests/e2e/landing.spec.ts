import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("automated accessibility (axe-core, WCAG 2 A/AA)", () => {
  // Theme (light/dark) isn't varied here: the Coming Soon experience always renders the
  // fixed dark architectural treatment via --bs-color-role-dark-* tokens directly (see
  // ComingSoonExperience.vue), so a light/dark cookie produces byte-identical output for
  // this page. Locale is varied since RTL mirroring is real DOM/CSS change.
  for (const lang of ["en", "ar"]) {
    test(`no violations — ${lang}`, async ({ page, context }) => {
      await context.addCookies([{ name: "bs-lang", value: lang, url: "http://localhost:3412" }]);
      await page.goto("/");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
});

test.describe("server rendering", () => {
  test("English renders server-side without executing JS", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("Building Suit");
    expect(html).toContain("Coming Soon");
    expect(html).toContain("Clarity you can trust.");
  });

  test("Arabic renders server-side via the bs-lang cookie", async ({ request }) => {
    const response = await request.get("/", { headers: { cookie: "bs-lang=ar" } });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("قريبًا");
    expect(html).toContain("وضوح تثق به.");
  });

  test("no dead #-only links; the only link on the page is the skip link", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator('a[href="#"]').count()).toBe(0);
    const links = page.locator("a");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", "#main-content");
  });

  test("the future actions slot exists, is empty, and carries no placeholder copy", async ({ page }) => {
    await page.goto("/");
    const slot = page.locator('[data-testid="future-actions-slot"]');
    await expect(slot).toBeAttached();
    expect((await slot.textContent())?.trim()).toBe("");
  });
});

test.describe("keyboard and focus", () => {
  test("the skip link is the only focusable element and receives visible focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(".bs-skip-link")).toBeFocused();
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(outline).not.toBe("none");

    // Nothing else on the page is focusable — tabbing again wraps out (to <body> in this
    // headless harness, to browser chrome in a real browser). Either way, no second
    // in-page element should receive focus.
    await page.keyboard.press("Tab");
    const secondFocusTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocusTag === "BODY" || secondFocusTag === undefined).toBe(true);
  });

  test("no automatic focus movement on page load", async ({ page }) => {
    await page.goto("/");
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe("BODY");
  });
});

test.describe("reduced motion", () => {
  test("every entrance element is immediately visible under prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const selector of [".bs-atmosphere", ".bs-brand__logo-frame", ".bs-brand__wordmark", ".bs-brand__status", ".bs-brand__promise"]) {
      await expect(page.locator(selector), `${selector} should be visible without motion`).toHaveCSS("opacity", "1");
    }
  });

  test("pointer parallax does not register a listener under reduced motion", async ({ page }) => {
    // Indirect check: with reduced motion active, moving the pointer must not move the
    // decorative planes at all (transform stays at rest).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const before = await page.locator(".bs-atmosphere__glow").evaluate((el) => getComputedStyle(el).transform);
    await page.mouse.move(50, 50);
    await page.mouse.move(800, 20);
    await page.waitForTimeout(200);
    const after = await page.locator(".bs-atmosphere__glow").evaluate((el) => getComputedStyle(el).transform);
    expect(after).toBe(before);
  });
});

test.describe("console and landmarks", () => {
  test("no console or page errors during load, reload, and locale switch via cookie", async ({ page, context }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await context.addCookies([{ name: "bs-lang", value: "ar", url: "http://localhost:3412" }]);
    await page.reload();

    expect(errors).toEqual([]);
  });

  test("exactly one h1, one main landmark, no header/footer chrome", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Coming Soon");
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("nav")).toHaveCount(0);
  });

  test("decorative atmosphere is hidden from the accessibility tree", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".bs-atmosphere")).toHaveAttribute("aria-hidden", "true");
  });
});
