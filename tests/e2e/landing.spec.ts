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
    // The platforms rail is server-rendered too — it must not be a client-only hydration
    // artefact, or it is invisible to crawlers and to no-JS visitors.
    expect(html).toContain("More from Building Suit.");
    expect(html).toContain("Ledger Suit");
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

  test("no dead #-only links; the skip link plus real platform links, nothing else", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator('a[href="#"]').count()).toBe(0);

    const links = page.locator("a");
    await expect(links.first()).toHaveAttribute("href", "#main-content");

    const platformLinks = page.locator(".bs-platform");
    await expect(platformLinks).not.toHaveCount(0);
    await expect(links).toHaveCount((await platformLinks.count()) + 1);
  });

  test("every platform link is absolute https and opens safely in a new tab", async ({ page }) => {
    await page.goto("/");
    const links = page.locator(".bs-platform");
    for (let i = 0; i < (await links.count()); i += 1) {
      const link = links.nth(i);
      const href = await link.getAttribute("href");
      expect(href, "platform href").toMatch(/^https:\/\//);
      await expect(link).toHaveAttribute("target", "_blank");
      // reverse-tabnabbing: the opened page must not get a live window.opener handle.
      expect(await link.getAttribute("rel")).toContain("noopener");
    }
  });

  test("the platforms rail is labelled by its own heading and announces the new tab", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator('[data-testid="platforms-rail"]');
    await expect(rail).toBeVisible();
    await expect(rail).toHaveAttribute("aria-labelledby", "bs-rail-title");
    await expect(page.locator("#bs-rail-title")).toHaveText("More from Building Suit.");
    await expect(page.locator(".bs-platform .bs-visually-hidden").first()).toHaveText("(opens in a new tab)");
  });
});

test.describe("keyboard and focus", () => {
  test("tab order is skip link then the platform links, each with a visible focus ring", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    await expect(page.locator(".bs-skip-link")).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle)).not.toBe("none");

    const platformCount = await page.locator(".bs-platform").count();
    for (let i = 0; i < platformCount; i += 1) {
      await page.keyboard.press("Tab");
      await expect(page.locator(".bs-platform").nth(i)).toBeFocused();
      const ring = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement as Element);
        return { style: style.outlineStyle, width: style.outlineWidth };
      });
      expect(ring.style).not.toBe("none");
      expect(Number.parseFloat(ring.width)).toBeGreaterThan(0);
    }

    // Nothing beyond the rail is focusable — tabbing again wraps out (to <body> in this
    // headless harness, to browser chrome in a real browser).
    await page.keyboard.press("Tab");
    const trailingFocusTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(trailingFocusTag === "BODY" || trailingFocusTag === undefined).toBe(true);
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
    const selectors = [
      ".bs-atmosphere",
      ".bs-brand__logo-frame",
      ".bs-brand__wordmark",
      ".bs-brand__status",
      ".bs-brand__promise",
      ".bs-experience__rule",
      ".bs-rail__title",
      ".bs-rail__subtitle",
      ".bs-rail__item",
    ];
    for (const selector of selectors) {
      await expect(page.locator(selector).first(), `${selector} should be visible without motion`).toHaveCSS("opacity", "1");
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

  test("exactly one h1, one h2 under it, one main landmark, no header/footer chrome", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Coming Soon");
    // The rail heading is an h2, not a second h1 — heading order must not skip a level.
    await expect(page.locator("h2")).toHaveCount(1);
    await expect(page.locator("h3")).toHaveCount(0);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("nav")).toHaveCount(0);
  });

  // Regression: the divider first shipped as a static in-flow element and was painted
  // underneath the absolutely-positioned atmosphere layer — laid out, opacity 1, and
  // completely invisible. Opacity assertions cannot catch that; stacking has to be
  // asserted directly.
  test("every foreground element stacks above the decorative atmosphere", async ({ page }) => {
    await page.goto("/");
    for (const selector of [".bs-brand", ".bs-rail", ".bs-experience__rule"]) {
      const stacking = await page.locator(selector).first().evaluate((el) => {
        const style = getComputedStyle(el);
        return { position: style.position, zIndex: style.zIndex };
      });
      expect(stacking.position, `${selector} position`).not.toBe("static");
      expect(Number(stacking.zIndex), `${selector} z-index`).toBeGreaterThan(0);
    }
  });

  test("decorative atmosphere is hidden from the accessibility tree", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".bs-atmosphere")).toHaveAttribute("aria-hidden", "true");
  });
});
