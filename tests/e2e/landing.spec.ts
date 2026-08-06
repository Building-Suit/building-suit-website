import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("automated accessibility (axe-core, WCAG 2 A/AA)", () => {
  for (const { name, lang, theme } of [
    { name: "en-light", lang: "en", theme: "light" },
    { name: "en-dark", lang: "en", theme: "dark" },
    { name: "ar-light", lang: "ar", theme: "light" },
    { name: "ar-dark", lang: "ar", theme: "dark" },
  ]) {
    test(`no violations — ${name}`, async ({ page, context }) => {
      await context.addCookies([
        { name: "bs-lang", value: lang, url: "http://localhost:3412" },
        { name: "bs-theme", value: theme, url: "http://localhost:3412" },
      ]);
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
    expect(html).toContain("A clearer way to run your building is coming.");
    expect(html).toContain("Coming Soon");
  });

  test("Arabic renders server-side via the bs-lang cookie", async ({ request }) => {
    const response = await request.get("/", { headers: { cookie: "bs-lang=ar" } });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("قريبًا");
  });

  test("no dead #-only links and CTA points to a real in-page section", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toContain('href="#"');
    expect(html).toContain('href="#value-pillars"');
    expect(html).toContain('href="#main-content"');
  });
});

test.describe("language and appearance switching", () => {
  test("dir changes correctly and the choice persists across reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await page.getByRole("button", { name: /Switch to Arabic/ }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("light, dark, and system theme all persist across reload", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "Light", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "System", exact: true }).click();
    await page.reload();
    // "system" is resolved by the blocking pre-paint script; just confirm it settles to a
    // valid value rather than being left unset.
    await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
  });
});

test.describe("primary action and navigation", () => {
  test("the CTA scrolls to the value pillars section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See what’s coming" }).click();
    await expect(page).toHaveURL(/#value-pillars$/);
    await expect(page.locator("#value-pillars")).toBeInViewport();
  });
});

test.describe("keyboard and focus", () => {
  test("keyboard navigation reaches the skip link, controls, and CTA with visible focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(".bs-skip-link")).toBeFocused();

    const focusable = page.locator(
      "a, button, [tabindex]:not([tabindex='-1'])"
    );
    const count = await focusable.count();
    expect(count).toBeGreaterThan(5);

    // Tab through the remaining controls (the skip link already consumed one Tab above)
    // and confirm each receives real DOM focus with a non-"none" outline — the actual
    // visible-focus requirement, checked without relying on :focus-visible's
    // browser-specific keyboard-origin heuristics under CDP. Tabbing past the last
    // control wraps to <body>, which just ends the walk instead of failing it.
    let visited = 0;
    for (let i = 0; i < count; i++) {
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return "WRAPPED";
        return getComputedStyle(el).outlineStyle;
      });
      if (outline === "WRAPPED") break;
      expect(outline).not.toBe("none");
      visited++;
    }
    expect(visited).toBeGreaterThan(4);
  });

  test("no automatic focus movement on page load", async ({ page }) => {
    await page.goto("/");
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe("BODY");
  });
});

test.describe("header surface transition", () => {
  test("header logo swaps between transparent-hero and scrolled-solid state", async ({ page }) => {
    await page.goto("/");
    const darkLogo = page.locator(".bs-header__logo").first();
    const lightLogo = page.locator(".bs-header__logo").nth(1);

    await expect(lightLogo).toHaveClass(/is-visible/);
    await expect(darkLogo).not.toHaveClass(/is-visible/);

    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(300);
    await expect(page.locator(".bs-header")).toHaveClass(/bs-header--scrolled/);
  });
});

test.describe("reduced motion", () => {
  test("hero content is immediately visible under prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".bs-hero__headline")).toBeVisible();
    await expect(page.locator(".bs-hero__headline")).toHaveCSS("opacity", "1");
  });

  test("below-the-fold viewport-reveal content (pillars, closing) is visible without scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Deliberately not scrolling — Motion Spec §8 requires viewport reveal to skip the
    // intersection wait entirely under reduced motion, not just skip the animation.
    await expect(page.locator(".bs-pillar").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".bs-closing__headline")).toHaveCSS("opacity", "1");
  });
});

test.describe("console and accessibility landmarks", () => {
  test("no console or page errors during load and interaction", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await page.getByRole("button", { name: /Switch to Arabic/ }).click();

    expect(errors).toEqual([]);
  });

  test("landmarks and single h1 are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});
