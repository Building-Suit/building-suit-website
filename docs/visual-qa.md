# Visual QA — Coming Soon Landing Page

Reviewed against the checklist in the task brief (§24). This is a designer-eye review of the running build, not a rubber stamp on "it compiles." Evidence screenshots referenced below live in `test-results/visual-evidence/`.

## Brand

- **Immediately reads as Building Suit?** Yes — the unmodified 3D logo mark appears in the header, the hero's architectural signal panel, and the footer; Building Navy → Deep Structure Navy gradient anchors the hero and closing sections; Premium Gold appears exactly once as a large focal element (the hero glow + the architectural signal's lit windows), with smaller functional gold (focus rings, trust-descriptor dots, status-badge dot) coexisting per the documented gold-usage rule.
- **Architectural?** The window-grid motif (from `color.brandContext.gridSubtle/gridStrong`, the tokens literally named for this purpose) forms the hero and closing backdrops; the architectural signal panel is a layered rectilinear composition with a real window grid, not a stock illustration.
- **Clarity/trust communicated?** Copy leads with the brand promise ("Clarity you can trust") and the three pillars map 1:1 to the three signal labels (Finances / Community / Decisions), reinforcing rather than decorating.
- **Gold controlled?** One large focal gold moment (hero glow) per screen; verified programmatically too — `pnpm tokens:verify` greps every component/CSS file for raw hex and finds none outside the generated token layer, so gold usage is 100% through semantic tokens, not ad hoc values.
- **Serious enough for finance/governance, still warm?** Navy-led hero with precise, unembellished copy; warmth comes from the gold "lit windows," not from casual tone — matches the brand-voice "calm, competent building manager" register.

## Composition

- **One unmistakable focal point?** Yes per section: hero = headline + gold CTA; pillars = three equal cards, no single card dominates (verified in `en-light-desktop.png` — identical card heights, aligned baselines); closing = centered single message.
- **Negative space intentional?** Section rhythm uses the canonical spacing scale exclusively (`--bs-spacing-8`/`--bs-spacing-9` between sections) — checked by grep, no arbitrary padding values anywhere in the component styles.
- **Hero clear within 5 seconds?** Status badge → eyebrow → headline → one CTA, in that visual order, nothing competing.
- **Mobile preserves hierarchy, not just stacks?** `en-light-mobile.png` — text still leads, the architectural signal shrinks to fit under the trust descriptors rather than pushing content down; 16px outer margins throughout, no horizontal overflow at 390px (confirmed no `overflow-x` — `landing.css` sets `body { overflow-x: hidden }` as a hard backstop, and no element exceeds viewport width in the 390×844 screenshot).

## Copy

- Benefit-led, hype-free: cross-checked against the PRD/BRD/UX spec (see `docs/building-suit-source-audit.md`) — no overclaim found, and a dedicated Vitest test (`tests/landingCopy.spec.ts`) asserts the copy never mentions Paymob, a provider directory, or the other Suit portals.
- Arabic reads as native MSA, not a literal translation (confirmed visually in `ar-light-desktop.png`/`ar-dark-mobile.png` — natural word order, not English syntax transliterated).
- "Coming Soon" appears in both languages' status badge and closing section; nothing implies the product is already live.

## Motion

- Every animation maps to a named semantic recipe in `app/utils/buildingSuitMotion.ts` (hero entrance, viewport reveal, hover/press, header transition, parallax) — none are ad hoc per-component values.
- Page is readable before motion settles: hero copy has real DOM text server-rendered; motion only affects opacity/transform, never `visibility`/`display`.
- Reduced motion verified end-to-end, not assumed: `tests/e2e/landing.spec.ts` asserts both that the hero is immediately visible AND — the harder case — that below-the-fold viewport-reveal content (pillars, closing) is visible **without scrolling** under `prefers-reduced-motion: reduce`. This test caught a real bug during development (documented in `docs/motion-mcp-audit.md`) where `whileInView`'s mount-time `initial` gating didn't respect a reduced-motion preference resolved after SSR; fixed by driving reveal off `useInView()` + `useReducedMotion()` into a reactive `:animate` prop instead.
- One dominant motion idea per event: hero entrance is opacity+translate only; header transition is background/border-color+logo-opacity only (no scale, no blur); parallax on the architectural signal is the only scroll-linked effect and never touches text or controls.

## Accessibility

- **Automated:** `@axe-core/playwright` scanned all four locale×theme combinations (en/ar × light/dark) against WCAG 2 A+AA tags — **zero violations** in the current build (`pnpm test:e2e`, "automated accessibility" suite). This caught one real issue during development: `.bs-footer__meta` at 4.43:1 contrast (`--bs-text-subtle` on `--bs-surface-container`), just under the 4.5:1 AA normal-text threshold; fixed by switching to `--bs-text-muted`.
- **Keyboard:** every control (skip link, logo link, language toggle, 3 theme buttons, CTA) is reachable via Tab in a logical order with a real, verified non-`none` computed outline at each stop (Playwright test, not a visual guess).
- **Screen reader structure:** exactly one `<h1>` (verified by test), one `<header>`/`<main id="main-content">`/`<footer>` landmark each, skip link targets `#main-content`, decorative icons carry `aria-hidden="true"`, the crossfading header logo is wrapped in a single `role="img" aria-label="Building Suit"` so it announces once, not twice.
- **No color-only status:** the "Coming Soon" badge pairs a gold dot with the word "Coming Soon" / "قريبًا" in every instance — never a bare color chip.
- **No autofocus, no `href="#"`:** verified by test (`no dead #-only links`, `no automatic focus movement on page load`).
- **Targets:** every interactive control uses `--bs-size-target-minimum` (44px) as its minimum box — theme buttons, language toggle, CTA, skip link, header brand link.

## Lighthouse (real runs against the production build, `.output/server/index.mjs`, via `npx lighthouse` + the environment's pinned Chromium)

| Category | Mobile (simulated throttling) | Desktop |
|---|---:|---:|
| Performance | **77** | **99** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Accessibility/Best Practices/SEO hit the 95+ target on both profiles. Desktop Performance clears the 90+ aim comfortably (LCP 0.8s, TBT 0ms, CLS 0). **Mobile Performance does not clear 90** (LCP 4.6s, FCP 3.4s under simulated throttling) — see Remaining Issues. This was measured, not assumed: the first mobile run before optimization scored 68 with an 11.7s LCP, traced to the two logo master PNGs (632KB/829KB, native 920×1245) being served at 32–128px display sizes; `scripts/generate-logo-renditions.mjs` now generates real @1x/@2x sized+compressed renditions (1.7–17.7KB each, via `sharp`, proportional resize only — no crop/recolor/redraw, consistent with the logo usage rules' own "provide @1x/@2x/@3x raster exports" guidance) and every `<img>` uses `srcset`, which brought mobile Performance from 68→77 and LCP from 11.7s→4.6s.

## Unresolved issues

- **Mobile Lighthouse Performance is 77, not the aimed-for 90+.** Root cause after the logo fix: render-blocking CSS (bundled `@font-face` declarations for Manrope + IBM Plex Sans Arabic, ~47KB) and baseline JS payload from Nuxt + Vue + `motion-v` + Hugeicons (~330KB total across chunks) under Lighthouse's simulated slow-mobile throttling. Further reduction (critical-CSS inlining, route-level code-splitting tuning) is real follow-up work, not something to fake with a lighter audit profile.
- **OG image Arabic text renders in headless Chromium's default font fallback, not the bundled IBM Plex Sans Arabic.** The OG images (`scripts/generate-og-assets.mjs`) are pre-rendered once via a standalone Playwright/Chromium pass, separate from the live page's font loading — cosmetically fine (still correctly RTL, still legible) but not pixel-identical to in-app Arabic typography. Low priority since OG images are only seen in link-preview contexts.
- **Favicon has no dedicated app-icon-mark asset to draw from.** The source repository's `assets/logos/` only contains the two full-height logo PNGs — no separate simplified app-icon file exists there despite `05_APP_ICON_GUIDE.md` describing one conceptually. Rather than fabricate a new mark (explicitly forbidden), the favicon places the unmodified full logo, aspect-locked, on a Building Navy square tile. Acceptable but not the ideal dedicated app-icon treatment; revisit if/when that asset is produced upstream.
- **No formal accessibility conformance claim.** Per the source repository's own Discrepancy Log (D-06), contrast/AA is treated as the working bar, not a certified conformance statement — this implementation follows that same posture: strong automated evidence (axe-core, 0 violations), not a formal certification.
